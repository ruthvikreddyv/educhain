from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import hashlib
import io
import requests
import pdfplumber
import re
import os
import subprocess

load_dotenv()

app = FastAPI(title="EduChain Backend", version="0.2.0")

# CORS for frontend
origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Pinata keys from environment
PINATA_API_KEY = os.getenv("PINATA_API_KEY")
PINATA_SECRET_KEY = os.getenv("PINATA_SECRET_KEY")

BLOCKCHAIN_SCRIPT = "../blockchain/scripts/register.js"

# ---------------------------------------------------
# Health Check
# ---------------------------------------------------

@app.get("/health")
async def health():
    return {"status": "ok", "service": "educhain-backend"}


# ---------------------------------------------------
# Blockchain Registration
# ---------------------------------------------------

def register_on_blockchain(doc_hash, ipfs_cid):
    try:
        result = subprocess.run(
            [
                "node",
                BLOCKCHAIN_SCRIPT,
                doc_hash,
                ipfs_cid
            ],
            capture_output=True,
            text=True
        )

        return result.stdout.strip()

    except Exception as e:
        return f"Blockchain registration failed: {str(e)}"


# ---------------------------------------------------
# Upload Certificate
# ---------------------------------------------------

@app.post("/upload")
async def upload_certificate(file: UploadFile = File(...)):

    if file.content_type != "application/pdf":
        return {"ok": False, "error": "Only PDF files are supported"}

    try:

        # Read file
        content = await file.read()

        # Generate SHA256
        sha256_hash = hashlib.sha256(content).hexdigest()

        # ---------------------------------------------------
        # Upload to IPFS (Pinata)
        # ---------------------------------------------------

        files = {"file": (file.filename, content, "application/pdf")}

        headers = {
            "pinata_api_key": PINATA_API_KEY,
            "pinata_secret_api_key": PINATA_SECRET_KEY,
        }

        response = requests.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            files=files,
            headers=headers,
        )

        ipfsCid = response.json()["IpfsHash"]

        # ---------------------------------------------------
        # Extract text from PDF
        # ---------------------------------------------------

        text = ""

        try:
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text() or ""
                    text += "\n" + page_text
        except Exception as e:
            print("PDF extraction error:", e)

        print("=== PDF TEXT SAMPLE ===")
        print(text[:1000])

        # ---------------------------------------------------
        # Detect document type
        # ---------------------------------------------------

        doc_type = "csvtu_sem"

        if "SSC" in text or "Marks Memo" in text:
            doc_type = "ssc_memo"
        elif "EXAM TYPE: Backlog" in text:
            doc_type = "csvtu_backlog"

        # ---------------------------------------------------
        # Regex Extraction
        # ---------------------------------------------------

        name_match = None
        inst_match = None
        degree_match = None
        gpa_match = None
        year_match = None

        if doc_type in ("csvtu_sem", "csvtu_backlog"):

            name_match = re.search(r"STUDENT NAME:\s*(.*?)\s+FATHER", text)
            inst_match = re.search(r"INSTITUTE NAME:\s*(.*?)\s+ABC", text)
            degree_match = re.search(r"COURSE / BRANCH:\s*(.*?)\s+EXAM SESSION", text)
            gpa_match = re.search(r"(SPI|CGPA|GPA)\s*:\s*([0-9]\.\d+)", text)
            year_match = re.search(r"SEM / LEVEL / YEAR:\s*(.*?)\s+EXAM TYPE", text)

        elif doc_type == "ssc_memo":

            name_match = re.search(
                r"(Student Name|Candidate Name|Name)\s*[:\-]\s*(.+)",
                text,
                re.IGNORECASE,
            )

            inst_match = re.search(
                r"(School Name|Institution|High School)\s*[:\-]\s*(.+)",
                text,
                re.IGNORECASE,
            )

            degree_match = re.search(
                r"(SSC|Secondary School Certificate|10th Class|X Class)[^,\n]*",
                text,
                re.IGNORECASE,
            )

            gpa_match = re.search(
                r"(GPA|CGPA|Percentage)\s*[:\-]\s*([0-9]{1,2}\.?\d*)",
                text,
                re.IGNORECASE,
            )

            year_match = re.search(
                r"(Year of Passing|Year)\s*[:\-]\s*([0-9]{4})",
                text,
                re.IGNORECASE,
            )

        # ---------------------------------------------------
        # Extract entities safely
        # ---------------------------------------------------

        entities = {
            "student_name": name_match.group(1).strip()
            if name_match and len(name_match.groups()) >= 1
            else "Unknown",

            "institution": inst_match.group(1).strip()
            if inst_match and len(inst_match.groups()) >= 1
            else "Unknown",

            "degree": degree_match.group(1).strip()
            if degree_match
            else "Unknown",

            "gpa": gpa_match.group(2).strip()
            if gpa_match and len(gpa_match.groups()) >= 2
            else "Unknown",

            "year": (
                year_match.group(1)
                if doc_type.startswith("csvtu") and year_match
                else year_match.group(2)
                if year_match and len(year_match.groups()) >= 2
                else "Unknown"
            ),
        }

        # ---------------------------------------------------
        # Generate Credential ID
        # ---------------------------------------------------

        credential_id = "EDCHN-" + sha256_hash[:12].upper()

        # ---------------------------------------------------
        # Register on Blockchain
        # ---------------------------------------------------

        blockchain_tx = register_on_blockchain(sha256_hash, ipfsCid)

        # ---------------------------------------------------
        # SAVE TO MEMORY
        # ---------------------------------------------------

        issued_db.append({
            "issuer": entities.get("student_name", "Unknown").split("FATHER")[0].strip(),
            "entities": entities,
            "ipfsCid": ipfsCid,
            "hash": sha256_hash,
            "fileName": file.filename
        })

        print("Stored in issued_db")

        # ---------------------------------------------------
        # Final Response
        # ---------------------------------------------------

        return {
            "ok": True,
            "credentialId": credential_id,
            "fileName": file.filename,
            "size": len(content),
            "docHashHex": sha256_hash,
            "ipfsCid": ipfsCid,
            "entities": entities,
            "blockchainTx": blockchain_tx,
            "message": "Certificate processed and registered.",
        }

    except Exception as e:

        return {
            "ok": False,
            "error": str(e)
        }


# ---------------------------------------------------
# Verification Endpoint
# ---------------------------------------------------

@app.get("/verify/{hash}")
async def verify_certificate(hash: str):

    return {
        "hash": hash,
        "verified": True,
        "message": "Certificate exists on blockchain (mock verification)."
    }
issued_db = []

@app.post("/store-issued")
async def store_issued(data: dict):
    issued_db.append(data)
    return {"ok": True}

@app.get("/issuer/{issuer}")
async def get_issuer_data(issuer: str):
    return [x for x in issued_db if x["issuer"] == issuer]