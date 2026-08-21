/**
 * Slot contracts for the IDE plugin: the registrant inject face and the
 * composed component props for the three registration surfaces
 * (`sidebar.workspaces`, `editor`, `conversation.view`). The SlotMap entries
 * themselves are declared by the owner packages (ui-sidebar, ui-layout,
 * ui-conversation); this module only pulls them into scope and types the
 * registrant's own share.
 * @module dsh-client-ide-ui/client/slots
 */

import type { IdeRemoteFace, RemoteResult } from 'dsh-ide-ui/types'
// Type-only: resolve the SlotMap merges we register into. The `editor` slot is
// deliberately NOT pulled in — it only exists on the local #6 ui-layout patch,
// and the `editor` registration in apply uses a runtime-probe cast so this
// package compiles against clean official DSH.
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: the `settings.plugin.item` keyed slot (declared by the
// configurable-plugins tab; our card registers under the `ide` key).
import type {} from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
import type { IdeTab } from './lib.ts'
import type { IdeStore } from './stores.ts'
import type { IdeHomeSource, IdeSettingsHandle } from './settings-store.ts'

/** Registrant business face: plain data and callbacks over the `ide` Remote + session/workspace services. */
export interface IdeInjected {
  ide: IdeRemoteFace
  /** Unwrap a RemoteResult (rejections surface as thrown errors). */
  rpc: <T>(p: Promise<RemoteResult<T>>) => Promise<T>
  /** Editor-tab store handle (shared with the editor column registration). */
  store: IdeStore
  /** Resolved `ide` settings (mirror of the Host namespace; defaults without a settings provider). */
  settings: IdeSettingsHandle
  /** Observable host account home (rc.8 `host.describe().home`), for `~` path display. */
  home: IdeHomeSource
  /** SCM refresh bus: remote events (credentials/updated) and timers push through it. */
  scm: { subscribe(fn: () => void): () => void }
  /** Open a file/diff tab in the editor view (a `conversation.view` tab). */
  openDoc: (tab: IdeTab) => void
  sessions: {
    open: (id: string) => void
    /** 会话搜索：disabled 表示远端内容索引不可用（rc.8 默认部署关闭全文索引），调用方应降级为本地匹配。 */
    search: (query: string, signal: AbortSignal) => Promise<{ items: unknown[]; hasMore: boolean; disabled: boolean }>
    fork: (id: string) => void
    archive: (id: string) => void
  }
  workspaces: {
    startSession: () => void
    pickDirectory: () => Promise<string | null>
    create: (input: { path: string }) => Promise<unknown>
    rename: (id: string, title: string) => Promise<unknown>
    delete: (id: string) => Promise<unknown>
  }
}

/**
 * Composed props of the `sidebar.workspaces` registration: the owner share
 * (wide/expandSidebar, from ui-sidebar's shell), the framework runtime hooks
 * for the root-scope slot, and the registrant inject face.
 */
export type IdeSidebarProps = {
  wide: boolean
  expandSidebar: () => void
} & IdeInjected

/** Props of the `editor` column registration (session-maybe scope; owner share is empty). */
export type IdeEditorProps = IdeInjected

/** Props of the `conversation.view` fallback registration. */
export type IdeConvViewProps = IdeInjected
