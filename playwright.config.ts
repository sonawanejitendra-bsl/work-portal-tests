import { defineConfig } from "@playwright/test";
import { qa } from "./config/environments.js";

const headed = process.env.HEADED === "1" || process.env.PROFILE !== "ci";

export default defineConfig({
  testDir: "./tests",
  testMatch: /\.spec\.ts/,
  timeout: 300_000,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: qa.baseURL,
    channel: qa.browser,
    headless: !headed,
    ignoreHTTPSErrors: true,
    trace: "on",
    screenshot: "on",
    video: "off",
    viewport: { width: 1280, height: 720 },
  },
});
