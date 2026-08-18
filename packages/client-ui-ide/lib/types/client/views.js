/**
 * Sidebar views: Explorer (file tree), Search, Source Control, Sessions.
 * Pure presentation — all data and callbacks arrive through props (the
 * registrant inject face + framework hook snapshots). No ctx reach.
 * @module @deepseek-ai/dsh-client-ui-ide/client/views
 */
import { createElement, useEffect, useState } from 'react';
import { Icon } from "./icons.js";
import { baseName, dirnameOf, joinPath, relTime } from "./lib.js";
function Tree(props) {
    const { ide, rpc } = props.injected;
    const el = createElement;
    const isOpen = props.depth === 0 || props.expanded.has(props.path);
    const [entries, setEntries] = useState(undefined);
    useEffect(() => {
        let cancelled = false;
        setEntries(undefined);
        rpc(ide.listDir(props.path)).then((r) => { if (!cancelled)
            setEntries(r.entries ?? []); }, () => { if (!cancelled)
            setEntries([]); });
        return () => { cancelled = true; };
    }, [props.path, isOpen]);
    const f = (props.filter ?? '').toLowerCase();
    const visible = (entries ?? []).filter((e) => (props.showHidden || !(e.name.length > 0 && e.name[0] === '.')) && (f === '' || e.name.toLowerCase().includes(f)));
    return el('div', null, entries === undefined ? el('div', { className: 'dshide-loading' }, '加载中…') : visible.map((e) => {
        if (e.type === 'directory') {
            const open = props.expanded.has(e.path);
            return el('div', { key: e.path }, el('div', {
                className: 'dshide-row', style: { paddingLeft: `${props.depth * 12 + 8}px` },
                draggable: true,
                onDragStart: (ev) => { ev.dataTransfer.setData('text/plain', e.path); ev.dataTransfer.effectAllowed = 'move'; },
                onDragOver: (ev) => { ev.preventDefault(); ev.dataTransfer.dropEffect = 'move'; },
                onDrop: (ev) => { ev.preventDefault(); props.onMove(ev.dataTransfer.getData('text/plain'), e.path); },
                onClick: () => { props.toggle(e.path); },
            }, el('span', { className: `dshide-arrow${open ? ' open' : ''}` }, el(Icon, { name: 'chevron', size: 12 })), el(Icon, { name: 'folder', size: 15, className: 'dshide-glyph' }), el('span', { className: 'dshide-name' }, e.name), el('span', { className: 'dshide-row-actions', onClick: (ev) => { ev.stopPropagation(); } }, el('button', { type: 'button', className: 'dshide-row-btn', title: '在资源管理器中打开', onClick: (ev) => { ev.stopPropagation(); void rpc(ide.explore(e.path, false)); } }, el(Icon, { name: 'locate', size: 13 })), el('button', { type: 'button', className: 'dshide-row-btn', title: '重命名', onClick: (ev) => { ev.stopPropagation(); props.onRename(e.path, e.name); } }, el(Icon, { name: 'edit', size: 13 })), el('button', { type: 'button', className: 'dshide-row-btn', title: '删除', onClick: (ev) => { ev.stopPropagation(); props.onDelete(e.path, e.name); } }, el(Icon, { name: 'trash', size: 13 })))), open ? el(Tree, { path: e.path, depth: props.depth + 1, expanded: props.expanded, toggle: props.toggle, onOpen: props.onOpen, showHidden: props.showHidden, filter: props.filter, onRename: props.onRename, onDelete: props.onDelete, onMove: props.onMove, injected: props.injected }) : null);
        }
        return el('div', {
            key: e.path, className: 'dshide-row', style: { paddingLeft: `${props.depth * 12 + 8 + 14}px` },
            draggable: true,
            onDragStart: (ev) => { ev.dataTransfer.setData('text/plain', e.path); ev.dataTransfer.effectAllowed = 'move'; },
            onClick: () => { props.onOpen(e.path); },
        }, el(Icon, { name: 'file', size: 15, className: 'dshide-glyph' }), el('span', { className: 'dshide-name' }, e.name), el('span', { className: 'dshide-row-actions', onClick: (ev) => { ev.stopPropagation(); } }, el('button', { type: 'button', className: 'dshide-row-btn', title: '在资源管理器中显示', onClick: (ev) => { ev.stopPropagation(); void rpc(ide.explore(e.path, true)); } }, el(Icon, { name: 'locate', size: 13 })), el('button', { type: 'button', className: 'dshide-row-btn', title: '重命名', onClick: (ev) => { ev.stopPropagation(); props.onRename(e.path, e.name); } }, el(Icon, { name: 'edit', size: 13 })), el('button', { type: 'button', className: 'dshide-row-btn', title: '删除', onClick: (ev) => { ev.stopPropagation(); props.onDelete(e.path, e.name); } }, el(Icon, { name: 'trash', size: 13 }))));
    }));
}
export function ExplorerView(props) {
    const { ide, rpc, openDoc } = props;
    const el = createElement;
    const [expanded, setExpanded] = useState(() => new Set());
    const [showHidden] = useState(false);
    const [filter, setFilter] = useState('');
    const [action, setAction] = useState(null);
    const [input, setInput] = useState('');
    const [busy, setBusy] = useState(false);
    const seen = {};
    const options = (props.workspaces ?? []).map((w) => ({ path: w.path, title: w.title ?? w.path })).filter((o) => { if (seen[o.path])
        return false; seen[o.path] = true; return true; });
    if (props.root && !seen[props.root])
        options.unshift({ path: props.root, title: props.root });
    const toggle = (p) => { setExpanded((prev) => { const n = new Set(prev); if (n.has(p))
        n.delete(p);
    else
        n.add(p); return n; }); };
    const openFile = (path) => { openDoc({ key: path, kind: 'file', path }); };
    const refresh = () => { setExpanded(new Set()); };
    const move = (src, dest) => { if (src && src !== dest)
        void rpc(ide.rename(src, joinPath(dest, baseName(src)))).then(refresh); };
    const paste = () => { setBusy(true); void rpc(ide.paste(props.root ?? '')).then(() => { setBusy(false); refresh(); }); };
    const startAction = (kind, path, name) => { setAction({ kind, path, name: name ?? '' }); setInput(name ?? ''); };
    const cancel = () => { setAction(null); setInput(''); };
    const runAction = () => {
        const a = action;
        if (!a)
            return;
        if (a.kind !== 'delete' && input.trim() === '')
            return;
        setBusy(true);
        const done = () => { setBusy(false); setAction(null); setInput(''); refresh(); };
        if (a.kind === 'newfile')
            void rpc(ide.newFile(joinPath(a.path, input.trim()))).then(done);
        else if (a.kind === 'newdir')
            void rpc(ide.mkdir(joinPath(a.path, input.trim()))).then(done);
        else if (a.kind === 'rename')
            void rpc(ide.rename(a.path, joinPath(dirnameOf(a.path), input.trim()))).then(done);
        else if (a.kind === 'delete')
            void rpc(ide.delete(a.path)).then(done);
    };
    const actionLabel = action ? (action.kind === 'newfile' ? '新建文件' : action.kind === 'newdir' ? '新建文件夹' : action.kind === 'rename' ? '重命名为' : `删除 ${action.name} ?`) : '';
    return el('div', { className: 'dshide-view' }, el('div', { className: 'dshide-toolbar' }, el('select', { className: 'dshide-select', value: props.root ?? '', onChange: (e) => { props.setRoot(e.target.value); refresh(); } }, options.map((o) => el('option', { key: o.path, value: o.path }, o.title))), el('button', { type: 'button', className: 'dshide-iconbtn', title: '新建文件', onClick: () => { startAction('newfile', props.root ?? '', ''); } }, el(Icon, { name: 'file', size: 15 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '新建文件夹', onClick: () => { startAction('newdir', props.root ?? '', ''); } }, el(Icon, { name: 'folder', size: 15 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '粘贴', onClick: paste, disabled: busy }, el(Icon, { name: 'check', size: 15 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '刷新', onClick: refresh }, el(Icon, { name: 'refresh', size: 15 }))), el('input', { className: 'dshide-search-input', style: { margin: '6px 8px', flex: 'none' }, placeholder: '按名称查找…', value: filter, onChange: (e) => { setFilter(e.target.value); } }), action ? el('div', { className: 'dshide-actionbar' }, el('span', { className: 'dshide-actionbar-label' }, actionLabel), action.kind !== 'delete' ? el('input', { className: 'dshide-actionbar-input', autoFocus: true, value: input, onChange: (e) => { setInput(e.target.value); }, onKeyDown: (e) => { if (e.key === 'Enter')
            runAction(); if (e.key === 'Escape')
            cancel(); } }) : null, el('button', { type: 'button', className: 'dshide-iconbtn', title: '确认', onClick: runAction, disabled: busy }, el(Icon, { name: action.kind === 'delete' ? 'trash' : 'check', size: 14 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '取消', onClick: cancel }, el(Icon, { name: 'close', size: 14 }))) : null, el('div', { className: 'dshide-scroll' }, el(Tree, { path: props.root ?? '', depth: 0, expanded, toggle, onOpen: openFile, showHidden, filter, onRename: (p, n) => startAction('rename', p, n), onDelete: (p, n) => startAction('delete', p, n), onMove: move, injected: props })));
}
export function SearchView(props) {
    const { ide, rpc, openDoc } = props;
    const el = createElement;
    const [query, setQuery] = useState('');
    const [cs, setCs] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const run = () => {
        if (!query.trim())
            return;
        setLoading(true);
        setResult(null);
        rpc(ide.search(props.root ?? '', query, cs)).then((r) => { setResult(r); setLoading(false); }, (e) => { setResult({ error: String(e.message), matches: [], files: 0, truncated: false }); setLoading(false); });
    };
    const openFile = (path) => { openDoc({ key: path, kind: 'file', path }); };
    return el('div', { className: 'dshide-view' }, el('div', { className: 'dshide-search-box' }, el('input', { className: 'dshide-search-input', placeholder: '在工作区中搜索…', value: query, onChange: (e) => { setQuery(e.target.value); }, onKeyDown: (e) => { if (e.key === 'Enter')
            run(); } }), el('button', { type: 'button', className: 'dshide-iconbtn', title: '区分大小写', onClick: () => { setCs((v) => !v); }, style: cs ? { color: 'var(--dsw-alias-brand-primary)' } : undefined }, 'Aa'), el('button', { type: 'button', className: 'dshide-iconbtn', title: '搜索', onClick: run }, el(Icon, { name: 'search', size: 15 }))), loading ? el('div', { className: 'dshide-loading' }, '搜索中…') : result == null ? el('div', { className: 'dshide-empty' }, '输入关键字，在工作区文件中搜索内容。') : result.error ? el('div', { className: 'dshide-empty' }, result.error) : el('div', { className: 'dshide-results' }, el('div', { className: 'dshide-result-summary' }, `${result.matches.length} 处匹配 · ${result.files} 个文件${result.truncated ? '（已截断）' : ''}`), result.matches.length === 0 ? el('div', { className: 'dshide-empty' }, '未找到匹配结果。') : result.matches.map((m, i) => el('div', { key: i, className: 'dshide-match', onClick: () => { openFile(m.path); } }, el('div', { className: 'dshide-match-path' }, m.path), el('div', { className: 'dshide-match-line' }, el('span', { className: 'dshide-match-lineno' }, String(m.line)), el('span', { className: 'dshide-match-text' }, m.text))))));
}
export function ScmView(props) {
    const { ide, rpc, openDoc } = props;
    const el = createElement;
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const refresh = () => {
        if (!props.root)
            return;
        setLoading(true);
        rpc(ide.gitStatus(props.root)).then((r) => { setStatus(r); setLoading(false); }, (e) => { setStatus({ branch: '', changes: [], notRepo: true, error: String(e.message) }); setLoading(false); });
    };
    useEffect(() => { refresh(); }, [props.root]);
    const act = (fn) => { setBusy(true); void fn().then(() => { setBusy(false); refresh(); }); };
    const openDiff = (path) => { openDoc({ key: `diff:${path}`, kind: 'diff', path, ...(props.root ? { cwd: props.root } : {}) }); };
    const commit = () => {
        if (!message.trim())
            return;
        setBusy(true);
        void rpc(ide.gitCommit(props.root ?? '', message)).then(() => { setBusy(false); setMessage(''); refresh(); });
    };
    const changes = status?.changes ?? [];
    const staged = changes.filter((c) => c.staged && c.staged !== ' ');
    const unstaged = changes.filter((c) => !c.staged || c.staged === ' ');
    const untracked = changes.filter((c) => c.xy === '??');
    const row = (c, action) => el('div', { key: c.path, className: 'dshide-row', onClick: () => { openDiff(c.path); } }, el('span', { className: 'dshide-scm-status', title: c.xy }, c.staged || c.unstaged || '?'), el('span', { className: 'dshide-name' }, c.path), c.renameFrom ? el('span', { className: 'dshide-rename' }, `← ${c.renameFrom}`) : null, el('span', { className: 'dshide-row-actions', onClick: (ev) => { ev.stopPropagation(); } }, el('button', { type: 'button', className: 'dshide-row-btn', title: action === 'stage' ? '暂存' : '取消暂存', onClick: (ev) => { ev.stopPropagation(); act(() => (action === 'stage' ? rpc(ide.gitStage(props.root ?? '', [c.path])) : rpc(ide.gitUnstage(props.root ?? '', [c.path])))); } }, el(Icon, { name: action === 'stage' ? 'plus' : 'minus', size: 13 })), el('button', { type: 'button', className: 'dshide-row-btn', title: '丢弃更改', onClick: (ev) => { ev.stopPropagation(); act(() => rpc(ide.gitDiscard(props.root ?? '', c.path, c.xy === '??'))); } }, el(Icon, { name: 'trash', size: 13 }))));
    const group = (label, list, action) => list.length === 0 ? null : el('div', { className: 'dshide-scm-group' }, el('div', { className: 'dshide-scm-group-title' }, `${label} (${list.length})`), list.map((c) => row(c, action)));
    return el('div', { className: 'dshide-view' }, el('div', { className: 'dshide-toolbar' }, el('span', { className: 'dshide-title' }, '源代码管理'), el('span', { className: 'dshide-branch', title: status?.branch ?? '' }, el(Icon, { name: 'scm', size: 14 }), el('span', null, status?.branch ?? '')), el('button', { type: 'button', className: 'dshide-iconbtn', title: '暂存全部', onClick: () => { act(() => rpc(ide.gitStageAll(props.root ?? ''))); }, disabled: busy }, el(Icon, { name: 'plus', size: 14 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '取消暂存全部', onClick: () => { act(() => rpc(ide.gitUnstageAll(props.root ?? ''))); }, disabled: busy }, el(Icon, { name: 'minus', size: 14 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '刷新', onClick: refresh, disabled: busy }, el(Icon, { name: 'refresh', size: 14 }))), el('div', { className: 'dshide-commit' }, el('textarea', { className: 'dshide-commit-input', placeholder: '提交信息（Ctrl+Enter 提交）', value: message, onChange: (e) => { setMessage(e.target.value); }, onKeyDown: (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter')
            commit(); } }), el('button', { type: 'button', className: 'dshide-commit-btn', disabled: !message.trim() || staged.length === 0 || busy, onClick: commit }, busy ? '…' : '提交')), loading ? el('div', { className: 'dshide-loading' }, '读取中…') : status == null ? null : status.notRepo ? el('div', { className: 'dshide-empty' }, '当前工作区不是 Git 仓库。') : status.error ? el('div', { className: 'dshide-empty' }, status.error) : el('div', { className: 'dshide-scm' }, changes.length === 0 ? el('div', { className: 'dshide-empty' }, '没有未提交的更改。') : el('div', null, group('已暂存', staged, 'unstage'), group('更改', unstaged, 'stage'), group('未跟踪', untracked, 'stage'))));
}
export function SessionView(props) {
    const { sessions, workspaces } = props;
    const el = createElement;
    const sessState = props.sessState;
    const wsState = props.wsState;
    const ids = sessState?.ids ?? [];
    const byId = (sessState?.byId ?? {});
    const current = sessState?.current;
    const workspaceList = (wsState?.items ?? []);
    const archived = new Set(wsState?.archivedSessionIds ?? []);
    const [view, setView] = useState('group');
    const [expanded, setExpanded] = useState(() => new Set());
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [action, setAction] = useState(null);
    const [input, setInput] = useState('');
    useEffect(() => {
        const q = query.trim();
        if (q === '') {
            setResults(null);
            return;
        }
        let cancelled = false;
        const ctrl = new AbortController();
        const timer = window.setTimeout(() => {
            sessions.search(q, ctrl.signal).then((r) => { if (!cancelled)
                setResults(r); }).catch(() => { if (!cancelled)
                setResults({ items: [] }); });
        }, 250);
        return () => { cancelled = true; window.clearTimeout(timer); try {
            ctrl.abort();
        }
        catch { /* no-op */ } };
    }, [query]);
    const q = query.trim().toLowerCase();
    const workspaceBySession = {};
    for (const w of workspaceList)
        for (const sid of w.sessionIds)
            if (!workspaceBySession[sid])
                workspaceBySession[sid] = w.title;
    const visible = (s) => !!s && s.origin !== 'subagent' && !archived.has(s.id) && (!s.blank || s.id === current);
    const label = (s) => workspaceBySession[s.id] || (s.cwd ? s.cwd.replace(/[\\/]+$/, '').split(/[\\/]/).pop() ?? '' : '');
    const clickChatTab = () => {
        try {
            const tabs = document.querySelectorAll('[role="tab"]');
            let first = null;
            for (let i = 0; i < tabs.length; i++) {
                const tab = tabs[i];
                if (!tab)
                    continue;
                const txt = (tab.textContent ?? '').trim();
                if (!first)
                    first = tab;
                if (txt === '对话' || txt === 'Chat') {
                    tab.click();
                    return true;
                }
            }
            if (first) {
                first.click();
                return true;
            }
        }
        catch { /* no-op */ }
        return false;
    };
    const open = (id) => {
        sessions.open(id);
        if (id === current) {
            clickChatTab();
        }
        else {
            [150, 350, 650, 1100].forEach((d) => { window.setTimeout(clickChatTab, d); });
        }
    };
    const newSession = () => { workspaces.startSession(); };
    const addWorkspace = () => { workspaces.pickDirectory().then((p) => { if (p)
        void workspaces.create({ path: p }); }); };
    const forkSession = (id) => { sessions.fork(id); };
    const archiveSession = (id) => { sessions.archive(id); };
    const runAction = () => {
        const a = action;
        if (!a)
            return;
        const done = () => { setAction(null); setInput(''); };
        if (a.kind === 'wrename' && input.trim())
            workspaces.rename(a.id, input.trim()).then(done);
        else if (a.kind === 'wdelete')
            workspaces.delete(a.id).then(done);
    };
    const sessionRow = (s, indent) => el('div', { key: s.id, className: `dshide-row${s.id === current ? ' selected' : ''}`, style: indent ? { paddingLeft: '18px' } : undefined, title: s.displayTitle, onClick: () => { open(s.id); } }, el('span', { className: 'dshide-dot' }), el('span', { className: 'dshide-name' }, s.displayTitle || s.id), el('span', { className: 'dshide-time' }, relTime(s.updatedAt)), el('span', { className: 'dshide-row-actions', onClick: (ev) => { ev.stopPropagation(); } }, el('button', { type: 'button', className: 'dshide-row-btn', title: '派生会话', onClick: (ev) => { ev.stopPropagation(); forkSession(s.id); } }, el(Icon, { name: 'scm', size: 13 })), el('button', { type: 'button', className: 'dshide-row-btn', title: '归档', onClick: (ev) => { ev.stopPropagation(); archiveSession(s.id); } }, el(Icon, { name: 'trash', size: 13 }))));
    const workspaceRow = (w) => {
        const members = (w.sessionIds ?? []).map((id) => byId[id]).filter(visible).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
        const isOpen = expanded.has(w.workspaceId);
        return el('div', { key: w.workspaceId }, el('div', { className: 'dshide-wsgroup-title', title: w.path, onClick: () => { toggleGroup(w.workspaceId); } }, el('span', { className: `dshide-arrow${isOpen ? ' open' : ''}` }, el(Icon, { name: 'chevron', size: 12 })), el(Icon, { name: 'folder', size: 14, className: 'dshide-glyph' }), el('span', { className: 'dshide-name' }, w.title), el('span', { className: 'dshide-row-actions', onClick: (ev) => { ev.stopPropagation(); } }, el('button', { type: 'button', className: 'dshide-row-btn', title: '重命名工作区', onClick: (ev) => { ev.stopPropagation(); setAction({ kind: 'wrename', id: w.workspaceId, name: w.title }); setInput(w.title); } }, el(Icon, { name: 'edit', size: 13 })), el('button', { type: 'button', className: 'dshide-row-btn', title: '删除工作区', onClick: (ev) => { ev.stopPropagation(); setAction({ kind: 'wdelete', id: w.workspaceId, name: w.title }); } }, el(Icon, { name: 'trash', size: 13 })))), isOpen ? members.map((s) => sessionRow(s, true)) : null);
    };
    const toggleGroup = (id) => { setExpanded((prev) => { const n = new Set(prev); if (n.has(id))
        n.delete(id);
    else
        n.add(id); return n; }); };
    let body;
    if (q !== '') {
        const local = ids.map((id) => byId[id]).filter(visible).filter((s) => (s.displayTitle ?? '').toLowerCase().includes(q) || label(s).toLowerCase().includes(q)).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
        const content = results?.items ?? [];
        const merged = local.map((s) => ({ id: s.id, title: s.displayTitle ?? s.id, ws: label(s) }));
        const seenIds = {};
        merged.forEach((m) => { seenIds[m.id] = true; });
        content.forEach((c) => {
            const ci = c;
            if (!ci.sessionId || seenIds[ci.sessionId])
                return;
            const s = byId[ci.sessionId];
            if (s)
                merged.push({ id: ci.sessionId, title: s.displayTitle ?? ci.sessionId, ws: label(s), ...(ci.snippet ? { snippet: ci.snippet } : {}) });
        });
        const rows = merged.slice(0, 20).map((m) => el('div', { key: m.id, className: 'dshide-row', onClick: () => { open(m.id); } }, el('span', { className: 'dshide-dot' }), el('span', { className: 'dshide-name' }, m.title), m.ws ? el('span', { className: 'dshide-rename' }, m.ws) : null, m.snippet ? el('span', { className: 'dshide-time' }, m.snippet) : null));
        body = rows.length === 0 ? el('div', { className: 'dshide-empty' }, '未找到匹配的会话。') : rows;
    }
    else if (view === 'flat') {
        const flat = ids.map((id) => byId[id]).filter(visible).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
        body = flat.length === 0 ? el('div', { className: 'dshide-empty' }, '暂无会话。') : flat.map((s) => sessionRow(s, false));
    }
    else {
        const accounted = new Set();
        const groups = workspaceList.map((w) => { w.sessionIds.forEach((id) => { accounted.add(id); }); return workspaceRow(w); });
        const stray = ids.map((id) => byId[id]).filter(visible).filter((s) => !accounted.has(s.id)).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
        if (stray.length > 0)
            groups.push(el('div', { key: '__ungrouped' }, el('div', { className: 'dshide-wsgroup-title' }, el('span', { className: 'dshide-arrow' }, el(Icon, { name: 'chevron', size: 12 })), el(Icon, { name: 'folder', size: 14, className: 'dshide-glyph' }), el('span', { className: 'dshide-name' }, '未分组')), stray.map((s) => sessionRow(s, true))));
        body = groups;
    }
    return el('div', { className: 'dshide-view' }, el('div', { className: 'dshide-toolbar' }, el('span', { className: 'dshide-title' }, '会话管理'), el('div', { className: 'dshide-seg' }, el('button', { type: 'button', className: `dshide-seg-btn${view === 'group' ? ' on' : ''}`, onClick: () => { setView('group'); } }, '按工作区'), el('button', { type: 'button', className: `dshide-seg-btn${view === 'flat' ? ' on' : ''}`, onClick: () => { setView('flat'); } }, '平铺')), el('button', { type: 'button', className: 'dshide-iconbtn', title: '新建会话', onClick: newSession }, el(Icon, { name: 'chat', size: 15 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '添加工作区', onClick: addWorkspace }, el(Icon, { name: 'plus', size: 15 }))), el('input', { className: 'dshide-search-input', style: { margin: '6px 8px', flex: 'none' }, placeholder: '搜索会话…', value: query, onChange: (e) => { setQuery(e.target.value); } }), action ? el('div', { className: 'dshide-actionbar' }, el('span', { className: 'dshide-actionbar-label' }, action.kind === 'wrename' ? '重命名工作区' : `删除工作区 ${action.name} ?`), action.kind === 'wrename' ? el('input', { className: 'dshide-actionbar-input', autoFocus: true, value: input, onChange: (e) => { setInput(e.target.value); }, onKeyDown: (e) => { if (e.key === 'Enter')
            runAction(); if (e.key === 'Escape')
            setAction(null); } }) : null, el('button', { type: 'button', className: 'dshide-iconbtn', title: '确认', onClick: runAction }, el(Icon, { name: action.kind === 'wrename' ? 'check' : 'trash', size: 14 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '取消', onClick: () => { setAction(null); setInput(''); } }, el(Icon, { name: 'close', size: 14 }))) : null, el('div', { className: 'dshide-scroll' }, body));
}
//# sourceMappingURL=views.js.map