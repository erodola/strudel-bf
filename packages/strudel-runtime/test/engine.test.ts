import { describe, expect, it } from "vitest";

import {
  collectActiveSampleNames,
  collectNormalizedHaps,
  LANDING_PAGE_REFERENCE_CODE,
} from "../src/index.js";

describe("Strudel runtime bridge", () => {
  it("queries the landing-page rhythm through the pinned Strudel runtime", async () => {
    const haps = await collectNormalizedHaps(LANDING_PAGE_REFERENCE_CODE, 2);
    expect(haps.length).toBeGreaterThan(0);
    expect(collectActiveSampleNames(haps)).toEqual(["bd", "hh", "oh"]);
    expect(haps[0]?.value.bank).toBe("tr909");
  });
});
