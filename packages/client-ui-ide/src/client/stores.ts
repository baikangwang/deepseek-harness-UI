/**
 * Editor-column store: the open document / diff tabs shared between the
 * sidebar (opens a tab) and the editor column (renders the tabs). A
 * `createIdeStore()` factory, created once inside `apply` and handed to both
 * registrations — never a module-level singleton (packages/client/AGENTS.md).
 * @module @deepseek-ai/dsh-client-ui-ide/client/stores
 */

import type { IdeTab } from './lib.ts'

export interface IdeStore {
  tabs: readonly IdeTab[]
  activeId: string | null
  subscribe(fn: () => void): () => void
  add(tab: IdeTab): void
  close(key: string): void
  setActive(key: string): void
}

/** Create one editor-tab store instance. */
export function createIdeStore(): IdeStore {
  let tabs: IdeTab[] = []
  let activeId: string | null = null
  const listeners: Array<() => void> = []
  const emit = (): void => { for (const fn of listeners) { try { fn() } catch { /* listener isolated */ } } }
  return {
    get tabs(): readonly IdeTab[] { return tabs },
    get activeId(): string | null { return activeId },
    subscribe(fn: () => void): () => void {
      listeners.push(fn)
      return () => { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1) }
    },
    add(tab: IdeTab): void {
      const ex = tabs.find((t) => t.key === tab.key)
      if (ex) { activeId = tab.key; emit(); return }
      tabs = [...tabs, tab]
      activeId = tab.key
      emit()
    },
    close(key: string): void {
      const i = tabs.findIndex((t) => t.key === key)
      if (i < 0) return
      const next = [...tabs.slice(0, i), ...tabs.slice(i + 1)]
      tabs = next
      if (activeId === key) { const n = next[i] ?? next[i - 1]; activeId = n ? n.key : null }
      emit()
    },
    setActive(key: string): void { if (activeId !== key) { activeId = key; emit() } },
  }
}
