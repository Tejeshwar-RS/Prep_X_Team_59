import pdfplumber


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from a text-based PDF.
    Scanned PDFs are NOT supported.
    """
    text_chunks = []

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_chunks.append(page_text)

    return "\n".join(text_chunks)
