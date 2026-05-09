import type { BrainfuckOutputEvent } from "@strudel-bf/bf-core";
import type { SourceMappedNumber, SourceMappedString } from "@strudel-bf/shared";

import { eventRangeAt } from "@strudel-bf/bf-core";
import { rangeUnion } from "@strudel-bf/shared";

import { MusicCompilerError } from "./diagnostics.js";
import type { ProgramV0, VoiceV0 } from "./ir.js";
import { validateProgramV0 } from "./ir.js";

type ParsedLine = {
  key: string;
  value: string;
  valueStart: number;
  valueEnd: number;
};

function parseProtocolLines(output: string): ParsedLine[] {
  const lines: ParsedLine[] = [];
  let lineStart = 0;

  for (let index = 0; index <= output.length; index += 1) {
    const isLineEnd = index === output.length || output[index] === "\n";
    if (!isLineEnd) {
      continue;
    }

    const line = output.slice(lineStart, index);
    if (line.length > 0) {
      const equalsIndex = line.indexOf("=");
      if (equalsIndex < 0) {
        throw new MusicCompilerError(`Invalid protocol line: ${line}`, "invalid_line", {
          start: lineStart,
          end: index,
        });
      }

      const key = line.slice(0, equalsIndex).trim();
      const rawValue = line.slice(equalsIndex + 1);
      const leadingWhitespace = rawValue.match(/^\s*/u)?.[0].length ?? 0;
      const trailingWhitespace = rawValue.match(/\s*$/u)?.[0].length ?? 0;
      const valueStart = lineStart + equalsIndex + 1 + leadingWhitespace;
      const valueEnd = index - trailingWhitespace;

      lines.push({
        key,
        value: output.slice(valueStart, valueEnd),
        valueStart,
        valueEnd,
      });
    }

    lineStart = index + 1;
  }

  return lines;
}

function decodeMappedString(
  line: ParsedLine,
  outputEvents: readonly BrainfuckOutputEvent[],
): SourceMappedString {
  return {
    value: line.value,
    bfRanges: eventRangeAt(outputEvents, line.valueStart, line.valueEnd),
    perCharBfRanges: Array.from(line.value, (_, index) =>
      eventRangeAt(
        outputEvents,
        line.valueStart + index,
        line.valueStart + index + 1,
      ),
    ),
  };
}

function decodeMappedNumber(
  line: ParsedLine,
  outputEvents: readonly BrainfuckOutputEvent[],
): SourceMappedNumber {
  const value = Number.parseFloat(line.value);
  if (!Number.isFinite(value)) {
    throw new MusicCompilerError(`Invalid numeric value: ${line.value}`, "invalid_number", {
      start: line.valueStart,
      end: line.valueEnd,
    });
  }

  return {
    value,
    bfRanges: eventRangeAt(outputEvents, line.valueStart, line.valueEnd),
  };
}

export function decodeBrainfuckMusicOutput(
  output: string,
  outputEvents: readonly BrainfuckOutputEvent[],
): ProgramV0 {
  const lines = parseProtocolLines(output);
  const lineByKey = new Map(lines.map((line) => [line.key, line] as const));

  const miniLine = lineByKey.get("mini");
  if (!miniLine) {
    throw new MusicCompilerError("Protocol is missing `mini=` line", "missing_mini");
  }

  const voice: VoiceV0 = {
    kind: "sample",
    mini: decodeMappedString(miniLine, outputEvents),
  };

  const bankLine = lineByKey.get("bank");
  if (bankLine) {
    voice.bank = decodeMappedString(bankLine, outputEvents);
  }

  const decLine = lineByKey.get("dec");
  if (decLine) {
    voice.dec = decodeMappedNumber(decLine, outputEvents);
  }

  return validateProgramV0({
    version: 0,
    voices: [voice],
  });
}

export function collectVoiceRanges(voice: VoiceV0) {
  return rangeUnion(
    voice.mini.bfRanges,
    voice.bank?.bfRanges ?? [],
    voice.dec?.bfRanges ?? [],
  );
}

