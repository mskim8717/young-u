import { test, expect } from "@playwright/test";

test("퀴즈 페이지 에러 확인", async ({ page }) => {
  const errors: string[] = [];
  const consoleLogs: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on("pageerror", (err) => {
    errors.push(err.message);
  });

  // Test 1: /quiz without review_id
  await page.goto("/quiz");
  await page.waitForTimeout(2000);
  console.log("=== /quiz (no review_id) ===");
  console.log("Errors:", errors);

  // Test 2: /quiz with review_id
  errors.length = 0;
  await page.goto("/quiz?review_id=853c0ce6-8404-4704-8158-5e5647eb851a");
  await page.waitForTimeout(3000);
  console.log("=== /quiz (with review_id) ===");
  console.log("Errors:", errors);

  // Take screenshot
  await page.screenshot({ path: "test-results/quiz-page-check.png" });

  // Check for network errors
  errors.length = 0;
  const response = await page.goto("/quiz?review_id=853c0ce6-8404-4704-8158-5e5647eb851a");
  console.log("Page status:", response?.status());

  if (errors.length > 0) {
    console.log("FOUND ERRORS:", errors);
  } else {
    console.log("No errors found");
  }
});
