import type { Page } from "@playwright/test";

/** Test user for the Birlasoft JD Edwards DV environment. */
export const JDE_USER_ID = "TESTT02";
export const JDE_PASSWORD = "welcome123";

/**
 * Sign-in page at /jde/E1Menu.maf?
 * The host comes from playwright.config.ts environments.qa.
 */
export class JdeLoginPage {
  constructor(private readonly page: Page) {}

  userId() {
    return this.page.getByRole("textbox", { name: "User ID" });
  }

  password() {
    return this.page.getByRole("textbox", { name: "Password" });
  }

  environment() {
    return this.page.getByRole("textbox", { name: "Environment" });
  }

  role() {
    return this.page.getByRole("textbox", { name: "Role" });
  }

  signInButton() {
    return this.page.getByRole("button", { name: "Sign In" });
  }

  async open(): Promise<void> {
    await this.page.goto("/jde/E1Menu.maf?");
  }

  async login(environment = "JTR920", role = "*ALL"): Promise<void> {
    await this.open();
    await this.userId().fill(JDE_USER_ID);
    await this.password().fill(JDE_PASSWORD);
    await this.environment().fill(environment);
    await this.role().fill(role);
    await this.signInButton().click();
    await this.signInButton().waitFor({ state: "hidden", timeout: 60_000 });
  }

  async logout(): Promise<void> {
    const signOut = this.page
      .getByRole("link", { name: /sign out|log out/i })
      .or(this.page.getByRole("button", { name: /sign out|log out/i }));

    if (!(await signOut.first().isVisible())) {
      await this.page.getByText(JDE_USER_ID, { exact: true }).click();
    }

    await signOut.first().click();

    const confirm = this.page.getByRole("button", { name: /^(yes|ok)$/i });
    if (await confirm.isVisible()) {
      await confirm.click();
    }

    await this.userId().waitFor({ state: "visible", timeout: 60_000 });
  }
}
