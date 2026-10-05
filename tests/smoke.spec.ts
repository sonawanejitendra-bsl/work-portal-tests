import { expect, test } from "@core/playwright-framework";
import { portal } from "../actions/portal-actions.js";

test("home loads with the saved operator session", { tag: "@smoke" }, async ({ page, allocatedUser, logger }) => {
  logger.info(`worker slot ${allocatedUser.username}`);
  const home = portal.home(page);
  await home.open();
  await expect(home.ready()).toBeVisible();
  await expect(home.heading()).toContainText("operator");
});

test.describe("reviewer role", () => {
  test.use({ role: "reviewer" });

  test("reviewer session is a different saved login", { tag: "@smoke" }, async ({ page }) => {
    const home = portal.home(page);
    await home.open();
    await expect(home.heading()).toContainText("reviewer");
  });
});
