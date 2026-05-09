import { describe, expect, it } from "vitest";

import { buildBracketMap, BrainfuckCompileError } from "../src/bracket-map.js";
import { tokenizeBrainfuck } from "../src/tokenizer.js";

describe("buildBracketMap", () => {
  it("links opening and closing brackets", () => {
    const tokens = tokenizeBrainfuck("[[]]");
    const map = buildBracketMap(tokens);
    expect(map.get(0)).toBe(3);
    expect(map.get(3)).toBe(0);
    expect(map.get(1)).toBe(2);
    expect(map.get(2)).toBe(1);
  });

  it("throws on unmatched opening bracket", () => {
    const tokens = tokenizeBrainfuck("[+");
    expect(() => buildBracketMap(tokens)).toThrowError(BrainfuckCompileError);
  });
});

