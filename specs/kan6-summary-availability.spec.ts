import { expect, test } from "@playwright/test";
import { adjustInventory } from "../actions/adjust-inventory.js";
import { findOnHand } from "../actions/find-availability.js";
import { signInWithHeal } from "../actions/sign-in.js";

const item = { number: "220", branch: "10" };

test("KAN-6 summary availability shows the updated on-hand quantity", async ({ page }) => {
  test.setTimeout(300_000);
  await signInWithHeal(page);
  const before = Number(await findOnHand(page, item));
  await adjustInventory(page, item, 1);
  const after = Number(await findOnHand(page, item, "Updated find results"));
  expect(after).toBe(before + 1);
  await adjustInventory(page, item, -1);
});
