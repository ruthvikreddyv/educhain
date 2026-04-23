📘 EduChain: Enhancing Academic Trust through Blockchain and NLP
🚀 Overview

EduChain is a decentralized academic credential verification system designed to eliminate fraud, automate validation, and ensure trust in educational documents.

It combines:

Blockchain (Ethereum) → Immutable credential storage
NLP (SpaCy / Transformers) → Intelligent data extraction from certificates
IPFS → Decentralized file storage
Full-stack architecture → Scalable and user-friendly platform
🎯 Problem Statement

Traditional academic verification systems suffer from:

Manual verification delays
High fraud rates (fake certificates)
Lack of interoperability between institutions
Centralized, insecure storage
💡 Solution

EduChain provides:

Automated certificate verification using NLP
Tamper-proof credential storage on blockchain
Decentralized document storage via IPFS
Real-time verification for employers and institutions
🏗️ System Architecture
User → Upload Certificate (PDF)
        ↓
Backend (FastAPI / Node.js)
        ↓
NLP Engine (SpaCy / Transformers)
        ↓
Extracted Data + Validation
        ↓
IPFS Storage (Document Hash)
        ↓
Blockchain (Ethereum Smart Contract)
        ↓
Verification Portal (Frontend)
⚙️ Tech Stack
🔗 Blockchain
Ethereum
Solidity
Hardhat
🧠 NLP Engine
SpaCy
HuggingFace Transformers
💾 Storage
IPFS (Decentralized)
MongoDB / PostgreSQL
🔧 Backend
Node.js / Express
FastAPI (Python)
🎨 Frontend
React.js
Tailwind CSS
Web3.js
☁️ Deployment
Vercel / Render
Ethereum Testnet (Sepolia / Goerli)
🔍 Key Features
📄 1. Certificate Upload
Upload academic documents (PDF format)
Secure handling and preprocessing
🤖 2. NLP-Based Data Extraction
Extracts:
Name
Institution
Degree
GPA
Dates
Detects anomalies and inconsistencies
🔐 3. Blockchain Verification
Generates certificate hash
Stores hash on Ethereum smart contract
Ensures immutability
🌐 4. IPFS Storage
Stores actual document off-chain
Returns content-addressable hash
✅ 5. Verification Portal
Employers can verify credentials instantly
Compare document hash with blockchain record
🔄 Workflow
User uploads certificate
NLP extracts structured data
Certificate stored on IPFS → generates hash
Hash stored on blockchain
Verification system validates authenticity
📊 Example Processing Pipeline
Document Uploaded
        ↓
PDF Received by Backend
        ↓
NLP Extraction (Entities + Validation)
        ↓
Fraud Detection Checks
        ↓
IPFS Upload → Hash Generated
        ↓
Blockchain Transaction (Store Hash)
        ↓
Ready for Verification
🧪 Modules Implemented
✅ Smart Contract (Credential Storage)
✅ NLP Extraction Engine
✅ Backend APIs (Upload, Process, Verify)
✅ IPFS Integration
✅ Frontend UI (Upload + Verification)
🔄 Fraud Detection Enhancement (In Progress)
🔄 Advanced NLP Models (Future Work)
📂 Project Structure
EduChain/
│── blockchain/        # Smart contracts & Hardhat scripts
│── backend/           # FastAPI / Node.js APIs
│── frontend/          # React frontend
│── nlp_engine/        # NLP models & extraction logic
│── storage/           # IPFS integration
│── docs/              # Research papers / diagrams
🛠️ Installation & Setup
1. Clone Repository
git clone https://github.com/ruthvikreddyv/educhain.git
cd educhain
2. Backend Setup
cd backend
python -m venv .venv
source .venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
3. Blockchain Setup
cd blockchain
npm install
npx hardhat compile
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
4. Frontend Setup
cd frontend
npm install
npm start
📈 Future Enhancements
🔍 Advanced fraud detection using ML models
🌍 Multi-university integration
📱 Mobile application
🔐 Zero-Knowledge Proof (ZKP) based verification
🤝 API for global recruiters
📚 Research Contribution

This project contributes to:

Secure academic verification systems
Integration of NLP with blockchain
Reduction of verification latency
Prevention of credential fraud
👨‍💻 Author

Ruthvik Reddy Veerannagari

Internship Project: EduChain
Organization: Cypwng
📜 License

This project is licensed under the MIT License.

⭐ Acknowledgements
Open-source blockchain community
NLP research contributions
Ethereum & IPFS ecosystems
🔗 Repository

👉 https://github.com/ruthvikreddyv/educhain
