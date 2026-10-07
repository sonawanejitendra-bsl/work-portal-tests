import { expect, test } from "@core/playwright-framework";
import { InventoryAdjustmentsPage } from "../pages/inventory-adjustments.page.js";
import { JdeLoginPage } from "../pages/jde-login.page.js";
import { SummaryAvailabilityPage } from "../pages/summary-availability.page.js";

/**
 * KAN-6 positive path.
 * Search Summary Availability, post an inventory adjustment of 1 for item 220
 * at branch 10, search again, and check the on-hand quantity increased by 1.
 * The adjustment is then reversed so the quantity returns to where it started.
 */
test("KAN-6 summary availability shows the updated on-hand quantity", { tag: "@kan6" }, async ({ page }) => {
  test.setTimeout(300_000);
  const jde = new JdeLoginPage(page);
  await jde.login();
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
