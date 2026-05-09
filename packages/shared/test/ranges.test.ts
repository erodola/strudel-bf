import { describe, expect, it } from "vitest";

import { normalizeRanges, rangeUnion } from "../src/index.js";

describe("range helpers", () => {
  it("merges overlapping and adjacent ranges", () => {
    expect(
      normalizeRanges([
        { start: 10, end: 12 },
        { start: 12, end: 15 },
        { start: 1, end: 3 },
        { start: 2, end: 4 },
      ]),
    ).toEqual([
      { start: 1, end: 4 },
      { start: 10, end: 15 },
    ]);
  });

  it("unions multiple range sets", () => {
    expect(
      rangeUnion(
        [{ start: 1, end: 2 }],
        [{ start: 3, end: 5 }],
        [{ start: 2, end: 3 }],
      ),
    ).toEqual([{ start: 1, end: 5 }]);
  });
});

