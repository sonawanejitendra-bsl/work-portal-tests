# KAN-1 generation check — catalog

Use this file when a generated KAN-1 arrives on this branch. Compare it with `tests/kan6-adjust.test.ts` and `flows/kan6-adjust.flow.ts`. KAN-1 must use that same shape. The business stop point is the on-hand quantity. There is no inventory adjustment.

Score the files before the first DV run. A browser pass in the wrong shape is still a miss.

## Business result

1. Sign in the same way KAN-6 signs in. The flow calls `screen.heal("login.missingLogin", "login.signIn")`. The title then contains JD Edwards.
2. Fast path comes from JSON. The value is P41202. The screen title contains Work With Item Availability.
3. The flow fills item and branch from JSON, checks Omit Zero Quantities, and clicks Find. The sample values are item 220 and branch 10.
4. On-hand is read with catalog key `availability.row` for that branch. The total row is not the result.
5. The flow compares that quantity with the expected on-hand in JSON. On this DV environment the last confirmed quantity was 986. The older story text 996 is the wrong expected result.
6. The test file only checks that the flow result is passed. The test ends there. On-hand is unchanged. P4114 is not opened.

## Files

| Expect | Detail |
| --- | --- |
| New test | `tests/kan1-summary.test.ts` |
| New flow | `flows/kan1-summary.flow.ts` |
| New data | `data/kan1.json` |
| Registry | `flows/run-flow.ts` gains `"kan1-summary"` beside the existing `"kan6-adjust"` |
| Catalog | Reuse `login.*`, `shell.*`, and `availability.*`. Add a key only when the flow needs a control that is not already in `catalog/jde.catalog.ts` |
| Left unchanged | `tests/kan6-adjust.test.ts`, `flows/kan6-adjust.flow.ts`, `data/kan6.json` |

## Data shape to accept

```json
{
  "item": "220",
  "branch": "10",
  "onHand": "986",
  "fastPathAvailability": "P41202"
}
```

## Test shape to accept

```ts
import { expect, test } from "@playwright/test";
import { runFlow } from "../flows/run-flow.js";

test("KAN-1 summary availability shows on-hand for item 220", async ({ page }) => {
  test.setTimeout(180_000);
  const result = await runFlow(page, "kan1-summary");
  expect(result.passed).toBe(true);
});
```

The flow performs sign-in, fast path, search, and the on-hand compare. The test does not call login or search itself. A timeout of 300000 is acceptable.

## Checks

- The test file ends in `.test.ts`.
- The test has one `expect`: `result.passed` is true.
- `run-flow.ts` still exports `kan6-adjust` and also exports `kan1-summary`.
- Item, branch, P41202, and the expected on-hand are in `data/kan1.json`. Those digits are not written in the test or as raw strings in the flow.
- Heal uses the catalog keys `login.missingLogin` and `login.signIn`.
- On-hand uses `availability.row`. Branch cell 4 and quantity cell 5 stay in the catalog entry.
- The flow and the test contain no `getByRole` and no CSS string.

## Misses

- A `*.spec.ts` file for this case.
- `kan6-adjust` removed or rewritten into the KAN-1 flow.
- `adjustments.*` keys, P4114, increase, or restore in the KAN-1 flow or `data/kan1.json`.
- An expected on-hand of 996.
- A selector outside `catalog/jde.catalog.ts`.
- An intent id that is not a catalog key.
- The generated files edited after generation and before the first DV run.
