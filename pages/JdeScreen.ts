import { type Frame, type Locator, type Page } from "@playwright/test";
import { jdeCatalog, type CatalogKey } from "../catalog/jde.catalog.js";

/** Thin screen. Every control is a catalog key. */
export class JdeScreen {
  constructor(private readonly page: Page) {}

  async click(key: CatalogKey): Promise<void> {
    await (await this.target(key)).click();
  }

  async fill(key: CatalogKey, value: string): Promise<void> {
    const target = await this.target(key);
    await target.click();
    await target.fill(value);
    await target.press("Tab");
  }

  async check(key: CatalogKey): Promise<void> {
    await (await this.target(key)).check();
  }

  async fastPath(program: string): Promise<void> {
    const box = await this.target("shell.fastPath");
    if (!(await box.isVisible().catch(() => false))) await this.click("shell.navigator");
    await box.click();
    await box.fill(program);
    await box.press("Enter");
  }

  async heal(staleKey: CatalogKey, liveKey: CatalogKey): Promise<void> {
    const stale = await this.target(staleKey);
    if (await stale.isVisible().catch(() => false)) {
      await stale.click();
      return;
    }
    const live = jdeCatalog[liveKey];
    if (live.kind !== "role") throw new Error(`${liveKey} is not a role`);
    await this.page
      .getByRole(live.role, { name: live.name })
      .or(this.page.locator(`input[value='${live.name}' i], input[alt='${live.name}' i]`))
      .first()
      .click();
  }

  async readOnHand(key: CatalogKey, branchPlant: string): Promise<string> {
    const entry = jdeCatalog[key];
    if (entry.kind !== "grid") throw new Error(`${key} is not a grid`);
    const rowName = new RegExp(entry.name);
    for (const frame of [...this.page.frames()].reverse()) {
      const rows = frame.getByRole("row", { name: rowName });
      const count = await rows.count().catch(() => 0);
      for (let i = 0; i < count; i += 1) {
        const cells = rows.nth(i).getByRole("cell");
        const branch = ((await cells.nth(entry.branchCell).innerText().catch(() => "")) || "").trim();
        const onHand = ((await cells.nth(entry.quantityCell).innerText().catch(() => "")) || "").trim();
        if (branch === branchPlant && onHand) return onHand;
      }
    }
    return "";
  }

  async bodyText(key: CatalogKey): Promise<string> {
    const frame = await this.frameFor(key);
    return frame.locator("body").innerText().catch(() => "");
  }

  title(): Promise<string> {
    return this.page.title();
  }

  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  async waitHidden(key: CatalogKey): Promise<void> {
    await (await this.target(key)).waitFor({ state: "hidden", timeout: 60_000 });
  }

  async waitVisible(key: CatalogKey): Promise<void> {
    await (await this.target(key)).waitFor({ state: "visible", timeout: 30_000 });
  }

  private async target(key: CatalogKey): Promise<Locator> {
    const entry = jdeCatalog[key];
    if (entry.kind === "role") return this.page.getByRole(entry.role, { name: entry.name });
    if (entry.kind === "css") return this.page.locator(entry.css);
    const frame = await this.frameFor(key);
    if (entry.kind === "frameNth") return frame.locator(entry.css).nth(entry.nth);
    if (entry.kind === "frameCss") return frame.locator(entry.css).first();
    throw new Error(`${key} has no locator`);
  }

  private async frameFor(key: CatalogKey): Promise<Frame> {
    const entry = jdeCatalog[key];
    const css = "css" in entry ? entry.css : "input[title='Item Number']";
    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
      for (const frame of [...this.page.frames()].reverse()) {
        if (await frame.locator(css).count().catch(() => 0)) return frame;
      }
      await this.page.waitForTimeout(400);
    }
    throw new Error(`No frame contains ${key}`);
  }
}
