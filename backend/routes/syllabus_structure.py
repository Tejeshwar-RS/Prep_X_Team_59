import json
import uuid
from pathlib import Path
from fastapi import APIRouter, Body, HTTPException
from core.syllabus_structurer import SyllabusStructurer

router = APIRouter(prefix="/api/syllabus", tags=["Syllabus Structure"])

STORAGE_DIR = Path("storage/syllabi")
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

structurer = SyllabusStructurer()


@router.post("/structure")
def structure_syllabus(syllabus_text: str = Body(..., embed=True)):
    if not syllabus_text.strip():
        raise HTTPException(status_code=400, detail="Empty syllabus text")

    try:
        structured = structurer.structure(syllabus_text)
    except Exception as e:
        print("[STRUCTURE ERROR]", e)
        raise HTTPException(status_code=500, detail=str(e))

    syllabus_id = str(uuid.uuid4())
    path = STORAGE_DIR / f"{syllabus_id}.json"

    with open(path, "w", encoding="utf-8") as f:
        json.dump(structured, f, indent=2)

    return {
        "syllabus_id": syllabus_id,
        "structured_syllabus": structured
    }
