/**
 * Shared leaf: pure helpers and wire types for the IDE sidebar / editor
 * column. No React state, no ctx, no side effects — everything here is a
 * pure function or a plain data shape.
 * @module dsh-client-ide-ui/client/lib
 */

import { createElement } from 'react'
import type { GitFileState, GitStatusMapResult, RemoteResult } from 'dsh-ide-ui/types'

/** One open document tab (file preview or git diff) in the editor column. */
export interface IdeTab {
  key: string
  kind: 'file' | 'diff'
  path: string
  cwd?: string
}

/** Unwrap a Remote result envelope: a Host throw becomes { ok:false, error }. */
export async function rpc<T>(p: Promise<RemoteResult<T>>): Promise<T> {
  const r = await p
  if (!r.ok) throw new Error(r.error.message)
  return r.value
}

export function relTime(ts?: number): string {
  if (!ts) return ''
  const diff = Date.now() - ts
  const m = 60000, h = 3600000, d = 86400000
  if (diff < m) return '刚刚'
  if (diff < h) return `${Math.floor(diff / m)} 分钟前`
  if (diff < d) return `${Math.floor(diff / h)} 小时前`
  if (diff < 30 * d) return `${Math.floor(diff / d)} 天前`
  return new Date(ts).toLocaleDateString()
}

export const joinPath = (dir: string, name: string): string => dir.replace(/[\\/]+$/, '') + '\\' + name

export const dirnameOf = (p: string): string => {
  const i = Math.max(p.lastIndexOf('\\'), p.lastIndexOf('/'))
  return i < 0 ? p : p.slice(0, i)
}

export const baseName = (p: string): string => {
  const s = p.replace(/[\\/]+$/, '')
  const i = Math.max(s.lastIndexOf('\\'), s.lastIndexOf('/'))
  return i < 0 ? s : s.slice(i + 1)
}

export function detectLang(path: string): string {
  const p = (path || '').toLowerCase()
  if (/\.(js|jsx|mjs|cjs|ts|tsx)$/.test(p)) return 'js'
  if (/\.json$/.test(p)) return 'json'
  if (/\.(md|markdown)$/.test(p)) return 'md'
  if (/\.(css|scss|less)$/.test(p)) return 'css'
  if (/\.(html|htm|vue)$/.test(p)) return 'html'
  if (/\.py$/.test(p)) return 'py'
  if (/\.(sh|bash|zsh)$/.test(p)) return 'sh'
  if (/\.ya?ml$/.test(p)) return 'yaml'
  return 'text'
}

const KW: Record<string, string> = {
  js: 'const let var function return if else for while do class extends super import export from default new try catch finally throw async await typeof instanceof in of this delete void yield switch case break continue',
  py: 'def return if elif else for while import from class try except finally raise with as lambda pass break continue global not and or in is del yield async await',
  sh: 'if then else elif fi for while do done case esac function export local return echo cd source',
}

export function buildRules(lang: string): Array<[RegExp, string]> {
  if (lang === 'text') return []
  if (lang === 'md') return [[/^#{1,6}[^\n]*/g, 'tok-md-heading'], [/`[^`\n]*`/g, 'tok-str'], [/\*\*[^*\n]+\*\*/g, 'tok-bold'], [/\[[^\]]*\]\([^)]*\)/g, 'tok-link'], [/^>\s?[^\n]*/g, 'tok-com']]
  if (lang === 'json') return [[/"(?:[^"\\]|\\.)*"(?=\s*:)/g, 'tok-json-key'], [/"(?:[^"\\]|\\.)*"/g, 'tok-str'], [/-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/gi, 'tok-num'], [/\b(?:true|false|null)\b/g, 'tok-bool']]
  if (lang === 'html') return [[/<!--[\s\S]*?-->/g, 'tok-com'], [/<\/?[a-zA-Z][a-zA-Z0-9-]*/g, 'tok-tag'], [/\/?>/g, 'tok-tag'], [/[a-zA-Z-]+(?==")/g, 'tok-attr'], [/"[^"]*"/g, 'tok-str']]
  if (lang === 'css') return [[/\/\*[\s\S]*?\*\//g, 'tok-com'], [/[a-zA-Z-]+(?=\s*:)/g, 'tok-prop'], [/#[0-9a-fA-F]{3,8}\b/g, 'tok-num'], [/-?\b\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s|ms|fr)?\b/gi, 'tok-num'], [/"[^"]*"|'[^']*'/g, 'tok-str']]
  const kws = ((KW[lang] ?? KW.js) || '').split(' ').join('|')
  const lineComment = (lang === 'py' || lang === 'sh' || lang === 'yaml') ? /#[^\n]*/g : /\/\/[^\n]*/g
  return [[/\/\*[\s\S]*?\*\//g, 'tok-com'], [lineComment, 'tok-com'], [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g, 'tok-str'], [new RegExp(`\\b(?:${kws})\\b`, 'g'), 'tok-kw'], [/-?\b\d+(?:\.\d+)?\b/g, 'tok-num']]
}

export function tokenize(line: string, rules: Array<[RegExp, string]>): Array<[string, string | null]> {
  const out: Array<[string, string | null]> = []
  let i = 0
  const n = line.length
  while (i < n) {
    let best: [string, string] | null = null
    for (const r of rules) {
      r[0].lastIndex = i
      const m = r[0].exec(line)
      if (m && m.index === i && (best === null || m[0].length > best[0].length)) best = [m[0], r[1]]
    }
    if (best) { out.push(best); i += best[0].length } else { out.push([line[i] ?? '', null]); i += 1 }
  }
  return out
}

/** Render one source line with token spans. */
export function renderLine(line: string, lang: string): ReturnType<typeof createElement> {
  const segs = tokenize(line, buildRules(lang))
  return createElement('span', { className: 'dshide-linetext' }, segs.map((s, i) => (s[1] ? createElement('span', { key: i, className: s[1] }, s[0] ?? '') : s[0] ?? '')))
}

/* ------------------------------------------------------------------ */
/* Git decorations for the explorer tree (VSCode-style)               */
/* ------------------------------------------------------------------ */

/**
 * Condensed per-path git lookup built once per workspace root:
 * - `files` maps normalized relPath -> state for changed/untracked files.
 * - `dirs` bubbles every file state up to all ancestor directories, so a
 *   collapsed folder already knows it contains changes (VSCode behavior).
 * - `ignored` holds ignored paths (files and whole-ignored directories).
 */
export interface GitLookup {
  files: Map<string, GitFileState>
  dirs: Map<string, GitFileState>
  ignored: Set<string>
}

/** Decoration a tree row should render (dot color/position + dimming). */
export interface GitDecoration {
  code: string
  staged: boolean
  ignored: boolean
}

/** Normalize a repo-relative path for lookup: forward slashes, case-folded. */
export function normRel(p: string): string {
  return (p || '').replace(/\\/g, '/').toLowerCase()
}

/** Absolute path -> repo-relative path (forward slashes, case-folded). */
export function relFromAbs(abs: string, root: string): string {
  const a = normRel(abs)
  const r = normRel(root).replace(/\/+$/, '')
  if (a === r) return ''
  if (r !== '' && a.startsWith(r + '/')) return a.slice(r.length + 1)
  return a
}

/** Decoration severity: conflict > untracked > modified > added/deleted/renamed. */
const RANK: Record<string, number> = { C: 4, U: 3, M: 2, A: 1, D: 1, R: 1 }

function better(a: GitFileState | undefined, b: GitFileState): GitFileState {
  if (!a) return b
  const ra = RANK[a.code] ?? 0
  const rb = RANK[b.code] ?? 0
  if (rb > ra) return b
  if (rb === ra) return { code: a.code, staged: a.staged || b.staged }
  return a
}

/** Build the lookup tables from one `ide.gitStatusMap` result. */
export function buildGitLookup(root: string, map: GitStatusMapResult): GitLookup {
  const files = new Map<string, GitFileState>()
  const dirs = new Map<string, GitFileState>()
  for (const [rel, st] of Object.entries(map.files ?? {})) {
    const n = normRel(rel)
    if (n === '') continue
    files.set(n, st)
    let i = n.lastIndexOf('/')
    while (i > 0) {
      const d = n.slice(0, i)
      dirs.set(d, better(dirs.get(d), st))
      i = d.lastIndexOf('/')
    }
  }
  const ignored = new Set<string>()
  for (const d of map.ignoredDirs ?? []) {
    const n = normRel(d)
    if (n !== '') ignored.add(n)
  }
  return { files, dirs, ignored }
}

/** Resolve the decoration for one absolute path against the lookup. */
export function gitDecoration(abs: string, root: string, lookup: GitLookup): GitDecoration {
  const rel = relFromAbs(abs, root)
  if (rel === '') return { code: '', staged: false, ignored: false }
  const st = lookup.files.get(rel)
  if (st) return { code: st.code, staged: st.staged, ignored: false }
  const d = lookup.dirs.get(rel)
  if (d) return { code: d.code, staged: d.staged, ignored: false }
  let seg = rel
  while (seg !== '') {
    if (lookup.ignored.has(seg)) return { code: '', staged: false, ignored: true }
    const i = seg.lastIndexOf('/')
    if (i < 0) break
    seg = seg.slice(0, i)
  }
  return { code: '', staged: false, ignored: false }
}

export const GIT_LABEL: Record<string, string> = {
  C: '冲突',
  U: '未跟踪',
  M: '已修改',
  A: '已暂存（新增）',
  D: '已删除',
  R: '已重命名',
}
