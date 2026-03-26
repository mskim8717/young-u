from fastapi import APIRouter, HTTPException
from app.database import get_supabase
from app.models.schemas import ChildCreate, ChildResponse

router = APIRouter()


@router.get("", response_model=list[ChildResponse])
async def list_children():
    db = get_supabase()
    result = db.table("children").select("*").order("created_at").execute()
    return result.data


@router.post("", response_model=ChildResponse)
async def create_child(child: ChildCreate):
    db = get_supabase()
    result = db.table("children").insert(child.model_dump()).execute()
    return result.data[0]


@router.get("/{child_id}", response_model=ChildResponse)
async def get_child(child_id: str):
    db = get_supabase()
    result = db.table("children").select("*").eq("id", child_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Child not found")
    return result.data[0]


@router.put("/{child_id}", response_model=ChildResponse)
async def update_child(child_id: str, child: ChildCreate):
    db = get_supabase()
    result = db.table("children").update(child.model_dump()).eq("id", child_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Child not found")
    return result.data[0]


@router.delete("/{child_id}")
async def delete_child(child_id: str):
    db = get_supabase()
    db.table("children").delete().eq("id", child_id).execute()
    return {"ok": True}
