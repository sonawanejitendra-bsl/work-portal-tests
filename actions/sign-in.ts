import { expect, type Page } from "@playwright/test";
import { jdePassword, jdeUser } from "../support/credentials.js";
import { clickOrHeal } from "../support/click-or-heal.js";
import { shot } from "../support/shot.js";

const userId = (page: Page) => page.getByRole("textbox", { name: "User ID" });
const password = (page: Page) => page.getByRole("textbox", { name: "Password" });
const loginButton = (page: Page) => page.getByRole("button", { name: "Login" });

export async function signInWithHeal(page: Page): Promise<void> {
  await page.goto("/jde/E1Menu.maf?");
  await userId(page).waitFor({ state: "visible", timeout: 30_000 });
  await shot(page, "Sign in page");
  await userId(page).fill(jdeUser);
  await password(page).fill(jdePassword);
  await shot(page, "Credentials entered");
  await clickOrHeal(page, loginButton(page), { id: "sign-in", role: "button", name: "Sign In" });
  await userId(page).waitFor({ state: "hidden", timeout: 60_000 });
  await expect(page).toHaveTitle(/JD Edwards/);
  await shot(page, "Signed in");
}
