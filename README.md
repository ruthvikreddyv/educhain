EduChain
A Decentralised Academic Certificate Verification Framework Integrating Blockchain, NLP, and IPFS

Tamper-evident credential authentication at scale — no institutional participation required.


Status: Paper under review at Future Generation Computer Systems


Overview
EduChain is an end-to-end academic certificate verification system that integrates three complementary technologies:

Ethereum smart contracts — immutable SHA-256 hash registration
Dual-model NLP pipeline — spaCy + Hugging Face BERT for automated credential field extraction
IPFS — persistent, content-addressed document storage

A key innovation is holder-initiated post-issuance registration, which allows verification of legacy certificates without requiring the original institution to participate — resolving the adoption barrier that has constrained prior blockchain credentialing systems.

Key Results
MetricValueWeighted avg. NLP F1-score0.883 (95% CI: [0.864, 0.902])Tamper-detection accuracy100% across 8 adversarial scenariosDataset size412 certificates, 5 countries, 6 layout categoriesLayer 2 cost per registration~USD 0.002 (Polygon PoS)Layer 2 throughput>1,000,000 registrations/dayPilot zero-correction rate90% (54/60 certificates)
EduChain statistically outperforms spaCy-only (0.841), BERT-only (0.857), and fine-tuned LayoutLM (0.871) baselines at p < 0.05.

Architecture
┌─────────────────────────────────────────────────────────────┐
│  Presentation Layer   ReactJS 18 · Tailwind CSS 3 · Web3.js │
├─────────────────────────────────────────────────────────────┤
│  Application Layer    Node.js 18 LTS · Express · Bull/Redis  │
├─────────────────────────────────────────────────────────────┤
│  NLP Microservice     Python 3.10 · FastAPI · spaCy · BERT   │
│                       PyMuPDF · Tesseract OCR 5.3            │
├──────────────────────────────┬──────────────────────────────┤
│  Storage Layer               │  Blockchain Layer             │
│  MongoDB 6.0 · IPFS (Pinata) │  Ethereum Sepolia · Sol 0.8  │
└──────────────────────────────┴──────────────────────────────┘

Verification invariant: MongoDB is never consulted during verification. All verification queries go directly to the smart contract — independence from EduChain's operational infrastructure is guaranteed.


Features

Dual-model NER extraction — spaCy (frozen RoBERTa backbone) with BERT fallback at confidence threshold τ = 0.75
Coordinate-aware preprocessing — 8-stage pipeline including column boundary detection and OCR noise correction
Spatial prior confidence adjustment — Gaussian KDE over normalised vertical page positions per field
Write-once smart contract — SHA-256 hashes stored immutably; verifyCertificate is a view function (zero gas)
Asynchronous registration — HTTP 202 Accepted immediately; Bull/Redis worker handles pipeline execution
Anomaly detection — flags missing fields, length violations, unparseable dates, out-of-range grades, and cross-field inconsistencies


Supported Certificate Fields
FieldEntity LabelHolder nameNAMEInstitutionINSTDegree titleDEGDate of awardDATEGrade / GPAGRADE

Performance by Layout Format
FormatDescriptionWeighted F1BERT Fallback RateALabelled single-column0.9415.7%BProse single-column0.89718.8%CTwo-column0.84937.6%DDecorative background0.82141.9%EHeavy watermark/seal0.80852.1%FMixed/non-standard0.79363.4%

Ablation Study
ConfigurationWeighted F1ΔFull EduChain0.883—Without preprocessing pipeline0.820−0.063Without spatial prior adjustment0.851−0.032Without OCR noise correction0.857−0.026Without BERT fallback0.862−0.021BERT only0.857−0.026Regex only0.737−0.146
Coordinate-aware preprocessing is the single highest-impact component.

Tech Stack
LayerTechnologiesFrontendReactJS 18, Tailwind CSS 3, Web3.js 4.0, MetaMaskBackendNode.js 18 LTS, Express, Bull 4.12, Redis 6.0NLPPython 3.10, FastAPI, spaCy 3.6, Transformers 4.30, PyMuPDF 1.22, Tesseract 5.3StorageMongoDB 6.0, IPFS via Pinata, go-ipfs 0.20BlockchainSolidity 0.8.17, Hardhat 2.17, Ethereum Sepolia testnet, Infura

Getting Started
Prerequisites

Node.js 18 LTS
Python 3.10
Docker & Docker Compose
MetaMask browser extension
Infura project ID (or equivalent RPC endpoint)
Pinata API key (for IPFS pinning)

Quickstart (Docker Compose)
bashgit clone https://github.com/ruthvikreddyv/educhain.git
cd educhain
cp .env.example .env          # fill in your API keys
docker compose up --build
The UI will be available at http://localhost:3000.
Manual Setup
bash# 1. Install backend dependencies
cd backend && npm install

# 2. Install NLP microservice dependencies
cd nlp && pip install -r requirements.txt
python -m spacy download en_core_web_trf

# 3. Install frontend dependencies
cd frontend && npm install

# 4. Deploy smart contract (Sepolia testnet)
cd contracts && npx hardhat deploy --network sepolia

# 5. Start services
npm run dev          # backend + frontend
uvicorn main:app     # NLP microservice

Smart Contract
solidity// registerCertificate — 78,412 gas
function registerCertificate(bytes32 hash, string calldata ipfsCid) external

// verifyCertificate — 0 gas (view)
function verifyCertificate(bytes32 hash) external view returns (CertificateRecord memory)
Registration is write-once: re-registering an existing hash reverts. Verification is always free.

Blockchain Cost Summary
NetworkCost per RegistrationEthereum Mainnet (30 Gwei)~USD 5.88Ethereum Mainnet (10 Gwei)~USD 1.96Polygon PoS (Layer 2)~USD 0.002
Recommendation: Use Polygon PoS or another Layer 2 for institutional deployment.

Security Notes
ThreatStatusReplay attacks✅ Mitigated — write-once require guard reverts duplicate registrationsTamper detection✅ Full-binary SHA-256 detects metadata-only and content modificationsFront-running⚠️ Commit-reveal scheme planned for mainnetContract upgradability⚠️ OpenZeppelin upgradeable proxy planned for mainnetRegistrant identity⚠️ Institutional DID integration required for full trust closure

Dataset
The EduChain dataset comprises 412 certificates across:

5 countries (India, UK, USA, Germany, Australia)
6 layout format categories
7 degree types
348 native digital PDFs + 64 OCR-processed scanned documents

Split: 288 train / 62 validation / 62 test (stratified by format and country).
Average inter-annotator Cohen's κ = 0.905; all field-level κ ≥ 0.85.

Known Limitations

Dataset scale — Format E (8 test) and Format F (5 test) sub-samples are too small for reliable sub-category estimation; expansion to 1,000+ certificates is the top priority.
Language — Validated on English-language certificates only.
GPU models — LayoutLMv3 and Donut excluded due to CPU-only hardware constraints; GPU evaluation is planned.
OCR degradation — Accuracy on scans below 150 DPI or skew > 5° is not yet systematically characterised.
Legal status — No regulatory authority has established the evidentiary weight of blockchain hash comparison in employment or admissions decisions.


Roadmap

Dataset expansion to 1,000+ certificates
LayoutLMv3 and Donut evaluation on GPU infrastructure
Systematic OCR characterisation as a function of scan quality
Commit-reveal front-running mitigation for mainnet
W3C Verifiable Credentials compliance
Zero-knowledge proofs for selective disclosure (zk-SNARKs via snarkjs/circom)


Citation
This work is currently under review. A citation will be added upon publication.

Authors

Ruthvik Reddy Veerannagari — Conceptualisation, Methodology, Software, Data curation, Formal analysis, Writing (ruthvikreddyv@gmail.com)
Divya Shukla (Corresponding author) — Supervision, Validation, Writing review & editing (divyashukla.cse@csvtu.ac.in)

Department of Computer Science & Engineering
Chhattisgarh Swami Vivekanand Technical University, Bhilai, India

License
See LICENSE for details.

Academic credential fraud costs employers, institutions, and society. EduChain makes verification instant, tamper-proof, and institution-independent.
