import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const packageJsonPath = resolve(
  process.cwd(),
  "node_modules/@kabelsalat/web/package.json",
);

try {
  const raw = await readFile(packageJsonPath, "utf8");
  const parsed = JSON.parse(raw);

  if (parsed.main === "dist/index.mjs") {
    process.exit(0);
  }

  parsed.main = "dist/index.mjs";
  await writeFile(packageJsonPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
} catch (error) {
  console.warn("patch-kabelsalat-web: skipped", error);
}
