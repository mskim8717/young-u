from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.database import get_supabase
from app.models.schemas import TextbookResponse
from app.services.pdf_service import extract_text_from_pdf
from app.services.ai_service import summarize_text

router = APIRouter()


@router.get("", response_model=list[TextbookResponse])
async def list_textbooks(child_id: str):
    db = get_supabase()
    result = db.table("textbooks").select("*").eq("child_id", child_id).order("created_at", desc=True).execute()
    return result.data


@router.post("/upload", response_model=TextbookResponse)
async def upload_textbook(
    file: UploadFile = File(...),
    child_id: str = Form(...),
    title: str = Form(...),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="PDF 파일만 업로드 가능합니다")

    db = get_supabase()
    file_bytes = await file.read()

    # Upload to Supabase Storage
    file_url = ""
    try:
        storage_path = f"textbooks/{child_id}/{file.filename}"
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

    # AI Summarize
    summary = ""
    try:
        if extracted_text:
            summary = await summarize_text(extracted_text, "교재")
    except Exception:
        pass

    # Save to DB
    result = db.table("textbooks").insert({
        "child_id": child_id,
        "title": title,
        "file_url": file_url,
        "extracted_text": extracted_text,
        "summary": summary,
    }).execute()

    return result.data[0]


@router.delete("/{textbook_id}")
async def delete_textbook(textbook_id: str):
    db = get_supabase()
    db.table("textbooks").delete().eq("id", textbook_id).execute()
    return {"ok": True}
