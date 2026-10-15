import { test as base } from "@playwright/test";
import { InventoryAdjustmentsPage } from "../pages/inventory-adjustments.page.js";
import { JdeLoginPage } from "../pages/jde-login.page.js";
import { SummaryAvailabilityPage } from "../pages/summary-availability.page.js";

type JdeFixtures = {
  jdeLogin: JdeLoginPage;
  summaryAvailability: SummaryAvailabilityPage;
  inventoryAdjustments: InventoryAdjustmentsPage;
};

export const test = base.extend<JdeFixtures>({
  jdeLogin: async ({ page }, use) => {
    await use(new JdeLoginPage(page));
  },
  summaryAvailability: async ({ page }, use) => {
    await use(new SummaryAvailabilityPage(page));
  },
  inventoryAdjustments: async ({ page }, use) => {
    await use(new InventoryAdjustmentsPage(page));
  },
});

export { expect } from "@playwright/test";
