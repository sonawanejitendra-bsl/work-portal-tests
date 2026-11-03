*** Settings ***
Library    SeleniumLibrary
Library    JdeSupport
Library    String
Library    OperatingSystem

*** Keywords ***
Open JD Edwards
    [Documentation]    Start Microsoft Edge. The suite uses the Edge already installed on the PC.
    ${options}=    Evaluate    __import__('selenium.webdriver', fromlist=['EdgeOptions']).EdgeOptions()
    Call Method    ${options}    add_argument    --ignore-certificate-errors
    ${headless}=    Get Environment Variable    HEADLESS    0
    IF    '${headless}' in ['1', 'true', 'yes']
        Call Method    ${options}    add_argument    --headless=new
    END
    Open Browser    about:blank    edge    options=${options}
    Set Window Size    1280    720
    Set Selenium Timeout    30 seconds
    Set Selenium Page Load Timeout    60 seconds
    Set Selenium Implicit Wait    0 seconds

Close JD Edwards
    Run Keyword And Ignore Error    Close All Browsers

Enter Fast Path
    [Documentation]    Open a program from the Fast Path box. Summary Availability always opens the menu first.
    [Arguments]    ${program}
    Unselect Frame
    Click Element    id=drop_mainmenuParent
    Wait Until Element Is Visible    id=TE_FAST_PATH_BOX    15s
    Click Element    id=TE_FAST_PATH_BOX
    Input Text    id=TE_FAST_PATH_BOX    ${program}
    Press Keys    id=TE_FAST_PATH_BOX    ENTER

Enter Fast Path If Needed
    [Documentation]    Open a program from Fast Path. Click the menu only when the box is hidden.
    [Arguments]    ${program}
    Unselect Frame
    ${visible}=    Run Keyword And Return Status    Element Should Be Visible    id=TE_FAST_PATH_BOX
    IF    not $visible
        Click Element    id=drop_mainmenuParent
        Wait Until Element Is Visible    id=TE_FAST_PATH_BOX    15s
    END
    Click Element    id=TE_FAST_PATH_BOX
    Input Text    id=TE_FAST_PATH_BOX    ${program}
    Press Keys    id=TE_FAST_PATH_BOX    ENTER

Fill Titled Field
    [Arguments]    ${title}    ${value}
    ${field}=    Set Variable    css:input[title="${title}"]
    Wait Until Element Is Visible    ${field}    30s
    Click Element    ${field}
    Input Text    ${field}    ${value}
    Press Keys    ${field}    TAB

Wait Until Title Contains
    [Arguments]    ${fragment}
    FOR    ${i}    IN RANGE    150
        ${title}=    Get Title
        ${title}=    Evaluate    $title.replace('\\u00a0', ' ')
        IF    $fragment in $title    RETURN
        Sleep    0.4s
    END
    ${title}=    Get Title
    Fail    Page title was "${title}", expected it to contain "${fragment}"
