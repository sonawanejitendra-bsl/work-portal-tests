*** Variables ***
# Summary Availability (P41202) and Inventory Adjustments (P4114).
${ITEM NUMBER}      220
${BRANCH PLANT}     10
${QUANTITY UP}      1
${QUANTITY DOWN}    -1
${EXPLANATION}      KAN-6

# Company PACO rejects the system date as a future period. 01/31/2026 is a date this environment accepts.
${GL DATE}    01/31/2026
