"use client";

import { useEffect, useState } from "react";
import { api, type Child, type DailyReview } from "@/lib/api";
import { ChildSelector } from "@/components/child-selector";
import { PageHeader } from "@/components/page-header";
import { todayStr, formatDate } from "@/lib/utils";
import { Markdown } from "@/components/markdown";
import Link from "next/link";

export default function ReviewPage() {
  const [child, setChild] = useState<Child | null>(null);
  const [date, setDate] = useState(todayStr());
  const [review, setReview] = useState<DailyReview | null>(null);
  const [generating, setGenerating] = useState(false);
  const [reviews, setReviews] = useState<DailyReview[]>([]);

  useEffect(() => {
    if (!child) return;
    // Try to load today's review
    api.getDailyReview(child.id, date).then(setReview).catch(() => setReview(null));
    // Load recent reviews
    api.getDailyReview(child.id, date).catch(() => null);
    // Load review list
    fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/reviews/${child.id}`)
      .then((r) => r.json())
      .then(setReviews)
      .catch(() => {});
  }, [child, date]);

  const handleGenerate = async () => {
    if (!child) return;
    setGenerating(true);
    try {
      const r = await api.generateReview(child.id, date);
      setReview(r);
    } catch (e) {
      alert("리뷰 생성에 실패했습니다. 알림장이나 레슨플랜 데이터가 있는지 확인해주세요.");
    }
    setGenerating(false);
  };

  return (
    <>
      <ChildSelector selectedId={child?.id ?? null} onSelect={setChild} />
      <PageHeader title="데일리 리뷰" description="AI가 오늘 배운 내용을 정리하고 복습 가이드를 제공합니다" />

      {child && (
        <div className="mb-4 flex items-center gap-3">
          <input
            type="date"
            className="input w-auto"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary"
          >
            {generating ? "AI 생성 중..." : review ? "리뷰 다시 생성" : "리뷰 생성"}
          </button>
        </div>
      )}

      {review && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-lg">📝</span> 오늘의 학습 요약
            </h3>
            <Markdown content={review.summary} />
          </div>

          <div className="card bg-warm-50 border-warm-200">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-lg">💬</span> 부모 질문 가이드
            </h3>
            <Markdown content={review.parent_guide} />
          </div>

          <div className="flex gap-2">
            <Link href={`/quiz?review_id=${review.id}`} className="btn-primary">
              🎯 퀴즈 & 플래시카드 시작
            </Link>
          </div>
        </div>
      )}

      {child && !review && !generating && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📖</p>
          <p className="text-gray-500 mb-2">
            {date === todayStr() ? "오늘" : formatDate(date)}의 리뷰가 없습니다
          </p>
          <p className="text-sm text-gray-400">알림장과 레슨플랜을 먼저 입력한 후 리뷰를 생성해보세요</p>
        </div>
      )}

      {/* Recent reviews list */}
      {reviews.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-gray-700 mb-3">최근 리뷰</h3>
          <div className="space-y-2">
            {reviews.map((r) => (
              <button
                key={r.id}
                onClick={() => { setDate(r.date); setReview(r); }}
                className="w-full text-left card hover:border-primary-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary-600">{formatDate(r.date)}</span>
                  <span className="text-xs text-gray-400">→</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.summary}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
