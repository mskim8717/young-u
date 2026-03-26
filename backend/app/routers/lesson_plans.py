from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.database import get_supabase
from app.models.schemas import LessonPlanResponse
from app.services.pdf_service import extract_text_from_pdf
from app.services.ai_service import summarize_text

router = APIRouter()


@router.get("", response_model=list[LessonPlanResponse])
async def list_lesson_plans(child_id: str):
    db = get_supabase()
    result = db.table("lesson_plans").select("*").eq("child_id", child_id).order("week_start", desc=True).execute()
    return result.data


@router.post("/upload", response_model=LessonPlanResponse)
async def upload_lesson_plan(
    file: UploadFile = File(...),
    child_id: str = Form(...),
    title: str = Form(...),
    week_start: str = Form(...),
    week_end: str = Form(...),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="PDF 파일만 업로드 가능합니다")

    db = get_supabase()
    file_bytes = await file.read()

    # Upload to Supabase Storage (non-blocking on failure)
    file_url = ""
    try:
        storage_path = f"lesson-plans/{child_id}/{file.filename}"
        db.storage.from_("uploads").upload(storage_path, file_bytes, {"content-type": "application/pdf"})
        file_url = db.storage.from_("uploads").get_public_url(storage_path)
    except Exception:
        pass

    # Extract text from PDF
    extracted_text = ""
    try:
        extracted_text = await extract_text_from_pdf(file_bytes, file.filename)
    except Exception:
        pass

    # AI Summarize (skip if no API key or extraction failed)
    summary = ""
    try:
        if extracted_text:
            summary = await summarize_text(extracted_text, "주간 레슨 플랜")
    except Exception:
        pass

    # Save to DB
    result = db.table("lesson_plans").insert({
        "child_id": child_id,
        "title": title,
        "week_start": week_start,
        "week_end": week_end,
        "file_url": file_url,
        "extracted_text": extracted_text,
        "summary": summary,
    }).execute()

    return result.data[0]


@router.delete("/{plan_id}")
async def delete_lesson_plan(plan_id: str):
    db = get_supabase()
    db.table("lesson_plans").delete().eq("id", plan_id).execute()
    return {"ok": True}
