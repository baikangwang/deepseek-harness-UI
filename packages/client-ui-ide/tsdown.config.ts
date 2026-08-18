import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'tsdown'

/**
 * Self-contained client build: bundle `src/client/index.ts` into `lib/client.js`
 * with the module-loader closure handoff, plus the trivial node half and the
 * invariant companion. No DSH monorepo machinery:
 * - `react` stays external (loader platform module); everything else
 *   (`dsh-ide-ui/remote`, zod, all client code) is inlined.
 * - `styles.module.css` is injected via a tiny plugin (global classes — the
 *   file is emitted as-is into a <style data-plugin-css> tag).
 */
const ID = 'dsh-client-ide-ui'

const cssInject = (): object => ({
  name: 'dshide-css-inject',
  resolveId(source: string, importer?: string) {
    if (!source.endsWith('.module.css')) return null
    const abs = importer ? resolve(dirname(importer), source) : source
    // `.mjs` suffix keeps the virtual id away from rolldown's css pipeline.
    return { id: `\0dshide:${abs}.mjs` }
  },
  load(id: string) {
    if (!id.startsWith('\0dshide:') || !id.endsWith('.mjs')) return null
    const file = id.slice('\0dshide:'.length, -'.mjs'.length)
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
  {
    name: `${ID}/client`,
    entry: { client: 'src/client/index.ts' },
    outDir: 'lib',
    format: 'cjs',
    platform: 'browser',
    target: 'es2024',
    external: ['react'],
    noExternal: (id: string) => (id === 'react' ? undefined : true),
    dts: false,
    clean: false,
    plugins: [cssInject()],
    outputOptions: {
      entryFileNames: 'client.js',
      banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(ID)}, factory: (require) => {`,
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
    },
  },
])
