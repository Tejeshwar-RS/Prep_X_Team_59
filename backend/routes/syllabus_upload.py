import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from core.ocr import extract_text_from_pdf

router = APIRouter(prefix="/api/syllabus", tags=["Syllabus Upload"])

UPLOAD_DIR = Path("storage/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload")
def upload_syllabus(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_id = f"{uuid.uuid4()}.pdf"
    file_path = UPLOAD_DIR / file_id

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    text = extract_text_from_pdf(str(file_path))

    if not text or len(text.strip()) < 200:
        raise HTTPException(
            status_code=400,
            detail=(
                "Failed to extract text. "
                "This PDF may be scanned (image-only)."
            )
        )

    return {
        "file_id": file_id,
        "extracted_text": text
    }
