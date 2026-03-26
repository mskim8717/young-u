"use client";

import { useEffect, useState } from "react";
import { api, type Child, type Textbook } from "@/lib/api";
import { ChildSelector } from "@/components/child-selector";
import { PageHeader } from "@/components/page-header";
import { formatDate } from "@/lib/utils";
import { Markdown } from "@/components/markdown";

export default function TextbooksPage() {
  const [child, setChild] = useState<Child | null>(null);
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!child) return;
    api.getTextbooks(child.id).then(setTextbooks);
  }, [child]);

  const handleUpload = async () => {
    if (!child || !file || !title) return;
    setUploading(true);
    const tb = await api.uploadTextbook(child.id, file, title);
    setTextbooks((prev) => [tb, ...prev]);
    setTitle("");
    setFile(null);
    setShowUpload(false);
    setUploading(false);
  };

  return (
    <>
      <ChildSelector selectedId={child?.id ?? null} onSelect={setChild} />
      <PageHeader
        title="교재 관리"
        description="유치원 교재 PDF를 업로드하면 AI가 내용을 분석합니다"
        action={
          child && (
            <button onClick={() => setShowUpload(true)} className="btn-primary">
              + 교재 업로드
            </button>
          )
        }
      />

      {showUpload && (
        <div className="card mb-6">
          <div className="space-y-3">
            <input
              className="input"
              placeholder="교재 제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
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
                {uploading ? "업로드 중... (AI 분석 포함)" : "업로드"}
              </button>
              <button onClick={() => setShowUpload(false)} className="btn-secondary">취소</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {textbooks.map((tb) => (
          <div key={tb.id} className="card">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedId(expandedId === tb.id ? null : tb.id)}
            >
              <div>
                <h4 className="font-medium text-gray-800">{tb.title}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(tb.created_at)}</p>
              </div>
              <span className="text-gray-400 text-sm">{expandedId === tb.id ? "▲" : "▼"}</span>
            </div>
            {expandedId === tb.id && (
              <div className="mt-4 space-y-3">
                {tb.summary && (
                  <div>
                    <p className="text-xs font-medium text-primary-500 mb-1">AI 요약</p>
                    <Markdown content={tb.summary} />
                  </div>
                )}
                {tb.extracted_text && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1">추출된 텍스트</p>
                    <p className="text-xs text-gray-500 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                      {tb.extracted_text.slice(0, 2000)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {child && textbooks.length === 0 && (
          <p className="text-center text-gray-400 py-8">아직 교재가 없습니다</p>
        )}
      </div>
    </>
  );
}
