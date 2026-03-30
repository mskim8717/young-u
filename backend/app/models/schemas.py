from pydantic import BaseModel
from datetime import date
from typing import Optional


class ChildCreate(BaseModel):
    name: str
    birth_year: int


class ChildResponse(BaseModel):
    id: str
    name: str
    birth_year: int
    created_at: str


class DailyNoticeCreate(BaseModel):
    child_id: str
    date: date
    content: str


class DailyNoticeResponse(BaseModel):
    id: str
    child_id: str
    date: str
    content: str
    summary: Optional[str] = None
    created_at: str


class LessonPlanResponse(BaseModel):
    id: str
    child_id: str
    title: str
    week_start: str
    week_end: str
    file_url: Optional[str] = None
    extracted_text: Optional[str] = None
    summary: Optional[str] = None
    created_at: str


class TextbookResponse(BaseModel):
    id: str
    child_id: str
    title: str
    file_url: Optional[str] = None
    extracted_text: Optional[str] = None
    summary: Optional[str] = None
    created_at: str


class DailyReviewResponse(BaseModel):
    id: str
    child_id: str
    date: str
    summary: str
    parent_guide: str
    created_at: str


class QuizResponse(BaseModel):
    id: str
    review_id: str
    question: str
    answer: str
    options: Optional[list[str]] = None
    quiz_type: str
    created_at: str


class GenerateReviewRequest(BaseModel):
    child_id: str
    date: str


class GenerateQuizzesRequest(BaseModel):
    review_id: str


class LearningSessionResponse(BaseModel):
    id: str
    child_id: str
    date: str
    stars_earned: int
    activities_completed: int
    total_activities: int
    completed_at: Optional[str] = None
    created_at: str
    activities: list["LearningActivityResponse"] = []


class LearningActivityResponse(BaseModel):
    id: str
    session_id: str
    activity_type: str
    question: str
    answer: str
    options: Optional[list] = None
    hint: Optional[str] = None
    emoji_cue: Optional[str] = None
    is_completed: bool
    is_correct: Optional[bool] = None
    display_order: int
    created_at: str


class CompleteActivityRequest(BaseModel):
    activity_id: str
    is_correct: bool


class LearningStatsResponse(BaseModel):
    current_streak: int
    longest_streak: int
    total_stars: int
    last_activity_date: Optional[str] = None


class ChildSummaryResponse(BaseModel):
    summary: str
    encouragement: str
