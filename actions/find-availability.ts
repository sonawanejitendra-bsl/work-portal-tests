import { expect, type Frame, type Page } from "@playwright/test";
import { shot } from "../support/shot.js";

const fastPath = (page: Page) => page.locator("#TE_FAST_PATH_BOX");
const navigator = (page: Page) => page.locator("#drop_mainmenuParent");

export async function findOnHand(page: Page, item: { number: string; branch: string }, resultName = "Find results"): Promise<string> {
  await navigator(page).click();
  await fastPath(page).click();
  await fastPath(page).fill("P41202");
  await fastPath(page).press("Enter");
  await expect.poll(async () => (await page.title()).replace(/\u00a0/g, " "), { timeout: 60_000 }).toContain("Work With Item Availability");
  await shot(page, "Summary Availability open");
  const form = await formFrame(page);
  const itemBox = form.locator("input[title='Item Number']");
  const branch = form.locator("input[title='Branch/Plant']");
  await itemBox.click();
  await itemBox.fill(item.number);
  await itemBox.press("Tab");
  await branch.click();
  await branch.fill(item.branch);
  await branch.press("Tab");
  await form.locator("input[title='Omit Zero Quantities']").check();
  await form.locator("#hc_Find").click();
  await form.getByRole("row", { name: /^No Attachment P/ }).first().waitFor({ state: "visible", timeout: 30_000 }).catch(() => undefined);
  await shot(page, resultName);
  let quantity = "";
  await expect.poll(async () => {
    quantity = await readOnHand(page, item.branch);
    return quantity;
  }, { timeout: 30_000 }).not.toBe("");
  return quantity;
}

export async function readOnHand(page: Page, branchPlant: string): Promise<string> {
  for (const frame of [...page.frames()].reverse()) {
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

async function formFrame(page: Page): Promise<Frame> {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    for (const frame of [...page.frames()].reverse()) {
      if (await frame.locator("input[title='Item Number']").count().catch(() => 0)) return frame;
    }
    await page.waitForTimeout(400);
  }
  throw new Error("Work With Item Availability did not open");
}
