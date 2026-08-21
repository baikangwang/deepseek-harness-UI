/**
 * Shared settings vocabulary for dsh-ide-ui: the `ide` settings namespace
 * shape, defaults, and the exclude-directory baseline. Zero dependencies and
 * zero runtime globals — safe to bundle into BOTH the Host half (lib/index.js)
 * and the browser client half (lib/client.js). The Host half builds the
 * schemastery schema from these; the client half uses the same shape for its
 * defaults and for the settings-scope mirror. Neither half may import the
 * other's modules, so this module is the one shared source of truth.
 * @module dsh-ide-ui/settings-shared
 */

/** Settings namespace owned by this plugin (must match `^[a-z][a-z0-9-]*$`). */
export const IDE_NAMESPACE = 'ide'

/** Directory names the content search skips by default (keep in sync with the Host search fallback). */
export const IDE_DEFAULT_EXCLUDES: readonly string[] = [
  'node_modules', '.git', 'dist', 'build', 'out', 'target', 'coverage',
  '.next', '.dsh', '.agent-presets', '__pycache__', '.venv', 'venv', '.idea', '.vscode',
]

/** Content-search section. */
export interface IdeSearchSettings {
  /** Directory names to skip (replaces the built-in baseline when overridden). */
  excludes: readonly string[]
  /** Fallback-scan file cap. */
  maxFiles: number
  /** Fallback-scan match cap. */
  maxMatches: number
}

/** Editor column section. */
export interface IdeEditorSettings {
  /** Editor body font size in px. */
  fontSize: number
  /** Render line numbers in the source view. */
  showLineNumbers: boolean
}

/** Explorer section. */
export interface IdeExplorerSettings {
  /** Abbreviate the POSIX home directory to `~` in displayed paths. */
  abbreviateHome: boolean
}

/** Source-control section. */
export interface IdeGitSettings {
  /** Automatic SCM status refresh interval in ms (0 disables). */
  autoRefreshMs: number
}

/** Resolved `ide` settings section. */
export interface IdeSettings {
  search: IdeSearchSettings
  editor: IdeEditorSettings
  explorer: IdeExplorerSettings
  git: IdeGitSettings
}

/** Defaults when the settings service is absent or the section is empty. */
export const DEFAULT_IDE_SETTINGS: IdeSettings = {
  search: {
    excludes: [...IDE_DEFAULT_EXCLUDES],
    maxFiles: 400,
    maxMatches: 200,
  },
  editor: {
    fontSize: 13,
    showLineNumbers: true,
  },
  explorer: {
    abbreviateHome: true,
  },
  git: {
    autoRefreshMs: 30000,
  },
}

/** Normalize a possibly-partial resolved section onto the defaults. */
export function normalizeIdeSettings(value: unknown): IdeSettings {
  const v = (value ?? {}) as Partial<IdeSettings>
  const search = (v.search ?? {}) as Partial<IdeSearchSettings>
  const editor = (v.editor ?? {}) as Partial<IdeEditorSettings>
  const explorer = (v.explorer ?? {}) as Partial<IdeExplorerSettings>
  const git = (v.git ?? {}) as Partial<IdeGitSettings>
  return {
    search: {
      excludes: Array.isArray(search.excludes) && search.excludes.length > 0 ? [...search.excludes] : [...IDE_DEFAULT_EXCLUDES],
      maxFiles: typeof search.maxFiles === 'number' && search.maxFiles > 0 ? search.maxFiles : DEFAULT_IDE_SETTINGS.search.maxFiles,
      maxMatches: typeof search.maxMatches === 'number' && search.maxMatches > 0 ? search.maxMatches : DEFAULT_IDE_SETTINGS.search.maxMatches,
    },
    editor: {
      fontSize: typeof editor.fontSize === 'number' && editor.fontSize >= 8 && editor.fontSize <= 32 ? editor.fontSize : DEFAULT_IDE_SETTINGS.editor.fontSize,
      showLineNumbers: typeof editor.showLineNumbers === 'boolean' ? editor.showLineNumbers : DEFAULT_IDE_SETTINGS.editor.showLineNumbers,
    },
    explorer: {
      abbreviateHome: typeof explorer.abbreviateHome === 'boolean' ? explorer.abbreviateHome : DEFAULT_IDE_SETTINGS.explorer.abbreviateHome,
    },
    git: {
      autoRefreshMs: typeof git.autoRefreshMs === 'number' && git.autoRefreshMs >= 0 ? git.autoRefreshMs : DEFAULT_IDE_SETTINGS.git.autoRefreshMs,
    },
  }
}
