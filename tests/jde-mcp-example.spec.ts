import { expect, test } from "@core/playwright-framework";
import { JdeLoginPage } from "../pages/jde-login.page.js";

/**
 * New test drafted the Playwright MCP way.
 *
 * In Cursor, with the playwright MCP server from .cursor/mcp.json, paste:
 *   Open https://mirajde-dvtrweb.birlasoft.com/jde/E1Menu.maf?
 *   Sign in, click Health & Safety Incidents, then Incident Case Inquiry.
 *   Draft a Playwright test that asserts the inquiry title. Do not save any record.
 *
 * MCP drives the real browser and returns the roles and names below.
 * npm test does not start MCP. This file is the test that prompt produces.
 */
test("MCP example opens Incident Case Inquiry", { tag: "@mcp" }, async ({ page }) => {
  test.setTimeout(180_000);
  const jde = new JdeLoginPage(page);
  await jde.login();
  await expect(page.getByPlaceholder("Search")).toBeVisible();
  await jde.clickText("Health & Safety Incidents");
  await jde.clickText("Incident Case Inquiry");
  await expect.poll(async () => (await page.title()).replace(/\u00a0/g, " "), { timeout: 60_000 }).toMatch(/Incident Case Inquiry/);
});
