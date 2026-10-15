# KAN-1 generation check — fixtures

Use this file when a generated KAN-1 arrives on this branch. Compare it with `tests/jde/kan-6-summary-availability.spec.ts`. KAN-1 must use that same shape. The business stop point is the on-hand quantity. There is no inventory adjustment.

Score the files before the first DV run. A browser pass in the wrong shape is still a miss.

## Business result

1. Sign in the same way KAN-6 signs in. `jdeLogin.signInWithHeal()` asks for Login and clicks Sign In. The title then contains JD Edwards.
2. Fast path P41202 opens Work With Item Availability.
3. Search item 220, branch 10. Omit Zero Quantities is checked. Find is clicked.
4. On-hand is the quantity cell on the data row for branch 10. The total row is not the result.
5. The quantity asserted is the quantity on that row. On this DV environment the last confirmed quantity was 986. The older story text 996 is the wrong expected result.
6. The test ends there. On-hand is unchanged. P4114 is not opened.

## Files

| Expect | Detail |
| --- | --- |
| New spec | `tests/jde/kan-1-summary-availability.spec.ts` |
| Pages reused | `summaryAvailability` and `jdeLogin` already registered in `fixtures/jde-test.ts` |
| Page method | Add `expectOnHand(branch, quantity)` on `pages/summary-availability.page.ts` if it is not already there. It uses the same row and cells as `readOnHand`. |
| Left unchanged | `tests/jde/kan-6-summary-availability.spec.ts` |

## Spec shape to accept

```ts
import { test } from "../../fixtures/jde-test.js";

test("KAN-1 summary availability shows on-hand for item 220", { tag: "@kan1" }, async ({
  jdeLogin,
  summaryAvailability,
}) => {
  test.setTimeout(180_000);
  await jdeLogin.signInWithHeal();
  await summaryAvailability.open();
  await summaryAvailability.search("220", "10");
  await summaryAvailability.expectOnHand("10", "986");
});
```

Item and branch stay as method arguments, the same way KAN-6 passes `"220"` and `"10"`. A timeout of 300000 is acceptable.

## Checks

- The spec imports `test` from `../../fixtures/jde-test.js` only.
- The callback arguments are `jdeLogin` and `summaryAvailability`.
- The file name is kebab-case under `tests/jde/`.
- The tag on the test is `@kan1`.
- Sign-in is `jdeLogin.signInWithHeal()`.
- Search is `summaryAvailability.search("220", "10")`.
- The on-hand check is a method on the fixture page.
- The spec contains no page import, no `new`, no `getByRole`, and no CSS selector.
- KAN-6 still destructures `inventoryAdjustments`. KAN-1 does not.
- Screenshots still go through `stepShot` inside the page methods.

## Misses

- `new JdeLoginPage(page)` or `new SummaryAvailabilityPage(page)` in the spec.
- An import from a page file, or a PascalCase spec name.
- `inventoryAdjustments` in the KAN-1 argument list, `adjust(`, P4114, `"1"`, or `"-1"`.
- An assertion of 996.
- A JSON data file for this case. This branch keeps the numbers on the method call.
- The spec edited after generation and before the first DV run.
