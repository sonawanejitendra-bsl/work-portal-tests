import { expect, type Page } from "@playwright/test";
import { jdePassword, jdeUser } from "../support/credentials.js";
import { stepShot } from "../support/step-shot.js";

export class JdeLoginPage {
  constructor(private readonly page: Page) {}

  async signInWithHeal(): Promise<void> {
    await this.page.goto("/jde/E1Menu.maf?");
    const user = this.page.getByRole("textbox", { name: "User ID" });
    await user.waitFor({ state: "visible", timeout: 30_000 });
    await stepShot(this.page, "Sign in page");
    await user.fill(jdeUser);
    await this.page.getByRole("textbox", { name: "Password" }).fill(jdePassword);
    await stepShot(this.page, "Credentials entered");
    const stale = this.page.getByRole("button", { name: "Login" });
    if (await stale.isVisible().catch(() => false)) await stale.click();
    else {
      await this.page
        .getByRole("button", { name: "Sign In" })
        .or(this.page.locator("input[value='Sign In' i], input[alt='Sign In' i]"))
        .first()
        .click();
    }
    await user.waitFor({ state: "hidden", timeout: 60_000 });
    await expect(this.page).toHaveTitle(/JD Edwards/);
    await stepShot(this.page, "Signed in");
  }
}
