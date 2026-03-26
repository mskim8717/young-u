"use client";

import { useEffect, useState } from "react";
import { api, type Child, type DailyNotice } from "@/lib/api";
import { ChildSelector } from "@/components/child-selector";
import { PageHeader } from "@/components/page-header";
import { formatDate, todayStr } from "@/lib/utils";
import { Markdown } from "@/components/markdown";

export default function NoticesPage() {
  const [child, setChild] = useState<Child | null>(null);
  const [notices, setNotices] = useState<DailyNotice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(todayStr());
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!child) return;
    api.getDailyNotices(child.id).then(setNotices);
  }, [child]);

  const handleSubmit = async () => {
    if (!child || !content.trim()) return;
    setSaving(true);
    const notice = await api.createDailyNotice({
      child_id: child.id,
      date,
      content: content.trim(),
    });
    setNotices((prev) => [notice, ...prev]);
    setContent("");
    setShowForm(false);
    setSaving(false);
  };

  return (
    <>
      <ChildSelector selectedId={child?.id ?? null} onSelect={setChild} />
      <PageHeader
        title="알림장"
        description="유치원에서 받은 알림장 내용을 입력하세요"
        action={
          child && (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              + 알림장 입력
            </button>
          )
        }
      />

      {showForm && (
        <div className="card mb-6">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
              <input
                type="date"
                className="input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">알림장 내용</label>
              <textarea
                className="input min-h-[120px] resize-y"
                placeholder="오늘 유치원에서 보내온 알림장 내용을 입력하세요..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSubmit} disabled={saving} className="btn-primary">
                {saving ? "저장 중..." : "저장"}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary">취소</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {notices.map((notice) => (
          <div key={notice.id} className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary-600">{formatDate(notice.date)}</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{notice.content}</p>
            {notice.summary && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-400 mb-1">AI 요약</p>
                <Markdown content={notice.summary} />
              </div>
            )}
          </div>
        ))}
        {child && notices.length === 0 && (
          <p className="text-center text-gray-400 py-8">아직 알림장이 없습니다</p>
        )}
      </div>
    </>
  );
}
