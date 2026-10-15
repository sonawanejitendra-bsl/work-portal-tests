import { test } from "../../fixtures/jde-test.js";

test("KAN-6 summary availability shows the updated on-hand quantity", { tag: ["@kan6", "@heal"] }, async ({
  jdeLogin,
  summaryAvailability,
  inventoryAdjustments,
}) => {
  test.setTimeout(300_000);
  await jdeLogin.signInWithHeal();
  await summaryAvailability.open();
  await summaryAvailability.search("220", "10");
  const before = await summaryAvailability.readOnHand("10");
  await inventoryAdjustments.adjust("220", "10", "1");
  await summaryAvailability.open();
  await summaryAvailability.search("220", "10", "Updated find results");
  await summaryAvailability.expectOnHandIncreased("10", before);
  await inventoryAdjustments.adjust("220", "10", "-1");
});
