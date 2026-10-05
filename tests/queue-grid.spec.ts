import { expect, filterBy, rowByText, sortBy, test } from "@core/playwright-framework";
import { portal } from "../actions/portal-actions.js";

test("work queue grid helpers find a row", { tag: "@ui" }, async ({ page }) => {
  await portal.openMenu(page, "queue");
  await expect(rowByText(page, "WI-1001")).toBeVisible();
  await sortBy(page, "Id");
  await filterBy(page, "WI-1001");
  await expect(rowByText(page, "WI-1001")).toBeVisible();
});
