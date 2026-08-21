/**
 * Build-time injected module — the tsdown version plugin (`dshide-version-inject`
 * in tsdown.config.ts) replaces this file's entire body with constant exports,
 * so the bundle carries the package version and DSH baseline as literals.
 * This source form only exists to keep `tsc --noEmit` green (the declares make
 * the identifiers visible to the type checker).
 * @module dsh-ide-ui/client/version
 */

declare const __DSH_IDE_VERSION__: string
declare const __DSH_IDE_DSH_BASELINE__: string

/** Installed plugin version (e.g. `0.1.0-rc.20`), injected at build time. */
export const IDE_VERSION: string = __DSH_IDE_VERSION__

/** DSH baseline this build targets (e.g. `0.1.0-rc.8`), injected at build time. */
export const IDE_DSH_BASELINE: string = __DSH_IDE_DSH_BASELINE__
