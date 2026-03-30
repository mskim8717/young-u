from datetime import datetime, date
from fastapi import APIRouter, HTTPException
from app.database import get_supabase
from app.models.schemas import (
    LearningSessionResponse,
    LearningActivityResponse,
    CompleteActivityRequest,
    LearningStatsResponse,
    ChildSummaryResponse,
)
from app.services.ai_service import generate_child_summary, generate_learning_activities

router = APIRouter()


@router.get("/today/{child_id}", response_model=LearningSessionResponse)
async def get_today_session(child_id: str):
    db = get_supabase()
    today = date.today().isoformat()

    # Check existing session
    result = (
        db.table("learning_sessions")
        .select("*")
        .eq("child_id", child_id)
        .eq("date", today)
        .execute()
    )

    if result.data:
        session = result.data[0]
        # Get activities
        activities = (
            db.table("learning_activities")
            .select("*")
            .eq("session_id", session["id"])
            .order("display_order")
            .execute()
        )
        session["activities"] = activities.data
        return session

    # No session yet — generate one if review exists
    review = (
        db.table("daily_reviews")
        .select("*")
        .eq("child_id", child_id)
        .eq("date", today)
        .execute()
    )

    if not review.data:
        # Try yesterday or most recent review
        review = (
            db.table("daily_reviews")
            .select("*")
            .eq("child_id", child_id)
            .order("date", desc=True)
            .limit(1)
            .execute()
        )

    if not review.data:
        raise HTTPException(status_code=404, detail="리뷰가 없어요. 먼저 알림장을 입력하고 리뷰를 생성해주세요!")

    review_data = review.data[0]

    # Get child info
    child = db.table("children").select("*").eq("id", child_id).execute()
    if not child.data:
        raise HTTPException(status_code=404, detail="Child not found")
    child = child.data[0]
    child_age = datetime.now().year - child["birth_year"]

    # Generate activities with AI
    try:
        activity_data = await generate_learning_activities(
            child_name=child["name"],
            child_age=child_age,
            review_summary=review_data["summary"],
        )
    except Exception:
        activity_data = []

    # Create session
    session_result = db.table("learning_sessions").insert({
        "child_id": child_id,
        "date": today,
        "total_activities": len(activity_data),
    }).execute()
    session = session_result.data[0]

    # Save activities
    activities = []
    for i, act in enumerate(activity_data):
        row = {
            "session_id": session["id"],
            "activity_type": act.get("activity_type", "multiple_choice"),
            "question": act.get("question", ""),
            "answer": act.get("answer", ""),
            "options": act.get("options"),
            "hint": act.get("hint"),
            "emoji_cue": act.get("emoji_cue"),
            "display_order": i,
        }
        activities.append(row)

    if activities:
        act_result = db.table("learning_activities").insert(activities).execute()
        session["activities"] = act_result.data
    else:
        session["activities"] = []

    return session


@router.get("/summary/{child_id}/{date}")
async def get_child_summary(child_id: str, date: str):
    db = get_supabase()

    child = db.table("children").select("*").eq("id", child_id).execute()
    if not child.data:
        raise HTTPException(status_code=404, detail="Child not found")
    child = child.data[0]
    child_age = datetime.now().year - child["birth_year"]

    # Get notice
    notices = (
        db.table("daily_notices")
        .select("content")
        .eq("child_id", child_id)
        .eq("date", date)
        .execute()
    )
    notice_content = notices.data[0]["content"] if notices.data else ""

    # Get lesson plan
    lesson_plans = (
        db.table("lesson_plans")
        .select("summary")
        .eq("child_id", child_id)
        .lte("week_start", date)
        .gte("week_end", date)
        .execute()
    )
    lesson_summary = lesson_plans.data[0]["summary"] if lesson_plans.data else ""

    # If no data at all, use most recent review
    if not notice_content and not lesson_summary:
        review = (
            db.table("daily_reviews")
            .select("summary")
            .eq("child_id", child_id)
            .order("date", desc=True)
            .limit(1)
            .execute()
        )
        if review.data:
            notice_content = review.data[0]["summary"]

    try:
        result = await generate_child_summary(
            child_name=child["name"],
            child_age=child_age,
            notice_content=notice_content,
            lesson_summary=lesson_summary,
        )
        return result
    except Exception:
        return {
            "summary": f"{child['name']}아, 오늘도 재미있게 배웠어! 🌟",
            "encouragement": "최고야! 같이 복습해보자! ⭐",
        }


@router.post("/complete")
async def complete_activity(req: CompleteActivityRequest):
    db = get_supabase()

    # Update activity
    db.table("learning_activities").update({
        "is_completed": True,
        "is_correct": req.is_correct,
    }).eq("id", req.activity_id).execute()

    # Get activity to find session
    activity = db.table("learning_activities").select("session_id").eq("id", req.activity_id).execute()
    if not activity.data:
        raise HTTPException(status_code=404, detail="Activity not found")

    session_id = activity.data[0]["session_id"]

    # Count completed activities
    all_activities = (
        db.table("learning_activities")
        .select("is_completed, is_correct")
        .eq("session_id", session_id)
        .execute()
    )

    completed = sum(1 for a in all_activities.data if a["is_completed"])
    stars = sum(1 for a in all_activities.data if a["is_correct"])
    total = len(all_activities.data)

    update_data = {
        "activities_completed": completed,
        "stars_earned": stars,
    }

    # All done?
    if completed >= total:
        update_data["completed_at"] = datetime.now().isoformat()

        # Update streak
        session = db.table("learning_sessions").select("child_id").eq("id", session_id).execute()
        if session.data:
            child_id = session.data[0]["child_id"]
            await _update_streak(db, child_id, stars)

    db.table("learning_sessions").update(update_data).eq("id", session_id).execute()

    return {"completed": completed, "total": total, "stars": stars}


async def _update_streak(db, child_id: str, new_stars: int):
    today = date.today()

    streak = db.table("learning_streaks").select("*").eq("child_id", child_id).execute()

    if streak.data:
        s = streak.data[0]
        last_date = date.fromisoformat(s["last_activity_date"]) if s["last_activity_date"] else None

        if last_date == today:
            # Already updated today
            db.table("learning_streaks").update({
                "total_stars": s["total_stars"] + new_stars,
            }).eq("child_id", child_id).execute()
        elif last_date and (today - last_date).days == 1:
            # Consecutive day
            new_streak = s["current_streak"] + 1
            db.table("learning_streaks").update({
                "current_streak": new_streak,
                "longest_streak": max(new_streak, s["longest_streak"]),
                "last_activity_date": today.isoformat(),
                "total_stars": s["total_stars"] + new_stars,
            }).eq("child_id", child_id).execute()
        else:
            # Streak broken
            db.table("learning_streaks").update({
                "current_streak": 1,
                "last_activity_date": today.isoformat(),
                "total_stars": s["total_stars"] + new_stars,
            }).eq("child_id", child_id).execute()
    else:
        # First time
        db.table("learning_streaks").insert({
            "child_id": child_id,
            "current_streak": 1,
            "longest_streak": 1,
            "last_activity_date": today.isoformat(),
            "total_stars": new_stars,
        }).execute()


@router.get("/stats/{child_id}", response_model=LearningStatsResponse)
async def get_stats(child_id: str):
    db = get_supabase()
    result = db.table("learning_streaks").select("*").eq("child_id", child_id).execute()

    if result.data:
        s = result.data[0]
        return {
            "current_streak": s["current_streak"],
            "longest_streak": s["longest_streak"],
            "total_stars": s["total_stars"],
            "last_activity_date": s["last_activity_date"],
        }

    return {
        "current_streak": 0,
        "longest_streak": 0,
        "total_stars": 0,
        "last_activity_date": None,
    }
