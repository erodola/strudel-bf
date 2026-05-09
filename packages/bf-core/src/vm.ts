import type { SourceRange } from "@strudel-bf/shared";

import type { BrainfuckOutputEvent } from "./trace.js";
import { buildBracketMap, BrainfuckCompileError } from "./bracket-map.js";
import { tokenizeBrainfuck } from "./tokenizer.js";

export class BrainfuckRuntimeError extends Error {
  readonly range: SourceRange;

  constructor(message: string, range: SourceRange) {
    super(message);
    this.name = "BrainfuckRuntimeError";
    this.range = range;
  }
}

export type BrainfuckExecutionOptions = {
  memorySize?: number;
  input?: Uint8Array | string;
};

export type BrainfuckExecutionResult = {
  output: string;
  outputBytes: number[];
  outputEvents: BrainfuckOutputEvent[];
  pointer: number;
  memory: Uint8Array;
  steps: number;
};

function normalizeInput(input: Uint8Array | string | undefined): number[] {
  if (input === undefined) {
    return [];
  }
  if (typeof input === "string") {
    return Array.from(input, (char) => char.charCodeAt(0));
  }
  return Array.from(input);
}

export function executeBrainfuck(
  source: string,
  options: BrainfuckExecutionOptions = {},
): BrainfuckExecutionResult {
  const tokens = tokenizeBrainfuck(source);
  const bracketMap = buildBracketMap(tokens);
  const memory = new Uint8Array(options.memorySize ?? 30_000);
  const input = normalizeInput(options.input);
  const outputBytes: number[] = [];
  const outputEvents: BrainfuckOutputEvent[] = [];

  let pointer = 0;
  let instructionPointer = 0;
  let inputPointer = 0;
  let steps = 0;

  while (instructionPointer < tokens.length) {
    const token = tokens[instructionPointer];
    if (!token) {
      break;
    }
    const cell = memory[pointer] ?? 0;

    switch (token.command) {
      case ">":
        pointer += 1;
        if (pointer >= memory.length) {
          throw new BrainfuckRuntimeError("Pointer overflow", {
            start: token.sourceOffset,
            end: token.sourceOffset + 1,
          });
        }
        break;
      case "<":
        pointer -= 1;
        if (pointer < 0) {
          throw new BrainfuckRuntimeError("Pointer underflow", {
            start: token.sourceOffset,
            end: token.sourceOffset + 1,
          });
        }
        break;
      case "+":
        memory[pointer] = (cell + 1) & 0xff;
        break;
      case "-":
        memory[pointer] = (cell - 1 + 256) & 0xff;
        break;
      case ".":
        outputBytes.push(cell);
        outputEvents.push({
          outputIndex: outputEvents.length,
          value: cell,
          char: String.fromCharCode(cell),
          ranges: [{ start: token.sourceOffset, end: token.sourceOffset + 1 }],
        });
        break;
      case ",":
        if (inputPointer < input.length) {
          memory[pointer] = input[inputPointer] ?? cell;
          inputPointer += 1;
        }
        break;
      case "[":
        if (cell === 0) {
          const nextInstruction = bracketMap.get(instructionPointer);
          if (nextInstruction === undefined) {
            throw new BrainfuckCompileError("Missing bracket target", {
              start: token.sourceOffset,
              end: token.sourceOffset + 1,
            });
          }
          instructionPointer = nextInstruction;
        }
        break;
      case "]":
        if (cell !== 0) {
          const previousInstruction = bracketMap.get(instructionPointer);
          if (previousInstruction === undefined) {
            throw new BrainfuckCompileError("Missing bracket target", {
              start: token.sourceOffset,
              end: token.sourceOffset + 1,
            });
          }
          instructionPointer = previousInstruction;
        }
        break;
      default:
        break;
    }

    instructionPointer += 1;
    steps += 1;
  }

  return {
    output: String.fromCharCode(...outputBytes),
    outputBytes,
    outputEvents,
    pointer,
    memory,
    steps,
  };
}
