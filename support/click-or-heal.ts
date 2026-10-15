import type { Locator, Page } from "@playwright/test";

export async function clickOrHeal(
  page: Page,
  stale: Locator,
  intent: { id: string; role: "button"; name: string },
): Promise<void> {
  if (await stale.isVisible().catch(() => false)) {
    await stale.click();
    return;
  }
  await page
    .getByRole(intent.role, { name: intent.name })
    .or(page.locator(`input[value='${intent.name}' i], input[alt='${intent.name}' i]`))
    .first()
    .click();
}
