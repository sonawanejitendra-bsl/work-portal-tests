*** Settings ***
Resource    common.resource

*** Keywords ***
Adjust Inventory
    [Documentation]    Post an Inventory Adjustments (P4114) line and wait until it is saved.
    [Arguments]    ${item number}    ${branch plant}    ${quantity}    ${gl date}    ${explanation}
    ${qty}=    Evaluate    str($quantity).removesuffix('.0')
    Enter Fast Path If Needed    P4114
    Select Frame Containing    css:#hc_Add
    Click Element    css:#hc_Add
    Select Frame Containing    css:input[title="G/L Date"]
    Fill Titled Field    Branch/Plant    ${branch plant}
    Fill Titled Field    Explanation    ${explanation}
    Fill Titled Field    G/L Date    ${gl date}
    Fill Titled Field    Transaction Date    ${gl date}
    Fill Grid Field    1    ${item number}
    Fill Grid Field    2    ${qty}
    Click Element    css:#hc_OK
    Wait Until Adjustment Is Saved
    Log    Posted adjustment ${qty} for item ${item number} at branch ${branch plant}

Fill Grid Field
    [Arguments]    ${position}    ${value}
    ${field}=    Set Variable    xpath:(//table[contains(@class,'gridrowEven')]//input[contains(@class,'JSTextfield')])[${position}]
    Wait Until Element Is Visible    ${field}    30s
    Click Element    ${field}
    Input Text    ${field}    ${value}
    Press Keys    ${field}    TAB

Wait Until Adjustment Is Saved
    FOR    ${i}    IN RANGE    75
        ${text}=    Adjustment Form Text
        ${rejected}=    Evaluate    bool(__import__('re').search(r'This form has [1-9]|Future Month|Blanks Invalid', $text or ''))
        IF    $rejected
            Fail    Inventory adjustment was rejected: ${text}
        END
        IF    'Previous Doc' in $text    RETURN
        Sleep    0.4s
    END
    Fail    Inventory adjustment was not saved

Adjustment Form Text
    ${ready}=    Run Keyword And Return Status    Select Frame Containing    css:input[title="G/L Date"]
    IF    not $ready    RETURN    ${EMPTY}
    ${text}=    Get Text    xpath=//body
    RETURN    ${text}
