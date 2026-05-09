import type { SourceMappedNumber, SourceMappedString } from "@strudel-bf/shared";

import { z } from "zod";

const sourceRangeSchema = z.object({
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
});

const sourceMappedStringSchema = z.object({
  value: z.string(),
  bfRanges: z.array(sourceRangeSchema),
  perCharBfRanges: z.array(z.array(sourceRangeSchema)),
});

const sourceMappedNumberSchema = z.object({
  value: z.number().finite(),
  bfRanges: z.array(sourceRangeSchema),
});

const sampleVoiceSchema = z.object({
  kind: z.literal("sample"),
  mini: sourceMappedStringSchema,
  bank: sourceMappedStringSchema.optional(),
  dec: sourceMappedNumberSchema.optional(),
});

const programV0Schema = z.object({
  version: z.literal(0),
  voices: z.array(sampleVoiceSchema).min(1),
});

export type VoiceV0 = {
  kind: "sample";
  mini: SourceMappedString;
  bank?: SourceMappedString;
  dec?: SourceMappedNumber;
};

export type ProgramV0 = {
  version: 0;
  voices: VoiceV0[];
};

export function validateProgramV0(input: unknown): ProgramV0 {
  return programV0Schema.parse(input) as ProgramV0;
}
