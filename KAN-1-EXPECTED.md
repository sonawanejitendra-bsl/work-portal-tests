# KAN-1 generation check — Gherkin

Use this file when a generated KAN-1 arrives on this branch. Compare it with `features/kan6-inventory-adjustment.feature`. KAN-1 must use that same shape. The business stop point is the on-hand quantity. There is no inventory adjustment.

Score the files before the first DV run. A browser pass in the wrong shape is still a miss.

## Business result

1. Sign in with the same sentences KAN-6 uses. The feature still says the screen may show Login, and the step clicks Sign In. The title then contains JD Edwards.
2. Summary Availability opens on fast path P41202.
3. The scenario finds item 220 in branch 10. Omit Zero Quantities is checked. Find is clicked. Those controls stay in `pages/summary.page.ts`.
4. The on-hand check reads the quantity cell on the data row for branch 10. The total row is not the result.
5. The Examples table carries the expected quantity. On this DV environment the last confirmed quantity was 986. The older story text 996 is the wrong expected result.
6. The scenario ends there. On-hand is unchanged. P4114 is not opened.

## Files

| Expect | Detail |
| --- | --- |
| New feature | `features/kan1-summary-availability.feature` |
| Steps | Reuse the sign-in, open, and find sentences in `steps/jde.steps.ts`. Add one Then sentence for the exact on-hand quantity. |
| Pages | The new Then step calls `pages/summary.page.ts`. Locators stay in that page. |
| Left unchanged | `features/kan6-inventory-adjustment.feature` |

## Feature shape to accept

```gherkin
Feature: KAN-1 summary availability

  Scenario Outline: KAN-1 summary availability
    Given I am on the JD Edwards sign-in page
    When I enter the DV user
    And I click Sign In even if the screen still says Login
    Then I am signed in to JD Edwards
    When I open Summary Availability
    And I find item "<item>" in branch "<branch>"
    Then the on-hand quantity for branch "<branch>" is "<onHand>"

    Examples:
      | item | branch | onHand |
      | 220  | 10     | 986    |
```

The new step sentence is the only step this case should add:

`Then the on-hand quantity for branch {string} is {string}`

That step reads the on-hand through `SummaryPage` and compares it with the Examples value. It does not contain a selector.

## Checks

- The case is a `.feature` file. There is no `tests/*.spec.ts` for KAN-1.
- The feature has no selector, no file name, and no TypeScript import.
- Item, branch, and on-hand sit in the Examples table. They are not hardcoded inside `steps/jde.steps.ts`.
- Sign-in reuses `When I click Sign In even if the screen still says Login`.
- Find reuses `When I find item {string} in branch {string}`.
- Scenario name is `KAN-1 summary availability`.
- KAN-6 feature still has its increase and restore examples.

## Misses

- A Playwright spec, or a step that calls `adjust`.
- Examples columns `increase` or `restore` on the KAN-1 feature.
- An on-hand example of 996.
- A selector or a CSS string inside the feature.
- A new sentence that repeats sign-in or find when `steps/jde.steps.ts` already has that sentence.
- The feature mentioning a heal function by its code name.
- The generated feature edited after generation and before the first DV run.

## Run

`npm run kan` still runs the KAN-6 feature. Run the generated feature on its own for the first DV check, for example:

```bat
node --import tsx ./node_modules/@cucumber/cucumber/bin/cucumber.js features/kan1-summary-availability.feature
```
