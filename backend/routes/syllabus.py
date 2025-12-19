from fastapi import APIRouter, UploadFile, File, HTTPException
from core.syllabus_parser import extract_text_from_pdf

router = APIRouter(prefix="/api/syllabus", tags=["Syllabus"])


@router.post("/upload")
async def upload_syllabus(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_bytes = await file.read()
    text = extract_text_from_pdf(file_bytes)

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="Failed to extract text from syllabus"
        )

    return {
        "message": "Syllabus processed successfully",
        "preview": text[:1200]  # return only preview for now
    }
