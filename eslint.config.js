import js from "@eslint/js";
import playwright from "eslint-plugin-playwright";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["node_modules/**", "test-results/**", "playwright-report/**", "blob-report/**", ".auth/**", "dummy-portal/**", "scripts/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module" },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    ...playwright.configs["flat/recommended"],
    files: ["tests/**/*.ts"],
    rules: {
      "playwright/no-wait-for-timeout": "error",
      "playwright/no-force-option": "error",
      "playwright/prefer-web-first-assertions": "error",
    },
  },
);
