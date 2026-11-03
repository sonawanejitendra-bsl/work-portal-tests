*** Settings ***
Resource    common.resource

*** Keywords ***
Sign In
    [Documentation]    Open the sign-in page, enter the DV user, and click Sign In.
    ...    The click still finds Sign In when the screen says Login.
    Go To    ${LOGIN_URL}
    Wait Until Element Is Visible    css:input[title="User ID"]    30s
    Input Text    css:input[title="User ID"]    ${JDE_USER}
    Enter Password
    Ensure Field    Environment    ${JDE_ENVIRONMENT}
    Ensure Field    Role    ${JDE_ROLE}
    Click Sign In Even If The Screen Still Says Login
    Wait Until Element Is Not Visible    css:input[title="User ID"]    60s
    Wait Until Title Contains    JD Edwards
    Log    Signed in as ${JDE_USER}

Enter Password
    IF    not $JDE_PASSWORD
        Fail    Set JDE_USER and JDE_PASSWORD in .env, then run the suite again.
    END
    Set Log Level    NONE
    Input Password    css:input[title="Password"]    ${JDE_PASSWORD}
    Set Log Level    INFO

Click Sign In Even If The Screen Still Says Login
    ${clicked}=    Run Keyword And Return Status
    ...    Click Element
    ...    xpath=//input[translate(@value,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='sign in' or translate(@alt,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='sign in']
    IF    $clicked    RETURN
    ${clicked}=    Run Keyword And Return Status
    ...    Click Element
    ...    xpath=//button[contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'sign in')] | //a[normalize-space(.)='Sign In']
    IF    $clicked    RETURN
    Click Element    xpath=(//a|//button|//div|//span)[normalize-space(.)='Sign In'][last()]

Ensure Field
    [Arguments]    ${label}    ${value}
    ${text}=    Set Variable    css:input[title="${label}"]
    ${text visible}=    Run Keyword And Return Status    Element Should Be Visible    ${text}
    IF    $text visible
        ${current}=    Get Value    ${text}
        IF    $current.strip() != $value    Input Text    ${text}    ${value}
        RETURN
    END
    ${dropdown}=    Set Variable    css:select[title="${label}"]
    ${dropdown visible}=    Run Keyword And Return Status    Element Should Be Visible    ${dropdown}
    IF    not $dropdown visible    RETURN
    ${selected}=    Get Selected List Label    ${dropdown}
    IF    $value in $selected    RETURN
    Select From List By Label    ${dropdown}    ${value}
