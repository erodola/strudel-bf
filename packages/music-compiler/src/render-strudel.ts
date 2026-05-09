import type { SourceRange } from "@strudel-bf/shared";

import { rangeUnion } from "@strudel-bf/shared";

import type { ProgramV0 } from "./ir.js";

export type RenderField = "mini" | "bank" | "dec";

export type RenderMappingSegment = {
  start: number;
  end: number;
  field: RenderField;
  sourceIndex?: number;
  bfRanges: SourceRange[];
};

export type RenderedProgram = {
  code: string;
  segments: RenderMappingSegment[];
};

function formatCanonicalNumber(value: number): string {
  const asString = value.toString();
  if (asString.startsWith("0.")) {
    return asString.slice(1);
  }
  if (asString.startsWith("-0.")) {
    return `-${asString.slice(2)}`;
  }
  return asString;
}

export function renderProgramToStrudel(program: ProgramV0): RenderedProgram {
  const voice = program.voices[0];
  if (!voice) {
    throw new Error("ProgramV0 must contain at least one voice");
  }
  const segments: RenderMappingSegment[] = [];

  let code = '$: s("';
  const miniStart = code.length;
  code += voice.mini.value;

  voice.mini.perCharBfRanges.forEach((ranges, index) => {
    segments.push({
      start: miniStart + index,
      end: miniStart + index + 1,
      field: "mini",
      sourceIndex: index,
      bfRanges: ranges,
    });
  });

  code += '")';

  if (voice.bank) {
    code += '.bank("';
    const bankStart = code.length;
    code += voice.bank.value;
    voice.bank.perCharBfRanges.forEach((ranges, index) => {
      segments.push({
        start: bankStart + index,
        end: bankStart + index + 1,
        field: "bank",
        sourceIndex: index,
        bfRanges: ranges,
      });
    });
    code += '")';
  }

  if (voice.dec) {
    code += ".dec(";
    const renderedNumber = formatCanonicalNumber(voice.dec.value);
    const decStart = code.length;
    code += renderedNumber;
    const decRanges = voice.dec.bfRanges;
    for (let index = 0; index < renderedNumber.length; index += 1) {
      segments.push({
        start: decStart + index,
        end: decStart + index + 1,
        field: "dec",
        sourceIndex: index,
        bfRanges: decRanges,
      });
    }
    code += ")";
  }

  return { code, segments };
}

export function collectRenderedBrainfuckRanges(
  rendered: RenderedProgram,
  start: number,
  end: number,
): SourceRange[] {
  return rangeUnion(
    ...rendered.segments
      .filter((segment) => segment.end > start && segment.start < end)
      .map((segment) => segment.bfRanges),
  );
}
