from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.database import get_supabase
from app.models.schemas import QuizResponse, GenerateQuizzesRequest
from app.services.ai_service import generate_quizzes

router = APIRouter()


@router.get("", response_model=list[QuizResponse])
async def list_quizzes(review_id: str):
    db = get_supabase()
    result = db.table("quizzes").select("*").eq("review_id", review_id).execute()
    return result.data


@router.post("/generate", response_model=list[QuizResponse])
async def create_quizzes(req: GenerateQuizzesRequest):
    db = get_supabase()

    # Get review
    review = db.table("daily_reviews").select("*").eq("id", req.review_id).execute()
    if not review.data:
        raise HTTPException(status_code=404, detail="Review not found")
    review = review.data[0]

    # Get child info
    child = db.table("children").select("*").eq("id", review["child_id"]).execute()
    if not child.data:
        raise HTTPException(status_code=404, detail="Child not found")
    child = child.data[0]
    child_age = datetime.now().year - child["birth_year"]

    # Generate quizzes with AI
    try:
        quiz_data = await generate_quizzes(
            child_name=child["name"],
            child_age=child_age,
            review_summary=review["summary"],
            parent_guide=review["parent_guide"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"퀴즈 생성 실패: {str(e)}")

    # Save to DB
    rows = []
    for q in quiz_data:
        rows.append({
            "review_id": req.review_id,
            "question": q["question"],
            "answer": q["answer"],
            "options": q.get("options"),  # JSONB column accepts list directly
            "quiz_type": q["quiz_type"],
        })

    if rows:
        result = db.table("quizzes").insert(rows).execute()
        return result.data

    return []
