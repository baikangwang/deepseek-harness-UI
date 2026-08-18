/**
 * deepseek-harness-UI client half, apply: mount the `ide` Remote, create the
 * shared editor store, and register the two surfaces (`sidebar.workspaces`
 * plus `editor`, or the `conversation.view` fallback). Registration goes
 * through `ctx.slots.inject` (waits on the owner declaration, follows HMR
 * lifetimes); business data rides the register `inject` factory — never a
 * wider ctx reach in components.
 * @module @deepseek-ai/dsh-client-ui-ide/client
 */

import type { Context } from '@deepseek-ai/cordis'
import ideRemote from '@deepseek-ai/dsh-ide/remote'
import type { IdeRemoteFace } from '@deepseek-ai/dsh-ide/types'
// Type-only: resolve the injected client service augmentations.
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pull the SlotMap merges we register into (sidebar.workspaces,
// editor, conversation.view) through the contract module.
import type {} from './slots.ts'
import type { IdeInjected } from './slots.ts'
import { createIdeStore } from './stores.ts'
import { rpc } from './lib.ts'
import { IdeSidebar } from './IdeSidebar.tsx'
import { EditorView } from './EditorView.tsx'

/** Required services (cordis fiber inject). */
export const inject = ['slots', 'remote', 'sessions', 'workspaces']

/** Fallback conversation-view activation: click the 编辑器/Chat tab by label. */
function clickTabNow(labels: string[]): boolean {
  try {
    const tabs = document.querySelectorAll('[role="tab"]')
    for (let i = 0; i < tabs.length; i++) {
      const txt = (tabs[i].textContent ?? '').trim()
      for (const l of labels) if (txt === l) { (tabs[i] as HTMLElement).click(); return true }
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
  // The `layout` service is optional: present exactly when ui-layout owns an
  // editor column (#6); without it the editor falls back to conversation.view.
  const layout = ctx.get('layout') as { openEditor?: () => void } | undefined
  const hasEditorColumn = layout !== undefined && typeof layout.openEditor === 'function'

  const injected: IdeInjected = {
    ide,
    rpc,
    store,
    openEditor: layout?.openEditor,
    openDoc: (tab) => {
      store.add(tab)
      if (hasEditorColumn) { layout?.openEditor?.(); return }
      clickTabNow(['编辑器', 'Editor'])
    },
    sessions: {
      open: (id) => { ctx.sessions.open(id) },
      search: async (query, signal) => {
        const result = await ctx.sessions.search(query, signal)
        if (!result.ok) throw new Error(result.error.message)
        return result.value
      },
      fork: (id) => {
        ctx.sessions.fork({ sessionId: id, increaseTitle: true })
          .then((childId) => { ctx.sessions.open(childId) })
          .catch(() => { /* fork or child-open failure keeps the current selection */ })
      },
      archive: (id) => { void ctx.workspaces.archiveSession(id) },
    },
    workspaces: {
      startSession: () => { ctx.workspaces.startSession() },
      pickDirectory: () => ctx.workspaces.pickDirectory(),
      create: (input) => ctx.workspaces.create(input),
      rename: (id, title) => ctx.workspaces.rename(id, title),
      delete: (id) => ctx.workspaces.delete(id),
    },
  }

  ctx.slots.inject('sidebar.workspaces', () => ctx.slots.register(
    { name: 'sidebar.workspaces', inject: () => injected },
    // Boundary cast: the composed props include the owner + framework shares
    // (PropsRuntime<'sidebar.workspaces'>); the component itself types its own
    // props. A full SlotMap-typed register is the residual follow-up.
    IdeSidebar as any,
  ))

  if (hasEditorColumn) {
    ctx.slots.inject('editor', () => ctx.slots.register(
      { name: 'editor', inject: () => injected },
      EditorView as any,
    ))
  } else {
    ctx.slots.inject('conversation.view', () => ctx.slots.register(
      { name: 'conversation.view', id: 'editor', order: 20, label: '编辑器', inject: () => injected },
      EditorView as any,
    ))
  }
}
