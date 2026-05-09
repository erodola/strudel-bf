import { describe, expect, it } from "vitest";

import {
  collectActiveSampleNames,
  collectNormalizedHaps,
  LANDING_PAGE_REFERENCE_CODE,
} from "../src/index.js";

describe("Strudel runtime bridge", () => {
  it("queries a synth pattern through the pinned Strudel runtime", async () => {
    const haps = await collectNormalizedHaps(LANDING_PAGE_REFERENCE_CODE, 2);
    expect(haps.length).toBeGreaterThan(0);
    expect(collectActiveSampleNames(haps)).toEqual(["supersaw"]);
  });
});
