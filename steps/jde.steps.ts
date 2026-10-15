import { Given, Then, When } from "@cucumber/cucumber";
import { AdjustmentsPage } from "../pages/adjustments.page.js";
import { LoginPage } from "../pages/login.page.js";
import { SummaryPage } from "../pages/summary.page.js";
import type { JdeWorld } from "../support/hooks.js";

Given("I am on the JD Edwards sign-in page", async function (this: JdeWorld) {
  await new LoginPage(this.page).open();
});

When("I enter the DV user", async function (this: JdeWorld) {
  await new LoginPage(this.page).enterUser();
});

When("I click Sign In even if the screen still says Login", async function (this: JdeWorld) {
  await new LoginPage(this.page).clickSignInEvenIfLogin();
});

Then("I am signed in to JD Edwards", async function (this: JdeWorld) {
  await new LoginPage(this.page).expectSignedIn();
});

When("I open Summary Availability", async function (this: JdeWorld) {
  await new SummaryPage(this.page).open();
});

When("I find item {string} in branch {string}", async function (this: JdeWorld, item: string, branch: string) {
  await new SummaryPage(this.page).find(item, branch);
});

When("I remember the on-hand quantity for branch {string}", async function (this: JdeWorld, branch: string) {
  this.onHandBefore = await new SummaryPage(this.page).readOnHand(branch);
});

When("I adjust item {string} in branch {string} by {string}", async function (this: JdeWorld, item: string, branch: string, quantity: string) {
  await new AdjustmentsPage(this.page).adjust(item, branch, quantity);
});

Then(
  "the on-hand quantity for branch {string} has increased by {string}",
  async function (this: JdeWorld, branch: string, increase: string) {
    await new SummaryPage(this.page).open();
    await new SummaryPage(this.page).expectIncreased(branch, this.onHandBefore, Number(increase));
  },
);
