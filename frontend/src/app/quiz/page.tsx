"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, type Quiz } from "@/lib/api";

export default function QuizPage() {
  return (
    <Suspense fallback={<p className="text-center text-gray-400 py-8">로딩 중...</p>}>
      <QuizContent />
    </Suspense>
  );
}

function QuizContent() {
  const searchParams = useSearchParams();
  const reviewId = searchParams.get("review_id");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [generating, setGenerating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState<"quiz" | "flashcard">("quiz");
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!reviewId) return;
    api.getQuizzes(reviewId)
      .then((data) => {
        if (data.length > 0) {
          setQuizzes(data);
        }
      })
      .catch(() => {});
  }, [reviewId]);

  const handleGenerate = async () => {
    if (!reviewId) return;
    setGenerating(true);
    const data = await api.generateQuizzes(reviewId);
    setQuizzes(data);
    setGenerating(false);
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
  };

  const filtered = quizzes.filter((q) => q.quiz_type === mode);
  const current = filtered[currentIndex];

  const handleSelectAnswer = (answer: string) => {
    if (showAnswer) return;
    setSelectedAnswer(answer);
    setShowAnswer(true);
    if (answer === current.answer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= filtered.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setScore(0);
    setFinished(false);
  };

  if (!reviewId) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">🎯</p>
        <p className="text-gray-500 mb-2">데일리 리뷰에서 퀴즈를 시작해주세요</p>
        <a href="/review" className="btn-primary inline-block">리뷰 페이지로 가기</a>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setMode("quiz"); handleRestart(); }}
          className={mode === "quiz" ? "btn-primary" : "btn-secondary"}
        >
          🎯 퀴즈
        </button>
        <button
          onClick={() => { setMode("flashcard"); handleRestart(); }}
          className={mode === "flashcard" ? "btn-primary" : "btn-secondary"}
        >
          🃏 플래시카드
        </button>
      </div>

      {quizzes.length === 0 && (
        <div className="text-center py-12">
          <button onClick={handleGenerate} disabled={generating} className="btn-primary text-lg px-8 py-3">
            {generating ? "퀴즈 생성 중..." : "퀴즈 & 플래시카드 만들기"}
          </button>
        </div>
      )}

      {filtered.length > 0 && !finished && current && (
        <div className="card">
          <div className="text-xs text-gray-400 mb-4">
            {currentIndex + 1} / {filtered.length}
          </div>

          {mode === "quiz" ? (
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{current.question}</h3>
              <div className="space-y-2">
                {(current.options ?? []).map((opt, i) => {
                  let optClass = "w-full text-left p-3 rounded-xl border text-sm transition-colors ";
                  if (showAnswer) {
                    if (opt === current.answer) {
                      optClass += "border-green-400 bg-green-50 text-green-800";
                    } else if (opt === selectedAnswer) {
                      optClass += "border-red-400 bg-red-50 text-red-800";
                    } else {
                      optClass += "border-gray-200 text-gray-500";
                    }
                  } else {
                    optClass += "border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-700";
                  }
                  return (
                    <button key={i} className={optClass} onClick={() => handleSelectAnswer(opt)}>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {showAnswer && (
                <button onClick={handleNext} className="btn-primary mt-4 w-full">
                  {currentIndex + 1 >= filtered.length ? "결과 보기" : "다음 →"}
                </button>
              )}
            </>
          ) : (
            <>
              <div
                className="min-h-[200px] flex items-center justify-center cursor-pointer rounded-xl border-2 border-dashed border-gray-200 hover:border-primary-300 transition-colors p-6"
                onClick={() => setShowAnswer(!showAnswer)}
              >
                {showAnswer ? (
                  <div className="text-center">
                    <p className="text-xs text-primary-500 mb-2">답</p>
                    <p className="text-lg font-medium text-gray-800">{current.answer}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-2">질문 (탭해서 뒤집기)</p>
                    <p className="text-lg font-medium text-gray-800">{current.question}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setShowAnswer(false);
                  handleNext();
                }}
                className="btn-primary mt-4 w-full"
              >
                {currentIndex + 1 >= filtered.length ? "완료" : "다음 카드 →"}
              </button>
            </>
          )}
        </div>
      )}

      {finished && mode === "quiz" && (
        <div className="card text-center">
          <p className="text-4xl mb-3">🎉</p>
          <h3 className="text-xl font-bold text-gray-800 mb-2">퀴즈 완료!</h3>
          <p className="text-lg text-gray-600">
            {filtered.length}개 중 <span className="text-primary-600 font-bold">{score}</span>개 정답
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button onClick={handleRestart} className="btn-primary">다시 풀기</button>
            <a href="/review" className="btn-secondary">리뷰로 돌아가기</a>
          </div>
        </div>
      )}

      {finished && mode === "flashcard" && (
        <div className="card text-center">
          <p className="text-4xl mb-3">✨</p>
          <h3 className="text-xl font-bold text-gray-800 mb-2">플래시카드 완료!</h3>
          <div className="mt-4 flex justify-center gap-2">
            <button onClick={handleRestart} className="btn-primary">다시 보기</button>
            <a href="/review" className="btn-secondary">리뷰로 돌아가기</a>
          </div>
        </div>
      )}
    </div>
  );
}
