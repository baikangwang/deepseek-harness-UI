/**
 * deepseek-harness-UI client half, apply: mount the `ide` Remote, create the
 * shared editor store, and register the surfaces. The editor is a
 * `conversation.view` tab (official slot, distributable); there is NO shell
 * dependency — the plugin composes only through declared slots.
 * @module @deepseek-ai/dsh-client-ui-ide/client
 */

import type { Context } from '@deepseek-ai/cordis'
import ideRemote from '@deepseek-ai/dsh-ide/remote'
import type { IdeRemoteFace } from '@deepseek-ai/dsh-ide/types'
// Type-only: resolve the injected client service augmentations + branded ids.
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type { SessionId, WorkspaceId } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pull the SlotMap merges we register into (sidebar.workspaces,
// conversation.view) through the contract module.
import type {} from './slots.ts'
import type { IdeInjected } from './slots.ts'
import { createIdeStore } from './stores.ts'
import { rpc } from './lib.ts'
import { IdeSidebar } from './IdeSidebar.tsx'
import { EditorView } from './EditorView.tsx'
// Side-effect: inject the global stylesheet (bundled by the standalone tsdown CSS plugin).
import './styles.module.css'

/** Required services (cordis fiber inject). */
export const inject = ['slots', 'remote', 'sessions', 'workspaces']

/** Activate the conversation editor view: click the 编辑器 tab by label. */
function clickTabNow(labels: string[]): boolean {
  try {
    const tabs = document.querySelectorAll('[role="tab"]')
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i]
      if (!tab) continue
      const txt = (tab.textContent ?? '').trim()
      for (const l of labels) if (txt === l) { (tab as HTMLElement).click(); return true }
    }
  } catch { /* no-op */ }
  return false
}

/**
 * Mount the ide Remote and register the sidebar + editor surfaces.
 * @param ctx - client root context.
 */
export async function apply(ctx: Context): Promise<void> {
  const disposeRemote = await ctx.remote.$mount(ideRemote)
  ctx.effect(() => () => { void disposeRemote() })

  const ide = (ctx.remote as unknown as { ide: IdeRemoteFace }).ide
  const store = createIdeStore()

  const injected: IdeInjected = {
    ide,
    rpc,
    store,
    openDoc: (tab) => {
      store.add(tab)
      clickTabNow(['编辑器', 'Editor'])
    },
    sessions: {
      open: (id) => { ctx.sessions.open(id as SessionId) },
      search: async (query, signal) => {
        const result = await ctx.sessions.search(query, signal)
        if (!result.ok) throw new Error(result.error.message)
        return result.value
      },
      fork: (id) => {
        ctx.sessions.fork({ sessionId: id as SessionId, increaseTitle: true })
          .then((childId) => { ctx.sessions.open(childId) })
          .catch(() => { /* fork or child-open failure keeps the current selection */ })
      },
      archive: (id) => { void ctx.workspaces.archiveSession(id as SessionId) },
    },
    workspaces: {
      startSession: () => { ctx.workspaces.startSession() },
      pickDirectory: () => ctx.workspaces.pickDirectory(),
      create: (input) => ctx.workspaces.create(input),
      rename: (id, title) => ctx.workspaces.rename(id as WorkspaceId, title),
      delete: (id) => ctx.workspaces.delete(id as WorkspaceId),
    },
  }

  ctx.slots.inject('sidebar.workspaces', () => ctx.slots.register(
    { name: 'sidebar.workspaces', inject: () => injected },
    // Boundary cast: the composed props include the owner + framework shares
    // (PropsRuntime<'sidebar.workspaces'>); the component itself types its own
    // props. A full SlotMap-typed register is the residual follow-up.
    IdeSidebar as any,
  ))

  ctx.slots.inject('conversation.view', () => ctx.slots.register(
    { name: 'conversation.view', id: 'editor', order: 20, label: '编辑器', inject: () => injected },
    EditorView as any,
  ))
}
