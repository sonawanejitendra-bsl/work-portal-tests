# KAN-2 generation check — Robot Framework

Use this file when a generated KAN-2 arrives on this branch. Compare it with `tests/kan6_summary_availability.robot`. KAN-2 must use that same shape. The business flow is a sales order: create the header, add the line, then find the order by the number JD Edwards assigned.

Score the files before the first DV run. A browser pass in the wrong shape is still a miss.

## Business result

1. Sign in with the same `Sign In` keyword KAN-6 uses.
2. Enter Orders Header opens from Navigator, EnterpriseOne Menus, Order Management, Sales Order Management, Daily Sales Order Management Processing, Sales Order Processing.
3. Add starts a new order. The header is branch/plant 10, sold to 17001, ship to 17001, requested date 09/17/2026, and customer PO anu-3.
4. After the header is saved, Sales Order Detail Revisions is displayed and JD Edwards has assigned an order number. The test keeps that number. It does not hardcode an order number.
5. The line is item 220 with quantity ordered 2, then the order is saved.
6. Sales Order Detail opens from the same Sales Order Processing menu. The search uses the order number from the header.
7. Customer PO contains anu-3, quantity ordered contains 2, and 2nd Item Number contains 220.
8. Summary Availability and Inventory Adjustments are not part of this case.

## Files

| Expect | Detail |
| --- | --- |
| New test | `tests/kan2_sales_order.robot` |
| Data | `variables/kan2.resource` with branch 10, sold to 17001, ship to 17001, requested date 09/17/2026, customer PO anu-3, item 220, and quantity ordered 2 |
| New page | `resources/sales_order_page.resource`. Locators for Enter Orders Header and Sales Order Detail stay in that file |
| Keywords | Reuse `Sign In`, `Open JD Edwards`, and `Close JD Edwards`. Add the sales-order keywords in the new resource |
| Left unchanged | `tests/kan6_summary_availability.robot` and the Summary Availability resources |

## Test shape to accept

```robot
*** Settings ***
Documentation     KAN-2 on the JD Edwards web.
...               Sign in, create a sales order, and retrieve it by the order number.
Library           SeleniumLibrary
Resource          ../resources/common.resource
Resource          ../resources/login_page.resource
Resource          ../resources/sales_order_page.resource
Variables         ${CURDIR}/../variables/env.py
Resource          ../variables/kan2.resource
Suite Setup       Open JD Edwards
Suite Teardown    Close JD Edwards

*** Test Cases ***
KAN-2 Create A Sales Order And Retrieve It By Order Number
    [Documentation]    Positive path. The order number comes from the screen after the header is saved.
    [Tags]    kan2    jde
    [Timeout]    10 minutes
    Sign In
    Open Enter Orders Header
    Add Sales Order Header    ${BRANCH PLANT}    ${SOLD TO}    ${SHIP TO}    ${REQUESTED DATE}    ${CUSTOMER PO}
    ${order}=    Read Order Number
    Add Sales Order Line    ${ITEM NUMBER}    ${QUANTITY ORDERED}
    Open Sales Order Detail
    Search Sales Order    ${order}
    Sales Order Detail Should Show    ${CUSTOMER PO}    ${QUANTITY ORDERED}    ${ITEM NUMBER}
```

`variables/kan2.resource` carries the data:

```robot
*** Variables ***
${BRANCH PLANT}         10
${SOLD TO}              17001
${SHIP TO}              17001
${REQUESTED DATE}       09/17/2026
${CUSTOMER PO}          anu-3
${ITEM NUMBER}          220
${QUANTITY ORDERED}     2
```

The new keywords live in `resources/sales_order_page.resource`. `Read Order Number` returns the number shown after the header save. `Sales Order Detail Should Show` checks customer PO, quantity ordered, and 2nd Item Number.

## Checks

- The case is a `.robot` file under `tests/`. There is no `tests/*.spec.ts` and no `.feature` file for KAN-2.
- The test has no selector, no XPath, and no CSS.
- Header and line values sit in `variables/kan2.resource`. The order number does not.
- Sign-in reuses `Sign In`.
- Sales-order locators are only in `resources/sales_order_page.resource`.
- Test name is `KAN-2 Create A Sales Order And Retrieve It By Order Number`.
- KAN-6 still has its increase and restore steps.

## Misses

- A Playwright spec, a Gherkin feature, or a call to `Adjust Inventory` or `Open Summary Availability`.
- A hardcoded order number in the test or in `variables/kan2.resource`.
- A selector inside the `.robot` test.
- A new Python library for KAN-2.
- Sign-in written again inside `sales_order_page.resource`.
- The generated test edited after generation and before the first DV run.

## Run

`npm run kan` still runs the KAN-6 robot file. Run the generated file on its own for the first DV check:

```powershell
python -m robot --pythonpath libraries --outputdir results tests/kan2_sales_order.robot
```
