/**
 * IDE sidebar: the activity rail plus the active view (Explorer / Search /
 * Source Control / Sessions). Registers into `sidebar.workspaces`; it reads
 * the framework's global `useSessions` / `useWorkspaces` hooks (passed as the
 * root-scope runtime share) and the registrant inject face. Pure presentation.
 * @module dsh-client-ide-ui/client/IdeSidebar
 */
import { createElement, useEffect, useState } from 'react';
import { Icon } from "./icons.js";
import { rpc } from "./lib.js";
import { ExplorerView, SearchView, ScmView, SessionView } from "./views.js";
export function IdeSidebar(props) {
    const el = createElement;
    const wsState = props.useWorkspaces ? props.useWorkspaces((s) => s) : null;
    const sessState = props.useSessions ? props.useSessions((s) => s) : null;
    const [active, setActive] = useState('sessions');
    const [root, setRoot] = useState(undefined);
    const items = (wsState?.items ?? []);
    const recent = wsState?.recentWorkspaceId;
    useEffect(() => {
        if (root !== undefined)
            return;
        if (recent) {
            const w = items.find((x) => x.workspaceId === recent);
            if (w?.path) {
                setRoot(w.path);
                return;
            }
        }
        if (items[0]?.path) {
            setRoot(items[0].path);
            return;
        }
        rpc(props.ide.roots()).then((r) => { if (r.root)
            setRoot(r.root);
        else if (r.workspaces[0])
            setRoot(r.workspaces[0].path); });
    }, [root, recent, items]);
    const views = [{ id: 'files', icon: 'explorer', label: '资源管理器' }, { id: 'search', icon: 'search', label: '搜索' }, { id: 'scm', icon: 'scm', label: '源代码管理' }, { id: 'sessions', icon: 'chat', label: '会话管理' }];
    const pick = (v) => { if (!props.wide && props.expandSidebar)
        props.expandSidebar(); setActive(v); };
    const buttons = () => views.map((v) => el('button', { key: v.id, type: 'button', title: v.label, 'aria-label': v.label, className: `dshide-activity-btn${props.wide && active === v.id ? ' active' : ''}`, onClick: () => { pick(v.id); } }, el(Icon, { name: v.icon, size: 20 })));
    if (!props.wide)
        return el('div', { className: 'dshide-region rail' }, buttons());
    return el('div', { className: 'dshide-region' }, el('div', { className: 'dshide-activity' }, buttons()), el('div', { className: 'dshide-content' }, active === 'sessions' ? el(SessionView, { sessions: props.sessions, workspaces: props.workspaces, wsState, sessState }) : active === 'files' ? el(ExplorerView, { ide: props.ide, rpc: props.rpc, openDoc: props.openDoc, root, setRoot, workspaces: items }) : active === 'search' ? el(SearchView, { ide: props.ide, rpc: props.rpc, openDoc: props.openDoc, sessions: props.sessions, workspaces: props.workspaces, root }) : el(ScmView, { ide: props.ide, rpc: props.rpc, openDoc: props.openDoc, sessions: props.sessions, workspaces: props.workspaces, root })));
}
//# sourceMappingURL=IdeSidebar.js.map