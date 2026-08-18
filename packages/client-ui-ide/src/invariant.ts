/**
 * Package-owned invariant companion for `@deepseek-ai/dsh-client-ui-ide`.
 * @module @deepseek-ai/dsh-client-ui-ide/invariant
 */

/* jscpd:ignore-start */
import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-client-ui-ide'

/** Cordis companion plugin name. */
export const name = 'client-ui-ide-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/**
 * No runtime invariant: the sidebar and editor column are pure presentation
 * over the `ide` Remote and the framework's slot hooks; they emit no cordis
 * events and own no Cordis event ordering.
 */
const install: InvariantInstaller = () => {}

/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
/* jscpd:ignore-end */
