export const jdeCatalog = {
  "login.userId": { kind: "role", role: "textbox", name: "User ID" },
  "login.password": { kind: "role", role: "textbox", name: "Password" },
  "login.missingLogin": { kind: "role", role: "button", name: "Login" },
  "login.signIn": { kind: "role", role: "button", name: "Sign In" },
  "shell.navigator": { kind: "css", css: "#drop_mainmenuParent" },
  "shell.fastPath": { kind: "css", css: "#TE_FAST_PATH_BOX" },
  "availability.itemNumber": { kind: "frameCss", css: "input[title='Item Number']" },
  "availability.branch": { kind: "frameCss", css: "input[title='Branch/Plant']" },
  "availability.omitZero": { kind: "frameCss", css: "input[title='Omit Zero Quantities']" },
  "availability.find": { kind: "frameCss", css: "#hc_Find" },
  "availability.row": { kind: "grid", name: "^No Attachment P", branchCell: 4, quantityCell: 5 },
  "adjustments.add": { kind: "frameCss", css: "#hc_Add" },
  "adjustments.branch": { kind: "frameCss", css: "input[title='Branch/Plant']" },
  "adjustments.explanation": { kind: "frameCss", css: "input[title='Explanation']" },
  "adjustments.glDate": { kind: "frameCss", css: "input[title='G/L Date']" },
  "adjustments.transactionDate": { kind: "frameCss", css: "input[title='Transaction Date']" },
  "adjustments.item": { kind: "frameNth", css: "table.gridrowEven input.JSTextfield", nth: 0 },
  "adjustments.quantity": { kind: "frameNth", css: "table.gridrowEven input.JSTextfield", nth: 1 },
  "adjustments.ok": { kind: "frameCss", css: "#hc_OK" },
} as const;

export type CatalogKey = keyof typeof jdeCatalog;
