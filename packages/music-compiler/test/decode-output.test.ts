import { describe, expect, it } from "vitest";

import type { BrainfuckOutputEvent } from "@strudel-bf/bf-core";

import { decodeBrainfuckMusicOutput } from "../src/decode-output.js";

function createOutputEvents(text: string): BrainfuckOutputEvent[] {
  return Array.from(text, (char, index) => ({
    outputIndex: index,
    value: char.charCodeAt(0),
    char,
    ranges: [{ start: index * 2, end: index * 2 + 1 }],
  }));
}

describe("decodeBrainfuckMusicOutput", () => {
  it("decodes the text protocol into ProgramV0", () => {
    const output = "mini=[bd <hh oh>]*2\nbank=tr909\ndec=.4\n";
    const program = decodeBrainfuckMusicOutput(output, createOutputEvents(output));
    const voice = program.voices[0];
    expect(voice).toBeDefined();
    if (!voice) {
      return;
    }

    expect(voice.mini.value).toBe("[bd <hh oh>]*2");
    expect(voice.bank?.value).toBe("tr909");
    expect(voice.dec?.value).toBe(0.4);
    expect(voice.mini.perCharBfRanges).toHaveLength(14);
  });
});
