import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "영유 - 우리 아이 학습 트래커",
  description: "유치원 알림장, 교재, 레슨 플랜을 기반으로 아이의 학습을 트래킹하고 리뷰하세요",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        <Nav />
        <main className="md:ml-56 pb-20 md:pb-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-6">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
