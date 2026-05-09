import type { Extension } from "@codemirror/state";
import type { SourceRange } from "@strudel-bf/shared";

import { RangeSetBuilder } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";

const activeMark = Decoration.mark({
  class: "cm-bf-active-range",
});

export function createActiveRangeExtension(ranges: readonly SourceRange[]): Extension {
  const builder = new RangeSetBuilder<Decoration>();
  for (const range of ranges) {
    if (range.end > range.start) {
      builder.add(range.start, range.end, activeMark);
    }
  }
  return EditorView.decorations.of(builder.finish());
}

export const brainfuckEditorTheme = EditorView.theme({
  "&": {
    backgroundColor: "#0b0707",
    color: "#f2e7d0",
    fontSize: "15px",
    minHeight: "360px",
  },
  ".cm-editor": {
    backgroundColor: "#0b0707",
  },
  ".cm-content": {
    fontFamily: "'IBM Plex Mono', 'Fira Code', monospace",
    caretColor: "#ff6a3d",
  },
  ".cm-line": {
    color: "#f2e7d0",
  },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "rgba(255, 106, 61, 0.28)",
  },
  ".cm-scroller": {
    backgroundColor: "#0b0707",
    overflow: "auto",
  },
  ".cm-bf-active-range": {
    backgroundColor: "rgba(255, 106, 61, 0.34)",
    outline: "1px solid rgba(255, 106, 61, 0.95)",
    borderRadius: "3px",
  },
  ".cm-gutters": {
    backgroundColor: "#120b0a",
    color: "#9f8065",
    borderRight: "1px solid #4e2a24",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "rgba(211, 58, 44, 0.16)",
    color: "#f2e7d0",
  },
});
