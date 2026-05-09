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
    backgroundColor: "#02040a",
    color: "#f4e7e9",
    fontSize: "17px",
    minHeight: "360px",
  },
  ".cm-editor": {
    backgroundColor: "#02040a",
  },
  ".cm-content": {
    fontFamily: "'IBM Plex Mono', 'Fira Code', monospace",
    caretColor: "#ff2a42",
  },
  ".cm-line": {
    color: "#f4e7e9",
  },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "rgba(255, 42, 66, 0.3)",
  },
  ".cm-scroller": {
    backgroundColor: "#02040a",
    overflow: "auto",
  },
  ".cm-bf-active-range": {
    backgroundColor: "rgba(255, 42, 66, 0.36)",
    outline: "1px solid rgba(255, 42, 66, 0.95)",
    borderRadius: "3px",
    boxShadow: "0 0 12px rgba(255, 42, 66, 0.45)",
  },
  ".cm-gutters": {
    backgroundColor: "#050711",
    color: "#7d8797",
    borderRight: "1px solid rgba(255, 42, 66, 0.22)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "rgba(227, 18, 47, 0.2)",
    color: "#f4e7e9",
  },
});
