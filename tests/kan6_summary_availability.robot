*** Settings ***
Documentation     KAN-6 on the JD Edwards web.
...               Sign in, open Summary Availability, and read on-hand for item 220 at branch 10.
...               Post an inventory adjustment of 1, confirm on-hand increased by 1,
...               then post -1 so the quantity returns to where it started.
Library           SeleniumLibrary
Resource          ../resources/common.resource
Resource          ../resources/login_page.resource
Resource          ../resources/summary_availability_page.resource
Resource          ../resources/inventory_adjustments_page.resource
Variables         ${CURDIR}/../variables/env.py
Resource          ../variables/kan6.resource
Suite Setup       Open JD Edwards
Suite Teardown    Close JD Edwards

*** Test Cases ***
KAN-6 Summary Availability Shows The Updated On-Hand Quantity
    [Documentation]    Positive path. Summary Availability is P41202.
    ...                Inventory Adjustments is P4114. The G/L date is ${GL DATE}.
    [Tags]    kan6    jde
    [Timeout]    10 minutes
    Sign In
    Open Summary Availability
    Search Availability    ${ITEM NUMBER}    ${BRANCH PLANT}
    ${before}=    Read On Hand    ${BRANCH PLANT}
    ${before}=    Convert To Number    ${before}
    Adjust Inventory    ${ITEM NUMBER}    ${BRANCH PLANT}    ${QUANTITY UP}    ${GL DATE}    ${EXPLANATION}
    Open Summary Availability
    Search Availability    ${ITEM NUMBER}    ${BRANCH PLANT}
    ${after}=    Read On Hand    ${BRANCH PLANT}
    ${after}=    Convert To Number    ${after}
    ${up}=    Convert To Number    ${QUANTITY UP}
    ${expected}=    Evaluate    $before + $up
    Should Be Equal As Numbers    ${after}    ${expected}
    Adjust Inventory    ${ITEM NUMBER}    ${BRANCH PLANT}    ${QUANTITY DOWN}    ${GL DATE}    ${EXPLANATION}
