import requests
import os
from dotenv import load_dotenv

load_dotenv()

PINATA_API_KEY = os.getenv("PINATA_API_KEY")
PINATA_SECRET_API_KEY = os.getenv("PINATA_SECRET_API_KEY")

def upload_to_ipfs(file_bytes):
    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"

    files = {
        'file': ('certificate.pdf', file_bytes)
    }

    headers = {
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_SECRET_API_KEY
    }

    response = requests.post(url, files=files, headers=headers)

    if response.status_code != 200:
        raise Exception(f"IPFS upload failed: {response.text}")

    return response.json()["IpfsHash"]