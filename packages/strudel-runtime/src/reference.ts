export const LANDING_PAGE_REFERENCE_CODE =
  '$: s("[bd <hh oh>]*8").bank("tr909").dec(.4)';

export function sanitizePlayableCode(code: string): string {
  return code.replace(/^\s*\$:\s*/u, "").trim();
}
