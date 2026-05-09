import { describe, expect, it } from "vitest";

import {
  BrainfuckRuntimeError,
  executeBrainfuck,
} from "../src/index.js";

describe("executeBrainfuck", () => {
  it("executes simple output", () => {
    const result = executeBrainfuck("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.");
    expect(result.output).toBe("A");
    expect(result.outputEvents).toEqual([
      {
        outputIndex: 0,
        value: 65,
        char: "A",
        ranges: [{ start: 65, end: 66 }],
      },
    ]);
  });

  it("executes loops and ignores comments", () => {
    const result = executeBrainfuck("++[>+++++<-]>++. label");
    expect(result.output).toBe("\f");
  });

  it("leaves the cell unchanged on EOF", () => {
    const result = executeBrainfuck("+++++,.", { input: "" });
    expect(result.outputBytes).toEqual([5]);
  });

  it("throws on pointer underflow", () => {
    expect(() => executeBrainfuck("<")).toThrowError(BrainfuckRuntimeError);
  });
});
