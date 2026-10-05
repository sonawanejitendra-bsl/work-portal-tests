import { expect, insideFrames, mockRoute, test, waitForLoaderToClear } from "@core/playwright-framework";
import { portal } from "../actions/portal-actions.js";

test("nested frames are reachable", { tag: "@ui" }, async ({ page }) => {
  await page.goto("/embed");
  await expect(insideFrames(page, "#main", "#content").getByTestId("inside-frame")).toHaveText("Inside nested frame");
});

test("help opens as a popup from the left menu", { tag: "@ui" }, async ({ page }) => {
  await portal.home(page).open();
  const help = await portal.openHelpWindow(page);
  await expect(help.getByRole("heading", { name: "Help window" })).toBeVisible();
});

test("loader overlay clears without a hard-coded wait", { tag: "@ui" }, async ({ page }) => {
  await page.goto("/overlay");
  await waitForLoaderToClear(page);
  await expect(page.getByTestId("result")).toHaveText("Done");
});

test("vendor HTTP call can be stood in with a mock", { tag: "@ui" }, async ({ page }) => {
  await mockRoute(page, { url: "**/api/vendor/status", body: { status: "vendor-ok" } });
  await page.goto("/vendor-status");
  await expect(page.getByTestId("vendor")).toHaveText("vendor-ok");
});
