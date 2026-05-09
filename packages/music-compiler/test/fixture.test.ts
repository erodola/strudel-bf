import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { executeBrainfuck } from "@strudel-bf/bf-core";

import {
  decodeBrainfuckMusicOutput,
  renderProgramToStrudel,
} from "../src/index.js";

describe("landing-page Brainfuck fixture", () => {
  it("renders exactly to the reference snippet", () => {
    const source = readFileSync(
      resolve(import.meta.dirname, "../../../fixtures/landing-page-demo.bf"),
      "utf8",
    );

    const execution = executeBrainfuck(source);
    const program = decodeBrainfuckMusicOutput(
      execution.output,
      execution.outputEvents,
    );
    const rendered = renderProgramToStrudel(program);

    expect(execution.output).toBe("mini=[bd <hh oh>]*8\nbank=tr909\ndec=.4\n");
    expect(rendered.code).toBe(
      '$: s("[bd <hh oh>]*8").bank("tr909").dec(.4)',
    );
  });
});
