import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // Use jsdom for frontend-like environment (React components, DOM APIs)
    environment: "jsdom",

    // Global test setup file
    setupFiles: ["./tests/setup.ts"],

    // Enable globals (describe, it, expect) without imports
    globals: true,

    // Include test files from tests/ directory
    include: ["tests/**/*.test.{ts,tsx}"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/app/**/layout.tsx",
        "src/app/**/page.tsx",
        "src/instrumentation.ts",
      ],
    },

    // Type checking
    typecheck: {
      enabled: true,
      tsconfig: "./tsconfig.json",
    },

    // Faster test isolation
    isolate: true,

    // Reporter for CI output
    reporters: ["verbose"],
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
