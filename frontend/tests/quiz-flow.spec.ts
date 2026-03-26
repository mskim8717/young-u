import { test, expect } from "@playwright/test";

test("퀴즈 생성 및 풀기 전체 플로우", async ({ page }) => {
  // 리뷰 페이지에서 퀴즈로 이동
  await page.goto("/review");
  await page.getByRole("button", { name: /김수현/ }).click({ timeout: 5000 });

  // 리뷰가 있으면 퀴즈 버튼 클릭
  const quizLink = page.locator("text=퀴즈 & 플래시카드 시작");
  if (await quizLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await quizLink.click();
  } else {
    // 리뷰가 없으면 생성
    await page.getByRole("button", { name: /리뷰 생성/ }).click();
    await expect(page.locator("text=퀴즈 & 플래시카드 시작")).toBeVisible({ timeout: 30000 });
    await page.locator("text=퀴즈 & 플래시카드 시작").click();
  }

  // 퀴즈 페이지
  await expect(page.locator("text=퀴즈 & 플래시카드 만들기")).toBeVisible({ timeout: 5000 });
  await page.getByRole("button", { name: /퀴즈 & 플래시카드 만들기/ }).click();

  // 퀴즈 생성 대기
  await expect(page.locator(".card")).toBeVisible({ timeout: 30000 });

  // 퀴즈 풀기 - 아무 보기나 클릭
  const options = page.locator("button.w-full.text-left");
  if (await options.count() > 0) {
    await options.first().click();
    // 다음 버튼 클릭
    await page.getByRole("button", { name: /다음|결과/ }).click();
  }

  console.log("퀴즈 플로우 테스트 성공!");
});
