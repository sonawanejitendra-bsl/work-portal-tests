import { expect, test } from "@core/playwright-framework";
import { portal } from "../actions/portal-actions.js";

test("left menu opens search and finds a party", { tag: ["@smoke", "@ui"] }, async ({ page }) => {
  await portal.home(page).open();
  await portal.searchParty(page, "Jordan");
  await expect(portal.search(page).row("Jordan Lee")).toBeVisible();
});

test("left menu opens the party screen and saves", { tag: "@ui" }, async ({ page }) => {
  await portal.savePartyOnScreen(page, "Casey Nguyen", "AB");
  await expect(portal.party(page).status()).toHaveText("Party saved");
});
