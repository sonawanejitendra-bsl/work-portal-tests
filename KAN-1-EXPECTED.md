# KAN-1 generation check — Robot Framework

Use this file when a generated KAN-1 arrives on this branch. Compare it with `tests/kan6_summary_availability.robot`. KAN-1 must use that same shape. The business stop point is the on-hand quantity. There is no inventory adjustment.

Score the files before the first DV run. A browser pass in the wrong shape is still a miss.

## Business result

1. Sign in with the same `Sign In` keyword KAN-6 uses. That keyword clicks Sign In even when the screen says Login. The title then contains JD Edwards.
2. Summary Availability opens on fast path P41202.
3. The test finds item 220 in branch 10. Omit Zero Quantities is checked. Find is clicked. Those controls stay in `resources/summary_availability_page.resource`.
4. The on-hand check reads the quantity cell on the data row for branch 10. The total row is not the result.
5. The expected quantity sits in `variables/kan1.resource`. On this DV environment the last confirmed quantity was 986. The older story text 996 is the wrong expected result.
6. The test ends there. On-hand is unchanged. P4114 is not opened.

## Files

| Expect | Detail |
| --- | --- |
| New test | `tests/kan1_summary_availability.robot` |
| Data | `variables/kan1.resource` with item 220, branch 10, and expected on-hand 986 |
| Keywords | Reuse `Sign In`, `Open Summary Availability`, `Search Availability`, and `Read On Hand` |
| Pages | No new page resource. Locators stay in `resources/summary_availability_page.resource` |
| Left unchanged | `tests/kan6_summary_availability.robot` |

## Test shape to accept

```robot
*** Settings ***
Documentation     KAN-1 on the JD Edwards web.
...               Sign in, open Summary Availability, and confirm on-hand for item 220 at branch 10.
Library           SeleniumLibrary
Resource          ../resources/common.resource
Resource          ../resources/login_page.resource
Resource          ../resources/summary_availability_page.resource
Variables         ${CURDIR}/../variables/env.py
Resource          ../variables/kan1.resource
Suite Setup       Open JD Edwards
Suite Teardown    Close JD Edwards

*** Test Cases ***
KAN-1 Summary Availability Shows On-Hand For Item 220
    [Documentation]    Positive path. Summary Availability is P41202.
    ...                The on-hand check stops the case. Inventory Adjustments is not opened.
    [Tags]    kan1    jde
    [Timeout]    6 minutes
    Sign In
    Open Summary Availability
    Search Availability    ${ITEM NUMBER}    ${BRANCH PLANT}
    ${on hand}=    Read On Hand    ${BRANCH PLANT}
    Should Be Equal As Numbers    ${on hand}    ${EXPECTED ON HAND}
```

`variables/kan1.resource` carries the data:

```robot
*** Variables ***
${ITEM NUMBER}         220
${BRANCH PLANT}        10
${EXPECTED ON HAND}    986
```

## Checks

- The case is a `.robot` file. There is no `tests/*.spec.ts` and no `.feature` file for KAN-1.
- The test has no selector, no XPath, and no CSS.
- Item, branch, and on-hand sit in `variables/kan1.resource`. They are not hardcoded in the test.
- Sign-in reuses `Sign In`.
- Find reuses `Search Availability`.
- The on-hand check reuses `Read On Hand`.
- Test name is `KAN-1 Summary Availability Shows On-Hand For Item 220`.
- KAN-6 still has its increase and restore steps.

## Misses

- A Playwright spec, a Gherkin feature, or a call to `Adjust Inventory`.
- An expected on-hand of 996.
- A selector inside the `.robot` test.
- A new Python library for KAN-1.
- A new sign-in or find keyword when `login_page.resource` and `summary_availability_page.resource` already have those keywords.
- The generated test edited after generation and before the first DV run.

## Run

`npm run kan` still runs the KAN-6 robot file. Run the generated file on its own for the first DV check:

```powershell
python -m robot --pythonpath libraries --outputdir results tests/kan1_summary_availability.robot
```
