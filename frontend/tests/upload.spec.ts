import { test, expect } from "@playwright/test";
import path from "path";

const PDF_PATH = "/Users/minsoo/Downloads/Starfish 03.30-04.03.pdf";

test.describe("PDF 업로드 테스트", () => {
  test("레슨플랜 PDF 업로드", async ({ page }) => {
    await page.goto("/lesson-plans");

    // 아이 선택
    await page.getByRole("button", { name: /테스트아이/ }).click({ timeout: 5000 });

    // 업로드 폼 열기
    await page.getByRole("button", { name: /레슨플랜 업로드/ }).click();

    // 폼 입력
    await page.locator('input[placeholder*="레슨플랜 제목"]').fill("Starfish 3월 5주차");

    // 날짜 입력
    await page.locator('input[type="date"]').first().fill("2026-03-30");
    await page.locator('input[type="date"]').last().fill("2026-04-03");

    // PDF 파일 선택
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(PDF_PATH);

    // 업로드 버튼 클릭
    await page.getByRole("button", { name: "업로드", exact: true }).click();

    // 업로드 완료 대기 (AI 요약 없이 기본 동작 확인, 최대 30초)
    await expect(page.locator("text=Starfish 3월 5주차")).toBeVisible({ timeout: 30000 });
  });

  test("교재 PDF 업로드", async ({ page }) => {
    await page.goto("/textbooks");

    // 아이 선택
    await page.getByRole("button", { name: /테스트아이/ }).click({ timeout: 5000 });

    // 업로드 폼 열기
    await page.getByRole("button", { name: /교재 업로드/ }).click();

    // 폼 입력
    await page.locator('input[placeholder="교재 제목"]').fill("Starfish 교재");

    // PDF 파일 선택
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(PDF_PATH);

    // 업로드 버튼 클릭
    await page.getByRole("button", { name: "업로드", exact: true }).click();

    // 업로드 완료 대기
    await expect(page.locator("text=Starfish 교재")).toBeVisible({ timeout: 30000 });
  });
});
