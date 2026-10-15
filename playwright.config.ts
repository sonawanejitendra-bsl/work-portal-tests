import { defineConfig } from "@playwright/test";
import { jdeBaseUrl } from "./support/credentials.js";

/** Browser settings shared with the Cucumber hook. The feature files are run by cucumber-js. */
export default defineConfig({
  use: {
    baseURL: jdeBaseUrl,
    channel: "msedge",
    ignoreHTTPSErrors: true,
    video: "off",
  },
});
