import { defineConfig } from 'tsdown'

/**
 * Self-contained host build: bundle `src/index.ts` (the `IdeService` with
 * standard `@Remote` decorators) and `src/invariant.ts` into `lib/`. No DSH
 * monorepo machinery — `@deepseek-ai/dsh-typert-protocol` stays external
 * (runtime peer); all other `@deepseek-ai/*` imports are type-only (erased).
 * The Typert artifacts (`lib/typert.host.*`, `lib/typert.remote-client.*`)
 * are committed build outputs and only regenerate when the `@Remote` surface
 * changes.
 */
export default defineConfig([
  {
    entry: ['src/index.ts'],
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    fixedExtension: false,
    external: ['@deepseek-ai/dsh-typert-protocol'],
    dts: false,
    clean: false,
  },
  {
    entry: ['src/invariant.ts'],
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    clean: false,
  },
])
