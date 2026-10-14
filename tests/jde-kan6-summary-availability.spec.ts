import { expect, healedClick, test } from "@core/playwright-framework";
import { captureStep } from "../pages/capture-step.js";
import { InventoryAdjustmentsPage } from "../pages/inventory-adjustments.page.js";
import { JdeLoginPage } from "../pages/jde-login.page.js";
import { SummaryAvailabilityPage } from "../pages/summary-availability.page.js";

/**
 * KAN-6 positive path, starting with a healed sign-in.
 * The test asks for a button named Login. Recover mode clicks Sign In.
 * It then searches Summary Availability, posts an adjustment of 1 for item 220
 * at branch 10, checks the on-hand quantity increased by 1, and posts -1
 * so the quantity returns to where it started.
 */
const signIn = { id: "sign-in", role: "button" as const, name: "Sign In" };

test("KAN-6 summary availability shows the updated on-hand quantity", { tag: ["@kan6", "@heal"] }, async ({ page }) => {
  test.setTimeout(300_000);
  const jde = new JdeLoginPage(page);
  await jde.fillCredentials();
  await healedClick(page, page.getByRole("button", { name: "Login" }), signIn);
  await jde.userId().waitFor({ state: "hidden", timeout: 60_000 });
  await captureStep(page, "Signed in");
  await expect(page).toHaveTitle(/JD Edwards/);

  const availability = new SummaryAvailabilityPage(page);
  await availability.open();
  await availability.search("220", "10");
  const before = Number(await availability.readOnHand("10"));

  const adjustments = new InventoryAdjustmentsPage(page);
  await adjustments.adjust("220", "10", "1");
  await availability.open();
  await availability.search("220", "10", "Updated find results");
  await availability.expectOnHand("10", String(before + 1));

  await adjustments.adjust("220", "10", "-1");
});
