import { clientBundle } from '../../client/tsdown.client.ts'

/**
 * Dual-face package: the Host pass bundles the `ide` Remote service node half
 * (and the root Typert plugin emits `typert.host.js` + `typert.remote-client.js`
 * from the `@Remote` decorators), while the Client pass emits the browser
 * bundle only. `hostPhase: true` keeps the node half in the Host pass so the
 * client bundle never rebuilds it.
 */
export default clientBundle(
  '@deepseek-ai/dsh-ide',
  ['lib/types/index.js'],
  { hostPhase: true },
)
