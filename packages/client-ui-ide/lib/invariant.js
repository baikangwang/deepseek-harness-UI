//#region lib/types/invariant.js
/**
* Package-owned invariant companion for `@deepseek-ai/dsh-client-ui-ide`.
* @module @deepseek-ai/dsh-client-ui-ide/invariant
*/
const PACKAGE_NAME = "@deepseek-ai/dsh-client-ui-ide";
/** Cordis companion plugin name. */
const name = "client-ui-ide-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/**
* No runtime invariant: the sidebar and editor column are pure presentation
* over the `ide` Remote and the framework's slot hooks; they emit no cordis
* events and own no Cordis event ordering.
*/
const install = () => {};
/**
* Register this package's invariant companion.
* @param ctx - Cordis context carrying the invariant service.
* @returns the installed registration's disposer after setup succeeds.
*/
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
