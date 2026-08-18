/**
 * deepseek-harness-UI client half, apply: mount the `ide` Remote, create the
 * shared editor store, and register the surfaces. The editor is a
 * `conversation.view` tab (official slot, distributable); there is NO shell
 * dependency — the plugin composes only through declared slots.
 * @module dsh-client-ide-ui/client
 */
import ideRemote from 'dsh-ide-ui/remote';
import { createIdeStore } from "./stores.js";
import { rpc } from "./lib.js";
import { IdeSidebar } from "./IdeSidebar.js";
import { EditorView } from "./EditorView.js";
/** Required services (cordis fiber inject). */
export const inject = ['slots', 'remote', 'sessions', 'workspaces'];
/** Activate the conversation editor view: click the 编辑器 tab by label. */
function clickTabNow(labels) {
    try {
        const tabs = document.querySelectorAll('[role="tab"]');
        for (let i = 0; i < tabs.length; i++) {
            const tab = tabs[i];
            if (!tab)
                continue;
            const txt = (tab.textContent ?? '').trim();
            for (const l of labels)
                if (txt === l) {
                    tab.click();
                    return true;
                }
        }
    }
    catch { /* no-op */ }
    return false;
}
/**
 * Mount the ide Remote and register the sidebar + editor surfaces.
 * @param ctx - client root context.
 */
export async function apply(ctx) {
    const disposeRemote = await ctx.remote.$mount(ideRemote);
    ctx.effect(() => () => { void disposeRemote(); });
    const ide = ctx.remote.ide;
    const store = createIdeStore();
    const injected = {
        ide,
        rpc,
        store,
        openDoc: (tab) => {
            store.add(tab);
            clickTabNow(['编辑器', 'Editor']);
        },
        sessions: {
            open: (id) => { ctx.sessions.open(id); },
            search: async (query, signal) => {
                const result = await ctx.sessions.search(query, signal);
                if (!result.ok)
                    throw new Error(result.error.message);
                return result.value;
            },
            fork: (id) => {
                ctx.sessions.fork({ sessionId: id, increaseTitle: true })
                    .then((childId) => { ctx.sessions.open(childId); })
                    .catch(() => { });
            },
            archive: (id) => { void ctx.workspaces.archiveSession(id); },
        },
        workspaces: {
            startSession: () => { ctx.workspaces.startSession(); },
            pickDirectory: () => ctx.workspaces.pickDirectory(),
            create: (input) => ctx.workspaces.create(input),
            rename: (id, title) => ctx.workspaces.rename(id, title),
            delete: (id) => ctx.workspaces.delete(id),
        },
    };
    ctx.slots.inject('sidebar.workspaces', () => ctx.slots.register({ name: 'sidebar.workspaces', inject: () => injected }, 
    // Boundary cast: the composed props include the owner + framework shares
    // (PropsRuntime<'sidebar.workspaces'>); the component itself types its own
    // props. A full SlotMap-typed register is the residual follow-up.
    IdeSidebar));
    ctx.slots.inject('conversation.view', () => ctx.slots.register({ name: 'conversation.view', id: 'editor', order: 20, label: '编辑器', inject: () => injected }, EditorView));
}
//# sourceMappingURL=index.js.map