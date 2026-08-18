/**
 * Shared leaf: pure helpers and wire types for the IDE sidebar / editor
 * column. No React state, no ctx, no side effects — everything here is a
 * pure function or a plain data shape.
 * @module dsh-client-ide-ui/client/lib
 */
import { createElement } from 'react';
import type { RemoteResult } from 'dsh-ide-ui/types';
/** One open document tab (file preview or git diff) in the editor column. */
export interface IdeTab {
    key: string;
    kind: 'file' | 'diff';
    path: string;
    cwd?: string;
}
/** Unwrap a Remote result envelope: a Host throw becomes { ok:false, error }. */
export declare function rpc<T>(p: Promise<RemoteResult<T>>): Promise<T>;
export declare function relTime(ts?: number): string;
export declare const joinPath: (dir: string, name: string) => string;
export declare const dirnameOf: (p: string) => string;
export declare const baseName: (p: string) => string;
export declare function detectLang(path: string): string;
export declare function buildRules(lang: string): Array<[RegExp, string]>;
export declare function tokenize(line: string, rules: Array<[RegExp, string]>): Array<[string, string | null]>;
/** Render one source line with token spans. */
export declare function renderLine(line: string, lang: string): ReturnType<typeof createElement>;
//# sourceMappingURL=lib.d.ts.map