# EduChain: A Decentralised Academic Certificate Verification Framework

**Tamper-evident academic credential verification using Blockchain, NLP, and IPFS.**

## Overview

EduChain is an end-to-end academic certificate verification framework integrating:

* **Blockchain** — immutable SHA-256 certificate-hash registration and verification.
* **NLP** — automated certificate-field extraction using spaCy with a BERT fallback.
* **IPFS** — content-addressed certificate storage.

A key contribution is **holder-initiated post-issuance registration**, enabling legacy certificates to be registered and verified without requiring the issuing institution to participate.

## Key Results

| Metric                     |                          Result |
| -------------------------- | ------------------------------: |
| Weighted-average NLP F1    | **0.883** (95% CI: 0.864–0.902) |
| Tamper-detection accuracy  |     **100%** across 8 scenarios |
| Dataset                    |            **412 certificates** |
| Countries                  |                           **5** |
| Layout categories          |                           **6** |
| Pilot zero-correction rate |                 **90% (54/60)** |
| Layer-2 registration cost  |                  **~USD 0.002** |

EduChain outperforms the evaluated **spaCy-only (0.841), BERT-only (0.857), and fine-tuned LayoutLM (0.871)** baselines (*p* < 0.05).

## Architecture

```text
┌───────────────────────────────────────────────────────────┐
│ Presentation │ ReactJS · Tailwind CSS · Web3.js           │
├───────────────────────────────────────────────────────────┤
│ Application  │ Node.js · Express · Bull · Redis           │
├───────────────────────────────────────────────────────────┤
│ NLP          │ FastAPI · spaCy · BERT · PyMuPDF · OCR     │
├───────────────────────┬───────────────────────────────────┤
│ Storage               │ Blockchain                        │
│ MongoDB · IPFS        │ Ethereum Sepolia · Solidity       │
└───────────────────────┴───────────────────────────────────┘
```

**Verification invariant:** MongoDB is never consulted during verification. Verification queries are performed directly against the smart contract.

## Core Features

* Dual-model NER extraction with BERT fallback at **τ = 0.75**
* Coordinate-aware document preprocessing
* OCR noise correction and spatial-prior adjustment
* SHA-256 hash-based tamper detection
* Write-once smart-contract registration
* Gas-free read-only verification
* Asynchronous certificate registration using Bull/Redis
* Automated anomaly and cross-field consistency detection

### Supported Fields

`NAME` · `INST` · `DEG` · `DATE` · `GRADE`

## Ablation Study

| Configuration          | Weighted F1 |
| ---------------------- | ----------: |
| **Full EduChain**      |   **0.883** |
| Without preprocessing  |       0.820 |
| Without spatial prior  |       0.851 |
| Without OCR correction |       0.857 |
| Without BERT fallback  |       0.862 |
| BERT only              |       0.857 |
| Regex only             |       0.737 |

Coordinate-aware preprocessing produces the largest performance improvement.

## Technology Stack

**Frontend:** ReactJS 18, Tailwind CSS 3, Web3.js 4
**Backend:** Node.js 18, Express, Bull, Redis
**NLP:** Python 3.10, FastAPI, spaCy 3.6, Transformers 4.30
**Document Processing:** PyMuPDF, Tesseract OCR 5.3
**Storage:** MongoDB 6.0, IPFS/Pinata
**Blockchain:** Solidity 0.8.17, Hardhat 2.17, Ethereum Sepolia

## Getting Started

### Prerequisites

* Node.js 18
* Python 3.10
* Docker & Docker Compose
* MetaMask
* Infura/RPC endpoint
* Pinata API credentials

### Docker

```bash
git clone https://github.com/ruthvikreddyv/educhain.git
cd educhain
cp .env.example .env
docker compose up --build
```

Open `http://localhost:3000`.

### Manual Setup

```bash
cd backend && npm install

cd ../nlp
pip install -r requirements.txt
python -m spacy download en_core_web_trf

cd ../frontend
npm install

cd ../contracts
npx hardhat deploy --network sepolia
```

## Smart Contract

```solidity
function registerCertificate(
    bytes32 hash,
    string calldata ipfsCid
) external;

function verifyCertificate(
    bytes32 hash
) external view returns (CertificateRecord memory);
```

Registration is **write-once**; duplicate hashes are rejected. Verification is a read-only operation and requires no gas.

## Dataset

The evaluation dataset contains **412 certificates**:

* 5 countries
* 6 layout categories
* 7 degree types
* 348 native digital PDFs
* 64 scanned/OCR documents

**Split:** 288 training / 62 validation / 62 test

Average inter-annotator agreement: **Cohen's κ = 0.905**.

## Limitations

* Evaluation is currently limited to English certificates.
* Format E and F contain small test subsets.
* LayoutLMv3 and Donut require GPU-based evaluation.
* OCR robustness for low-resolution and skewed scans requires further study.
* Legal/regulatory acceptance of blockchain-based verification has not been established.

## Roadmap

* Expand dataset to 1,000+ certificates
* Evaluate LayoutLMv3 and Donut
* Extend multilingual support
* Improve OCR robustness
* Add institutional DIDs and W3C Verifiable Credentials
* Implement commit-reveal protection
* Investigate zero-knowledge proofs for selective disclosure

## Authors

**Ruthvik Reddy Veerannagari** — Conceptualisation, Methodology, Software, Data Curation, Formal Analysis, Writing

**Divya Shukla** — Corresponding Author; Supervision, Validation, Writing — Review & Editing

**Department of Computer Science & Engineering**
Chhattisgarh Swami Vivekanand Technical University, Bhilai, India

## Citation

This work is currently under peer review. Citation details will be added after publication.

## License

See `LICENSE` for details.
