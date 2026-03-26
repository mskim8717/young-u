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

-- Storage bucket for PDFs
-- Run in Supabase dashboard: CREATE BUCKET 'uploads' WITH public = false;
