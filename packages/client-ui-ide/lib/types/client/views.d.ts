/**
 * Sidebar views: Explorer (file tree), Search, Source Control, Sessions.
 * Pure presentation — all data and callbacks arrive through props (the
 * registrant inject face + framework hook snapshots). No ctx reach.
 * @module dsh-client-ide-ui/client/views
 */
import { createElement } from 'react';
import type { IdeInjected } from './slots.ts';
type ViewInjected = Pick<IdeInjected, 'ide' | 'rpc' | 'openDoc' | 'sessions' | 'workspaces'>;
interface ExplorerProps extends Pick<ViewInjected, 'ide' | 'rpc' | 'openDoc'> {
    root?: string | undefined;
    setRoot: (p: string) => void;
    workspaces: Array<{
        path: string;
        title?: string;
    }>;
}
export declare function ExplorerView(props: ExplorerProps): ReturnType<typeof createElement>;
interface SearchProps extends ViewInjected {
    root?: string | undefined;
}
export declare function SearchView(props: SearchProps): ReturnType<typeof createElement>;
interface ScmProps extends ViewInjected {
    root?: string | undefined;
}
export declare function ScmView(props: ScmProps): ReturnType<typeof createElement>;
export interface SessionSnapshot {
    ids?: string[];
    byId?: Record<string, unknown>;
    current?: string;
}
export interface WorkspaceSnapshot {
    items?: Array<{
        workspaceId: string;
        title: string;
        path: string;
        sessionIds?: string[];
        archivedSessionIds?: string[];
    }>;
    archivedSessionIds?: string[];
}
interface SessionProps extends Pick<ViewInjected, 'sessions' | 'workspaces'> {
    wsState: WorkspaceSnapshot | null;
    sessState: SessionSnapshot | null;
}
export declare function SessionView(props: SessionProps): ReturnType<typeof createElement>;
export {};
//# sourceMappingURL=views.d.ts.map