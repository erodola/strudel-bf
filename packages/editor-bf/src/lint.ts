import type { Extension } from "@codemirror/state";
import type { Diagnostic } from "@codemirror/lint";

import { linter } from "@codemirror/lint";

import { buildBracketMap, BrainfuckCompileError, tokenizeBrainfuck } from "@strudel-bf/bf-core";

export function createBrainfuckLinter(): Extension {
  return linter((view) => {
    try {
      buildBracketMap(tokenizeBrainfuck(view.state.doc.toString()));
      return [];
    } catch (error) {
      if (error instanceof BrainfuckCompileError) {
        const diagnostic: Diagnostic = {
          from: error.range.start,
          to: error.range.end,
          severity: "error",
          message: error.message,
        };
        return [diagnostic];
      }
      throw error;
    }
  });
}

