"use client";

import { useEffect, useState } from "react";
import { api, type Child, type LessonPlan } from "@/lib/api";
import { ChildSelector } from "@/components/child-selector";
import { PageHeader } from "@/components/page-header";
import { formatDate } from "@/lib/utils";
import { Markdown } from "@/components/markdown";

export default function LessonPlansPage() {
  const [child, setChild] = useState<Child | null>(null);
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!child) return;
    api.getLessonPlans(child.id).then(setPlans);
  }, [child]);

  const handleUpload = async () => {
    if (!child || !file || !title || !weekStart || !weekEnd) return;
    setUploading(true);
    const plan = await api.uploadLessonPlan(child.id, file, title, weekStart, weekEnd);
    setPlans((prev) => [plan, ...prev]);
    setTitle("");
    setFile(null);
    setWeekStart("");
    setWeekEnd("");
    setShowUpload(false);
    setUploading(false);
  };

  return (
    <>
      <ChildSelector selectedId={child?.id ?? null} onSelect={setChild} />
      <PageHeader
        title="주간 레슨 플랜"
        description="주간 레슨 플랜 PDF를 업로드하세요"
        action={
          child && (
            <button onClick={() => setShowUpload(true)} className="btn-primary">
              + 레슨플랜 업로드
            </button>
          )
        }
      />

      {showUpload && (
        <div className="card mb-6">
          <div className="space-y-3">
            <input
              className="input"
              placeholder="레슨플랜 제목 (예: 3월 4주차)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                <input type="date" className="input" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                <input type="date" className="input" value={weekEnd} onChange={(e) => setWeekEnd(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PDF 파일</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleUpload} disabled={uploading} className="btn-primary">
                {uploading ? "업로드 중..." : "업로드"}
              </button>
              <button onClick={() => setShowUpload(false)} className="btn-secondary">취소</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {plans.map((plan) => (
          <div key={plan.id} className="card">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedId(expandedId === plan.id ? null : plan.id)}
            >
              <div>
                <h4 className="font-medium text-gray-800">{plan.title}</h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDate(plan.week_start)} ~ {formatDate(plan.week_end)}
                </p>
              </div>
              <span className="text-gray-400 text-sm">{expandedId === plan.id ? "▲" : "▼"}</span>
            </div>
            {expandedId === plan.id && plan.summary && (
              <div className="mt-4">
                <p className="text-xs font-medium text-primary-500 mb-1">AI 요약</p>
                <Markdown content={plan.summary} />
              </div>
            )}
          </div>
        ))}
        {child && plans.length === 0 && (
          <p className="text-center text-gray-400 py-8">아직 레슨 플랜이 없습니다</p>
        )}
      </div>
    </>
  );
}
