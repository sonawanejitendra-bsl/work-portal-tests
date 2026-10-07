import { expect, test } from "@core/playwright-framework";
import { JdeLoginPage } from "../pages/jde-login.page.js";
import { SummaryAvailabilityPage } from "../pages/summary-availability.page.js";

/**
 * KAN-1 positive path.
 * Sign in, open Summary Availability (P41202), search item 220 at branch 10
 * with Omit Zero Quantities, and check the On Hand quantity.
 * This environment currently shows 986. The story text says 996.
 */
test("KAN-1 summary availability shows on-hand for item 220", { tag: "@kan1" }, async ({ page }) => {
  test.setTimeout(180_000);
  const jde = new JdeLoginPage(page);
  await jde.login();
  await expect(page).toHaveTitle(/JD Edwards/);

  const availability = new SummaryAvailabilityPage(page);
  await availability.open();
  await availability.search("220", "10");
  await availability.expectOnHand("10", "986");
});
