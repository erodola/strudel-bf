import { describe, expect, it } from "vitest";

import { tokenizeBrainfuck } from "../src/tokenizer.js";

describe("tokenizeBrainfuck", () => {
  it("keeps source offsets for commands while ignoring comments", () => {
    expect(tokenizeBrainfuck("a+ b[>c<-].")).toEqual([
      { command: "+", sourceOffset: 1 },
      { command: "[", sourceOffset: 4 },
      { command: ">", sourceOffset: 5 },
      { command: "<", sourceOffset: 7 },
      { command: "-", sourceOffset: 8 },
      { command: "]", sourceOffset: 9 },
      { command: ".", sourceOffset: 10 },
    ]);
  });
});

