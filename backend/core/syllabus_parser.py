import io
import pdfplumber
import pytesseract
from PIL import Image


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts clean text from a PDF.
    Uses OCR fallback if normal extraction fails.
    """

    extracted_text = ""

    # 1️⃣ Try normal text extraction
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"

    # If text looks valid, return it
    if len(extracted_text.strip()) > 300:
        return clean_text(extracted_text)

    # 2️⃣ OCR fallback (scanned PDFs)
    ocr_text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            image = page.to_image(resolution=300).original
            ocr_text += pytesseract.image_to_string(image)

    return clean_text(ocr_text)


def clean_text(text: str) -> str:
    """
    Cleans raw extracted text.
    """
    lines = text.splitlines()
    cleaned_lines = []

    for line in lines:
        line = line.strip()
        if line:
            cleaned_lines.append(line)

    return "\n".join(cleaned_lines)
