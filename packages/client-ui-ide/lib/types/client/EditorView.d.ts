/**
 * Editor column: the open file/diff tab strip plus the active viewer. Reads
 * the shared editor store (passed via the inject face) and the `ide` Remote.
 * Registers into `editor` (ui-layout #6) or, as a fallback, a
 * `conversation.view` tab. Pure presentation.
 * @module @deepseek-ai/dsh-client-ui-ide/client/EditorView
 */
import { createElement } from 'react';
import type { IdeInjected } from './slots.ts';
export interface EditorViewProps extends IdeInjected {
}
export declare function EditorView(props: EditorViewProps): ReturnType<typeof createElement>;
//# sourceMappingURL=EditorView.d.ts.map