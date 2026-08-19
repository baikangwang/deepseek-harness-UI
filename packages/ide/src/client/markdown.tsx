/**
 * Self-contained expert Markdown renderer. Parses GFM (tables, task lists,
 * strikethrough, autolinks) plus TeX math via micromark/mdast; renders every
 * mdast node as semantic React elements with theme tokens; code fences get
 * the shared token highlighter; TeX math renders through KaTeX (CSS comes
 * from the host web frontend). No CSS imports — bundler-safe.
 * @module dsh-ide-ui/client/markdown
 */

import { createElement, type ReactNode } from 'react'
import { fromMarkdown } from 'mdast-util-from-markdown'
import type { Root as MdastRoot } from 'mdast'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { gfm } from 'micromark-extension-gfm'
import { mathFromMarkdown } from 'mdast-util-math'
import { math } from 'micromark-extension-math'
import katex from 'katex'
import { renderLine } from './lib.ts'

type ComponentChildren = ReactNode

/** Render TeX source to an HTML string via KaTeX (host web frontend supplies katex.css). */
function katexHtml(tex: string, display: boolean): string {
  try {
    return katex.renderToString(tex, { displayMode: display, throwOnError: false, output: 'html' })
  } catch {
    return `<span class="dshide-md-math-err">${tex.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`
  }
}

export interface MdNode {
  type: string
  [k: string]: unknown
}

const childrenOf = (node: MdNode): MdNode[] => (node.children as MdNode[]) ?? []

/** Render an mdast node (or array) to React elements. */
export function renderMdast(node: MdNode | MdNode[] | null | undefined, keySeed = 0): ComponentChildren {
  if (Array.isArray(node)) return node.map((n, i) => renderMdast(n, keySeed * 97 + i + 1))
  if (!node) return null
  const el = createElement
  const key = keySeed
  const kids = (): ComponentChildren => renderMdast(childrenOf(node), key * 100 + 7)
  const raw = (): string => String((node as { value?: string }).value ?? '')
  switch (node.type) {
    case 'root': return el('div', { className: 'dshide-md-root' }, kids())
    case 'paragraph': return el('p', { key, className: 'dshide-md-p' }, kids())
    case 'heading': {
      const level = Math.min(6, Math.max(1, Number(node.depth ?? 1)))
      return el(`h${level}` as never, { key, className: `dshide-md-h dshide-md-h${level}` }, kids())
    }
    case 'strong': return el('strong', { key, className: 'dshide-md-strong' }, kids())
    case 'emphasis': return el('em', { key, className: 'dshide-md-em' }, kids())
    case 'delete': return el('del', { key, className: 'dshide-md-del' }, kids())
    case 'inlineCode': return el('code', { key, className: 'dshide-md-inline-code' }, raw())
    case 'code': {
      const lang = String((node.lang as string) ?? '').toLowerCase()
      const src = raw()
      if (lang === 'math') return el('div', { key, className: 'dshide-md-math-block', dangerouslySetInnerHTML: { __html: katexHtml(src, true) } })
      const lines = src.split(/\r?\n/)
      return el('div', { key, className: 'dshide-md-code' }, lang ? el('div', { className: 'dshide-md-code-lang' }, lang) : null, el('pre', { className: 'dshide-md-code-pre' }, lines.map((ln, i) => el('div', { key: i, className: 'dshide-md-code-line' }, ln === '' ? ' ' : renderLine(ln, lang)))))
    }
    case 'blockquote': return el('blockquote', { key, className: 'dshide-md-bq' }, kids())
    case 'list': {
      const ordered = node.ordered === true
      const start = Number(node.start ?? 1)
      const lis = childrenOf(node).map((item, i) => {
        const itemKids = childrenOf(item)
        const first = itemKids[0]
        const checked = (first as { checked?: boolean } | undefined)?.checked
        const rest = (checked !== undefined ? itemKids.slice(1) : itemKids)
        return el('li', { key: i, className: `dshide-md-li${checked !== undefined ? ' dshide-md-task' : ''}` }, checked !== undefined ? el('span', { className: 'dshide-md-task-box' }, el('input', { type: 'checkbox', checked: checked === true, readOnly: true, tabIndex: -1 })) : null, checked !== undefined ? el('span', { className: 'dshide-md-task-text' }, renderMdast(rest, i * 13 + 3)) : renderMdast(rest, i * 13 + 3))
      })
      return ordered ? el('ol', { key, className: 'dshide-md-ol', start }, lis) : el('ul', { key, className: 'dshide-md-ul' }, lis)
    }
    case 'listItem': return el('li', { key, className: 'dshide-md-li' }, kids())
    case 'thematicBreak': return el('hr', { key, className: 'dshide-md-hr' })
    case 'link': {
      const href = String(node.url ?? '')
      const external = /^https?:\/\//i.test(href)
      const safe = external || /^#|^mailto:/i.test(href) ? href : '#'
      return el('a', { key, className: 'dshide-md-a', href: safe, ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}) }, kids())
    }
    case 'image': {
      const src = String(node.url ?? '')
      const alt = String(node.alt ?? '')
      return /^https?:\/\/|^data:/i.test(src) ? el('img', { key, className: 'dshide-md-img', src, alt }) : el('span', { key, className: 'dshide-md-img-alt', title: src }, alt || '(图片)')
    }
    case 'html': return el('span', { key, className: 'dshide-md-html' }, raw())
    case 'table': {
      const rows = childrenOf(node)
      const head = rows[0]
      const headCells = head ? childrenOf(head) : []
      return el('div', { key, className: 'dshide-md-table-wrap' }, el('table', { className: 'dshide-md-table' }, head ? el('thead', null, el('tr', { className: 'dshide-md-tr dshide-md-tr-head' }, headCells.map((c, ci) => el('th', { key: ci, className: 'dshide-md-th', ...(alignOf(c) ? { style: { textAlign: alignOf(c) as never } } : {}) }, renderMdast(childrenOf(c), ci * 5 + 1))))) : null, el('tbody', null, rows.slice(1).map((row, ri) => el('tr', { key: ri, className: 'dshide-md-tr' }, childrenOf(row).map((c, ci) => el('td', { key: ci, className: 'dshide-md-td', ...(alignOf(c) ? { style: { textAlign: alignOf(c) as never } } : {}) }, renderMdast(childrenOf(c), ri * 31 + ci * 7 + 2))))))))
    }
    case 'tableRow': return el('tr', { key, className: 'dshide-md-tr' }, kids())
    case 'tableCell':
    case 'tableHead': return el('td', { key, className: 'dshide-md-td' }, kids())
    case 'break': return el('br', { key })
    case 'math': return el('span', { key, className: 'dshide-md-math-inline', dangerouslySetInnerHTML: { __html: katexHtml(raw(), false) } })
    case 'text': return raw()
    default: {
      const v = (node as { value?: string }).value
      if (typeof v === 'string') return v
      const ch = childrenOf(node)
      return ch.length > 0 ? el('span', { key }, kids()) : null
    }
  }
}

const alignOf = (cell: MdNode): string | undefined => (cell as { align?: string }).align

/** Parse markdown source into React elements (GFM + math). */
export function renderMarkdown(source: string): ComponentChildren {
  let tree: MdastRoot
  try {
    tree = fromMarkdown(source ?? '', {
      extensions: [gfm(), math()],
      mdastExtensions: [gfmFromMarkdown(), mathFromMarkdown()],
    })
  } catch {
    return createElement('pre', { className: 'dshide-md-err' }, String(source ?? ''))
  }
  return renderMdast(tree as unknown as MdNode)
}

/** Preview/source toggle bar for markdown documents. */
export function PreviewToggle(props: { mode: 'preview' | 'source'; onChange: (m: 'preview' | 'source') => void }): ReturnType<typeof createElement> {
  const el = createElement
  return el('div', { className: 'dshide-md-toggle' }, el('button', { type: 'button', className: `dshide-md-toggle-btn${props.mode === 'preview' ? ' on' : ''}`, onClick: () => { props.onChange('preview') } }, '预览'), el('button', { type: 'button', className: `dshide-md-toggle-btn${props.mode === 'source' ? ' on' : ''}`, onClick: () => { props.onChange('source') } }, '源码'))
}

/** Resolve a markdown link target that points at a relative path. */
export function resolveMdLink(href: string, baseDir: string): string | undefined {
  if (!href || href.startsWith('#') || /^[a-z]+:/i.test(href)) return undefined
  const clean = href.split('#')[0] ?? href
  if (!clean) return undefined
  return baseDir.replace(/[\\/]+$/, '') + '\\' + clean.replace(/\//g, '\\')
}
