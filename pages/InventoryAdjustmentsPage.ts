import { expect, type Frame, type Page } from "@playwright/test";
import { shot } from "../support/shot.js";
import type { JdeItem } from "../test-data/JdeItems.js";

const GL_DATE = "01/31/2026";

/** Inventory Adjustments, fast path P4114. */
export class InventoryAdjustmentsPage {
  constructor(private readonly page: Page) {}

  async post(item: JdeItem, quantity: string): Promise<void> {
    await this.fastPath("P4114");
    const workWith = await this.frameContaining("#hc_Add");
    await workWith.locator("#hc_Add").click();
    const entry = await this.frameContaining("input[title='G/L Date']");
    await shot(this.page, "Adjustment form");
    const branch = entry.locator("input[title='Branch/Plant']").first();
    await branch.click();
    await branch.fill(item.branch);
    await branch.press("Tab");
    const explanation = entry.locator("input[title='Explanation']");
    await explanation.fill("KAN-6");
    await explanation.press("Tab");
    for (const title of ["G/L Date", "Transaction Date"]) {
      const date = entry.locator(`input[title='${title}']`).first();
      await date.click();
      await date.fill(GL_DATE);
      await date.press("Tab");
    }
    const grid = entry.locator("table.gridrowEven").first();
    const itemBox = grid.locator("input.JSTextfield").nth(0);
    const units = grid.locator("input.JSTextfield").nth(1);
    await itemBox.click();
    await itemBox.fill(item.number);
    await itemBox.press("Tab");
    await units.click();
    await units.fill(quantity);
    await units.press("Tab");
    await shot(this.page, `Adjustment ${quantity} entered`);
    await entry.locator("#hc_OK").click();
    await expect.poll(async () => {
      const text = await entry.locator("body").innerText().catch(() => "");
      if (/This form has [1-9]/.test(text) || /Future Month|Blanks Invalid/.test(text)) return text.slice(0, 240);
      if (/Previous Doc/.test(text)) return "saved";
      return "";
    }, { timeout: 30_000 }).toBe("saved");
    await shot(this.page, `Adjustment ${quantity} saved`);
  }

  private async fastPath(program: string): Promise<void> {
    const fastPath = this.page.locator("#TE_FAST_PATH_BOX");
    if (!(await fastPath.isVisible().catch(() => false))) await this.page.locator("#drop_mainmenuParent").click();
    await fastPath.click();
    await fastPath.fill(program);
    await fastPath.press("Enter");
  }

  private async frameContaining(selector: string): Promise<Frame> {
    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
      for (const frame of [...this.page.frames()].reverse()) {
        if (await frame.locator(selector).count().catch(() => 0)) return frame;
      }
      await this.page.waitForTimeout(400);
    }
    throw new Error(`Inventory Adjustments did not show ${selector}`);
  }
}
