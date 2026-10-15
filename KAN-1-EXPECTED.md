# KAN-1 generation check — actions

Use this file when a generated KAN-1 arrives on this branch. Compare it with `specs/kan6-summary-availability.spec.ts`. KAN-1 must use that same shape. The business stop point is the on-hand quantity. There is no inventory adjustment.

Score the files before the first DV run. A browser pass in the wrong shape is still a miss.

## Business result

1. Sign in the same way KAN-6 signs in. `signInWithHeal(page)` asks for Login and clicks Sign In through `clickOrHeal`. The title then contains JD Edwards.
2. `findOnHand` opens fast path P41202, Work With Item Availability.
3. Search item 220, branch 10. Omit Zero Quantities is checked. Find is clicked.
4. The function returns the on-hand text for branch 10. The total row is not the result.
5. The spec asserts that text. On this DV environment the last confirmed quantity was 986. The older story text 996 is the wrong expected result.
6. The test ends there. On-hand is unchanged. P4114 is not opened.

## Files

| Expect | Detail |
| --- | --- |
| New spec | `specs/kan1-summary-availability.spec.ts` |
| Functions reused | `signInWithHeal` from `actions/sign-in.ts`, `findOnHand` from `actions/find-availability.ts` |
| Left unchanged | `specs/kan6-summary-availability.spec.ts` and `actions/adjust-inventory.ts` |

## Spec shape to accept

```ts
import { expect, test } from "@playwright/test";
import { findOnHand } from "../actions/find-availability.js";
import { signInWithHeal } from "../actions/sign-in.js";

const item = { number: "220", branch: "10" };

test("KAN-1 summary availability shows on-hand for item 220", async ({ page }) => {
  test.setTimeout(180_000);
  await signInWithHeal(page);
  const onHand = await findOnHand(page, item);
  expect(onHand).toBe("986");
});
```

`findOnHand` already opens the screen, searches, and returns the quantity. The spec does not open P41202 a second time. A timeout of 300000 is acceptable.

## Checks

- The spec imports `test` and `expect` from `@playwright/test`.
- `page` is the first argument of each action call.
- `const item` sits at the top of this spec. There is no data folder and no JSON file.
- `expect(onHand)` sits in the spec. `findOnHand` returns the text and does not assert.
- There is no `test.step`.
- There is no class and no file ending in `Page.ts`.
- Locators stay at the top of the action files. The spec has no `getByRole` and no CSS selector.
- KAN-6 still imports `adjustInventory`. KAN-1 does not.

## Misses

- An import of `adjustInventory`, a call with quantity `1` or `-1`, or fast path P4114.
- `expect` inside `actions/find-availability.ts`.
- A page class, `new`, or a fixture argument.
- An assertion of 996.
- A second search named "Updated find results". That second search belongs to KAN-6.
- The spec edited after generation and before the first DV run.
