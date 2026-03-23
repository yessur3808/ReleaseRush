import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  server: { host: "0.0.0.0" },
  plugins: [react(), tsconfigPaths()],
  define: {
    __BUILD_INFO__: JSON.stringify({
      COMMIT_HASH:
        process.env.GIT_COMMIT_SHA ||
        process.env.CI_COMMIT_SHA ||
        "[local-build]",
      COMMIT_TIME:
        process.env.GIT_COMMIT_TIME || process.env.CI_COMMIT_TIMESTAMP || null,
      TAG: process.env.GIT_COMMIT_TAG || process.env.CI_COMMIT_TAG || null,
      BUILD_TIME: process.env.IMAGE_BUILD_TIME || null,
    }),
  },
});
