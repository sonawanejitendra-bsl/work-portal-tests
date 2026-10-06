import { fileURLToPath } from "node:url";
import { defineFrameworkConfig } from "@core/playwright-framework";
import type { PlaywrightTestConfig } from "@playwright/test";

/**
 * JD Edwards is the application under test.
 * Host: environments.qa. The login test opens /jde/E1Menu.maf?
 * The execution summary page is written by this repo, not by the installed package.
 */
const summaryReporter = fileURLToPath(new URL("./scripts/execution-summary-reporter.mjs", import.meta.url));

const extra: PlaywrightTestConfig = {
  testDir: "./tests",
  testMatch: /jde-.*\.spec\.ts/,
  reporter: process.env.CI
    ? [
        ["blob", { outputDir: "blob-report" }],
        ["list"],
        ["junit", { outputFile: "test-results/junit.xml" }],
        [summaryReporter],
      ]
    : [
        ["list"],
        ["html", { open: "never" }],
        ["junit", { outputFile: "test-results/junit.xml" }],
        [summaryReporter],
      ],
};

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
      video: "off",
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
