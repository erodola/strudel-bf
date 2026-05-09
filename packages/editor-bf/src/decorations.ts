import type { Extension } from "@codemirror/state";
import type { SourceRange } from "@strudel-bf/shared";

import { RangeSetBuilder } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";

const activeMark = Decoration.mark({
  class: "cm-bf-active-range",
});

const activeLine = Decoration.line({
  attributes: { class: "cm-bf-active-line" },
});

export function createActiveRangeExtension(ranges: readonly SourceRange[]): Extension {
  return EditorView.decorations.of((view) => {
    const builder = new RangeSetBuilder<Decoration>();
    const activeLineStarts = new Set<number>();

    for (const range of ranges) {
      const start = Math.max(0, Math.min(range.start, view.state.doc.length));
      const end = Math.max(start, Math.min(range.end, view.state.doc.length));
      if (end <= start) {
        continue;
      }

      const line = view.state.doc.lineAt(start);
      if (!activeLineStarts.has(line.from)) {
        activeLineStarts.add(line.from);
        builder.add(line.from, line.from, activeLine);
      }
      builder.add(start, end, activeMark);
    }

    return builder.finish();
  });
}

export const brainfuckEditorTheme = EditorView.theme({
  "&": {
    backgroundColor: "#02040a",
    color: "#f4e7e9",
    fontSize: "15px",
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
  ".cm-bf-active-line": {
    background:
      "linear-gradient(90deg, rgba(255, 42, 66, 0.2), rgba(255, 42, 66, 0.055) 72%, transparent)",
    boxShadow: "inset 4px 0 0 rgba(255, 42, 66, 0.78)",
    animation: "bf-line-flash 180ms ease-out",
  },
  "@keyframes bf-line-flash": {
    "0%": {
      backgroundColor: "rgba(255, 42, 66, 0.42)",
    },
    "100%": {
      backgroundColor: "transparent",
    },
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
