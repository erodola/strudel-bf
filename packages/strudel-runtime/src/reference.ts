export const LANDING_PAGE_REFERENCE_CODE =
  's("supersaw").note("0")';

export function sanitizePlayableCode(code: string): string {
  return code.replace(/^\s*\$:\s*/u, "").trim();
}
