import type { SourceRange } from "@strudel-bf/shared";

import type { BrainfuckToken } from "./tokenizer.js";

export class BrainfuckCompileError extends Error {
  readonly range: SourceRange;

  constructor(message: string, range: SourceRange) {
    super(message);
    this.name = "BrainfuckCompileError";
    this.range = range;
  }
}

export function buildBracketMap(tokens: readonly BrainfuckToken[]): Map<number, number> {
  const bracketMap = new Map<number, number>();
  const stack: number[] = [];

  tokens.forEach((token, index) => {
    if (token.command === "[") {
      stack.push(index);
      return;
    }
    if (token.command !== "]") {
      return;
    }
    const openingIndex = stack.pop();
    if (openingIndex === undefined) {
      throw new BrainfuckCompileError("Unmatched closing bracket", {
        start: token.sourceOffset,
        end: token.sourceOffset + 1,
      });
    }
    bracketMap.set(openingIndex, index);
    bracketMap.set(index, openingIndex);
  });

  const danglingOpening = stack.pop();
  if (danglingOpening !== undefined) {
    const token = tokens[danglingOpening];
    if (!token) {
      throw new BrainfuckCompileError("Unmatched opening bracket", {
        start: 0,
        end: 0,
      });
    }
    throw new BrainfuckCompileError("Unmatched opening bracket", {
      start: token.sourceOffset,
      end: token.sourceOffset + 1,
    });
  }

  return bracketMap;
}
