import { expect, type Frame, type Page } from "@playwright/test";
import { captureStep } from "./capture-step.js";

/**
 * Inventory Adjustments (P4114).
 * Company PACO rejects the system date as a future period.
 * 01/31/2026 is a date this environment accepts.
 */
const GL_DATE = "01/31/2026";

export class InventoryAdjustmentsPage {
  constructor(private readonly page: Page) {}

  async adjust(itemNumber: string, branchPlant: string, quantity: string): Promise<void> {
    await this.fastPath("P4114");
    const workWith = await this.frameContaining("#hc_Add");
    await workWith.locator("#hc_Add").click();

    const entry = await this.frameContaining("input[title='G/L Date']");
    await captureStep(this.page, "Adjustment form");
    const branch = entry.locator("input[title='Branch/Plant']").first();
    await branch.click();
    await branch.fill(branchPlant);
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
    const item = grid.locator("input.JSTextfield").nth(0);
    const units = grid.locator("input.JSTextfield").nth(1);
    await item.click();
    await item.fill(itemNumber);
    await item.press("Tab");
    await units.click();
    await units.fill(quantity);
    await units.press("Tab");
    await captureStep(this.page, `Adjustment ${quantity} entered`);
    await entry.locator("#hc_OK").click();

    await expect
      .poll(async () => {
        const text = await entry.locator("body").innerText().catch(() => "");
        if (/This form has [1-9]/.test(text) || /Future Month|Blanks Invalid/.test(text)) return text.slice(0, 240);
        if (/Previous Doc/.test(text)) return "saved";
        return "";
      }, { timeout: 30_000 })
      .toBe("saved");
    await captureStep(this.page, `Adjustment ${quantity} saved`);
  }

  private async fastPath(program: string): Promise<void> {
    const fastPath = this.page.locator("#TE_FAST_PATH_BOX");
    if (!(await fastPath.isVisible().catch(() => false))) {
      await this.page.locator("#drop_mainmenuParent").click();
    }
    await fastPath.click();
    await fastPath.fill(program);
    await fastPath.press("Enter");
  }

  private async frameContaining(selector: string): Promise<Frame> {
    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
      const frames = [...this.page.frames()].reverse();
      for (const frame of frames) {
        if (await frame.locator(selector).count().catch(() => 0)) return frame;
      }
      await this.page.waitForTimeout(400);
    }
    throw new Error(`Inventory Adjustments did not show ${selector}`);
  }
}
