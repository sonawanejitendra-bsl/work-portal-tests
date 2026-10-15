Feature: KAN-6 inventory adjustment

  Scenario Outline: KAN-6 inventory adjustment
    Given I am on the JD Edwards sign-in page
    When I enter the DV user
    And I click Sign In even if the screen still says Login
    Then I am signed in to JD Edwards
    When I open Summary Availability
    And I find item "<item>" in branch "<branch>"
    And I remember the on-hand quantity for branch "<branch>"
    And I adjust item "<item>" in branch "<branch>" by "<increase>"
    Then the on-hand quantity for branch "<branch>" has increased by "<increase>"
    And I adjust item "<item>" in branch "<branch>" by "<restore>"

    Examples:
      | item | branch | increase | restore |
      | 220  | 10     | 1        | -1      |
