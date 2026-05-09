export type SourceRange = {
  start: number;
  end: number;
};

export type DiagnosticSeverity = "error" | "warning";

export type Diagnostic = {
  code: string;
  message: string;
  severity: DiagnosticSeverity;
  range?: SourceRange;
};

export type SourceMappedString = {
  value: string;
  bfRanges: SourceRange[];
  perCharBfRanges: SourceRange[][];
};

export type SourceMappedNumber = {
  value: number;
  bfRanges: SourceRange[];
};

export function compareRanges(left: SourceRange, right: SourceRange): number {
  if (left.start !== right.start) {
    return left.start - right.start;
  }
  return left.end - right.end;
}

export function normalizeRanges(ranges: readonly SourceRange[]): SourceRange[] {
  const filtered = ranges
    .filter((range) => range.end > range.start)
    .slice()
    .sort(compareRanges);

  if (filtered.length === 0) {
    return [];
  }

  const first = filtered[0];
  if (!first) {
    return [];
  }

  const merged: SourceRange[] = [{ ...first }];
  for (const current of filtered.slice(1)) {
    const previous = merged[merged.length - 1];
    if (!previous) {
      merged.push({ ...current });
      continue;
    }
    if (current.start <= previous.end) {
      previous.end = Math.max(previous.end, current.end);
      continue;
    }
    merged.push({ ...current });
  }
  return merged;
}

export function rangeUnion(
  ...rangeSets: ReadonlyArray<readonly SourceRange[]>
): SourceRange[] {
  return normalizeRanges(rangeSets.flat());
}

export function rangesEqual(
  left: readonly SourceRange[],
  right: readonly SourceRange[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }
  return left.every(
    (range, index) =>
      range.start === right[index]?.start && range.end === right[index]?.end,
  );
}
