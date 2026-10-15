import { expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { JdeScreen } from "../pages/JdeScreen.js";
import { jdePassword, jdeUser } from "../support/credentials.js";
import { shot } from "../support/shot.js";

type Kan6Data = {
  item: string;
  branch: string;
  increase: string;
  restore: string;
  explanation: string;
  glDate: string;
  fastPathAvailability: string;
  fastPathAdjust: string;
};

const data = JSON.parse(readFileSync(new URL("../data/kan6.json", import.meta.url), "utf8")) as Kan6Data;

export async function kan6Adjust(page: Page): Promise<{ passed: true }> {
  const screen = new JdeScreen(page);
  await screen.goto("/jde/E1Menu.maf?");
  await screen.waitVisible("login.userId");
  await shot(page, "Sign in page");
  await screen.fill("login.userId", jdeUser);
  await screen.fill("login.password", jdePassword);
  await shot(page, "Credentials entered");
  await screen.heal("login.missingLogin", "login.signIn");
  await screen.waitHidden("login.userId");
  await expect(page).toHaveTitle(/JD Edwards/);
  await shot(page, "Signed in");

  const before = Number(await openAndRead(screen, page, "Find results"));
  await post(screen, page, data.fastPathAdjust, data.increase);
  const after = Number(await openAndRead(screen, page, "Updated find results"));
  expect(after).toBe(before + 1);
  await post(screen, page, data.fastPathAdjust, data.restore);
  return { passed: true };
}

async function openAndRead(screen: JdeScreen, page: Page, resultName: string): Promise<string> {
  await screen.fastPath(data.fastPathAvailability);
  await expect.poll(async () => (await screen.title()).replace(/\u00a0/g, " "), { timeout: 60_000 }).toContain("Work With Item Availability");
  await shot(page, "Summary Availability open");
  await screen.fill("availability.itemNumber", data.item);
  await shot(page, "Item number entered");
  await screen.fill("availability.branch", data.branch);
  await shot(page, "Branch/Plant entered");
  await screen.check("availability.omitZero");
  await screen.click("availability.find");
  await shot(page, resultName);
  let quantity = "";
  await expect.poll(async () => {
    quantity = await screen.readOnHand("availability.row", data.branch);
    return quantity;
  }, { timeout: 30_000 }).not.toBe("");
  return quantity;
}

async function post(screen: JdeScreen, page: Page, program: string, quantity: string): Promise<void> {
  await screen.fastPath(program);
  await screen.click("adjustments.add");
  await shot(page, "Adjustment form");
  await screen.fill("adjustments.branch", data.branch);
  await screen.fill("adjustments.explanation", data.explanation);
  await screen.fill("adjustments.glDate", data.glDate);
  await screen.fill("adjustments.transactionDate", data.glDate);
  await screen.fill("adjustments.item", data.item);
  await screen.fill("adjustments.quantity", quantity);
  await shot(page, `Adjustment ${quantity} entered`);
  await screen.click("adjustments.ok");
  await expect.poll(async () => {
    const text = await screen.bodyText("adjustments.ok");
    if (/This form has [1-9]/.test(text) || /Future Month|Blanks Invalid/.test(text)) return text.slice(0, 240);
    if (/Previous Doc/.test(text)) return "saved";
    return "";
  }, { timeout: 30_000 }).toBe("saved");
  await shot(page, `Adjustment ${quantity} saved`);
}
