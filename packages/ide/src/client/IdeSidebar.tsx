/**
 * IDE sidebar: the activity rail plus the active view (Explorer / Search /
 * Source Control / Sessions). Registers into `sidebar.workspaces`; it reads
 * the framework's global `useSessions` / `useWorkspaces` hooks (passed as the
 * root-scope runtime share) and the registrant inject face. Pure presentation.
 * @module dsh-client-ide-ui/client/IdeSidebar
 */

import { createElement, useEffect, useState } from 'react'
import type { IdeInjected } from './slots.ts'
import { Icon } from './icons.tsx'
import { rpc } from './lib.ts'
import { ExplorerView, SearchView, ScmView, SessionView } from './views.tsx'
import type { SessionSnapshot, WorkspaceSnapshot } from './views.tsx'

type UseSnapshot<T> = (selector: (state: unknown) => unknown) => T

export interface IdeSidebarProps extends IdeInjected {
  /** Owner share (ui-sidebar shell): wide renders the full browser, rail the icon column. */
  wide: boolean
  /** Owner share: rail icons request expansion. */
  expandSidebar: () => void
  useSessions?: UseSnapshot<SessionSnapshot | null>
  useWorkspaces?: UseSnapshot<WorkspaceSnapshot | null>
}

export function IdeSidebar(props: IdeSidebarProps): ReturnType<typeof createElement> {
  const el = createElement
  const wsState = props.useWorkspaces ? props.useWorkspaces((s) => s as WorkspaceSnapshot) : null
  const sessState = props.useSessions ? props.useSessions((s) => s as SessionSnapshot) : null
  const [active, setActive] = useState('sessions')
  const [root, setRoot] = useState<string | undefined>(undefined)
  const items: Array<{ workspaceId: string; title?: string; path: string }> = (wsState?.items ?? []) as Array<{ workspaceId: string; title?: string; path: string }>
  const recent = (wsState as unknown as { recentWorkspaceId?: string })?.recentWorkspaceId
  useEffect(() => {
    if (root !== undefined) return
    if (recent) { const w = items.find((x) => x.workspaceId === recent); if (w?.path) { setRoot(w.path); return } }
    if (items[0]?.path) { setRoot(items[0].path); return }
    rpc(props.ide.roots()).then((r) => { if (r.root) setRoot(r.root); else if (r.workspaces[0]) setRoot(r.workspaces[0].path) })
  }, [root, recent, items])
  const views = [{ id: 'files', icon: 'explorer', label: '资源管理器' }, { id: 'search', icon: 'search', label: '搜索' }, { id: 'scm', icon: 'scm', label: '源代码管理' }, { id: 'sessions', icon: 'chat', label: '会话管理' }]
  const pick = (v: string): void => { if (!props.wide && props.expandSidebar) props.expandSidebar(); setActive(v) }
  const buttons = (): Array<ReturnType<typeof createElement>> => views.map((v) => el('button', { key: v.id, type: 'button', title: v.label, 'aria-label': v.label, className: `dshide-activity-btn${props.wide && active === v.id ? ' active' : ''}`, onClick: () => { pick(v.id) } }, el(Icon, { name: v.icon, size: 18 })))
  if (!props.wide) return el('div', { className: 'dshide-region rail' }, buttons())
  return el('div', { className: 'dshide-region' }, el('div', { className: 'dshide-activity' }, buttons()), el('div', { className: 'dshide-content' }, active === 'sessions' ? el(SessionView, { sessions: props.sessions, workspaces: props.workspaces, wsState, sessState }) : active === 'files' ? el(ExplorerView, { ide: props.ide, rpc: props.rpc, openDoc: props.openDoc, root, setRoot, workspaces: items }) : active === 'search' ? el(SearchView, { ide: props.ide, rpc: props.rpc, openDoc: props.openDoc, sessions: props.sessions, workspaces: props.workspaces, root }) : el(ScmView, { ide: props.ide, rpc: props.rpc, openDoc: props.openDoc, sessions: props.sessions, workspaces: props.workspaces, root })))
}
