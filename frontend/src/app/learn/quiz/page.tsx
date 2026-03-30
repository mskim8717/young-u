"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, type LearningActivity, type LearningSession } from "@/lib/api";
import { Confetti } from "@/components/learn/confetti";
import { StarAnimation } from "@/components/learn/star-animation";

export default function LearnQuizPage() {
  return (
    <Suspense fallback={<div className="text-center py-20"><p className="text-4xl animate-bounce">🎯</p><p className="text-gray-500 mt-3">준비 중...</p></div>}>
      <QuizContent />
    </Suspense>
  );
}

function QuizContent() {
  const searchParams = useSearchParams();
  const childId = searchParams.get("child_id");

  const [session, setSession] = useState<LearningSession | null>(null);
  const [activities, setActivities] = useState<LearningActivity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showStar, setShowStar] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [stars, setStars] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wordMatchSelections, setWordMatchSelections] = useState<{ word: string | null; desc: string | null }>({ word: null, desc: null });
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  useEffect(() => {
    if (!childId) return;
    api.getTodaySession(childId)
      .then((s) => {
        setSession(s);
        setActivities(s.activities.filter((a) => !a.is_completed));
        if (s.activities.every((a) => a.is_completed)) {
          setFinished(true);
          setStars(s.stars_earned);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [childId]);

  const current = activities[currentIndex];

  const handleAnswer = useCallback(async (answer: string, correct: boolean) => {
    if (showAnswer) return;
    setSelectedOption(answer);
    setIsCorrect(correct);
    setShowAnswer(true);

    if (correct) {
      setStars((s) => s + 1);
      setShowStar(true);
      setTimeout(() => setShowStar(false), 1000);
    }

    if (current) {
      try {
        await api.completeActivity(current.id, correct);
      } catch {}
    }
  }, [showAnswer, current]);

  const handleNext = () => {
    if (currentIndex + 1 >= activities.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setShowAnswer(false);
      setSelectedOption(null);
      setIsCorrect(null);
      setShowHint(false);
      setWordMatchSelections({ word: null, desc: null });
      setMatchedPairs([]);
    }
  };

  const handleFlashcardNext = async () => {
    if (current) {
      try { await api.completeActivity(current.id, true); } catch {}
    }
    setStars((s) => s + 1);
    handleNext();
  };

  if (!childId) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-3">🎮</p>
        <p className="text-gray-500">먼저 학습 모드에서 시작해주세요</p>
        <Link href="/learn" className="kid-btn-primary mt-4 inline-block">학습 모드로 가기</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl animate-bounce">🎯</p>
        <p className="text-lg text-gray-500 mt-4">학습 활동을 준비하고 있어요...</p>
      </div>
    );
  }

  if (!session || activities.length === 0 && !finished) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-3">📝</p>
        <p className="text-lg text-gray-600">아직 학습 활동이 없어요</p>
        <p className="text-sm text-gray-400 mt-2">부모님이 알림장을 입력하고 리뷰를 생성해주세요</p>
        <Link href="/learn" className="kid-btn-primary mt-6 inline-block">돌아가기</Link>
      </div>
    );
  }

  if (finished) {
    return (
      <>
        <Confetti show={true} />
        <div className="text-center py-10 space-y-6">
          <p className="text-6xl">🎉</p>
          <h2 className="text-3xl font-bold text-gray-800">대단해!</h2>
          <div className="kid-card bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 inline-block">
            <p className="text-4xl mb-2">⭐</p>
            <p className="text-2xl font-bold text-yellow-600">{stars}개의 별을 모았어요!</p>
          </div>
          <div className="space-y-3">
            <Link
              href={`/learn/quiz?child_id=${childId}&retry=1`}
              onClick={() => { setFinished(false); setCurrentIndex(0); setStars(0); }}
              className="block w-full kid-btn-primary"
            >
              🔄 다시 하기
            </Link>
            <Link href="/learn" className="block w-full kid-btn bg-white border-2 border-gray-200 text-gray-600">
              🏠 홈으로
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <StarAnimation show={showStar} />

      {/* 진행 바 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">{currentIndex + 1} / {activities.length}</span>
          <span className="text-sm text-yellow-500 font-bold">⭐ {stars}</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / activities.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 활동 카드 */}
      <div className="kid-card min-h-[300px] flex flex-col">
        {/* Activity type badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{current.emoji_cue || getTypeEmoji(current.activity_type)}</span>
          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {getTypeLabel(current.activity_type)}
          </span>
        </div>

        {/* OX Quiz */}
        {current.activity_type === "ox" && (
          <div className="flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-gray-800 text-center mb-6 flex-1 flex items-center justify-center">
              {current.question}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {(current.options as string[] || ["⭕ 맞아요", "❌ 틀려요"]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt, opt === current.answer)}
                  disabled={showAnswer}
                  className={`py-6 rounded-2xl text-2xl font-bold transition-all active:scale-95 ${
                    showAnswer
                      ? opt === current.answer
                        ? "bg-green-100 border-2 border-green-400 text-green-700"
                        : opt === selectedOption
                          ? "bg-red-100 border-2 border-red-400 text-red-700"
                          : "bg-gray-100 text-gray-400"
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 shadow-md"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Multiple Choice */}
        {current.activity_type === "multiple_choice" && (
          <div className="flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 text-center mb-5">
              {current.question}
            </h3>
            <div className="grid grid-cols-1 gap-3 flex-1">
              {(current.options as string[] || []).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt, opt === current.answer)}
                  disabled={showAnswer}
                  className={`py-4 px-5 rounded-2xl text-left text-base font-medium transition-all active:scale-[0.98] ${
                    showAnswer
                      ? opt === current.answer
                        ? "bg-green-100 border-2 border-green-400 text-green-700"
                        : opt === selectedOption
                          ? "bg-red-100 border-2 border-red-400 text-red-700"
                          : "bg-gray-50 border-2 border-gray-100 text-gray-400"
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 shadow-sm"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fill in the Blank */}
        {current.activity_type === "fill_blank" && (
          <div className="flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 text-center mb-5">
              {showAnswer && selectedOption
                ? current.question.replace("___", `[ ${selectedOption} ]`)
                : current.question}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {(current.options as string[] || []).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt, opt === current.answer)}
                  disabled={showAnswer}
                  className={`py-4 px-5 rounded-2xl text-center text-base font-medium transition-all active:scale-[0.98] ${
                    showAnswer
                      ? opt === current.answer
                        ? "bg-green-100 border-2 border-green-400 text-green-700"
                        : opt === selectedOption
                          ? "bg-red-100 border-2 border-red-400 text-red-700"
                          : "bg-gray-50 border-2 border-gray-100 text-gray-400"
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300 shadow-sm"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Flashcard */}
        {current.activity_type === "flashcard" && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div
              className="w-full min-h-[200px] flex items-center justify-center rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50 cursor-pointer transition-all hover:border-purple-400 p-6"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              {showAnswer ? (
                <div className="text-center">
                  <p className="text-xs text-purple-400 mb-2">답</p>
                  <p className="text-xl font-bold text-gray-800">{current.answer}</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xs text-purple-400 mb-2">탭해서 뒤집기!</p>
                  <p className="text-xl font-bold text-gray-800">{current.question}</p>
                </div>
              )}
            </div>
            {showAnswer && (
              <button onClick={handleFlashcardNext} className="kid-btn-primary mt-4 w-full">
                알겠어요! 👍
              </button>
            )}
          </div>
        )}

        {/* Word Match */}
        {current.activity_type === "word_match" && (
          <WordMatchActivity
            activity={current}
            onComplete={async () => {
              try { await api.completeActivity(current.id, true); } catch {}
              setStars((s) => s + 1);
              setShowStar(true);
              setTimeout(() => { setShowStar(false); handleNext(); }, 1000);
            }}
          />
        )}

        {/* Feedback */}
        {showAnswer && current.activity_type !== "flashcard" && current.activity_type !== "word_match" && (
          <div className={`mt-4 p-3 rounded-xl text-center ${isCorrect ? "bg-green-50" : "bg-orange-50"}`}>
            <p className="text-lg font-bold">
              {isCorrect ? "🎉 정답이야! 잘했어!" : "💪 괜찮아, 다시 해보자!"}
            </p>
            {!isCorrect && current.hint && (
              <p className="text-sm text-gray-500 mt-1">💡 {current.hint}</p>
            )}
          </div>
        )}

        {/* Hint button */}
        {!showAnswer && current.hint && current.activity_type !== "flashcard" && current.activity_type !== "word_match" && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="mt-3 text-sm text-blue-400 hover:text-blue-600"
          >
            {showHint ? `💡 ${current.hint}` : "💡 힌트 보기"}
          </button>
        )}
      </div>

      {/* Next button */}
      {showAnswer && current.activity_type !== "flashcard" && current.activity_type !== "word_match" && (
        <button onClick={handleNext} className="kid-btn-primary w-full mt-4">
          {currentIndex + 1 >= activities.length ? "🎉 결과 보기" : "다음 →"}
        </button>
      )}
    </>
  );
}

function WordMatchActivity({ activity, onComplete }: { activity: LearningActivity; onComplete: () => void }) {
  const [selected, setSelected] = useState<{ word: string | null; desc: string | null }>({ word: null, desc: null });
  const [matched, setMatched] = useState<string[]>([]);

  const options = activity.options as { words: string[]; descriptions: string[] } | null;
  if (!options) return <p className="text-gray-400">데이터 로드 실패</p>;

  const { words, descriptions } = options;

  const handleSelect = (type: "word" | "desc", value: string) => {
    const newSel = { ...selected, [type === "word" ? "word" : "desc"]: value };
    setSelected(newSel);

    if (newSel.word && newSel.desc) {
      const wordIdx = words.indexOf(newSel.word);
      const descIdx = descriptions.indexOf(newSel.desc);
      if (wordIdx === descIdx) {
        setMatched((m) => [...m, newSel.word!]);
        if (matched.length + 1 >= words.length) {
          setTimeout(onComplete, 500);
        }
      }
      setTimeout(() => setSelected({ word: null, desc: null }), 300);
    }
  };

  return (
    <div className="flex-1">
      <h3 className="text-lg font-bold text-gray-800 text-center mb-4">단어와 뜻을 연결해요!</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {words.map((w) => (
            <button
              key={w}
              onClick={() => !matched.includes(w) && handleSelect("word", w)}
              className={`w-full py-3 px-3 rounded-xl text-sm font-medium transition-all ${
                matched.includes(w)
                  ? "bg-green-100 border-2 border-green-300 text-green-600"
                  : selected.word === w
                    ? "bg-blue-100 border-2 border-blue-400 text-blue-700"
                    : "bg-white border-2 border-gray-200 text-gray-700"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {descriptions.map((d) => (
            <button
              key={d}
              onClick={() => !matched.some((m) => descriptions[words.indexOf(m)] === d) && handleSelect("desc", d)}
              className={`w-full py-3 px-3 rounded-xl text-sm font-medium transition-all ${
                matched.some((m) => descriptions[words.indexOf(m)] === d)
                  ? "bg-green-100 border-2 border-green-300 text-green-600"
                  : selected.desc === d
                    ? "bg-blue-100 border-2 border-blue-400 text-blue-700"
                    : "bg-white border-2 border-gray-200 text-gray-700"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getTypeEmoji(type: string): string {
  const map: Record<string, string> = {
    ox: "⭕",
    multiple_choice: "🎯",
    fill_blank: "✏️",
    flashcard: "🃏",
    word_match: "🔗",
  };
  return map[type] || "📝";
}

function getTypeLabel(type: string): string {
  const map: Record<string, string> = {
    ox: "OX 퀴즈",
    multiple_choice: "4지선다",
    fill_blank: "빈칸 채우기",
    flashcard: "플래시카드",
    word_match: "단어 연결",
  };
  return map[type] || "퀴즈";
}
