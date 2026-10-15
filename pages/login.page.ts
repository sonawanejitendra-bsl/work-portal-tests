import { expect, type Page } from "@playwright/test";
import { jdePassword, jdeUser } from "../support/credentials.js";

export class LoginPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto("/jde/E1Menu.maf?");
    await this.page.getByRole("textbox", { name: "User ID" }).waitFor({ state: "visible", timeout: 30_000 });
  }

  async enterUser(): Promise<void> {
    await this.page.getByRole("textbox", { name: "User ID" }).fill(jdeUser);
    await this.page.getByRole("textbox", { name: "Password" }).fill(jdePassword);
  }

  async clickSignInEvenIfLogin(): Promise<void> {
    const stale = this.page.getByRole("button", { name: "Login" });
    if (await stale.isVisible().catch(() => false)) await stale.click();
    else {
      await this.page
        .getByRole("button", { name: "Sign In" })
        .or(this.page.locator("input[value='Sign In' i], input[alt='Sign In' i]"))
        .first()
        .click();
    }
    await this.page.getByRole("textbox", { name: "User ID" }).waitFor({ state: "hidden", timeout: 60_000 });
  }

  async expectSignedIn(): Promise<void> {
    await expect(this.page).toHaveTitle(/JD Edwards/);
  }
}
