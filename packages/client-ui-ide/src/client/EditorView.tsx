/**
 * Editor column: the open file/diff tab strip plus the active viewer. Reads
 * the shared editor store (passed via the inject face) and the `ide` Remote.
 * Registers into `editor` (ui-layout #6) or, as a fallback, a
 * `conversation.view` tab. Pure presentation.
 * @module dsh-client-ide-ui/client/EditorView
 */

import { createElement, useEffect, useState } from 'react'
import type { IdeInjected } from './slots.ts'
import { Icon } from './icons.tsx'
import { baseName, detectLang, renderLine } from './lib.ts'

function FileEditor(props: { path: string; injected: IdeInjected }): ReturnType<typeof createElement> {
  const { ide, rpc: call } = props.injected
  const el = createElement
  const [st, setSt] = useState<{ loading: boolean; content?: string; error?: string; truncated?: boolean }>({ loading: true })
  useEffect(() => {
    let cancelled = false
    setSt({ loading: true })
    call(ide.readText(props.path)).then((r) => { if (!cancelled) setSt({ content: r.content, error: '', truncated: r.truncated, loading: false }) }, (e) => { if (!cancelled) setSt({ error: String((e as Error).message), loading: false }) })
    return () => { cancelled = true }
  }, [props.path])
  if (st.loading) return el('div', { className: 'dshide-loading' }, '加载中…')
  if (st.error) return el('div', { className: 'dshide-empty' }, st.error)
  const lang = detectLang(props.path)
  const lines = (st.content ?? '').split(/\r?\n/)
  return el('div', { className: 'dshide-editor-body' }, el('div', { className: 'dshide-preview-path', title: props.path }, props.path), el('pre', { className: 'dshide-code' }, lines.map((ln, i) => el('div', { key: i, className: 'dshide-codeline' }, el('span', { className: 'dshide-lineno' }, String(i + 1)), renderLine(ln, lang))), st.truncated ? el('div', { className: 'dshide-empty' }, '… 文件过大，已截断') : null))
}

function DiffEditor(props: { cwd: string; path: string; injected: IdeInjected }): ReturnType<typeof createElement> {
  const { ide, rpc: call } = props.injected
  const el = createElement
  const [st, setSt] = useState<{ loading: boolean; stdout?: string; stderr?: string }>({ loading: true })
  useEffect(() => {
    let cancelled = false
    setSt({ loading: true })
    call(ide.gitDiff(props.cwd, props.path)).then((r) => { if (!cancelled) setSt({ stdout: r.stdout, stderr: r.stderr, loading: false }) }, (e) => { if (!cancelled) setSt({ stderr: String((e as Error).message), loading: false }) })
    return () => { cancelled = true }
  }, [props.cwd, props.path])
  if (st.loading) return el('div', { className: 'dshide-loading' }, '加载中…')
  if (st.stderr && !st.stdout) return el('div', { className: 'dshide-empty' }, st.stderr)
  const lines = (st.stdout ?? '').split(/\r?\n/)
  return el('div', { className: 'dshide-editor-body' }, el('div', { className: 'dshide-preview-path', title: props.path }, props.path), el('pre', { className: 'dshide-code' }, lines.map((ln, i) => {
    const cls = ln.startsWith('+') && !ln.startsWith('+++') ? 'dshide-diff-line add' : ln.startsWith('-') && !ln.startsWith('---') ? 'dshide-diff-line del' : ln.startsWith('@@') ? 'dshide-diff-line hunk' : 'dshide-diff-line'
    return el('div', { key: i, className: cls }, ln || ' ')
  })))
}

export interface EditorViewProps extends IdeInjected {}

export function EditorView(props: EditorViewProps): ReturnType<typeof createElement> {
  const el = createElement
  const store = props.store
  const [state, setState] = useState<{ tabs: readonly typeof store.tabs[number][]; activeId: string | null }>({ tabs: store.tabs as readonly typeof store.tabs[number][], activeId: store.activeId })
  useEffect(() => store.subscribe(() => { setState({ tabs: store.tabs as readonly typeof store.tabs[number][], activeId: store.activeId }) }), [])
  const tabs = state.tabs
  const activeId = state.activeId
  const active = tabs.find((t) => t.key === activeId) ?? null
  return el('div', { className: 'dshide-editor' }, el('div', { className: 'dshide-etabs' }, tabs.map((t) => el('div', { key: t.key, className: `dshide-etab${t.key === activeId ? ' active' : ''}`, title: t.path, onClick: () => { store.setActive(t.key) } }, el('span', { className: 'dshide-etab-label' }, baseName(t.path) + (t.kind === 'diff' ? ' ⇄' : '')), el('button', { type: 'button', className: 'dshide-etab-close', title: '关闭', onClick: (e: { stopPropagation: () => void }) => { e.stopPropagation(); store.close(t.key) } }, el(Icon, { name: 'close', size: 11 })))), tabs.length === 0 ? el('span', { className: 'dshide-etab-hint' }, '从侧栏打开文件或 diff') : null), active === null ? el('div', { className: 'dshide-editor-empty' }, '在资源管理器 / 搜索 / 源码管理中打开文档') : active.kind === 'file' ? el(FileEditor, { path: active.path, injected: props }) : el(DiffEditor, { cwd: active.cwd ?? '', path: active.path, injected: props }))
}
