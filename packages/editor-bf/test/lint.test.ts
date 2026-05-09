import { describe, expect, it } from "vitest";

import { buildBracketMap, tokenizeBrainfuck } from "@strudel-bf/bf-core";

describe("brainfuck lint baseline", () => {
  it("accepts balanced programs", () => {
    expect(() => buildBracketMap(tokenizeBrainfuck("[[]]"))).not.toThrow();
  });

  it("rejects unmatched programs", () => {
    expect(() => buildBracketMap(tokenizeBrainfuck("[[]"))).toThrow();
  });
});
