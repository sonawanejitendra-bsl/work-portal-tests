import { expect, test } from "@core/playwright-framework";
import { PortalApi } from "../api/portal-api.js";

test("API client shares the login and lists parties", { tag: "@api" }, async ({ api }) => {
  const portalApi = new PortalApi(api);
  const me = await portalApi.me();
  expect(me.username).toMatch(/operator/);
  expect(me.role).toBe("operator");
  const parties = await portalApi.listParties();
  expect(parties.some((row) => row.name === "Jordan Lee")).toBeTruthy();
});

test("data factory creates then cleans a party over HTTP", { tag: "@api" }, async ({ api, dataFactory }) => {
  const created = await dataFactory.create("party", { province: "SK" });
  expect(created.id).toBeTruthy();
  const portalApi = new PortalApi(api);
  const parties = await portalApi.listParties();
  expect(parties.some((row) => row.id === created.id)).toBeTruthy();
});
