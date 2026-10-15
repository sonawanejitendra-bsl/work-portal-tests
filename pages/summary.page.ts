import { expect, type Frame, type Page } from "@playwright/test";

export class SummaryPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.locator("#drop_mainmenuParent").click();
    const fastPath = this.page.locator("#TE_FAST_PATH_BOX");
    await fastPath.click();
    await fastPath.fill("P41202");
    await fastPath.press("Enter");
    await expect.poll(async () => (await this.page.title()).replace(/\u00a0/g, " "), { timeout: 60_000 }).toContain("Work With Item Availability");
  }

  async find(item: string, branchPlant: string): Promise<void> {
    const form = await this.form();
    const itemBox = form.locator("input[title='Item Number']");
    const branch = form.locator("input[title='Branch/Plant']");
    await itemBox.click();
    await itemBox.fill(item);
    await itemBox.press("Tab");
    await branch.click();
    await branch.fill(branchPlant);
    await branch.press("Tab");
    await form.locator("input[title='Omit Zero Quantities']").check();
    await form.locator("#hc_Find").click();
    await form.getByRole("row", { name: /^No Attachment P/ }).first().waitFor({ state: "visible", timeout: 30_000 }).catch(() => undefined);
  }

  async readOnHand(branchPlant: string): Promise<number> {
    let quantity = "";
    await expect.poll(async () => {
      quantity = await this.onHand(branchPlant);
      return quantity;
    }, { timeout: 30_000 }).not.toBe("");
    return Number(quantity);
  }

  async expectIncreased(branchPlant: string, before: number, increase: number): Promise<void> {
    await expect.poll(async () => this.onHand(branchPlant), { timeout: 30_000 }).toBe(String(before + increase));
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
