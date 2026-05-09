export type NormalizedHap = {
  whole: [string | null, string | null];
  part: [string | null, string | null];
  value: Record<string, unknown>;
};

function fractionToString(value: unknown): string | null {
  if (
    value &&
    typeof value === "object" &&
    "toFraction" in value &&
    typeof value.toFraction === "function"
  ) {
    return value.toFraction();
  }
  return null;
}

export function normalizeHaps(haps: readonly any[]): NormalizedHap[] {
  return haps.map((hap) => ({
    whole: [
      fractionToString(hap.whole?.begin),
      fractionToString(hap.whole?.end),
    ],
    part: [
      fractionToString(hap.part?.begin),
      fractionToString(hap.part?.end),
    ],
    value: { ...(hap.value ?? {}) },
  }));
}

export function collectActiveSampleNames(haps: readonly NormalizedHap[]): string[] {
  const names = haps
    .map((hap) => hap.value.s)
    .filter((value): value is string => typeof value === "string");
  return Array.from(new Set(names));
}

