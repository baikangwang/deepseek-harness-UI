/**
 * Slot contracts for the IDE plugin: the registrant inject face and the
 * composed component props for the three registration surfaces
 * (`sidebar.workspaces`, `editor`, `conversation.view`). The SlotMap entries
 * themselves are declared by the owner packages (ui-sidebar, ui-layout,
 * ui-conversation); this module only pulls them into scope and types the
 * registrant's own share.
 * @module @deepseek-ai/dsh-client-ui-ide/client/slots
 */

import type { IdeRemoteFace, RemoteResult } from '@deepseek-ai/dsh-ide/types'
// Type-only: resolve the SlotMap merges we register into.
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { IdeTab } from './lib.ts'
import type { IdeStore } from './stores.ts'

/** Registrant business face: plain data and callbacks over the `ide` Remote + session/workspace services. */
export interface IdeInjected {
  ide: IdeRemoteFace
  /** Unwrap a RemoteResult (rejections surface as thrown errors). */
  rpc: <T>(p: Promise<RemoteResult<T>>) => Promise<T>
  /** Editor-tab store handle (shared with the editor column registration). */
  store: IdeStore
  /** Open a file/diff tab in the editor column (falls back to the conversation editor view). */
  openDoc: (tab: IdeTab) => void
  /** Present when the layout shell owns an editor column (ui-layout #6); undefined otherwise. */
  openEditor: (() => void) | undefined
  sessions: {
    open: (id: string) => void
    search: (query: string, signal: AbortSignal) => Promise<{ items: unknown[]; hasMore: boolean }>
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
