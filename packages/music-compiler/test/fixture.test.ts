import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { executeBrainfuck } from "@strudel-bf/bf-core";

describe("landing-page Brainfuck fixture", () => {
  it("outputs the pinned Stranger Things upstream source URL", () => {
    const source = readFileSync(
      resolve(import.meta.dirname, "../../../fixtures/landing-page-demo.bf"),
      "utf8",
    );

    const execution = executeBrainfuck(source);
    expect(execution.output).toBe(
      "strudel_url=https://raw.githubusercontent.com/eefano/strudel-songs-collection/a32abf733a4cab967f30eacb4bcecd596c3e2609/strangerthings.js\n",
    );
  });
});
