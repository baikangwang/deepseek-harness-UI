/**
 * Package-owned invariant companion for `dsh-ide-ui`.
 * @module dsh-ide-ui/invariant
 */
const PACKAGE_NAME = 'dsh-ide-ui';
/** Cordis companion plugin name. */
export const name = 'ide-invariant';
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants'];
/**
 * No runtime invariant: the `ide` Remote service is a stateless pass-through to
 * the `fs` / `subprocess` / `workspaceRegistry` / `sandboxPolicy` services; it
 * emits no cordis events and owns no Cordis event ordering.
 */
const install = () => { };
/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
/* jscpd:ignore-end */
//# sourceMappingURL=invariant.js.map