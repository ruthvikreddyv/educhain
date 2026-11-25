"""Public, bounded synthetic demonstration of the EduChain research engine.
No credential uploads, private data, externally supplied trust flags or issuance.
"""
from dataclasses import asdict
from fastapi import FastAPI, HTTPException
from educhain.benchmark import generate
from educhain.engine import verify, counterfactual, choose_action, Action, Evidence

app = FastAPI(title="EduChain research demonstration", version="2.0.0")
CASES = {c.attack:c for c in generate(6,42)}
DESCRIPTIONS = {
    "genuine":"Complete synthetic authenticated evidence",
    "missing":"Issuer evidence unavailable",
    "duplicate":"Repeated claims derived from one image",
    "conflict":"Image claim contradicts an authenticated record",
    "issuer_fraud":"Authenticated registry disagrees with the identity claim",
    "revoked":"Authenticated registry reports revocation",
}
@app.get("/")
@app.get("/health")
def health():
    return {"service":"EduChain","mode":"synthetic-research-demo","status":"ok"}

@app.get("/scenarios")
def scenarios():
    return [{"id":k,"description":v} for k,v in DESCRIPTIONS.items()]

@app.get("/demo/{scenario}")
def demo(scenario: str):
    if scenario not in CASES:
        raise HTTPException(status_code=404,detail="Unknown synthetic scenario")
    c=CASES[scenario]
    actions=()
    if scenario in ("missing","duplicate"):
        candidate=Evidence("new-registry","issuer","independent-registry",1,.98,True)
        actions=(Action("authenticated issuer query",.1,.05,((.8,(candidate,)),(.2,()))),)
    return {"synthetic":True,"scenario":scenario,"description":DESCRIPTIONS[scenario],"evidence":[asdict(e) for e in c.evidence],"decision":asdict(verify(c.evidence)),"independent":asdict(verify(c.evidence,provenance=False)),"counterfactual":counterfactual(c.evidence,max_trials=500),"action":choose_action(c.evidence,actions)}
