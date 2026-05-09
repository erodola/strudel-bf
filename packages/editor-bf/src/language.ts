export const BRAINFUCK_COMMANDS = new Set(["+", "-", "<", ">", "[", "]", ".", ","]);

export function isBrainfuckCommand(char: string): boolean {
  return BRAINFUCK_COMMANDS.has(char);
}

