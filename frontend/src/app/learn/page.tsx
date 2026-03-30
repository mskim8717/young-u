"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type Child, type ChildSummary, type LearningStats } from "@/lib/api";
import { calculateAge, todayStr } from "@/lib/utils";

export default function LearnPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [child, setChild] = useState<Child | null>(null);
  const [summary, setSummary] = useState<ChildSummary | null>(null);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getChildren().then((data) => {
      setChildren(data);
      if (data.length > 0) setChild(data[0]);
    });
  }, []);

  useEffect(() => {
    if (!child) return;
    setLoading(true);
    Promise.all([
      api.getChildSummary(child.id, todayStr()).catch(() => null),
      api.getLearningStats(child.id).catch(() => null),
    ]).then(([s, st]) => {
      setSummary(s);
      setStats(st);
      setLoading(false);
    });
  }, [child]);

  if (!child) {
    return (
      <div className="text-center py-20">
        <p className="text-6xl mb-4">👋</p>
        <p className="text-2xl font-bold text-gray-700">안녕!</p>
        <p className="text-gray-500 mt-2">먼저 아이를 등록해주세요</p>
        <Link href="/" className="kid-btn-primary mt-4 inline-block">홈으로 가기</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 아이 선택 */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {children.map((c) => (
          <button
            key={c.id}
            onClick={() => setChild(c)}
            className={`rounded-full px-5 py-3 text-base font-bold transition-all active:scale-95 ${
              child.id === c.id
                ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-lg"
                : "bg-white text-gray-600 shadow-md"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* 인사 헤더 */}
      <div className="text-center">
        <p className="text-5xl mb-2">🎒</p>
        <h1 className="text-2xl font-bold text-gray-800">
          {child.name}아, 안녕! 👋
        </h1>
        <p className="text-gray-500 mt-1">만 {calculateAge(child.birth_year)}세</p>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="flex justify-center gap-4">
          <div className="kid-card text-center min-w-[100px]">
            <p className="text-3xl">⭐</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.total_stars}</p>
            <p className="text-xs text-gray-400 mt-1">모은 별</p>
          </div>
          <div className="kid-card text-center min-w-[100px]">
            <p className="text-3xl">🔥</p>
            <p className="text-2xl font-bold text-orange-500">{stats.current_streak}</p>
            <p className="text-xs text-gray-400 mt-1">연속 학습</p>
          </div>
          <div className="kid-card text-center min-w-[100px]">
            <p className="text-3xl">🏆</p>
            <p className="text-2xl font-bold text-purple-500">{stats.longest_streak}</p>
            <p className="text-xs text-gray-400 mt-1">최고 기록</p>
          </div>
        </div>
      )}

      {/* 오늘의 학습 요약 */}
      {loading ? (
        <div className="kid-card text-center py-8">
          <p className="text-4xl animate-bounce">📚</p>
          <p className="text-gray-500 mt-3">불러오는 중...</p>
        </div>
      ) : summary ? (
        <div className="kid-card bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
          <h2 className="text-lg font-bold text-gray-700 mb-3">📖 오늘 뭘 배웠을까?</h2>
          <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{summary.summary}</p>
          <p className="text-sm text-orange-500 font-medium mt-3">{summary.encouragement}</p>
        </div>
      ) : (
        <div className="kid-card text-center py-6">
          <p className="text-4xl mb-2">📝</p>
          <p className="text-gray-500">아직 오늘의 학습 내용이 없어요</p>
          <p className="text-sm text-gray-400 mt-1">부모님이 알림장을 먼저 입력해주세요</p>
        </div>
      )}

      {/* 학습 시작 버튼 */}
      <div className="text-center">
        <Link
          href={`/learn/quiz?child_id=${child.id}`}
          className="inline-block w-full max-w-xs rounded-2xl bg-gradient-to-r from-green-400 to-blue-500 px-8 py-5 text-xl font-bold text-white shadow-xl shadow-green-200/50 transition-all hover:shadow-2xl active:scale-95"
        >
          🚀 학습 시작하기!
        </Link>
      </div>

      {/* 홈으로 돌아가기 */}
      <div className="text-center">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
          ← 부모 대시보드로
        </Link>
      </div>
    </div>
  );
}
