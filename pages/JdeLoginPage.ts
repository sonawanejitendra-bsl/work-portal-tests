import { expect } from "@playwright/test";
import { jdePassword, jdeUser } from "../support/credentials.js";
import { BasePage } from "./BasePage.js";

export class JdeLoginPage extends BasePage {
  async fillCredentials(): Promise<void> {
    await this.page.goto("/jde/E1Menu.maf?");
    const user = this.page.getByRole("textbox", { name: "User ID" });
    await user.waitFor({ state: "visible", timeout: 30_000 });
    await this.shot("Sign in page");
    await user.fill(jdeUser);
    await this.page.getByRole("textbox", { name: "Password" }).fill(jdePassword);
    await this.shot("Credentials entered");
  }

  async expectSignedIn(): Promise<void> {
    await this.page.getByRole("textbox", { name: "User ID" }).waitFor({ state: "hidden", timeout: 60_000 });
    await expect(this.page).toHaveTitle(/JD Edwards/);
    await this.shot("Signed in");
  }
}
