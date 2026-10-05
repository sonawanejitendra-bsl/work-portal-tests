import { test as teardown } from "@playwright/test";

teardown("cleanup hook ran", async () => {
  // dataFactory.cleanup() already deletes records created in each test.
});
