-- Young-U Database Schema

-- Children table
CREATE TABLE children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  birth_year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Textbooks (PDF uploads)
CREATE TABLE textbooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT,
  extracted_text TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly Lesson Plans (PDF uploads)
CREATE TABLE lesson_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  file_url TEXT,
  extracted_text TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Notices (text input)
CREATE TABLE daily_notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Reviews (AI-generated)
CREATE TABLE daily_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  summary TEXT NOT NULL,
  parent_guide TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, date)
);

-- Quizzes & Flashcards (AI-generated)
CREATE TABLE quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES daily_reviews(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  options JSONB,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('quiz', 'flashcard')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_textbooks_child ON textbooks(child_id);
CREATE INDEX idx_lesson_plans_child ON lesson_plans(child_id);
CREATE INDEX idx_lesson_plans_week ON lesson_plans(child_id, week_start, week_end);
CREATE INDEX idx_daily_notices_child_date ON daily_notices(child_id, date);
CREATE INDEX idx_daily_reviews_child_date ON daily_reviews(child_id, date);
CREATE INDEX idx_quizzes_review ON quizzes(review_id);

-- Learning Sessions (아이 학습 세션)
CREATE TABLE learning_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  stars_earned INTEGER DEFAULT 0,
  activities_completed INTEGER DEFAULT 0,
  total_activities INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, date)
);

-- Learning Activities (개별 학습 활동)
CREATE TABLE learning_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES learning_sessions(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('ox', 'multiple_choice', 'fill_blank', 'flashcard', 'word_match')),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  options JSONB,
  hint TEXT,
  emoji_cue TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  is_correct BOOLEAN,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning Streaks (연속 학습 기록)
CREATE TABLE learning_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_stars INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id)
);

CREATE INDEX idx_learning_sessions_child_date ON learning_sessions(child_id, date);
CREATE INDEX idx_learning_activities_session ON learning_activities(session_id);

-- Storage bucket for PDFs
-- Run in Supabase dashboard: CREATE BUCKET 'uploads' WITH public = false;
