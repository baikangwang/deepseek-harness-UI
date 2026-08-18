/**
 * deepseek-harness-UI client half, apply: mount the `ide` Remote, create the
 * shared editor store, and register the surfaces. The editor is a
 * `conversation.view` tab (official slot, distributable); there is NO shell
 * dependency — the plugin composes only through declared slots.
 * @module @deepseek-ai/dsh-client-ui-ide/client
 */
import type { Context } from '@deepseek-ai/cordis';
/** Required services (cordis fiber inject). */
export declare const inject: string[];
/**
 * Mount the ide Remote and register the sidebar + editor surfaces.
 * @param ctx - client root context.
 */
export declare function apply(ctx: Context): Promise<void>;
//# sourceMappingURL=index.d.ts.map