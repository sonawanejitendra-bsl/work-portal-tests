import { test } from "@playwright/test";
import { InventoryAdjustmentsPage } from "../../pages/InventoryAdjustmentsPage.js";
import { JdeLoginPage } from "../../pages/JdeLoginPage.js";
import { SummaryAvailabilityPage } from "../../pages/SummaryAvailabilityPage.js";
import { item220, kan6 } from "../../test-data/JdeItems.js";

test("KAN-6 summary availability shows the updated on-hand quantity", async ({ page }) => {
  test.setTimeout(300_000);
  const login = new JdeLoginPage(page);
  const availability = new SummaryAvailabilityPage(page);
  const adjustments = new InventoryAdjustmentsPage(page);

  await test.step("Sign in", async () => {
    await login.fillCredentials();
    await login.healClick("Login", { id: "sign-in", role: "button", name: "Sign In" });
    await login.expectSignedIn();
  });

  await test.step("Open Summary Availability", async () => {
    await availability.open();
  });

  let before = 0;
  await test.step("Search availability", async () => {
    await availability.search(item220);
    before = await availability.readOnHand(item220.branch);
  });

  await test.step("Adjust quantity up", async () => {
    await adjustments.post(item220, kan6.increase);
  });

  await test.step("Confirm on-hand increased", async () => {
    await availability.open();
    await availability.search(item220, "Updated find results");
    await availability.expectOnHandIncreased(item220.branch, before);
  });

  await test.step("Restore quantity", async () => {
    await adjustments.post(item220, kan6.restore);
  });
});
