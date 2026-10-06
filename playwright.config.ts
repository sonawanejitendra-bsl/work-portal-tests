import { defineFrameworkConfig } from "@core/playwright-framework";
import type { PlaywrightTestConfig } from "@playwright/test";

/**
 * JD Edwards is the application under test.
 * Host: environments.qa. The login test opens /jde/E1Menu.maf?
 */
const extra: PlaywrightTestConfig = {
  testDir: "./tests",
  testMatch: /jde-.*\.spec\.ts/,
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
    app: "jde",
    environments: {
      qa: "https://mirajde-dvtrweb.birlasoft.com",
    },
    roles: ["jde"],
    browsers: ["msedge"],
    defaultEnvironment: "qa",
    healing: { mode: "recover", minScore: 0.4 },
    evidence: {
      trace: "on",
      screenshot: "on",
      video: "on",
    },
    auth: { enabled: false },
    testData: {
      folder: "data/qa",
      cleanup: false,
    },
  },
  {
    ...extra,
    use: { ignoreHTTPSErrors: true },
  },
);
