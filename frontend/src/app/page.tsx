"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type Child, type DailyNotice, type DailyReview } from "@/lib/api";
import { ChildSelector } from "@/components/child-selector";
import { PageHeader } from "@/components/page-header";
import { calculateAge, formatDate, todayStr } from "@/lib/utils";

export default function Dashboard() {
  const [child, setChild] = useState<Child | null>(null);
  const [notices, setNotices] = useState<DailyNotice[]>([]);
  const [reviews, setReviews] = useState<DailyReview[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!child) return;
    setLoading(true);
    Promise.all([
      api.getDailyNotices(child.id),
      api.getDailyReview(child.id, todayStr()).catch(() => null),
    ]).then(([n, r]) => {
      setNotices(n.slice(0, 5));
      setReviews(r ? [r] : []);
      setLoading(false);
    });
  }, [child]);

  return (
    <>
      <ChildSelector selectedId={child?.id ?? null} onSelect={setChild} />
      <PageHeader
        title={child ? `${child.name}의 학습 대시보드` : "학습 대시보드"}
        description={child ? `만 ${calculateAge(child.birth_year)}세` : "아이를 선택하세요"}
      />

      {loading && <p className="text-gray-400 text-sm">불러오는 중...</p>}

      {child && !loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Quick Actions */}
          <div className="card sm:col-span-2">
            <h3 className="font-semibold text-gray-700 mb-3">빠른 작업</h3>
            <div className="flex flex-wrap gap-2">
              <Link href="/notices" className="btn-primary text-sm">📋 알림장 입력</Link>
              <Link href="/textbooks" className="btn-secondary text-sm">📚 교재 업로드</Link>
              <Link href="/lesson-plans" className="btn-secondary text-sm">📅 레슨플랜 업로드</Link>
              <Link href="/review" className="btn-primary text-sm">✏️ 오늘의 리뷰</Link>
              <Link href="/quiz" className="btn-secondary text-sm">🎯 퀴즈 시작</Link>
            </div>
          </div>

          {/* Today's Review */}
          <div className="card">
            <h3 className="font-semibold text-gray-700 mb-3">오늘의 리뷰</h3>
            {reviews.length > 0 ? (
              <div>
                <p className="text-sm text-gray-600 leading-relaxed">{reviews[0].summary}</p>
                <Link href="/review" className="text-primary-500 text-sm font-medium mt-3 inline-block hover:underline">
                  자세히 보기 →
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-400 mb-2">아직 오늘의 리뷰가 없습니다</p>
                <Link href="/review" className="btn-primary text-sm">리뷰 생성하기</Link>
              </div>
            )}
          </div>

          {/* Recent Notices */}
          <div className="card">
            <h3 className="font-semibold text-gray-700 mb-3">최근 알림장</h3>
            {notices.length > 0 ? (
              <ul className="space-y-2">
                {notices.map((n) => (
                  <li key={n.id} className="text-sm">
                    <span className="text-gray-400 mr-2">{formatDate(n.date)}</span>
                    <span className="text-gray-600">{n.content.slice(0, 60)}...</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">알림장이 없습니다</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
