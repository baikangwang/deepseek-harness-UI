import { defineConfig } from 'tsdown'
import ts from 'typescript'

/**
 * Lower TypeScript standard decorators (`@Remote`) exactly like the official
 * DSH pipeline: the official build runs `tsc` first (which emits the
 * `__esDecorate` helper) and tsdown only bundles the compiled JS. A
 * self-contained tsdown build compiles `.ts` directly and rolldown/oxc keeps
 * the native `@dec` syntax, which Node's ESM loader cannot parse. This
 * transform replays the tsc lowering for any module that uses decorators, so
 * the emitted `lib/*.js` is valid Node ESM.
 */
const lowerDecorators: {
  name: string
  transform(code: string, id: string): { code: string; map: null } | null
} = {
  name: 'dshide-lower-decorators',
  transform(code, id) {
    if (!id.endsWith('.ts') || !code.includes('@')) return null
    const out = ts.transpileModule(code, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        esModuleInterop: true,
        verbatimModuleSyntax: false,
        isolatedModules: true,
        allowImportingTsExtensions: true,
      },
      fileName: id,
    })
    return { code: out.outputText, map: null }
  },
}

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
    plugins: [lowerDecorators],
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
