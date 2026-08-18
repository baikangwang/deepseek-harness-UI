import { defineConfig } from 'tsdown'

/**
 * Host-only package: bundle the `IdeService` node half and its invariant
 * companion. The root Typert plugin emits `typert.host.js` +
 * `typert.remote-client.js` from the `@Remote` decorators during the Host
 * build pass (this package's `./typert` / `./remote` exports select it).
 */
export default defineConfig([
  {
    entry: ['lib/types/index.js'],
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    clean: false,
  },
  {
    entry: ['lib/types/invariant.js'],
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    clean: false,
  },
])
