import { expect, type Frame, type Page } from "@playwright/test";
import { shot } from "../support/shot.js";

const GL_DATE = "01/31/2026";

export async function adjustInventory(page: Page, item: { number: string; branch: string }, quantity: number): Promise<void> {
  const fastPath = page.locator("#TE_FAST_PATH_BOX");
  if (!(await fastPath.isVisible().catch(() => false))) await page.locator("#drop_mainmenuParent").click();
  await fastPath.click();
  await fastPath.fill("P4114");
  await fastPath.press("Enter");
  const workWith = await frameContaining(page, "#hc_Add");
  await workWith.locator("#hc_Add").click();
  const entry = await frameContaining(page, "input[title='G/L Date']");
  await shot(page, "Adjustment form");
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
  await units.fill(String(quantity));
  await units.press("Tab");
  await shot(page, `Adjustment ${quantity} entered`);
  await entry.locator("#hc_OK").click();
  await expect.poll(async () => {
    const text = await entry.locator("body").innerText().catch(() => "");
    if (/This form has [1-9]/.test(text) || /Future Month|Blanks Invalid/.test(text)) return text.slice(0, 240);
    if (/Previous Doc/.test(text)) return "saved";
    return "";
  }, { timeout: 30_000 }).toBe("saved");
  await shot(page, `Adjustment ${quantity} saved`);
}

async function frameContaining(page: Page, selector: string): Promise<Frame> {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    for (const frame of [...page.frames()].reverse()) {
      if (await frame.locator(selector).count().catch(() => 0)) return frame;
    }
    await page.waitForTimeout(400);
  }
  throw new Error(`Inventory Adjustments did not show ${selector}`);
}
