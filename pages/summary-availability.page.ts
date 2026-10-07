import { expect, type Frame, type Page } from "@playwright/test";
import { captureStep } from "./capture-step.js";

/**
 * Summary Availability is JD Edwards application P41202,
 * titled Work With Item Availability.
 * Fast Path is the menu path used to open it.
 */
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
    await captureStep(this.page, "Summary Availability open");
  }

  async search(itemNumber: string, branchPlant: string, resultName = "Find results"): Promise<void> {
    const form = await this.form();
    const item = form.locator("input[title='Item Number']");
    const branch = form.locator("input[title='Branch/Plant']");
    await item.click();
    await item.fill(itemNumber);
    await item.press("Tab");
    await captureStep(this.page, "Item number entered");
    await branch.click();
    await branch.fill(branchPlant);
    await branch.press("Tab");
    await captureStep(this.page, "Branch/Plant entered");
    await form.locator("input[title='Omit Zero Quantities']").check();
    await captureStep(this.page, "Omit zero quantities");
    await form.locator("#hc_Find").click();
    await form.getByRole("row", { name: /^No Attachment P/ }).first().waitFor({ state: "visible", timeout: 30_000 }).catch(() => undefined);
    await captureStep(this.page, resultName);
  }

  async readOnHand(branchPlant: string): Promise<string> {
    let quantity = "";
    await expect
      .poll(
        async () => {
          quantity = await this.onHand(branchPlant);
          return quantity;
        },
        { timeout: 30_000 },
      )
      .not.toBe("");
    return quantity;
  }

  /**
   * Data row cells are: checkbox, attachment, primary, location, branch, on hand.
   * The total row is excluded because its name starts with TOTAL.
   */
  async expectOnHand(branchPlant: string, quantity: string): Promise<void> {
    await expect.poll(async () => this.onHand(branchPlant), { timeout: 30_000 }).toBe(quantity);
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
      const frames = [...this.page.frames()].reverse();
      for (const frame of frames) {
        const item = frame.locator("input[title='Item Number']");
        if (await item.count().catch(() => 0)) return frame;
      }
      await this.page.waitForTimeout(400);
    }
    throw new Error("Work With Item Availability did not open");
  }
}
