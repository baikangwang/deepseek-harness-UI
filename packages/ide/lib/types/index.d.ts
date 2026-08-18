/**
 * deepseek-harness-UI — Host half: the `ide` Remote namespace.
 *
 * A single `TypertRemoteService` (registered as `ide`) exposes the file /
 * git / search primitives the browser client (the sidebar and editor column)
 * reaches through `ctx.remote.ide`. Every capability comes from Host services
 * — never hand-rolled shell:
 *   - fs                -> this.ctx.fs
 *   - git / ripgrep     -> this.ctx.subprocess (explicit argv)
 *   - workspace roots   -> this.ctx.workspaceRegistry / this.ctx.sandboxPolicy
 *
 * Methods throw on failure (the Remote layer wraps a throw into a
 * RemoteResult error), mirroring the DSH convention that a Remote is either a
 * clean value or a typed failure.
 */
import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { GitDiffResult, GitStatusResult, ListDirResult, ReadTextResult, RootsResult, SearchResult } from './types.ts';
/** Remote-only service exposing the DSH Code file / git / search surface. */
export declare class IdeService extends TypertRemoteService {
    static inject: string[];
    constructor(ctx: Context);
    private str;
    private root;
    /** Run one executable with explicit argv (no shell concatenation). */
    private run;
    private git;
    private pwsh;
    roots(): Promise<RootsResult>;
    listDir(path: string): Promise<ListDirResult>;
    readText(path: string): Promise<ReadTextResult>;
    newFile(path: string): Promise<{
        ok: true;
        path: string;
    }>;
    mkdir(path: string): Promise<{
        ok: boolean;
        stderr: string;
        path: string;
    }>;
    delete(path: string): Promise<{
        ok: boolean;
        stderr: string;
        path: string;
    }>;
    rename(from: string, to: string): Promise<{
        ok: boolean;
        stderr: string;
        from: string;
        to: string;
    }>;
    explore(path: string, select?: boolean): Promise<{
        ok: boolean;
        path: string;
    }>;
    paste(dest: string): Promise<{
        ok: boolean;
        files: string[];
        stderr: string;
    }>;
    gitStatus(cwd: string): Promise<GitStatusResult>;
    private parseStatus;
    gitDiff(cwd: string, path?: string): Promise<GitDiffResult>;
    gitStage(cwd: string, paths: string[]): Promise<{
        ok: boolean;
        stderr: string;
    }>;
    gitUnstage(cwd: string, paths: string[]): Promise<{
        ok: boolean;
        stderr: string;
    }>;
    gitStageAll(cwd: string): Promise<{
        ok: boolean;
        stderr: string;
    }>;
    gitUnstageAll(cwd: string): Promise<{
        ok: boolean;
        stderr: string;
    }>;
    gitDiscard(cwd: string, path: string, untracked: boolean): Promise<{
        ok: boolean;
        stderr: string;
        path: string;
    }>;
    gitCommit(cwd: string, message: string): Promise<{
        ok: boolean;
        stdout: string;
        stderr: string;
    }>;
    search(cwd: string, query: string, caseSensitive: boolean): Promise<SearchResult>;
}
export default IdeService;
//# sourceMappingURL=index.d.ts.map