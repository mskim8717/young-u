from fastapi import APIRouter, HTTPException
from datetime import datetime, date
from app.database import get_supabase
from app.models.schemas import DailyReviewResponse, GenerateReviewRequest
from app.services.ai_service import generate_daily_review

router = APIRouter()


@router.get("/{child_id}/{date}", response_model=DailyReviewResponse)
async def get_review(child_id: str, date: str):
    db = get_supabase()
    result = (
        db.table("daily_reviews")
        .select("*")
        .eq("child_id", child_id)
        .eq("date", date)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Review not found")
    return result.data[0]


@router.get("/{child_id}", response_model=list[DailyReviewResponse])
async def list_reviews(child_id: str):
    db = get_supabase()
    result = (
        db.table("daily_reviews")
        .select("*")
        .eq("child_id", child_id)
        .order("date", desc=True)
        .limit(30)
        .execute()
    )
    return result.data


@router.post("/generate", response_model=DailyReviewResponse)
async def generate_review(req: GenerateReviewRequest):
    db = get_supabase()

    # Get child info
    child = db.table("children").select("*").eq("id", req.child_id).execute()
    if not child.data:
        raise HTTPException(status_code=404, detail="Child not found")
    child = child.data[0]
    child_age = datetime.now().year - child["birth_year"]

    # Get today's notice
    notices = (
        db.table("daily_notices")
        .select("content")
        .eq("child_id", req.child_id)
        .eq("date", req.date)
        .execute()
    )
    notice_content = notices.data[0]["content"] if notices.data else ""

    # Get current week's lesson plan
    lesson_plans = (
        db.table("lesson_plans")
        .select("summary")
        .eq("child_id", req.child_id)
        .lte("week_start", req.date)
        .gte("week_end", req.date)
        .execute()
    )
    lesson_summary = lesson_plans.data[0]["summary"] if lesson_plans.data else ""

    # Get textbook summaries
    textbooks = (
        db.table("textbooks")
        .select("summary")
        .eq("child_id", req.child_id)
        .execute()
    )
    textbook_summaries = [t["summary"] for t in textbooks.data if t.get("summary")]

    # Generate with AI
    review_data = await generate_daily_review(
        child_name=child["name"],
        child_age=child_age,
        date=req.date,
        notice_content=notice_content,
        lesson_plan_summary=lesson_summary,
        textbook_summaries=textbook_summaries,
    )

    # Upsert to DB
    result = db.table("daily_reviews").upsert({
        "child_id": req.child_id,
        "date": req.date,
        "summary": review_data["summary"],
        "parent_guide": review_data["parent_guide"],
    }).execute()

    return result.data[0]
