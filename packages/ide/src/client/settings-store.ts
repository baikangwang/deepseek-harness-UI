/**
 * Client-side `ide` settings handle: a tiny observable over the resolved
 * `ide` section. When the browser settings scope (`ctx.settingsScope`,
 * provided by dsh-client-ui-settings) is composed, the handle mirrors
 * `scope.get()` and `scope.watch()`; otherwise it serves
 * {@link DEFAULT_IDE_SETTINGS} so every consumer degrades cleanly. All values
 * are plain data — no ctx, no host imports.
 * @module dsh-ide-ui/client/settings-store
 */

import { useEffect, useState } from 'react'
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client'
import { DEFAULT_IDE_SETTINGS, normalizeIdeSettings, type IdeSettings } from '../settings-shared.ts'

/**
 * The browser settings scope for our namespace — the official client-side
 * `SettingsScope` contract (snapshot read + field-level writes). NOTE: this is
 * NOT the Host-side `SettingsScope` (get/watch/update/replace); confusing the
 * two crashed the loader entry at runtime (settingsScopeHandle.get is not a
 * function).
 */
export type IdeSettingsScope = SettingsScope<unknown>

/** The current resolved section of a bound scope (undefined until the first acceptance). */
export function settingsValue(scope: IdeSettingsScope): unknown {
  return scope.getSnapshot().value
}

/** The resolved-settings surface handed to views through the inject face. */
export interface IdeSettingsHandle {
  get(): IdeSettings
  subscribe(fn: () => void): () => void
}

/** Mutable handle returned by the factory; `patch` feeds the mirror. */
export type IdeSettingsStore = IdeSettingsHandle & { patch(next: unknown): void }

/** Create a default-backed settings store (never throws, never touches ctx). */
export function createIdeSettingsStore(): IdeSettingsStore {
  let current: IdeSettings = DEFAULT_IDE_SETTINGS
  const listeners = new Set<() => void>()
  return {
    get(): IdeSettings { return current },
    subscribe(fn: () => void): () => void {
      listeners.add(fn)
      return () => { listeners.delete(fn) }
    },
    patch(next: unknown): void {
      current = normalizeIdeSettings(next)
      for (const fn of listeners) { try { fn() } catch { /* listener isolated */ } }
    },
  }
}

/** React hook: the current resolved settings, re-rendering on mirror updates. */
export function useIdeSettings(handle: IdeSettingsHandle): IdeSettings {
  const [value, setValue] = useState<IdeSettings>(() => handle.get())
  useEffect(() => handle.subscribe(() => setValue(handle.get())), [handle])
  return value
}

/** Observable host home (from `connection.hostDescription`; absent without a connection). */
export interface IdeHomeSource {
  get(): string | undefined
  subscribe(fn: () => void): () => void
}

/** Never-emitting home source for deployments without the connection service. */
export const NO_HOME_SOURCE: IdeHomeSource = {
  get: () => undefined,
  subscribe: () => () => {},
}

/** React hook: the current host account home, re-rendering on connection change. */
export function useIdeHome(source: IdeHomeSource): string | undefined {
  const [home, setHome] = useState<string | undefined>(() => source.get())
  useEffect(() => source.subscribe(() => setHome(source.get())), [source])
  return home
}
