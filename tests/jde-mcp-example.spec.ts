import { expect, test } from "@core/playwright-framework";
import { JdeLoginPage } from "../pages/jde-login.page.js";

/**
 * Same Incident Case Inquiry flow, drafted with Playwright MCP.
 *
 * In VS Code, GitHub Copilot uses .vscode/mcp.json, which starts Playwright MCP.
 * Paste this into Copilot chat:
 *   Open https://mirajde-dvtrweb.birlasoft.com/jde/E1Menu.maf?
 *   Sign in. Click Health & Safety Incidents, then Incident Case Inquiry.
 *   Write a Playwright test that checks the inquiry title.
 *   Do not save a record.
 *
 * MCP opens the portal and reads those names from the page.
 * npm test does not start MCP. It only runs the finished test.
 */
test("MCP example opens Incident Case Inquiry", { tag: "@mcp" }, async ({ page }) => {
  test.setTimeout(180_000);
  const jde = new JdeLoginPage(page);
  await jde.login();
  await expect(page.getByPlaceholder("Search")).toBeVisible();
  await jde.clickText("Health & Safety Incidents");
  await jde.clickText("Incident Case Inquiry");
  await jde.expectIncidentInquiry();
});
