import { After, Before, setDefaultTimeout, setWorldConstructor, World, type IWorldOptions } from "@cucumber/cucumber";
import { chromium, type Browser, type Page } from "@playwright/test";
import { jdeBaseUrl } from "./credentials.js";

setDefaultTimeout(300_000);

export class JdeWorld extends World {
  browser!: Browser;
  page!: Page;
  onHandBefore = 0;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(JdeWorld);

Before(async function (this: JdeWorld) {
  const headed = process.env.HEADED === "1" || process.env.PROFILE !== "ci";
  this.browser = await chromium.launch({ channel: "msedge", headless: !headed });
  const context = await this.browser.newContext({
    baseURL: jdeBaseUrl,
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
  });
  this.page = await context.newPage();
});

After(async function (this: JdeWorld) {
  await this.page?.context().close();
  await this.browser?.close();
});
