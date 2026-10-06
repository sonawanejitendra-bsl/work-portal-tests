import { expect, healedClick, test } from "@core/playwright-framework";
import { JdeLoginPage } from "../pages/jde-login.page.js";

/**
 * Demo of rule-based auto-heal.
 * The test still asks for a button named Login. That control is gone.
 * Recover mode clicks the live Sign In input instead.
 */
const signIn = { id: "sign-in", role: "button", name: "Sign In" };

test("healed sign-in opens Incident Case Inquiry", { tag: "@heal" }, async ({ page }) => {
  test.setTimeout(180_000);
  const jde = new JdeLoginPage(page);
  await jde.fillCredentials();
  await healedClick(page, page.getByRole("button", { name: "Login" }), signIn);
  await expect(page.getByPlaceholder("Search")).toBeVisible({ timeout: 60_000 });
  await jde.clickText("Health & Safety Incidents");
  await jde.clickText("Incident Case Inquiry");
  await expect.poll(async () => (await page.title()).replace(/\u00a0/g, " "), { timeout: 60_000 }).toMatch(/Incident Case Inquiry/);
});
