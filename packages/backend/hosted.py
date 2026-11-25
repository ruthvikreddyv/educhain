"""Stateless document-processing backend for EduChain. No automatic publication."""
import hashlib, io, re
from fastapi import FastAPI, File, UploadFile, HTTPException
from pypdf import PdfReader

app = FastAPI(title="EduChain Document API", version="1.0")

@app.get("/")
@app.get("/health")
def health():
    return {"status":"ok","service":"educhain-document-api","mode":"transient PDF extraction"}

@app.post("/upload")
def process(file: UploadFile = File(...)):
    data = file.file.read(4*1024*1024+1)
    if len(data)>4*1024*1024:
        raise HTTPException(413,"PDF must be at most 4 MB")
    if not data.startswith(b"%PDF-"):
        raise HTTPException(422,"Expected a PDF")
    try:
        reader=PdfReader(io.BytesIO(data))
        if reader.is_encrypted or len(reader.pages)>30:
            raise HTTPException(422,"Encrypted or over 30 pages")
        text="\n".join((p.extract_text() or "")[:100000] for p in reader.pages)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(422,"PDF could not be parsed")
    patterns={
        "student_name":r"(?:STUDENT NAME|Candidate Name|Student Name)\s*[:\-]\s*([^\n]+?)(?=\s+FATHER|\n|$)",
        "institution":r"(?:INSTITUTE NAME|Institution|University Name|School Name)\s*[:\-]\s*([^\n]+?)(?=\s+ABC|\n|$)",
        "degree":r"(?:COURSE / BRANCH|Degree|Course)\s*[:\-]\s*([^\n]+?)(?=\s+EXAM SESSION|\n|$)",
        "gpa":r"(?:CGPA|GPA|SPI|Percentage)\s*[:\-]\s*([0-9]{1,3}(?:\.[0-9]+)?)",
        "year":r"(?:Year of Passing|Graduation Year|Year)\s*[:\-]\s*([0-9]{4})"
    }
    fields={}
    for k,pattern in patterns.items():
        match=re.search(pattern,text,re.I)
        fields[k]=match.group(1).strip()[:300] if match else None
    h=hashlib.sha256(data).hexdigest()
    return {"ok":True,"docHashHex":h,"credentialId":"EDCHN-"+h[:12].upper(),"entities":fields,"textExtracted":bool(text.strip()),"registered":False,"stored":False}
