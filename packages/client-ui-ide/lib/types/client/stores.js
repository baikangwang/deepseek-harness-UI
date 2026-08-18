/**
 * Editor-column store: the open document / diff tabs shared between the
 * sidebar (opens a tab) and the editor column (renders the tabs). A
 * `createIdeStore()` factory, created once inside `apply` and handed to both
 * registrations — never a module-level singleton (packages/client/AGENTS.md).
 * @module dsh-client-ide-ui/client/stores
 */
/** Create one editor-tab store instance. */
export function createIdeStore() {
    let tabs = [];
    let activeId = null;
    const listeners = [];
    const emit = () => { for (const fn of listeners) {
        try {
            fn();
        }
        catch { /* listener isolated */ }
    } };
    return {
        get tabs() { return tabs; },
        get activeId() { return activeId; },
        subscribe(fn) {
            listeners.push(fn);
            return () => { const i = listeners.indexOf(fn); if (i >= 0)
                listeners.splice(i, 1); };
        },
        add(tab) {
            const ex = tabs.find((t) => t.key === tab.key);
            if (ex) {
                activeId = tab.key;
                emit();
                return;
            }
            tabs = [...tabs, tab];
            activeId = tab.key;
            emit();
        },
        close(key) {
            const i = tabs.findIndex((t) => t.key === key);
            if (i < 0)
                return;
            const next = [...tabs.slice(0, i), ...tabs.slice(i + 1)];
            tabs = next;
            if (activeId === key) {
                const n = next[i] ?? next[i - 1];
                activeId = n ? n.key : null;
            }
            emit();
        },
        setActive(key) { if (activeId !== key) {
            activeId = key;
            emit();
        } },
    };
}
//# sourceMappingURL=stores.js.map