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
// conversation.view, settings.plugin.item) through the contract module.
import type {} from './slots.ts'
import type { IdeInjected } from './slots.ts'
import { createIdeStore } from './stores.ts'
import { rpc } from './lib.ts'
import { IDE_NAMESPACE } from '../settings-shared.ts'
import { createIdeSettingsStore, NO_HOME_SOURCE, settingsValue, type IdeHomeSource, type IdeSettingsScope } from './settings-store.ts'
import { createIdeSettingsCardFace, IdeSettingsCard } from './settings/card.tsx'
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
    search(query: string, signal: AbortSignal): Promise<{ ok: boolean; value: { items: unknown[]; hasMore: boolean }; error: { code?: string; message: string } }>
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

  // `ide` settings: mirror the Host namespace through the optional browser
  // settings scope (dsh-client-ui-settings); without it, serve defaults.
  // NOTE: the browser scope is the client-side SettingsScope contract
  // (getSnapshot/subscribe + set/unset), NOT the Host-side get/watch/update/
  // replace — mixing the two crashed the loader entry at runtime.
  const settingsScope = ctx.get('settingsScope') as { bind(opts: { namespace: string }): IdeSettingsScope } | undefined
  const settings = createIdeSettingsStore()
  let settingsScopeHandle: IdeSettingsScope | undefined
  if (settingsScope !== undefined) {
    settingsScopeHandle = settingsScope.bind({ namespace: IDE_NAMESPACE })
    settings.patch(settingsValue(settingsScopeHandle))
    ctx.effect(() => settingsScopeHandle!.subscribe(() => {
      settings.patch(settingsValue(settingsScopeHandle!))
    }), 'ide: settings mirror')
  }

  // Host account home (rc.8 `host.describe().home`) for `~` path display.
  const connection = ctx.get('connection') as { hostDescription: { getSnapshot(): { home?: string } | undefined; subscribe(fn: () => void): () => void } } | undefined
  const homeSource: IdeHomeSource = connection === undefined
    ? NO_HOME_SOURCE
    : {
        get: () => connection.hostDescription.getSnapshot()?.home,
        subscribe: (fn) => connection.hostDescription.subscribe(fn),
      }

  // SCM refresh bus: `credentials/updated` (rc.8 remote event) and the
  // settings-driven auto-refresh timer both push through it.
  const scmListeners = new Set<() => void>()
  const scmBus = {
    subscribe(fn: () => void): () => void {
      scmListeners.add(fn)
      return () => { scmListeners.delete(fn) }
    },
    emit(): void { for (const fn of scmListeners) { try { fn() } catch { /* listener isolated */ } } },
  }
  // rc.8 remote event delivery: git credentials changed -> refresh SCM state.
  ctx.effect(() => ctx.remote.$on('credentials/updated', () => { scmBus.emit() }), 'ide: credential refresh')
  // settings.yaml edited outside the page / on another device -> resync mirror.
  if (settingsScopeHandle !== undefined) {
    ctx.effect(() => ctx.remote.$on('settings/document-updated', (ns) => {
      if (ns === IDE_NAMESPACE) settings.patch(settingsValue(settingsScopeHandle!))
    }), 'ide: settings sync')
  }

  const injected: IdeInjected = {
    ide,
    rpc,
    store,
    settings,
    home: homeSource,
    scm: { subscribe: scmBus.subscribe },
    openDoc: (tab) => {
      store.add(tab)
      clickTabNow(['编辑器', 'Editor'])
    },
    sessions: {
      open: (id) => { sessions.open(id) },
      search: async (query, signal) => {
        // rc.8: 默认部署关闭会话全文索引（openAt: 'never'），search 会以
        // SESSION_QUERY_SEARCH_DISABLED 失败。把失败折叠成 disabled 标志，
        // 让面板降级为"本地标题/工作区匹配 + 不可用提示"，而不是把
        // "被禁用"渲染成"无结果"。
        const result = await sessions.search(query, signal)
        if (!result.ok) return { items: [], hasMore: false, disabled: true }
        return { ...result.value, disabled: false }
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

  // rc.8 plugin-owned settings surface: our card under the `ide` key appears
  // on the official configurable-plugins tab. Guarded on the settings scope —
  // the keyed slot's declaring tab also needs it, so an absent scope means
  // the inject never fires anyway (a wait, not a throw).
  if (settingsScopeHandle !== undefined) {
    const cardFace = createIdeSettingsCardFace(settings, settingsScopeHandle)
    ctx.slots.inject('settings.plugin.item', function* () {
      yield ctx.slots.register(
        { name: 'settings.plugin.item', key: IDE_NAMESPACE, inject: () => cardFace },
        IdeSettingsCard as any,
      )
    })
  }
}
