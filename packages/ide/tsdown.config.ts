import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
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
/** Client bundle identity: the module-loader closure handoff id and the CSS tag. */
const ID = 'dsh-ide-ui'

/**
 * Installed version and DSH baseline, injected into `src/client/version.ts`
 * at build time. The single source of truth for the version is this
 * package.json's `version` field; the baseline is maintained here and must
 * track the DSH release this build targets.
 */
const PKG = JSON.parse(readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), 'package.json'), 'utf8')) as { version: string }
const DSH_BASELINE = '0.1.0-rc.8'

/** Replace the version.ts module body with literal constants (see src/client/version.ts). */
const versionInject = (): object => ({
  name: 'dshide-version-inject',
  transform(code: string, id: string) {
    if (!id.replace(/\\/g, '/').endsWith('/version.ts')) return null
    return {
      code: [
        `export const IDE_VERSION = ${JSON.stringify(PKG.version)};`,
        `export const IDE_DSH_BASELINE = ${JSON.stringify(DSH_BASELINE)};`,
      ].join('\n'),
      map: null,
    }
  },
})

const cssInject = (): object => ({
  name: 'dshide-css-inject',
  resolveId(source: string, importer?: string) {
    if (!source.endsWith('.css')) return null
    const abs = importer ? resolve(dirname(importer), source) : source
    // `.mjs` suffix keeps the virtual id away from rolldown's css pipeline.
    return { id: `\0dshide:${abs}.mjs` }
  },
  load(id: string) {
    if (!id.startsWith('\0dshide:') || !id.endsWith('.mjs')) return null
    const file = id.slice('\0dshide:'.length, -'.mjs'.length)
    if (file.endsWith('.module.css')) {
      const css = readFileSync(file, 'utf8')
      const tagId = `${ID}/styles`
      return [
        `const css = ${JSON.stringify(css)};`,
        `if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css="${tagId}"]') === null) {`,
        '  const tag = document.createElement(\'style\');',
        `  tag.dataset.pluginCss = ${JSON.stringify(tagId)};`,
        '  tag.textContent = css;',
        '  document.head.appendChild(tag);',
        '}',
      ].join('\n')
    }
    // Non-module CSS (katex.min.css etc.): the browser already loads these
    // through the official web frontend stylesheets, so stub the import out.
    return 'export default {};'
  },
})

export default defineConfig([
  {
    entry: ['src/index.ts'],
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    fixedExtension: false,
    external: ['@deepseek-ai/dsh-typert-protocol', '@deepseek-ai/dsh-settings', '@deepseek-ai/schemastery'],
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
  {
    name: `${ID}/client`,
    entry: { client: 'src/client/index.ts' },
    outDir: 'lib',
    format: 'cjs',
    platform: 'browser',
    target: 'es2024',
    deps: {
      // react/react-dom: PLATFORM_MODULES baseline. dsh-client-runtime: a
      // PRELOADED_CLIENT_EXTERNALS dynamic package — its published lib/client.js
      // is a loader-factory bundle (non-static exports), so it must stay
      // external and resolve through the loader's require at runtime.
      neverBundle: ['react', 'react-dom', '@deepseek-ai/dsh-client-runtime', '@deepseek-ai/dsh-client-runtime/client'],
      alwaysBundle: (id: string) => !['react', 'react-dom', '@deepseek-ai/dsh-client-runtime', '@deepseek-ai/dsh-client-runtime/client'].includes(id),
    },
    dts: false,
    clean: false,
    plugins: [cssInject(), versionInject()],
    outputOptions: {
      entryFileNames: 'client.js',
      banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(ID)}, factory: (require) => {`,
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
    },
  },
])
