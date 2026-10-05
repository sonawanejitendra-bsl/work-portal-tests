import { test as setup, expect } from "@playwright/test";
import { loginAs } from "@core/playwright-framework";

setup("log in operator once", async ({ page }) => {
  await loginAs(page, "operator");
  await expect(page.getByTestId("app-ready")).toBeVisible();
});

setup("log in reviewer once", async ({ page }) => {
  await loginAs(page, "reviewer");
  await expect(page.getByTestId("app-ready")).toBeVisible();
});
