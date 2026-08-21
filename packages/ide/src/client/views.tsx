/**
 * Sidebar views: Explorer (file tree), Search, Source Control, Sessions.
 * Pure presentation — all data and callbacks arrive through props (the
 * registrant inject face + framework hook snapshots). No ctx reach.
 * @module dsh-client-ide-ui/client/views
 */

import { createElement, useEffect, useRef, useState } from 'react'
import type { IdeInjected } from './slots.ts'
import { Icon } from './icons.tsx'
import { fileIcon } from './fileicons.ts'
import { baseName, buildGitLookup, dirnameOf, displayPath, fileMentionFor, GIT_LABEL, gitDecoration, joinPath, relTime } from './lib.ts'
import type { GitDecoration, GitLookup } from './lib.ts'
import { useIdeHome, useIdeSettings } from './settings-store.ts'

type ViewInjected = Pick<IdeInjected, 'ide' | 'rpc' | 'openDoc' | 'sessions' | 'workspaces' | 'settings' | 'home' | 'scm'>

/** One-shot "已复制 @引用" flash keyed on the copied path. */
function useCopyRef(): { copied: string | null; copyRef: (path: string, kind: 'file' | 'directory') => void } {
  const [copied, setCopied] = useState<string | null>(null)
  const copyRef = (path: string, kind: 'file' | 'directory'): void => {
    const mention = fileMentionFor(path, kind)
    if (mention === undefined) return
    void navigator.clipboard.writeText(mention).then(() => {
      setCopied(path)
      window.setTimeout(() => { setCopied((c) => (c === path ? null : c)) }, 1200)
    })
  }
  return { copied, copyRef }
}

/* ------------------------------------------------------------------ */
/* Explorer                                                           */
/* ------------------------------------------------------------------ */

interface ExplorerProps extends Pick<ViewInjected, 'ide' | 'rpc' | 'openDoc' | 'settings' | 'home'> {
  root?: string | undefined
  setRoot: (p: string) => void
  workspaces: Array<{ path: string; title?: string }>
}

interface TreeRow {
  name: string
  type: string
  path: string
  size: number | null
}

/** Injected share the recursive tree needs (settings + home for path display). */
type TreeInjected = Pick<ViewInjected, 'ide' | 'rpc' | 'openDoc' | 'settings' | 'home'>

/** VSCode-style git status dots layered on the file/folder glyph. */
function GitDots(props: { deco: GitDecoration }): ReturnType<typeof createElement> | null {
  const { deco } = props
  const el = createElement
  if (deco.ignored || deco.code === '') return null
  const dots: ReturnType<typeof createElement>[] = []
  if (deco.staged) dots.push(el('span', { key: 's', className: 'dshide-git-dot top-left staged', title: '已暂存' }))
  const pos = deco.code === 'U' ? 'top-right' : 'bottom-right'
  const cls = deco.code === 'C' ? 'conflict' : deco.code === 'U' ? 'untracked' : deco.code === 'M' ? 'modified' : 'staged'
  dots.push(el('span', { key: 'c', className: `dshide-git-dot ${pos} ${cls}`, title: GIT_LABEL[deco.code] ?? deco.code }))
  return el('span', { className: 'dshide-glyph-wrap', 'aria-hidden': true }, dots)
}

function Tree(props: { path: string; depth: number; expanded: Set<string>; toggle: (p: string) => void; onOpen: (p: string) => void; showHidden: boolean; filter: string; onRename: (p: string, n: string) => void; onDelete: (p: string, n: string) => void; onMove: (src: string, dest: string) => void; root?: string | undefined; lookup?: GitLookup | null | undefined; injected: TreeInjected }): ReturnType<typeof createElement> {
  const { ide, rpc } = props.injected
  const el = createElement
  const settings = useIdeSettings(props.injected.settings)
  const home = useIdeHome(props.injected.home)
  const { copied, copyRef } = useCopyRef()
  const isOpen = props.depth === 0 || props.expanded.has(props.path)
  const [entries, setEntries] = useState<Array<TreeRow> | undefined>(undefined)
  useEffect(() => {
    let cancelled = false
    setEntries(undefined)
    rpc(ide.listDir(props.path)).then((r) => { if (!cancelled) setEntries(r.entries ?? []) }, () => { if (!cancelled) setEntries([]) })
    return () => { cancelled = true }
  }, [props.path, isOpen])
  const f = (props.filter ?? '').toLowerCase()
  const visible = (entries ?? []).filter((e) => (props.showHidden || !(e.name.length > 0 && e.name[0] === '.')) && (f === '' || e.name.toLowerCase().includes(f)))
  return el('div', null, entries === undefined ? el('div', { className: 'dshide-loading' }, '加载中…') : visible.map((e) => {
    const deco = props.lookup ? gitDecoration(e.path, props.root ?? '', props.lookup) : null
    const ignoredCls = deco && deco.ignored ? ' ignored' : ''
    const shown = displayPath(e.path, home, settings.explorer.abbreviateHome)
    if (e.type === 'directory') {
      const open = props.expanded.has(e.path)
      return el('div', { key: e.path }, el('div', {
        className: 'dshide-row' + ignoredCls, style: { paddingLeft: `${props.depth * 12 + 8}px` }, title: shown,
        draggable: true,
        onDragStart: (ev: { dataTransfer: { setData: (k: string, v: string) => void; effectAllowed: string } }) => { ev.dataTransfer.setData('text/plain', e.path); ev.dataTransfer.effectAllowed = 'move' },
        onDragOver: (ev: { preventDefault: () => void; dataTransfer: { dropEffect: string } }) => { ev.preventDefault(); ev.dataTransfer.dropEffect = 'move' },
        onDrop: (ev: { preventDefault: () => void; dataTransfer: { getData: (k: string) => string } }) => { ev.preventDefault(); props.onMove(ev.dataTransfer.getData('text/plain'), e.path) },
        onClick: () => { props.toggle(e.path) },
      }, el('span', { className: `dshide-arrow${open ? ' open' : ''}` }, el(Icon, { name: 'chevron', size: 12 })), el('span', { className: 'dshide-glyph-wrap' }, el(Icon, { name: 'folder', size: 20, className: 'dshide-glyph' }), deco ? GitDots({ deco }) : null), el('span', { className: 'dshide-name' }, e.name), el('span', { className: 'dshide-row-actions', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation() } }, el('button', { type: 'button', className: 'dshide-row-btn', title: copied === e.path ? '已复制 @引用' : '复制为 @引用', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation(); copyRef(e.path, 'directory') } }, copied === e.path ? el(Icon, { name: 'check', size: 13 }) : '@'), el('button', { type: 'button', className: 'dshide-row-btn', title: '在资源管理器中打开', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation(); void rpc(ide.explore(e.path, false)) } }, el(Icon, { name: 'locate', size: 13 })), el('button', { type: 'button', className: 'dshide-row-btn', title: '重命名', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation(); props.onRename(e.path, e.name) } }, el(Icon, { name: 'edit', size: 13 })), el('button', { type: 'button', className: 'dshide-row-btn', title: '删除', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation(); props.onDelete(e.path, e.name) } }, el(Icon, { name: 'trash', size: 13 })))), open ? el(Tree, { path: e.path, depth: props.depth + 1, expanded: props.expanded, toggle: props.toggle, onOpen: props.onOpen, showHidden: props.showHidden, filter: props.filter, onRename: props.onRename, onDelete: props.onDelete, onMove: props.onMove, root: props.root, lookup: props.lookup, injected: props.injected }) : null)
    }
    return el('div', {
      key: e.path, className: 'dshide-row' + ignoredCls, style: { paddingLeft: `${props.depth * 12 + 8 + 14}px` }, title: shown,
      draggable: true,
      onDragStart: (ev: { dataTransfer: { setData: (k: string, v: string) => void; effectAllowed: string } }) => { ev.dataTransfer.setData('text/plain', e.path); ev.dataTransfer.effectAllowed = 'move' },
      onClick: () => { props.onOpen(e.path) },
    }, el('span', { className: 'dshide-glyph-wrap' }, fileIcon(e.path, 20, 'dshide-glyph'), deco ? GitDots({ deco }) : null), el('span', { className: 'dshide-name' }, e.name), el('span', { className: 'dshide-row-actions', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation() } }, el('button', { type: 'button', className: 'dshide-row-btn', title: copied === e.path ? '已复制 @引用' : '复制为 @引用', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation(); copyRef(e.path, 'file') } }, copied === e.path ? el(Icon, { name: 'check', size: 13 }) : '@'), el('button', { type: 'button', className: 'dshide-row-btn', title: '在资源管理器中显示', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation(); void rpc(ide.explore(e.path, true)) } }, el(Icon, { name: 'locate', size: 13 })), el('button', { type: 'button', className: 'dshide-row-btn', title: '重命名', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation(); props.onRename(e.path, e.name) } }, el(Icon, { name: 'edit', size: 13 })), el('button', { type: 'button', className: 'dshide-row-btn', title: '删除', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation(); props.onDelete(e.path, e.name) } }, el(Icon, { name: 'trash', size: 13 }))))
  }))
}

export function ExplorerView(props: ExplorerProps): ReturnType<typeof createElement> {
  const { ide, rpc, openDoc } = props
  const el = createElement
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())
  const [showHidden] = useState(false)
  const [filter, setFilter] = useState('')
  const [action, setAction] = useState<{ kind: string; path: string; name: string } | null>(null)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [git, setGit] = useState<GitLookup | null>(null)
  const loadGit = (): void => {
    const root = props.root ?? ''
    if (!root) { setGit(null); return }
    rpc(ide.gitStatusMap(root)).then((r) => { setGit(r.notRepo ? null : buildGitLookup(root, r)) }, () => { setGit(null) })
  }
  useEffect(() => { loadGit() }, [props.root])
  const seen: Record<string, boolean> = {}
  const options = (props.workspaces ?? []).map((w) => ({ path: w.path, title: w.title ?? w.path })).filter((o) => { if (seen[o.path]) return false; seen[o.path] = true; return true })
  if (props.root && !seen[props.root]) options.unshift({ path: props.root, title: props.root })
  const toggle = (p: string): void => { setExpanded((prev) => { const n = new Set(prev); if (n.has(p)) n.delete(p); else n.add(p); return n }) }
  const openFile = (path: string): void => { openDoc({ key: path, kind: 'file', path }) }
  const refresh = (): void => { setExpanded(new Set()); loadGit() }
  const move = (src: string, dest: string): void => { if (src && src !== dest) void rpc(ide.rename(src, joinPath(dest, baseName(src)))).then(refresh) }
  const paste = (): void => { setBusy(true); void rpc(ide.paste(props.root ?? '')).then(() => { setBusy(false); refresh() }) }
  const startAction = (kind: string, path: string, name: string): void => { setAction({ kind, path, name: name ?? '' }); setInput(name ?? '') }
  const cancel = (): void => { setAction(null); setInput('') }
  const runAction = (): void => {
    const a = action
    if (!a) return
    if (a.kind !== 'delete' && input.trim() === '') return
    setBusy(true)
    const done = (): void => { setBusy(false); setAction(null); setInput(''); refresh() }
    if (a.kind === 'newfile') void rpc(ide.newFile(joinPath(a.path, input.trim()))).then(done)
    else if (a.kind === 'newdir') void rpc(ide.mkdir(joinPath(a.path, input.trim()))).then(done)
    else if (a.kind === 'rename') void rpc(ide.rename(a.path, joinPath(dirnameOf(a.path), input.trim()))).then(done)
    else if (a.kind === 'delete') void rpc(ide.delete(a.path)).then(done)
  }
  const actionLabel = action ? (action.kind === 'newfile' ? '新建文件' : action.kind === 'newdir' ? '新建文件夹' : action.kind === 'rename' ? '重命名为' : `删除 ${action.name} ?`) : ''
  return el('div', { className: 'dshide-view' }, el('div', { className: 'dshide-toolbar' }, el('select', { className: 'dshide-select', value: props.root ?? '', onChange: (e: { target: { value: string } }) => { props.setRoot(e.target.value); refresh() } }, options.map((o) => el('option', { key: o.path, value: o.path }, o.title))), el('button', { type: 'button', className: 'dshide-iconbtn', title: '新建文件', onClick: () => { startAction('newfile', props.root ?? '', '') } }, el(Icon, { name: 'file', size: 15 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '新建文件夹', onClick: () => { startAction('newdir', props.root ?? '', '') } }, el(Icon, { name: 'folder', size: 15 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '粘贴', onClick: paste, disabled: busy }, el(Icon, { name: 'check', size: 15 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '刷新', onClick: refresh }, el(Icon, { name: 'refresh', size: 15 }))), el('input', { className: 'dshide-search-input', style: { margin: '6px 8px', flex: 'none' }, placeholder: '按名称查找…', value: filter, onChange: (e: { target: { value: string } }) => { setFilter(e.target.value) } }), action ? el('div', { className: 'dshide-actionbar' }, el('span', { className: 'dshide-actionbar-label' }, actionLabel), action.kind !== 'delete' ? el('input', { className: 'dshide-actionbar-input', autoFocus: true, value: input, onChange: (e: { target: { value: string } }) => { setInput(e.target.value) }, onKeyDown: (e: { key: string }) => { if (e.key === 'Enter') runAction(); if (e.key === 'Escape') cancel() } }) : null, el('button', { type: 'button', className: 'dshide-iconbtn', title: '确认', onClick: runAction, disabled: busy }, el(Icon, { name: action.kind === 'delete' ? 'trash' : 'check', size: 14 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '取消', onClick: cancel }, el(Icon, { name: 'close', size: 14 }))) : null, el('div', { className: 'dshide-scroll' }, el(Tree, { path: props.root ?? '', depth: 0, expanded, toggle, onOpen: openFile, showHidden, filter, onRename: (p, n) => startAction('rename', p, n), onDelete: (p, n) => startAction('delete', p, n), onMove: move, root: props.root, lookup: git, injected: props })))
}

/* ------------------------------------------------------------------ */
/* Search                                                             */
/* ------------------------------------------------------------------ */

interface SearchProps extends ViewInjected {
  root?: string | undefined
}

export function SearchView(props: SearchProps): ReturnType<typeof createElement> {
  const { ide, rpc, openDoc } = props
  const el = createElement
  const settings = useIdeSettings(props.settings)
  const home = useIdeHome(props.home)
  const { copied, copyRef } = useCopyRef()
  const [query, setQuery] = useState('')
  const [cs, setCs] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ error?: string; matches: Array<{ path: string; line: number; text: string }>; files: number; truncated: boolean } | null>(null)
  const run = (): void => {
    if (!query.trim()) return
    setLoading(true); setResult(null)
    rpc(ide.search(props.root ?? '', query, cs)).then((r) => { setResult(r); setLoading(false) }, (e) => { setResult({ error: String((e as Error).message), matches: [], files: 0, truncated: false }); setLoading(false) })
  }
  const openFile = (path: string): void => { openDoc({ key: path, kind: 'file', path }) }
  const abbreviate = settings.explorer.abbreviateHome
  return el('div', { className: 'dshide-view' }, el('div', { className: 'dshide-search-box' }, el('input', { className: 'dshide-search-input', placeholder: '在工作区中搜索…', value: query, onChange: (e: { target: { value: string } }) => { setQuery(e.target.value) }, onKeyDown: (e: { key: string }) => { if (e.key === 'Enter') run() } }), el('button', { type: 'button', className: 'dshide-iconbtn', title: '区分大小写', onClick: () => { setCs((v) => !v) }, style: cs ? { color: 'var(--dsw-alias-brand-primary)' } : undefined }, 'Aa'), el('button', { type: 'button', className: 'dshide-iconbtn', title: '搜索', onClick: run }, el(Icon, { name: 'search', size: 15 }))), loading ? el('div', { className: 'dshide-loading' }, '搜索中…') : result == null ? el('div', { className: 'dshide-empty' }, '输入关键字，在工作区文件中搜索内容。') : result.error ? el('div', { className: 'dshide-empty' }, result.error) : el('div', { className: 'dshide-results' }, el('div', { className: 'dshide-result-summary' }, `${result.matches.length} 处匹配 · ${result.files} 个文件${result.truncated ? '（已截断）' : ''}`), result.matches.length === 0 ? el('div', { className: 'dshide-empty' }, '未找到匹配结果。') : result.matches.map((m, i) => el('div', { key: i, className: 'dshide-match', onClick: () => { openFile(m.path) } }, el('div', { className: 'dshide-match-path' }, displayPath(m.path, home, abbreviate), el('span', { className: 'dshide-row-actions', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation() } }, el('button', { type: 'button', className: 'dshide-row-btn', title: copied === m.path ? '已复制 @引用' : '复制为 @引用', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation(); copyRef(m.path, 'file') } }, copied === m.path ? el(Icon, { name: 'check', size: 13 }) : '@'))), el('div', { className: 'dshide-match-line' }, el('span', { className: 'dshide-match-lineno' }, String(m.line)), el('span', { className: 'dshide-match-text' }, m.text))))))
}

/* ------------------------------------------------------------------ */
/* Source Control                                                     */
/* ------------------------------------------------------------------ */

interface ScmProps extends ViewInjected {
  root?: string | undefined
}

interface ScmStatus {
  branch: string
  changes: Array<{ xy: string; path: string; renameFrom: string; staged: string; unstaged: string }>
  notRepo: boolean
  error: string
}

export function ScmView(props: ScmProps): ReturnType<typeof createElement> {
  const { ide, rpc, openDoc } = props
  const el = createElement
  const settings = useIdeSettings(props.settings)
  const [status, setStatus] = useState<ScmStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const refresh = (): void => {
    if (!props.root) return
    setLoading(true)
    rpc(ide.gitStatus(props.root)).then((r) => { setStatus(r); setLoading(false) }, (e) => { setStatus({ branch: '', changes: [], notRepo: true, error: String((e as Error).message) }); setLoading(false) })
  }
  useEffect(() => { refresh() }, [props.root])
  // rc.8 event-driven refresh: `credentials/updated` remote events and the
  // settings-driven auto-refresh timer both re-run the latest refresh.
  const refreshRef = useRef<() => void>(() => {})
  refreshRef.current = refresh
  useEffect(() => props.scm.subscribe(() => { refreshRef.current() }), [props.scm])
  useEffect(() => {
    if (settings.git.autoRefreshMs <= 0) return
    const t = window.setInterval(() => { refreshRef.current() }, settings.git.autoRefreshMs)
    return () => { window.clearInterval(t) }
  }, [settings.git.autoRefreshMs])
  const act = (fn: () => Promise<unknown>): void => { setBusy(true); void fn().then(() => { setBusy(false); refresh() }) }
  const openDiff = (path: string): void => { openDoc({ key: `diff:${path}`, kind: 'diff', path, ...(props.root ? { cwd: props.root } : {}) }) }
  const commit = (): void => {
    if (!message.trim()) return
    setBusy(true)
    void rpc(ide.gitCommit(props.root ?? '', message)).then(() => { setBusy(false); setMessage(''); refresh() })
  }
  const changes = status?.changes ?? []
  const staged = changes.filter((c) => c.staged && c.staged !== ' ')
  const unstaged = changes.filter((c) => !c.staged || c.staged === ' ')
  const untracked = changes.filter((c) => c.xy === '??')
  const row = (c: typeof changes[number], action: string): ReturnType<typeof createElement> => el('div', { key: c.path, className: 'dshide-row', onClick: () => { openDiff(c.path) } }, el('span', { className: 'dshide-scm-status', title: c.xy }, c.staged || c.unstaged || '?'), el('span', { className: 'dshide-name' }, c.path), c.renameFrom ? el('span', { className: 'dshide-rename' }, `← ${c.renameFrom}`) : null, el('span', { className: 'dshide-row-actions', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation() } }, el('button', { type: 'button', className: 'dshide-row-btn', title: action === 'stage' ? '暂存' : '取消暂存', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation(); act(() => (action === 'stage' ? rpc(ide.gitStage(props.root ?? '', [c.path])) : rpc(ide.gitUnstage(props.root ?? '', [c.path])))) } }, el(Icon, { name: action === 'stage' ? 'plus' : 'minus', size: 13 })), el('button', { type: 'button', className: 'dshide-row-btn', title: '丢弃更改', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation(); act(() => rpc(ide.gitDiscard(props.root ?? '', c.path, c.xy === '??'))) } }, el(Icon, { name: 'trash', size: 13 }))))
  const group = (label: string, list: typeof changes, action: string): ReturnType<typeof createElement> | null => list.length === 0 ? null : el('div', { className: 'dshide-scm-group' }, el('div', { className: 'dshide-scm-group-title' }, `${label} (${list.length})`), list.map((c) => row(c, action)))
  return el('div', { className: 'dshide-view' }, el('div', { className: 'dshide-toolbar' }, el('span', { className: 'dshide-title' }, '源代码管理'), el('span', { className: 'dshide-branch', title: status?.branch ?? '' }, el(Icon, { name: 'scm', size: 14 }), el('span', null, status?.branch ?? '')), el('button', { type: 'button', className: 'dshide-iconbtn', title: '暂存全部', onClick: () => { act(() => rpc(ide.gitStageAll(props.root ?? ''))) }, disabled: busy }, el(Icon, { name: 'plus', size: 14 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '取消暂存全部', onClick: () => { act(() => rpc(ide.gitUnstageAll(props.root ?? ''))) }, disabled: busy }, el(Icon, { name: 'minus', size: 14 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '刷新', onClick: refresh, disabled: busy }, el(Icon, { name: 'refresh', size: 14 }))), el('div', { className: 'dshide-commit' }, el('textarea', { className: 'dshide-commit-input', placeholder: '提交信息（Ctrl+Enter 提交）', value: message, onChange: (e: { target: { value: string } }) => { setMessage(e.target.value) }, onKeyDown: (e: { ctrlKey: boolean; metaKey: boolean; key: string }) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') commit() } }), el('button', { type: 'button', className: 'dshide-commit-btn', disabled: !message.trim() || staged.length === 0 || busy, onClick: commit }, busy ? '…' : '提交')), loading ? el('div', { className: 'dshide-loading' }, '读取中…') : status == null ? null : status.notRepo ? el('div', { className: 'dshide-empty' }, '当前工作区不是 Git 仓库。') : status.error ? el('div', { className: 'dshide-empty' }, status.error) : el('div', { className: 'dshide-scm' }, changes.length === 0 ? el('div', { className: 'dshide-empty' }, '没有未提交的更改。') : el('div', null, group('已暂存', staged, 'unstage'), group('更改', unstaged, 'stage'), group('未跟踪', untracked, 'stage'))))
}

/* ------------------------------------------------------------------ */
/* Sessions                                                           */
/* ------------------------------------------------------------------ */

export interface SessionSnapshot {
  ids?: string[]
  byId?: Record<string, unknown>
  current?: string
}

export interface WorkspaceSnapshot {
  items?: Array<{ workspaceId: string; title: string; path: string; sessionIds?: string[]; archivedSessionIds?: string[] }>
  archivedSessionIds?: string[]
}

interface SessionProps extends Pick<ViewInjected, 'sessions' | 'workspaces' | 'settings' | 'home'> {
  wsState: WorkspaceSnapshot | null
  sessState: SessionSnapshot | null
}

interface SessionLike {
  id: string
  displayTitle?: string
  updatedAt?: number
  origin?: string
  blank?: boolean
  cwd?: string
}

/** Official StateDot twin: ongoing -> animated 3x3 matrix; else a data-state dot (host CSS colors it). */
function StateDot(props: { state: string; size?: number }): ReturnType<typeof createElement> {
  const el = createElement
  const size = props.size ?? 10
  if (props.state === 'ongoing') {
    const cells: Array<[number, number]> = [[0, 0], [4, 0], [8, 0], [8, 4], [8, 8], [4, 8], [0, 8], [0, 4]]
    return el('svg', { className: 'dshide-state-matrix', 'data-state': 'ongoing', width: size, height: size, viewBox: '0 0 10 10', shapeRendering: 'crispEdges', 'aria-hidden': true }, cells.map(([x, y], i) => el('rect', { key: i, className: 'dshide-state-cell', x, y, width: 2, height: 2, style: { animationDelay: `${(i - cells.length) * 125}ms` } })))
  }
  return el('span', { className: 'dshide-state-dot', 'data-state': props.state, style: { width: size, height: size }, 'aria-hidden': true })
}

/** Map a session row to the official dot state (best-effort from row shape). */
function dotStateOf(s: SessionLike): string {
  if (s.blank) return 'idle'
  // Sessions carry no live state in this projection; official defaults to done/idle.
  return 'done'
}

export function SessionView(props: SessionProps): ReturnType<typeof createElement> {
  const { sessions, workspaces } = props
  const el = createElement
  const settings = useIdeSettings(props.settings)
  const home = useIdeHome(props.home)
  const sessState = props.sessState
  const wsState = props.wsState
  const ids: string[] = sessState?.ids ?? []
  const byId: Record<string, SessionLike> = (sessState?.byId ?? {}) as Record<string, SessionLike>
  const current: string | undefined = sessState?.current
  const workspaceList: Array<{ workspaceId: string; title: string; path: string; sessionIds: string[] }> = (wsState?.items ?? []) as Array<{ workspaceId: string; title: string; path: string; sessionIds: string[] }>
  const archived = new Set<string>(wsState?.archivedSessionIds ?? [])
  const [view, setView] = useState('group')
  // Persisted group-expansion state: survives menu switches and reloads.
  const EXPAND_KEY = 'dshide.session.expanded.v1'
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(EXPAND_KEY)
      if (raw) return new Set(JSON.parse(raw) as string[])
    } catch { /* corrupted or unavailable storage */ }
    return new Set()
  })
  useEffect(() => {
    try { localStorage.setItem(EXPAND_KEY, JSON.stringify([...expanded])) } catch { /* storage unavailable */ }
  }, [expanded])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<unknown[] | null>(null)
  const [searchState, setSearchState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [action, setAction] = useState<{ kind: string; id: string; name: string } | null>(null)
  const [input, setInput] = useState('')
  useEffect(() => {
    const q = query.trim()
    if (q === '') { setResults(null); setSearchState('idle'); return }
    let cancelled = false
    const ctrl = new AbortController()
    setSearchState('loading')
    const timer = window.setTimeout(() => {
      sessions.search(q, ctrl.signal).then((r) => {
        if (cancelled) return
        setResults(r.items)
        // rc.8 默认部署关闭会话全文索引：disabled 时降级为本地匹配 + 提示。
        setSearchState(r.disabled ? 'error' : 'ready')
      }).catch(() => {
        if (cancelled) return
        setResults([])
        setSearchState('error')
      })
    }, 250)
    return () => { cancelled = true; window.clearTimeout(timer); try { ctrl.abort() } catch { /* no-op */ } }
  }, [query])
  const q = query.trim().toLowerCase()
  const workspaceBySession: Record<string, string> = {}
  for (const w of workspaceList) for (const sid of w.sessionIds) if (!workspaceBySession[sid]) workspaceBySession[sid] = w.title
  const visible = (s: SessionLike | undefined): s is SessionLike => !!s && s.origin !== 'subagent' && !archived.has(s.id) && (!s.blank || s.id === current)
  const label = (s: SessionLike): string => workspaceBySession[s.id] || (s.cwd ? s.cwd.replace(/[\\/]+$/, '').split(/[\\/]/).pop() ?? '' : '')
  const clickChatTab = (): boolean => {
    try {
      const tabs = document.querySelectorAll('[role="tab"]')
      let first: HTMLElement | null = null
      for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i]
        if (!tab) continue
        const txt = (tab.textContent ?? '').trim()
        if (!first) first = tab as HTMLElement
        if (txt === '对话' || txt === 'Chat') { (tab as HTMLElement).click(); return true }
      }
      if (first) { first.click(); return true }
    } catch { /* no-op */ }
    return false
  }
  const open = (id: string): void => {
    sessions.open(id)
    if (id === current) { clickChatTab() } else { [150, 350, 650, 1100].forEach((d) => { window.setTimeout(clickChatTab, d) }) }
  }
  const newSession = (): void => { workspaces.startSession() }
  const addWorkspace = (): void => { workspaces.pickDirectory().then((p: string | null) => { if (p) void workspaces.create({ path: p }) }) }
  const forkSession = (id: string): void => { sessions.fork(id) }
  const archiveSession = (id: string): void => { sessions.archive(id) }
  const runAction = (): void => {
    const a = action
    if (!a) return
    const done = (): void => { setAction(null); setInput('') }
    if (a.kind === 'wrename' && input.trim()) workspaces.rename(a.id, input.trim()).then(done)
    else if (a.kind === 'wdelete') workspaces.delete(a.id).then(done)
  }
  const sessionRow = (s: SessionLike, indent: boolean): ReturnType<typeof createElement> => el('div', { key: s.id, className: `dshide-session-row${s.id === current ? ' selected' : ''}`, style: indent ? { paddingLeft: '24px' } : undefined, title: s.displayTitle, role: 'treeitem', 'aria-selected': s.id === current, onClick: () => { open(s.id) } }, el('span', { className: 'dshide-slot' }, el(StateDot, { state: dotStateOf(s) })), el('span', { className: 'dshide-title' }, s.displayTitle || s.id), el('span', { className: 'dshide-time' }, relTime(s.updatedAt)), el('span', { className: 'dshide-row-actions', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation() } }, el('button', { type: 'button', className: 'dshide-row-btn', title: '派生会话', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation(); forkSession(s.id) } }, el(Icon, { name: 'scm', size: 13 })), el('button', { type: 'button', className: 'dshide-row-btn', title: '归档', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation(); archiveSession(s.id) } }, el(Icon, { name: 'trash', size: 13 }))))
  const workspaceRow = (w: typeof workspaceList[number]): ReturnType<typeof createElement> => {
    const members = (w.sessionIds ?? []).map((id) => byId[id]).filter(visible).sort((a: SessionLike, b: SessionLike) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
    const isOpen = expanded.has(w.workspaceId)
    return el('div', { key: w.workspaceId }, el('div', { className: 'dshide-project-row', title: displayPath(w.path, home, settings.explorer.abbreviateHome), role: 'treeitem', 'aria-expanded': isOpen, onClick: () => { toggleGroup(w.workspaceId) } }, el('span', { className: `dshide-chevron${isOpen ? ' open' : ''}` }, el(Icon, { name: 'chevron', size: 12 })), el('span', { className: 'dshide-slot' }, el(Icon, { name: 'folder', size: 16, className: isOpen ? 'dshide-folder-active' : 'dshide-folder' })), el('span', { className: 'dshide-title' }, w.title), el('span', { className: 'dshide-row-actions', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation() } }, el('button', { type: 'button', className: 'dshide-row-btn', title: '重命名工作区', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation(); setAction({ kind: 'wrename', id: w.workspaceId, name: w.title }); setInput(w.title) } }, el(Icon, { name: 'edit', size: 13 })), el('button', { type: 'button', className: 'dshide-row-btn', title: '删除工作区', onClick: (ev: { stopPropagation: () => void }) => { ev.stopPropagation(); setAction({ kind: 'wdelete', id: w.workspaceId, name: w.title }) } }, el(Icon, { name: 'trash', size: 13 })))), isOpen ? members.map((s) => sessionRow(s, true)) : null)
  }
  const toggleGroup = (id: string): void => { setExpanded((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n }) }
  let body: ReturnType<typeof createElement> | Array<ReturnType<typeof createElement>>
  if (q !== '') {
    const local = ids.map((id) => byId[id]).filter(visible).filter((s) => (s.displayTitle ?? '').toLowerCase().includes(q) || label(s).toLowerCase().includes(q)).sort((a: SessionLike, b: SessionLike) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
    const content: unknown[] = results ?? []
    const merged: Array<{ id: string; title: string; ws: string; snippet?: string }> = local.map((s) => ({ id: s.id, title: s.displayTitle ?? s.id, ws: label(s) }))
    const seenIds: Record<string, boolean> = {}
    merged.forEach((m) => { seenIds[m.id] = true })
    content.forEach((c) => {
      const ci = c as { sessionId?: string; snippet?: string }
      if (!ci.sessionId || seenIds[ci.sessionId]) return
      const s = byId[ci.sessionId]
      if (s) merged.push({ id: ci.sessionId, title: s.displayTitle ?? ci.sessionId, ws: label(s), ...(ci.snippet ? { snippet: ci.snippet } : {}) })
    })
    const rows = merged.slice(0, 20).map((m) => el('div', { key: m.id, className: 'dshide-session-row', onClick: () => { open(m.id) } }, el('span', { className: 'dshide-slot' }, el(StateDot, { state: 'done' })), el('span', { className: 'dshide-title' }, m.title), m.ws ? el('span', { className: 'dshide-rename' }, m.ws) : null, m.snippet ? el('span', { className: 'dshide-time' }, m.snippet) : null))
    body = searchState === 'loading' && rows.length === 0
      ? el('div', { className: 'dshide-loading' }, '搜索中…')
      : el('div', null,
        searchState === 'error'
          ? el('div', { className: 'dshide-search-warning' }, '会话全文搜索不可用（该部署未启用内容索引），仅按标题/工作区匹配。')
          : null,
        rows.length === 0 ? el('div', { className: 'dshide-empty' }, '未找到匹配的会话。') : rows)
  } else if (view === 'flat') {
    const flat = ids.map((id) => byId[id]).filter(visible).sort((a: SessionLike, b: SessionLike) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
    body = flat.length === 0 ? el('div', { className: 'dshide-empty' }, '暂无会话。') : flat.map((s) => sessionRow(s, false))
  } else {
    const accounted = new Set<string>()
    const groups = workspaceList.map((w) => { w.sessionIds.forEach((id) => { accounted.add(id) }); return workspaceRow(w) })
    const stray = ids.map((id) => byId[id]).filter(visible).filter((s) => !accounted.has(s.id)).sort((a: SessionLike, b: SessionLike) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
    if (stray.length > 0) groups.push(el('div', { key: '__ungrouped' }, el('div', { className: 'dshide-project-row', role: 'treeitem' }, el('span', { className: 'dshide-chevron' }, el(Icon, { name: 'chevron', size: 12 })), el('span', { className: 'dshide-slot' }, el(Icon, { name: 'folder', size: 16 })), el('span', { className: 'dshide-title' }, '未分组')), stray.map((s) => sessionRow(s, true))))
    body = groups
  }
  return el('div', { className: 'dshide-view' }, el('div', { className: 'dshide-toolbar' }, el('span', { className: 'dshide-title' }, '会话管理'), el('div', { className: 'dshide-seg' }, el('button', { type: 'button', className: `dshide-seg-btn${view === 'group' ? ' on' : ''}`, onClick: () => { setView('group') } }, '按工作区'), el('button', { type: 'button', className: `dshide-seg-btn${view === 'flat' ? ' on' : ''}`, onClick: () => { setView('flat') } }, '平铺')), el('button', { type: 'button', className: 'dshide-iconbtn', title: '新建会话', onClick: newSession }, el(Icon, { name: 'chat', size: 15 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '添加工作区', onClick: addWorkspace }, el(Icon, { name: 'plus', size: 15 }))), el('input', { className: 'dshide-search-input', style: { margin: '6px 8px', flex: 'none' }, placeholder: '搜索会话…', value: query, onChange: (e: { target: { value: string } }) => { setQuery(e.target.value) } }), action ? el('div', { className: 'dshide-actionbar' }, el('span', { className: 'dshide-actionbar-label' }, action.kind === 'wrename' ? '重命名工作区' : `删除工作区 ${action.name} ?`), action.kind === 'wrename' ? el('input', { className: 'dshide-actionbar-input', autoFocus: true, value: input, onChange: (e: { target: { value: string } }) => { setInput(e.target.value) }, onKeyDown: (e: { key: string }) => { if (e.key === 'Enter') runAction(); if (e.key === 'Escape') setAction(null) } }) : null, el('button', { type: 'button', className: 'dshide-iconbtn', title: '确认', onClick: runAction }, el(Icon, { name: action.kind === 'wrename' ? 'check' : 'trash', size: 14 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '取消', onClick: () => { setAction(null); setInput('') } }, el(Icon, { name: 'close', size: 14 }))) : null, el('div', { className: 'dshide-scroll' }, body))
}
