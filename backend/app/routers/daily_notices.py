from fastapi import APIRouter, HTTPException
from app.database import get_supabase
from app.models.schemas import DailyNoticeCreate, DailyNoticeResponse
from app.services.ai_service import summarize_text

router = APIRouter()


@router.get("", response_model=list[DailyNoticeResponse])
async def list_daily_notices(child_id: str):
    db = get_supabase()
    result = db.table("daily_notices").select("*").eq("child_id", child_id).order("date", desc=True).execute()
    return result.data


@router.post("", response_model=DailyNoticeResponse)
async def create_daily_notice(notice: DailyNoticeCreate):
    db = get_supabase()

    # AI Summarize the notice
    summary = ""
    try:
        summary = await summarize_text(notice.content, "알림장")
    except Exception:
        pass

    result = db.table("daily_notices").insert({
        "child_id": notice.child_id,
        "date": notice.date.isoformat(),
        "content": notice.content,
        "summary": summary,
    }).execute()

    return result.data[0]


@router.get("/{notice_id}", response_model=DailyNoticeResponse)
async def get_daily_notice(notice_id: str):
    db = get_supabase()
    result = db.table("daily_notices").select("*").eq("id", notice_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Notice not found")
    return result.data[0]


@router.delete("/{notice_id}")
async def delete_daily_notice(notice_id: str):
    db = get_supabase()
    db.table("daily_notices").delete().eq("id", notice_id).execute()
    return {"ok": True}
