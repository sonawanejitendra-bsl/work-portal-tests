import { readFileSync } from "node:fs";
import { defineConfig } from "@playwright/test";

const qa = JSON.parse(readFileSync(new URL("./config/qa.json", import.meta.url), "utf8")) as { baseURL: string; browser: string };
const headed = process.env.HEADED === "1" || process.env.PROFILE !== "ci";

export default defineConfig({
  testDir: "./tests",
  testMatch: /\.test\.ts/,
  timeout: 300_000,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.JDE_BASE_URL ?? qa.baseURL,
    channel: qa.browser,
    headless: !headed,
    ignoreHTTPSErrors: true,
    trace: "on",
    screenshot: "on",
    video: "off",
    viewport: { width: 1280, height: 720 },
  },
});
