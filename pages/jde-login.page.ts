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
    return this.page
      .getByRole("button", { name: /sign in/i })
      .or(this.page.getByRole("link", { name: /sign in/i }))
      .or(this.page.locator("input[value='Sign In' i], input[alt='Sign In' i]"));
  }

  async open(): Promise<void> {
    await this.page.goto("/jde/E1Menu.maf?");
  }

  /**
   * Environment and Role are often dropdowns that already show JTR920 and *ALL.
   * Filling them as text boxes waits until timeout, so Sign In was never clicked.
   */
  private async ensureValue(label: string, value: string): Promise<void> {
    const textbox = this.page.getByRole("textbox", { name: label });
    const dropdown = this.page.getByRole("combobox", { name: label });
    if (await textbox.isVisible().catch(() => false)) {
      if ((await textbox.inputValue()).trim() !== value) await textbox.fill(value);
      return;
    }
    if (await dropdown.isVisible().catch(() => false)) {
      const selected = ((await dropdown.locator("option:checked").textContent()) ?? "").trim();
      if (selected.includes(value) || (await dropdown.inputValue().catch(() => "")).trim() === value) return;
      await dropdown.selectOption({ label: value }).catch(async () => {
        await dropdown.selectOption(value);
      });
    }
  }

  private async clickSignIn(): Promise<void> {
    const primary = this.signInButton().first();
    if (await primary.isVisible().catch(() => false)) {
      await primary.click();
      return;
    }
    await this.page.locator("a, button, div, span").filter({ hasText: /^Sign In$/ }).last().click();
  }

  async fillCredentials(): Promise<void> {
    await this.open();
    await this.userId().fill(JDE_USER_ID);
    await this.password().fill(JDE_PASSWORD);
  }

  /** JD Edwards draws menus and tiles inside iframes, so the label is sought in every frame. */
  async clickText(name: string): Promise<void> {
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      for (const frame of this.page.frames()) {
        const clicked = await frame
          .evaluate((label) => {
            const hits = [...document.querySelectorAll("a, button, span, div, td, li")].filter(
              (el) => (el.textContent ?? "").replace(/\s+/g, " ").trim() === label,
            );
            const visible = hits.filter((el) => {
              const style = window.getComputedStyle(el);
              const box = el.getBoundingClientRect();
              return (
                style.visibility !== "hidden" &&
                style.display !== "none" &&
                Number(style.opacity) > 0 &&
                box.width > 8 &&
                box.height > 8 &&
                box.bottom > 0 &&
                box.right > 0
              );
            });
            const target = visible.sort((a, b) => a.getBoundingClientRect().width - b.getBoundingClientRect().width)[0];
            if (!target) return false;
            target.scrollIntoView({ block: "nearest", inline: "center" });
            target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
            return true;
          }, name)
          .catch(() => false);
        if (clicked) return;
      }
      await this.page.waitForTimeout(400);
    }
    throw new Error(`Could not find "${name}"`);
  }

  async login(environment = "JTR920", role = "*ALL"): Promise<void> {
    await this.open();
    await this.userId().fill(JDE_USER_ID);
    await this.password().fill(JDE_PASSWORD);
    await this.ensureValue("Environment", environment);
    await this.ensureValue("Role", role);
    await this.clickSignIn();
    await this.userId().waitFor({ state: "hidden", timeout: 60_000 });
  }

  async logout(): Promise<void> {
    await this.page.getByText(/Financial\/Distribution Company/).first().click();
    await this.page.getByText("Sign Out", { exact: true }).last().click();

    const confirm = this.page.getByRole("button", { name: /^(yes|ok)$/i });
    if (await confirm.isVisible().catch(() => false)) await confirm.click();

    await this.userId().waitFor({ state: "visible", timeout: 60_000 });
  }
}
