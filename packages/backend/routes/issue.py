from fastapi import APIRouter, UploadFile, File, HTTPException
from services.pdf_service import extract_text_from_pdf
from services.hash_service import generate_hash
from services.ipfs_service import upload_to_ipfs

router = APIRouter()

@router.post("/issue-certificate")
async def issue_certificate(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        # Extract text
        text = extract_text_from_pdf(contents)

        if not text:
            raise HTTPException(status_code=400, detail="Text extraction failed")

        # Generate hash
        cert_hash = generate_hash(text)

        # Upload to IPFS
        cid = upload_to_ipfs(contents)

        return {
            "status": "success",
            "certificate_hash": cert_hash,
            "ipfs_cid": cid
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))