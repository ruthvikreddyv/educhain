"""Local-only research interface; caller-supplied evidence is NOT authenticated by this API."""
from dataclasses import asdict
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from .engine import Evidence, verify, counterfactual

app=FastAPI(title="EduChain research verifier",version="2.0.0",description="Local simulation only. Authentication flags are test inputs, not verified signatures or issuer records.")

class Observation(BaseModel):
    id:str
    claim:str
    source:str
    polarity:int
    reliability:float=Field(ge=0,le=1)
    authenticated:bool=False
    parents:list[str]=Field(default_factory=list)

class CaseRequest(BaseModel):
    evidence:list[Observation]=Field(max_length=100)

@app.get("/health")
def health():
    return {"status":"ok","mode":"research-only"}

@app.post("/research/verify")
def evaluate_case(request:CaseRequest):
    try:
        items=tuple(Evidence(o.id,o.claim,o.source,o.polarity,o.reliability,o.authenticated,tuple(o.parents)) for o in request.evidence)
        return {"research_only":True,"decision":asdict(verify(items)),"counterfactual":counterfactual(items,max_trials=500)}
    except ValueError as e:
        raise HTTPException(status_code=422,detail=str(e)) from e
