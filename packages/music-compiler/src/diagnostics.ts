import type { Diagnostic, SourceRange } from "@strudel-bf/shared";

export class MusicCompilerError extends Error {
  readonly diagnostic: Diagnostic;

  constructor(message: string, code = "music_compiler_error", range?: SourceRange) {
    super(message);
    this.name = "MusicCompilerError";
    this.diagnostic = {
      code,
      message,
      severity: "error",
      ...(range ? { range } : {}),
    };
  }
}

