import type { SourceRange, SourceMappedString } from "@strudel-bf/shared";

import { rangeUnion } from "@strudel-bf/shared";

import type { RenderedProgram } from "./render-strudel.js";

export type MiniTokenSource = {
  token: string;
  miniRange: SourceRange;
  bfRanges: SourceRange[];
};

export function translateRenderedOffsetsToBrainfuck(
  rendered: RenderedProgram,
  offsets: readonly number[],
): SourceRange[] {
  const segments = offsets.flatMap((offset) =>
    rendered.segments
      .filter((segment) => segment.start <= offset && offset < segment.end)
      .map((segment) => segment.bfRanges),
  );
  return rangeUnion(...segments);
}

export function findRenderedSubstringRange(
  rendered: RenderedProgram,
  substring: string,
  fromIndex = 0,
): SourceRange {
  const start = rendered.code.indexOf(substring, fromIndex);
  if (start < 0) {
    throw new Error(`Substring not found: ${substring}`);
  }
  return {
    start,
    end: start + substring.length,
  };
}

export function extractMiniTokenSources(mini: SourceMappedString): MiniTokenSource[] {
  const matches = mini.value.matchAll(/[A-Za-z0-9_]+/gu);
  return Array.from(matches, (match) => {
    const token = match[0] ?? "";
    const start = match.index ?? 0;
    const end = start + token.length;
    return {
      token,
      miniRange: { start, end },
      bfRanges: rangeUnion(...mini.perCharBfRanges.slice(start, end)),
    };
  });
}
