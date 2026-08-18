//#region src/invariant.ts
const PACKAGE_NAME = "@deepseek-ai/dsh-ide";
/** Cordis companion plugin name. */
const name = "ide-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/**
* No runtime invariant: the `ide` Remote service is a stateless pass-through to
* the `fs` / `subprocess` / `workspaceRegistry` / `sandboxPolicy` services; it
* emits no cordis events and owns no Cordis event ordering.
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
