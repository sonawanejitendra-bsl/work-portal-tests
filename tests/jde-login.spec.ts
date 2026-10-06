import { expect, test } from "@core/playwright-framework";
import { JdeLoginPage } from "../pages/jde-login.page.js";

test("login to JD Edwards as TESTT02", { tag: "@jde" }, async ({ page }) => {
  const jde = new JdeLoginPage(page);
  await jde.login();
  await expect(jde.signInButton()).toBeHidden();
});

test("logout from JD Edwards returns to Sign In", { tag: "@jde" }, async ({ page }) => {
  const jde = new JdeLoginPage(page);
  await jde.login();
  await jde.logout();
  await expect(jde.userId()).toBeVisible();
  await expect(jde.signInButton()).toBeVisible();
});
