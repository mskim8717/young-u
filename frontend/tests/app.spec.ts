import { test, expect } from "@playwright/test";

test.describe("영유 - 기본 기능 테스트", () => {
  test("홈 페이지 로드", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1:has-text('영유')")).toBeVisible();
    await expect(page.getByRole("heading", { name: /학습 대시보드/ })).toBeVisible();
  });

  test("네비게이션 링크 표시", async ({ page }) => {
    await page.goto("/");
    // 데스크탑 nav만 체크
    const nav = page.locator("nav").first();
    await expect(nav.locator("text=알림장")).toBeVisible();
    await expect(nav.locator("text=교재")).toBeVisible();
    await expect(nav.locator("text=레슨플랜")).toBeVisible();
    await expect(nav.locator("text=데일리 리뷰")).toBeVisible();
    await expect(nav.locator("text=퀴즈")).toBeVisible();
  });

  test("기존 아이가 대시보드에 표시됨", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /테스트아이/ })).toBeVisible({ timeout: 5000 });
  });

  test("아이 추가 폼 열기", async ({ page }) => {
    await page.goto("/");
    await page.click("text=아이 추가");
    await expect(page.locator('input[placeholder="아이 이름"]')).toBeVisible();
    await expect(page.locator("text=태어난 연도")).toBeVisible();
  });

  test("알림장 페이지 로드 및 입력 폼", async ({ page }) => {
    await page.goto("/notices");
    await expect(page.getByRole("heading", { name: "알림장" })).toBeVisible();
    await page.getByRole("button", { name: /테스트아이/ }).click({ timeout: 5000 });
    await page.getByRole("button", { name: "알림장 입력" }).click();
    await expect(page.locator("textarea")).toBeVisible();
  });

  test("알림장 저장", async ({ page }) => {
    await page.goto("/notices");
    await page.getByRole("button", { name: /테스트아이/ }).click({ timeout: 5000 });
    await page.getByRole("button", { name: "알림장 입력" }).click();
    await page.fill("textarea", "오늘은 봄 관련 활동을 했습니다. 꽃 그리기와 나비 만들기를 했어요.");
    await page.getByRole("button", { name: "저장" }).click();
    await expect(page.locator("text=오늘은 봄 관련 활동을 했습니다")).toBeVisible({ timeout: 10000 });
  });

  test("교재 페이지 로드", async ({ page }) => {
    await page.goto("/textbooks");
    await expect(page.getByRole("heading", { name: "교재 관리" })).toBeVisible();
    await page.getByRole("button", { name: /테스트아이/ }).click({ timeout: 5000 });
    await expect(page.getByRole("button", { name: /교재 업로드/ })).toBeVisible();
  });

  test("레슨플랜 페이지 로드", async ({ page }) => {
    await page.goto("/lesson-plans");
    await expect(page.getByRole("heading", { name: "주간 레슨 플랜" })).toBeVisible();
    await page.getByRole("button", { name: /테스트아이/ }).click({ timeout: 5000 });
    await expect(page.getByRole("button", { name: /레슨플랜 업로드/ })).toBeVisible();
  });

  test("데일리 리뷰 페이지 로드", async ({ page }) => {
    await page.goto("/review");
    await expect(page.getByRole("heading", { name: "데일리 리뷰" })).toBeVisible();
    await page.getByRole("button", { name: /테스트아이/ }).click({ timeout: 5000 });
    await expect(page.locator("input[type='date']")).toBeVisible();
  });

  test("퀴즈 페이지 - 리뷰 없이 접근", async ({ page }) => {
    await page.goto("/quiz");
    await expect(page.locator("text=데일리 리뷰에서 퀴즈를 시작해주세요")).toBeVisible();
    await expect(page.locator("text=리뷰 페이지로 가기")).toBeVisible();
  });

  test("아이 프로필 관리 페이지", async ({ page }) => {
    await page.goto("/children");
    await expect(page.getByRole("heading", { name: "아이 프로필 관리" })).toBeVisible();
    await expect(page.locator("text=테스트아이").first()).toBeVisible({ timeout: 5000 });
  });

  test("각 페이지 간 네비게이션", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav").first();

    await nav.locator("text=알림장").click();
    await expect(page).toHaveURL("/notices");

    await nav.locator("text=교재").click();
    await expect(page).toHaveURL("/textbooks");

    await nav.locator("text=레슨플랜").click();
    await expect(page).toHaveURL("/lesson-plans");

    await nav.locator("text=데일리 리뷰").click();
    await expect(page).toHaveURL("/review");

    await nav.locator("text=퀴즈").click();
    await expect(page).toHaveURL("/quiz");

    await nav.locator("text=홈").click();
    await expect(page).toHaveURL("/");
  });
});
