import { defineConfig } from "@playwright/test";
import { jdeBaseUrl } from "./support/credentials.js";

const headed = process.env.HEADED === "1" || process.env.PROFILE !== "ci";

export default defineConfig({
  testDir: "./specs",
  testMatch: /\\.spec\\.ts/,
  timeout: 300_000,
  workers: 1,
  fullyParallel: false,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: jdeBaseUrl,
    channel: "msedge",
    headless: !headed,
    ignoreHTTPSErrors: true,
    trace: "on",
    screenshot: "on",
    video: "off",
    viewport: { width: 1280, height: 720 },
  },
  projects: [{ name: "jde-edge" }],
});
