# KAN-1 generation check — class page object

Use this file when a generated KAN-1 arrives on this branch. Compare it with `tests/e2e/Kan6InventoryAdjustment.spec.ts`. KAN-1 must use that same shape. The business stop point is the on-hand quantity. There is no inventory adjustment.

Score the files before the first DV run. A browser pass in the wrong shape is still a miss.

## Business result

1. Sign in the same way KAN-6 signs in. The script still asks for a button named Login. The live control is Sign In. `healClick` clicks Sign In. The title then contains JD Edwards.
2. Fast path P41202 opens Work With Item Availability.
3. Search item 220, branch 10. Omit Zero Quantities is checked. Find is clicked.
4. On-hand is the quantity cell on the data row for branch 10. The total row is not the result.
5. The quantity asserted is the quantity on that row. On this DV environment the last confirmed quantity was 986. The older story text 996 is the wrong expected result.
6. The test ends there. On-hand is unchanged. P4114 is not opened.

## Files

| Expect | Detail |
| --- | --- |
| New spec | `tests/e2e/Kan1SummaryAvailability.spec.ts` |
| Pages reused | `pages/JdeLoginPage.ts`, `pages/SummaryAvailabilityPage.ts` |
| Data | `item220` already in `test-data/JdeItems.ts`. Add `kan1` there when the expected on-hand is a fixed value: `{ onHand: "986" }` |
| Left unchanged | `tests/e2e/Kan6InventoryAdjustment.spec.ts` and `pages/InventoryAdjustmentsPage.ts` |

## Spec shape to accept

```ts
import { test } from "@playwright/test";
import { JdeLoginPage } from "../../pages/JdeLoginPage.js";
import { SummaryAvailabilityPage } from "../../pages/SummaryAvailabilityPage.js";
import { item220, kan1 } from "../../test-data/JdeItems.js";

test("KAN-1 summary availability shows on-hand for item 220", async ({ page }) => {
  test.setTimeout(180_000);
  const login = new JdeLoginPage(page);
  const availability = new SummaryAvailabilityPage(page);

  await test.step("Sign in", async () => {
    await login.fillCredentials();
    await login.healClick("Login", { id: "sign-in", role: "button", name: "Sign In" });
    await login.expectSignedIn();
  });

  await test.step("Open Summary Availability", async () => {
    await availability.open();
  });

  await test.step("Search availability", async () => {
    await availability.search(item220);
    await availability.expectOnHand(item220.branch, kan1.onHand);
  });
});
```

`expectOnHand` belongs on `SummaryAvailabilityPage`, next to the existing `readOnHand`. It checks branch cell 4 and on-hand cell 5, the same cells KAN-6 already uses. A timeout of 300000 is acceptable. 180000 matches the length of this case.

## Checks

- File name is PascalCase under `tests/e2e/`.
- The spec creates pages with `new JdeLoginPage(page)` and `new SummaryAvailabilityPage(page)`.
- The spec imports `test` from `@playwright/test`.
- The spec contains no `getByRole`, no CSS selector, and no `expect(`.
- Sign-in is `fillCredentials`, then `healClick("Login", { id: "sign-in", role: "button", name: "Sign In" })`, then `expectSignedIn`.
- Open and search go through `SummaryAvailabilityPage.open` and `search(item220)`.
- Item `220` and branch `10` are not typed in the spec. They come from `item220`.
- The on-hand check is a page method. The expected quantity comes from `kan1` in `test-data/JdeItems.ts`.
- Each business action is a `test.step`.
- KAN-6 files are still present and still run with `npm run kan`.

## Misses

- A kebab-case spec name, a fixture argument, or a `.feature` file.
- `InventoryAdjustmentsPage`, `post(`, P4114, quantity `1`, or quantity `-1`.
- An assertion of 996.
- A second page class that copies Summary Availability.
- `healedClick` imported from another package.
- The spec edited after generation and before the first DV run. Fix the generator, then generate again.
