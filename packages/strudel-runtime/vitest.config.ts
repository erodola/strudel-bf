import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@kabelsalat/web": resolve(
        __dirname,
        "../../node_modules/@kabelsalat/web/dist/index.mjs",
      ),
    },
  },
  test: {
    environment: "node",
  },
});
