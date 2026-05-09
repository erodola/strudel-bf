import { describe, expect, it } from "vitest";

import {
  decodeBrainfuckMusicOutput,
  extractMiniTokenSources,
  findRenderedSubstringRange,
  renderProgramToStrudel,
  translateRenderedOffsetsToBrainfuck,
} from "../src/index.js";

function createOutputEvents(text: string) {
  return Array.from(text, (char, index) => ({
    outputIndex: index,
    value: char.charCodeAt(0),
    char,
    ranges: [{ start: 100 + index, end: 101 + index }],
  }));
}

describe("renderProgramToStrudel", () => {
  it("renders the canonical landing-page snippet", () => {
    const output = "mini=[bd <hh oh>]*2\nbank=tr909\ndec=.4\n";
    const program = decodeBrainfuckMusicOutput(output, createOutputEvents(output));
    const rendered = renderProgramToStrudel(program);

    expect(rendered.code).toBe('$: s("[bd <hh oh>]*2").bank("tr909").dec(.4)');
  });

  it("translates active rendered offsets back to BF ranges", () => {
    const output = "mini=[bd <hh oh>]*2\nbank=tr909\ndec=.4\n";
    const program = decodeBrainfuckMusicOutput(output, createOutputEvents(output));
    const rendered = renderProgramToStrudel(program);

    const hhRange = findRenderedSubstringRange(rendered, "hh");
    const translated = translateRenderedOffsetsToBrainfuck(rendered, [
      hhRange.start,
      hhRange.start + 1,
    ]);

    expect(translated).toEqual([
      { start: 110, end: 112 },
    ]);
  });

  it("extracts mini token BF provenance", () => {
    const output = "mini=[bd <hh oh>]*2\nbank=tr909\ndec=.4\n";
    const program = decodeBrainfuckMusicOutput(output, createOutputEvents(output));
    const voice = program.voices[0];
    expect(voice).toBeDefined();
    if (!voice) {
      return;
    }
    const sources = extractMiniTokenSources(voice.mini);

    expect(sources.map((source) => source.token)).toEqual(["bd", "hh", "oh", "2"]);
    expect(sources[1]?.bfRanges).toEqual([{ start: 110, end: 112 }]);
  });
});
