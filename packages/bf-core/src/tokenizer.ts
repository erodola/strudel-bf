export const BF_COMMANDS = new Set(["+", "-", "<", ">", "[", "]", ".", ","]);

export type BrainfuckToken = {
  command: string;
  sourceOffset: number;
};

export function tokenizeBrainfuck(source: string): BrainfuckToken[] {
  const tokens: BrainfuckToken[] = [];
  for (let offset = 0; offset < source.length; offset += 1) {
    const command = source[offset];
    if (command !== undefined && BF_COMMANDS.has(command)) {
      tokens.push({ command, sourceOffset: offset });
    }
  }
  return tokens;
}
