import { expect, findCandidates, healedClick, test } from "@core/playwright-framework";
import { portalIntents } from "../healing/intents.js";

test("self-healing suggests save-party when the old test id is gone", { tag: "@heal" }, async ({ page }) => {
  await page.goto("/healing");
  const intent = portalIntents.get("save-party");
  const suggestions = await findCandidates(page, intent);
  expect(suggestions[0]?.score).toBeGreaterThanOrEqual(0.9);
  await expect(healedClick(page, page.getByTestId("old-save"), intent)).rejects.toThrow(/Healing did not replace/);
});
