import { expect, type Frame, type Page } from "@playwright/test";
import { shot } from "../support/shot.js";
import type { JdeItem } from "../test-data/JdeItems.js";

/** Work With Item Availability, fast path P41202. */
export class SummaryAvailabilityPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.locator("#drop_mainmenuParent").click();
    const fastPath = this.page.locator("#TE_FAST_PATH_BOX");
    await fastPath.click();
    await fastPath.fill("P41202");
    await fastPath.press("Enter");
    await expect
      .poll(async () => (await this.page.title()).replace(/\u00a0/g, " "), { timeout: 60_000 })
      .toContain("Work With Item Availability");
    await shot(this.page, "Summary Availability open");
  }

  async search(item: JdeItem, resultName = "Find results"): Promise<void> {
    const form = await this.form();
    const itemBox = form.locator("input[title='Item Number']");
    const branch = form.locator("input[title='Branch/Plant']");
    await itemBox.click();
    await itemBox.fill(item.number);
    await itemBox.press("Tab");
    await shot(this.page, "Item number entered");
    await branch.click();
    await branch.fill(item.branch);
    await branch.press("Tab");
    await shot(this.page, "Branch/Plant entered");
    await form.locator("input[title='Omit Zero Quantities']").check();
    await shot(this.page, "Omit zero quantities");
    await form.locator("#hc_Find").click();
    await form.getByRole("row", { name: /^No Attachment P/ }).first().waitFor({ state: "visible", timeout: 30_000 }).catch(() => undefined);
    await shot(this.page, resultName);
  }

  async readOnHand(branchPlant: string): Promise<number> {
    let quantity = "";
    await expect.poll(async () => {
      quantity = await this.onHand(branchPlant);
      return quantity;
    }, { timeout: 30_000 }).not.toBe("");
    return Number(quantity);
  }

  async expectOnHandIncreased(branchPlant: string, before: number): Promise<void> {
    await expect.poll(async () => this.onHand(branchPlant), { timeout: 30_000 }).toBe(String(before + 1));
  }

  private async onHand(branchPlant: string): Promise<string> {
    for (const frame of [...this.page.frames()].reverse()) {
      const rows = frame.getByRole("row", { name: /^No Attachment P/ });
      const count = await rows.count().catch(() => 0);
      for (let i = 0; i < count; i += 1) {
        const cells = rows.nth(i).getByRole("cell");
        const branch = ((await cells.nth(4).innerText().catch(() => "")) || "").trim();
        const onHand = ((await cells.nth(5).innerText().catch(() => "")) || "").trim();
        if (branch === branchPlant && onHand) return onHand;
      }
    }
    return "";
  }

  private async form(): Promise<Frame> {
    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
      for (const frame of [...this.page.frames()].reverse()) {
        if (await frame.locator("input[title='Item Number']").count().catch(() => 0)) return frame;
      }
      await this.page.waitForTimeout(400);
    }
    throw new Error("Work With Item Availability did not open");
  }
}
