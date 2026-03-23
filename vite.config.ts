import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  server: { host: "0.0.0.0" },
  plugins: [react(), tsconfigPaths()],
  define: {
    __BUILD_INFO__: JSON.stringify({
      COMMIT_HASH: process.env.GIT_COMMIT_SHA || process.env.CI_COMMIT_SHA || "[local-build]",
      COMMIT_TIME: process.env.GIT_COMMIT_TIME || process.env.CI_COMMIT_TIMESTAMP || null,
      TAG: process.env.GIT_COMMIT_TAG || process.env.CI_COMMIT_TAG || null,
      BUILD_TIME: process.env.IMAGE_BUILD_TIME || null,
    }),
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/test/**",
        "src/**/*.d.ts",
        "src/main.tsx",
        "src/design/assets/**",
        "src/i18n/**",
      ],
    },
  },
});
