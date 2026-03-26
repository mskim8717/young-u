"use client";

import { useEffect, useState } from "react";
import { api, type Child } from "@/lib/api";
import { calculateAge } from "@/lib/utils";

interface ChildSelectorProps {
  selectedId: string | null;
  onSelect: (child: Child) => void;
}

export function ChildSelector({ selectedId, onSelect }: ChildSelectorProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState(2020);

  useEffect(() => {
    api.getChildren().then((data) => {
      setChildren(data);
      if (data.length > 0 && !selectedId) {
        onSelect(data[0]);
      }
    });
  }, []);

  const handleAdd = async () => {
    if (!name) return;
    const child = await api.createChild({ name, birth_year: birthYear });
    setChildren((prev) => [...prev, child]);
    onSelect(child);
    setShowAdd(false);
    setName("");
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 flex-wrap">
        {children.map((child) => (
          <button
            key={child.id}
            onClick={() => onSelect(child)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedId === child.id
                ? "bg-primary-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {child.name} (만 {calculateAge(child.birth_year)}세)
          </button>
        ))}
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-full px-4 py-2 text-sm font-medium border-2 border-dashed border-gray-300 text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
        >
          + 아이 추가
        </button>
      </div>

      {showAdd && (
        <div className="mt-4 card max-w-sm">
          <div className="space-y-3">
            <input
              className="input"
              placeholder="아이 이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div>
              <label className="block text-sm text-gray-600 mb-1">태어난 연도</label>
              <input
                type="number"
                className="input"
                value={birthYear}
                onChange={(e) => setBirthYear(Number(e.target.value))}
                min={2015}
                max={2025}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="btn-primary">추가</button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary">취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
