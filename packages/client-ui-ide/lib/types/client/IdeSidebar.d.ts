/**
 * IDE sidebar: the activity rail plus the active view (Explorer / Search /
 * Source Control / Sessions). Registers into `sidebar.workspaces`; it reads
 * the framework's global `useSessions` / `useWorkspaces` hooks (passed as the
 * root-scope runtime share) and the registrant inject face. Pure presentation.
 * @module @deepseek-ai/dsh-client-ui-ide/client/IdeSidebar
 */
import { createElement } from 'react';
import type { IdeInjected } from './slots.ts';
import type { SessionSnapshot, WorkspaceSnapshot } from './views.tsx';
type UseSnapshot<T> = (selector: (state: unknown) => unknown) => T;
export interface IdeSidebarProps extends IdeInjected {
    /** Owner share (ui-sidebar shell): wide renders the full browser, rail the icon column. */
    wide: boolean;
    /** Owner share: rail icons request expansion. */
    expandSidebar: () => void;
    useSessions?: UseSnapshot<SessionSnapshot | null>;
    useWorkspaces?: UseSnapshot<WorkspaceSnapshot | null>;
}
export declare function IdeSidebar(props: IdeSidebarProps): ReturnType<typeof createElement>;
export {};
//# sourceMappingURL=IdeSidebar.d.ts.map