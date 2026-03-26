"use client";

import { useEffect, useState } from "react";
import { api, type Child } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { calculateAge } from "@/lib/utils";

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState(2020);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getChildren().then(setChildren);
  }, []);

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    if (editId) {
      const updated = await api.updateChild(editId, { name, birth_year: birthYear });
      setChildren((prev) => prev.map((c) => (c.id === editId ? updated : c)));
    } else {
      const created = await api.createChild({ name, birth_year: birthYear });
      setChildren((prev) => [...prev, created]);
    }
    resetForm();
    setSaving(false);
  };

  const startEdit = (child: Child) => {
    setEditId(child.id);
    setName(child.name);
    setBirthYear(child.birth_year);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setBirthYear(2020);
    setShowForm(false);
  };

  return (
    <>
      <PageHeader
        title="아이 프로필 관리"
        description="아이의 정보를 등록하고 관리하세요"
        action={<button onClick={() => setShowForm(true)} className="btn-primary">+ 아이 추가</button>}
      />

      {showForm && (
        <div className="card mb-6 max-w-sm">
          <h3 className="font-semibold text-gray-700 mb-3">{editId ? "프로필 수정" : "아이 추가"}</h3>
          <div className="space-y-3">
            <input className="input" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
            <div>
              <label className="block text-sm text-gray-600 mb-1">태어난 연도</label>
              <input type="number" className="input" value={birthYear} onChange={(e) => setBirthYear(Number(e.target.value))} min={2015} max={2025} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? "저장 중..." : "저장"}</button>
              <button onClick={resetForm} className="btn-secondary">취소</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {children.map((child) => (
          <div key={child.id} className="card flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-800 text-lg">{child.name}</h4>
              <p className="text-sm text-gray-500">{child.birth_year}년생 (만 {calculateAge(child.birth_year)}세)</p>
            </div>
            <button onClick={() => startEdit(child)} className="btn-secondary text-xs">수정</button>
          </div>
        ))}
      </div>

      {children.length === 0 && !showForm && (
        <p className="text-center text-gray-400 py-8">등록된 아이가 없습니다</p>
      )}
    </>
  );
}
