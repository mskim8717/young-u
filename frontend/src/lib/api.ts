const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || res.statusText);
  }
  return res.json();
}

export const api = {
  // Children
  getChildren: () => request<Child[]>("/api/children"),
  createChild: (data: CreateChild) =>
    request<Child>("/api/children", { method: "POST", body: JSON.stringify(data) }),
  updateChild: (id: string, data: Partial<CreateChild>) =>
    request<Child>(`/api/children/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // Textbooks
  getTextbooks: (childId: string) => request<Textbook[]>(`/api/textbooks?child_id=${childId}`),
  uploadTextbook: (childId: string, file: File, title: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("child_id", childId);
    form.append("title", title);
    return fetch(`${API_BASE}/api/textbooks/upload`, { method: "POST", body: form }).then((r) => r.json());
  },

  // Lesson Plans
  getLessonPlans: (childId: string) => request<LessonPlan[]>(`/api/lesson-plans?child_id=${childId}`),
  uploadLessonPlan: (childId: string, file: File, title: string, weekStart: string, weekEnd: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("child_id", childId);
    form.append("title", title);
    form.append("week_start", weekStart);
    form.append("week_end", weekEnd);
    return fetch(`${API_BASE}/api/lesson-plans/upload`, { method: "POST", body: form }).then((r) => r.json());
  },

  // Daily Notices
  getDailyNotices: (childId: string) => request<DailyNotice[]>(`/api/daily-notices?child_id=${childId}`),
  createDailyNotice: (data: CreateDailyNotice) =>
    request<DailyNotice>("/api/daily-notices", { method: "POST", body: JSON.stringify(data) }),

  // Reviews
  getDailyReview: (childId: string, date: string) =>
    request<DailyReview>(`/api/reviews/${childId}/${date}`),
  generateReview: (childId: string, date: string) =>
    request<DailyReview>(`/api/reviews/generate`, { method: "POST", body: JSON.stringify({ child_id: childId, date }) }),

  // Quizzes
  getQuizzes: (reviewId: string) => request<Quiz[]>(`/api/quizzes?review_id=${reviewId}`),
  generateQuizzes: (reviewId: string) =>
    request<Quiz[]>(`/api/quizzes/generate`, { method: "POST", body: JSON.stringify({ review_id: reviewId }) }),

  // Learning
  getTodaySession: (childId: string) =>
    request<LearningSession>(`/api/learning/today/${childId}`),
  getChildSummary: (childId: string, date: string) =>
    request<ChildSummary>(`/api/learning/summary/${childId}/${date}`),
  completeActivity: (activityId: string, isCorrect: boolean) =>
    request<{ completed: number; total: number; stars: number }>(`/api/learning/complete`, {
      method: "POST", body: JSON.stringify({ activity_id: activityId, is_correct: isCorrect }),
    }),
  getLearningStats: (childId: string) =>
    request<LearningStats>(`/api/learning/stats/${childId}`),
};

// Types
export interface Child {
  id: string;
  name: string;
  birth_year: number;
  created_at: string;
}

export interface CreateChild {
  name: string;
  birth_year: number;
}

export interface Textbook {
  id: string;
  child_id: string;
  title: string;
  file_url: string;
  extracted_text: string;
  summary: string;
  created_at: string;
}

export interface LessonPlan {
  id: string;
  child_id: string;
  title: string;
  week_start: string;
  week_end: string;
  file_url: string;
  extracted_text: string;
  summary: string;
  created_at: string;
}

export interface CreateDailyNotice {
  child_id: string;
  date: string;
  content: string;
}

export interface DailyNotice {
  id: string;
  child_id: string;
  date: string;
  content: string;
  summary: string;
  created_at: string;
}

export interface DailyReview {
  id: string;
  child_id: string;
  date: string;
  summary: string;
  parent_guide: string;
  created_at: string;
}

export interface Quiz {
  id: string;
  review_id: string;
  question: string;
  answer: string;
  options?: string[];
  quiz_type: "quiz" | "flashcard";
  created_at: string;
}

export interface LearningSession {
  id: string;
  child_id: string;
  date: string;
  stars_earned: number;
  activities_completed: number;
  total_activities: number;
  completed_at: string | null;
  activities: LearningActivity[];
}

export interface LearningActivity {
  id: string;
  session_id: string;
  activity_type: "ox" | "multiple_choice" | "fill_blank" | "flashcard" | "word_match";
  question: string;
  answer: string;
  options?: any;
  hint?: string;
  emoji_cue?: string;
  is_completed: boolean;
  is_correct?: boolean;
  display_order: number;
}

export interface ChildSummary {
  summary: string;
  encouragement: string;
}

export interface LearningStats {
  current_streak: number;
  longest_streak: number;
  total_stars: number;
  last_activity_date: string | null;
}
