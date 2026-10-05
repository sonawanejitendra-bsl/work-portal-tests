import { defineFrameworkConfig } from "@core/playwright-framework";
import type { PlaywrightTestConfig } from "@playwright/test";

/**
 * Application test config. App name, URLs and roles live here.
 * Shared behaviour (profiles, reporters, projects) comes from the core package.
 */
const extra: PlaywrightTestConfig = {
  testDir: "./tests",
  webServer: {
    command: "node dummy-portal/server.mjs",
    url: "http://127.0.0.1:4174/login",
    reuseExistingServer: !process.env.CI,
  },
};

if (process.env.CI) {
  extra.reporter = [
    ["blob", { outputDir: "blob-report" }],
    ["list"],
    ["junit", { outputFile: "test-results/junit.xml" }],
    ["@core/playwright-framework/reporter"],
  ];
}

export default defineFrameworkConfig(
  {
    app: "work-portal",
    environments: {
      qa: "http://127.0.0.1:4174",
    },
    roles: ["operator", "reviewer"],
    browsers: ["chromium"],
    defaultEnvironment: "qa",
    healing: { mode: "report" },
    auth: {
      enabled: true,
      loginPath: "/login",
      sessionCheckPath: "/api/me",
      reloginOnce: true,
    },
    testData: {
      folder: "data/qa",
      cleanup: true,
    },
  },
  extra,
);
