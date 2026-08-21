/**
 * Host-side settings registration for the `ide` namespace. Composed as part of
 * the single dsh-ide-ui row: `IdeService` probes the optional `settings`
 * service at construction and registers here when a provider is composed.
 * Absent a settings provider (a minimal deployment), registration is skipped
 * and every consumer falls back to {@link DEFAULT_IDE_SETTINGS}.
 *
 * rc.8: the third-party namespace allowlist was removed ("registering is
 * exposing"), so the browser settings page serves this namespace and the
 * plugin's own card (registered under the `settings.plugin.item` keyed slot)
 * without any host-side changes.
 * @module dsh-ide-ui/settings
 */

import type { Context } from '@deepseek-ai/cordis'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'
import {
  IDE_DEFAULT_EXCLUDES, IDE_NAMESPACE,
  type IdeEditorSettings, type IdeExplorerSettings, type IdeGitSettings, type IdeSearchSettings, type IdeSettings,
} from './settings-shared.ts'

/** Branded settings namespace for the `ide` section. */
export const IDE_SETTINGS_NAMESPACE = settingsNamespace(IDE_NAMESPACE)

/** Durable `ide` section schema; also the wire envelope the browser scope validates against. */
export const IdeSettingsSchema: z<IdeSettings> = z.object({
  search: z.object({
    excludes: z.array(z.string()).default([...IDE_DEFAULT_EXCLUDES]),
    maxFiles: z.number().default(400),
    maxMatches: z.number().default(200),
  }) as unknown as z<IdeSearchSettings>,
  editor: z.object({
    fontSize: z.number().default(13),
    showLineNumbers: z.boolean().default(true),
  }) as unknown as z<IdeEditorSettings>,
  explorer: z.object({
    abbreviateHome: z.boolean().default(true),
  }) as unknown as z<IdeExplorerSettings>,
  git: z.object({
    autoRefreshMs: z.number().default(30000),
  }) as unknown as z<IdeGitSettings>,
})

/**
 * Register the `ide` namespace when a settings provider is already composed.
 * Non-blocking by design: this probes `ctx.get('settings')` instead of
 * declaring a hard inject, so a deployment without the settings service still
 * activates the plugin (consumers use the defaults).
 * @param ctx - the plugin context (service construction context).
 * @returns whether the namespace was registered.
 */
export function registerIdeSettings(ctx: Context): boolean {
  const settings = ctx.get('settings')
  if (settings === undefined) return false
  settings.register(IDE_SETTINGS_NAMESPACE, IdeSettingsSchema, { applies: 'live' })
  return true
}
