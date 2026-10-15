import type { Page } from "@playwright/test";
import { shot } from "../support/shot.js";

export class BasePage {
  constructor(protected readonly page: Page) {}

  /** Clicks the named control. If that name is missing, clicks the intent instead. */
  async healClick(staleName: string, intent: { id: string; role: "button"; name: string }): Promise<void> {
    const stale = this.page.getByRole("button", { name: staleName });
    if (await stale.isVisible().catch(() => false)) {
      await stale.click();
      return;
    }
    const live = this.page
      .getByRole(intent.role, { name: intent.name })
      .or(this.page.locator(`input[value='${intent.name}' i], input[alt='${intent.name}' i]`));
    await live.first().click();
  }

  protected async shot(name: string): Promise<void> {
    await shot(this.page, name);
  }
}
