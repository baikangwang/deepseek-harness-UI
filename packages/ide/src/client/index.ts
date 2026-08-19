/**
 * dsh-ide-ui client half, apply: mount the `ide` Remote, create the shared
 * editor store, and register the surfaces. The editor is a
 * `conversation.view` tab (official slot, distributable); there is NO shell
 * dependency — the plugin composes only through declared slots.
 * @module dsh-ide-ui/client
 */

import type { Context } from '@deepseek-ai/cordis'
import ideRemote from 'dsh-ide-ui/remote'
import type { IdeRemoteFace } from 'dsh-ide-ui/types'
// Type-only: resolve the injected client service augmentations + branded ids.
import type {} from '@deepseek-ai/dsh-api-remotes/client'
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

/** Required services (cordis fiber inject). NOTE: `remote.ide` must NOT be
 * declared here — it is created by this plugin's own `$mount` inside apply, and
 * declaring it would park the fiber before apply can run (self-provided
 * namespace). Read it via `ctx.get('remote.ide')` instead, mirroring how
 * `dsh-api-remotes` mounts namespaces while consumers declare `remote.*`. */
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

  // `remote.ide` is provided by our own $mount above, so it cannot be in the
  // inject declaration (self-provided namespace); read it via ctx.get, which
  // bypasses the inject gate.
  const ide = ctx.get('remote.ide') as unknown as IdeRemoteFace | undefined
  if (!ide) throw new Error('ide Remote was not mounted: ctx.get("remote.ide") returned undefined')
  const store = createIdeStore()

  // The client runtime augments cordis Context with sessions/workspaces;
  // assert the narrow face we use so typecheck does not depend on the
  // augmentation import chain resolving.
  interface SessionsFace {
    open(id: string): void
    search(query: string, signal: AbortSignal): Promise<{ ok: boolean; value: { items: unknown[]; hasMore: boolean }; error: { message: string } }>
    fork(opts: { sessionId: string; increaseTitle?: boolean }): Promise<string>
    archive(id: string): void
  }
  interface WorkspacesFace {
    startSession(): void
    pickDirectory(): Promise<string | null>
    create(input: { path: string }): Promise<unknown>
    rename(id: string, title: string): Promise<unknown>
    delete(id: string): Promise<unknown>
    archiveSession(id: string): void
  }
  const sessions = ctx.get('sessions') as unknown as SessionsFace
  const workspaces = ctx.get('workspaces') as unknown as WorkspacesFace

  const injected: IdeInjected = {
    ide,
    rpc,
    store,
    openDoc: (tab) => {
      store.add(tab)
      clickTabNow(['编辑器', 'Editor'])
    },
    sessions: {
      open: (id) => { sessions.open(id) },
      search: async (query, signal) => {
        const result = await sessions.search(query, signal)
        if (!result.ok) throw new Error(result.error.message)
        return result.value
      },
      fork: (id) => {
        sessions.fork({ sessionId: id })
          .then((childId) => { sessions.open(childId) })
          .catch(() => { /* fork or child-open failure keeps the current selection */ })
      },
      archive: (id) => { void workspaces.archiveSession(id) },
    },
    workspaces: {
      startSession: () => { workspaces.startSession() },
      pickDirectory: () => workspaces.pickDirectory(),
      create: (input) => workspaces.create(input),
      rename: (id, title) => workspaces.rename(id, title),
      delete: (id) => workspaces.delete(id),
    },
  }

  ctx.slots.inject('sidebar.workspaces', () => ctx.slots.register(
    // priority: -1 shadows the native ui-workspace browser (which registers at
    // default 0). Without it the single slot rejects the duplicate at priority 0
    // ("already has a registration"). Dynamic-plugin mode auto-assigned a unique
    // priority via the runner guard; bundle mode requires the explicit value.
    { name: 'sidebar.workspaces', priority: -1, inject: () => injected },
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
