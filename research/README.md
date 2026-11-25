# EduChain v2 — Provenance-aware counterfactual credential verification

Research prototype extending the legacy EduChain repository. The original application is preserved. This is not a production authenticator: the core consumes already supplied evidence observations and does not itself contact institutions or authenticate signatures. The local API trusts caller-provided flags for simulation only; never expose it as a public verification service.

## Run

Python 3.10+; from the repository root:

```bash
cd research
python3 -m unittest discover -s tests -v
python3 -m educhain.evaluate --n 300 --seed 42
python3 -m educhain.study --n 300 --seeds 11 22 33 44 55
python3 -m pip install -r requirements.txt
python3 -m educhain.plots
python3 -m uvicorn educhain.api:app --host 127.0.0.1 --port 8001
```

On Windows use `python` in place of `python3`. The API documentation is at http://127.0.0.1:8001/docs. Core experiments require no third-party dependencies. Results are generated locally in outputs/, never copied from proposed target values.

## Method

- Evidence records contain claim, polarity, provenance source, reliability, authentication flag and derivation parents.
- Source and derivation edges induce connected components. Each component contributes at most its strongest positive and negative vote per claim. This conservative heuristic avoids vote inflation by duplicated evidence with declared common provenance.
- Acceptance requires independently supplied authenticated positive evidence for every required claim (identity, issuer, status, integrity), no detected contradictions and a score threshold. Authentication flags must originate in trusted server-side adapters in a deployed system. Negative authenticated evidence can veto acceptance; missing or conflicting evidence prompts review.
- Counterfactual search enumerates bounded observation-removal sets and cascades removals to dependent observations. It reports minimum explicit removal count within the searched bound, not minimum total cascade cost. It does not generate arbitrary authentic records.
- Candidate actions are ranked by expected heuristic risk reduction minus declared cost and privacy penalties. The action outcome probabilities are inputs, not learned or verified.
- Logistic calibration fits on validation simulations only. It does not establish real-world probability calibration. Calibration is diagnostic; it does not override hard verification gates.

## Experiments and limitations

The included benchmark is synthetic and intentionally encodes specific failure scenarios. Institution/template IDs are split-prefixed placeholders, not real-world independent populations; these splits do not establish generalization. The independent-evidence baseline shares the same hard gates, isolating aggregation effects. No learned GNN, real institutional verification, genuine fraud dataset, external model baselines, learned acquisition policy or conformal coverage guarantee is implemented yet. No journal-readiness or novelty score is claimed.

Before publication: acquire consented/de-identified authentic credentials and independent issuer evidence, separate institution/template/identity and attack families, define source trust policy, freeze thresholds, train strong multimodal and graph baselines, fit action outcome models on training data, evaluate costs and calibration on held-out data, and report confidence intervals and failure cases. Never report synthetic targets or legacy results as measured EduChain v2 performance.


## Registry integration and migration

The legacy frontend and backend now query the actual registry rather than returning a mock success. Set the backend environment variables `EDUCHAIN_RPC_URL`, `EDUCHAIN_REGISTRY_ADDRESS`, and `EDUCHAIN_CHAIN_ID`; install dependencies in packages/blockchain so the ethers-based read script is available. The frontend requires `NEXT_PUBLIC_CERT_REGISTRY_ADDRESS` and `NEXT_PUBLIC_CERT_REGISTRY_CHAIN_ID` matching the configured wagmi network. Never put RPC credentials in client-side environment variables. The frontend hashes a selected file locally and does not upload it. A registry hit establishes registration and revocation status only, not academic validity.

The Solidity source now rejects duplicate registration and restricts revocation to the registering issuer with the issuer role. These changes do not modify any already-deployed contract. Test the source and deploy a new registry deliberately before migrating credentials; do not overwrite production addresses without a migration plan. The existing upload flow still uses IPFS and requires a separate privacy, consent, persistence and authorization review before production. The research API remains local and separate from the legacy registry route.
