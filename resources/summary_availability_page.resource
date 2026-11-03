*** Settings ***
Resource    common.resource

*** Keywords ***
Open Summary Availability
    [Documentation]    Open Summary Availability (P41202), Work With Item Availability.
    Enter Fast Path    P41202
    Wait Until Title Contains    Work With Item Availability

Search Availability
    [Documentation]    Enter the item and branch, select Omit Zero Quantities, and click Find.
    [Arguments]    ${item number}    ${branch plant}
    Select Frame Containing    css:input[title="Item Number"]
    Fill Titled Field    Item Number    ${item number}
    Fill Titled Field    Branch/Plant    ${branch plant}
    Select Checkbox    css:input[title="Omit Zero Quantities"]
    Click Element    css:#hc_Find
    Log    Searched item ${item number} at branch ${branch plant}

Read On Hand
    [Documentation]    Return the on-hand quantity for the branch row.
    ...    Data row cells are checkbox, attachment, primary, location, branch, on hand.
    ...    The total row is excluded because its text starts with TOTAL.
    [Arguments]    ${branch plant}
    FOR    ${i}    IN RANGE    75
        ${value}=    Read On Hand Once    ${branch plant}
        IF    $value
            Log    Branch ${branch plant} on hand: ${value}
            RETURN    ${value}
        END
        Sleep    0.4s
    END
    Fail    On-hand quantity for branch ${branch plant} was not shown

Read On Hand Once
    [Arguments]    ${branch plant}
    ${ready}=    Run Keyword And Return Status
    ...    Select Frame Containing
    ...    xpath=//tr[starts-with(normalize-space(.),'No Attachment P')]
    IF    not $ready    RETURN    ${EMPTY}
    ${count}=    Get Element Count    xpath=//tr[starts-with(normalize-space(.),'No Attachment P')]
    FOR    ${index}    IN RANGE    1    ${count + 1}
        ${branch}=    Get Text    xpath=(//tr[starts-with(normalize-space(.),'No Attachment P')])[${index}]/td[5]
        ${on hand}=    Get Text    xpath=(//tr[starts-with(normalize-space(.),'No Attachment P')])[${index}]/td[6]
        ${branch}=    Strip String    ${branch}
        ${on hand}=    Strip String    ${on hand}
        ${on hand}=    Replace String    ${on hand}    ,    ${EMPTY}
        IF    $branch == $branch_plant and $on_hand
            RETURN    ${on hand}
        END
    END
    RETURN    ${EMPTY}
