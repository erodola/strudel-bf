import type { SourceRange } from "@strudel-bf/shared";

import { normalizeRanges } from "@strudel-bf/shared";

export type BrainfuckOutputEvent = {
  outputIndex: number;
  value: number;
  char: string;
  ranges: SourceRange[];
};

export function eventRangeAt(
  events: readonly BrainfuckOutputEvent[],
  start: number,
  end: number,
): SourceRange[] {
  return normalizeRanges(
    events.slice(start, end).flatMap((event) => event.ranges),
  );
}

