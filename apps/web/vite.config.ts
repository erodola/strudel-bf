import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@kabelsalat/web": resolve(
        __dirname,
        "../../node_modules/@kabelsalat/web/dist/index.mjs",
      ),
    },
    dedupe: ["@codemirror/state", "@codemirror/view"],
  },
  server: {
    port: 5173,
  },
});
