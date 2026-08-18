/**
 * Editor-column store: the open document / diff tabs shared between the
 * sidebar (opens a tab) and the editor column (renders the tabs). A
 * `createIdeStore()` factory, created once inside `apply` and handed to both
 * registrations — never a module-level singleton (packages/client/AGENTS.md).
 * @module @deepseek-ai/dsh-client-ui-ide/client/stores
 */
import type { IdeTab } from './lib.ts';
export interface IdeStore {
    tabs: readonly IdeTab[];
    activeId: string | null;
    subscribe(fn: () => void): () => void;
    add(tab: IdeTab): void;
    close(key: string): void;
    setActive(key: string): void;
}
/** Create one editor-tab store instance. */
export declare function createIdeStore(): IdeStore;
//# sourceMappingURL=stores.d.ts.map