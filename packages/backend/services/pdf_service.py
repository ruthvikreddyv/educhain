import pdfplumber
import io
import re

def extract_text_from_pdf(file_bytes):
    text = ""

    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""

    # Clean text
    text = re.sub(r'\s+', ' ', text).strip()

    return text