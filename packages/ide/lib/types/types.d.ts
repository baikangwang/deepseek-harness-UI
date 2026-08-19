/**
 * ide-ui — `ide` Remote namespace payload types.
 *
 * These are the wire shapes the Host {@link IdeService} returns and the
 * browser client consumes through `ctx.remote.ide`. Plain JSON-safe types
 * only: the Typert codegen derives the Remote descriptors from these
 * declarations, so nothing here may reference a Host-only value.
 */
/** One workspace registration the client uses to populate its root picker. */
export interface WorkspaceRef {
    id: string;
    title: string;
    path: string;
}
/** One filesystem entry returned by `ide.listDir`. */
export interface DirEntry {
    name: string;
    type: 'directory' | 'file';
    path: string;
    size: number | null;
}
/** `ide.listDir` result. */
export interface ListDirResult {
    path: string;
    entries: DirEntry[];
}
/** `ide.readText` result (content truncated at the Host cap). */
export interface ReadTextResult {
    path: string;
    content: string;
    truncated: boolean;
    size: number;
}
/** `ide.roots` result: the workspace root plus every registered workspace. */
export interface RootsResult {
    root: string;
    workspaces: WorkspaceRef[];
}
/** A porcelain `git status --porcelain=v1 -z` change record. */
export interface GitChange {
    xy: string;
    path: string;
    renameFrom: string;
    staged: string;
    unstaged: string;
}
/** `ide.gitStatus` result. */
export interface GitStatusResult {
    branch: string;
    changes: GitChange[];
    notRepo: boolean;
    error: string;
}
/**
 * One file's condensed git state for the explorer decorations.
 * `code` is a single letter: 'C' conflict, 'U' untracked, 'M' modified,
 * 'A' added (staged), 'D' deleted, 'R' renamed. `staged` marks whether the
 * change lives in the index (green decoration).
 */
export interface GitFileState {
    code: string;
    staged: boolean;
}
/** `ide.gitStatusMap` result: whole-repo path → state lookup for the tree. */
export interface GitStatusMapResult {
    branch: string;
    notRepo: boolean;
    error: string;
    /** relPath (forward slashes, relative to cwd) → condensed state. */
    files: Record<string, GitFileState>;
    /** Ignored directories (relPath, forward slashes), directory-level aggregate. */
    ignoredDirs: string[];
}
/** `ide.gitDiff` result. */
export interface GitDiffResult {
    stdout: string;
    ok: boolean;
    stderr: string;
    path: string;
}
/** One `ide.search` match. */
export interface SearchMatch {
    path: string;
    line: number;
    text: string;
}
/** `ide.search` result. */
export interface SearchResult {
    error: string;
    matches: SearchMatch[];
    files: number;
    truncated: boolean;
}
/**
 * A Remote result envelope: success carries `value`, failure carries `error`.
 * Mirrors `RemoteResult<T>` from `@deepseek-ai/dsh-typert-protocol` (the
 * `details` field rides along on failures) so the client can unwrap the
 * carrier without importing the protocol runtime.
 */
export type RemoteResult<T> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
};
/** The `remote.ide` face the browser client reaches after mounting its Remote. */
export interface IdeRemoteFace {
    roots(): Promise<RemoteResult<RootsResult>>;
    listDir(path: string): Promise<RemoteResult<ListDirResult>>;
    readText(path: string): Promise<RemoteResult<ReadTextResult>>;
    newFile(path: string): Promise<RemoteResult<{
        ok: true;
        path: string;
    }>>;
    mkdir(path: string): Promise<RemoteResult<{
        ok: boolean;
        stderr: string;
        path: string;
    }>>;
    delete(path: string): Promise<RemoteResult<{
        ok: boolean;
        stderr: string;
        path: string;
    }>>;
    rename(from: string, to: string): Promise<RemoteResult<{
        ok: boolean;
        stderr: string;
        from: string;
        to: string;
    }>>;
    explore(path: string, select?: boolean): Promise<RemoteResult<{
        ok: boolean;
        path: string;
    }>>;
    paste(dest: string): Promise<RemoteResult<{
        ok: boolean;
        files: string[];
        stderr: string;
    }>>;
    gitStatus(cwd: string): Promise<RemoteResult<GitStatusResult>>;
    gitStatusMap(cwd: string): Promise<RemoteResult<GitStatusMapResult>>;
    gitDiff(cwd: string, path?: string): Promise<RemoteResult<{
        stdout: string;
        ok: boolean;
        stderr: string;
        path: string;
    }>>;
    gitStage(cwd: string, paths: string[]): Promise<RemoteResult<{
        ok: boolean;
        stderr: string;
    }>>;
    gitUnstage(cwd: string, paths: string[]): Promise<RemoteResult<{
        ok: boolean;
        stderr: string;
    }>>;
    gitStageAll(cwd: string): Promise<RemoteResult<{
        ok: boolean;
        stderr: string;
    }>>;
    gitUnstageAll(cwd: string): Promise<RemoteResult<{
        ok: boolean;
        stderr: string;
    }>>;
    gitDiscard(cwd: string, path: string, untracked: boolean): Promise<RemoteResult<{
        ok: boolean;
        stderr: string;
        path: string;
    }>>;
    gitCommit(cwd: string, message: string): Promise<RemoteResult<{
        ok: boolean;
        stdout: string;
        stderr: string;
    }>>;
    search(cwd: string, query: string, caseSensitive: boolean): Promise<RemoteResult<SearchResult>>;
}
