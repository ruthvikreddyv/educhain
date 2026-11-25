"""Repeated synthetic experiments; calibration is fitted separately per seed."""
import argparse
import json
from pathlib import Path
from statistics import mean, stdev
from .benchmark import generate
from .engine import verify, Evidence, Action, choose_action, REQUIRED
from .calibration import fit,predict,metrics
from .evaluate import evaluate

def run(n,seeds):
    results=[]
    for seed in seeds:
        validation=list(generate(n,seed,"validation"))
        test=list(generate(n,seed+100000,"test"))
        for provenance in (True,False):
            model="provenance" if provenance else "independent"
            s=[verify(c.evidence,provenance=provenance).score for c in validation]
            params=fit(s,[int(c.genuine) for c in validation])
            raw=[verify(c.evidence,provenance=provenance).score for c in test]
            y=[int(c.genuine) for c in test]
            summary,_=evaluate(test,model)
            summary.update(seed=seed,raw_calibration=metrics(raw,y),calibrated=metrics([predict(p,params) for p in raw],y))
            results.append(summary)
    aggregate={}
    for model in ("provenance","independent"):
        rows=[r for r in results if r["model"]==model]
        aggregate[model]={}
        for field in ("coverage","selective_error","false_accept_rate","false_reject_rate"):
            v=[r[field] for r in rows if r[field] is not None]
            aggregate[model][field]={"mean":mean(v),"sd":stdev(v) if len(v)>1 else None} if v else None
    # Mechanism stress test: duplicate non-authoritative image-derived observations.
    base=tuple(Evidence(c,c,c,1,.95,True) for c in REQUIRED if c!="issuer")
    stress=[]
    for copies in (1,2,4,8,16,32):
        items=base+tuple(Evidence(f"copy-{i}","issuer","same-image",1,.95) for i in range(copies))
        stress.append({"copies":copies,"provenance":verify(items).score,"independent":verify(items,provenance=False).score})
    candidate=Evidence("issuer","issuer","registry",1,.98,True)
    actions=(Action("authenticated_registry",.1,.05,((.8,(candidate,)),(.2,()))),Action("extra_image_analysis",.05,.01,((1.,(Evidence("img","issuer","image",1,.7),)),)))
    return {"dataset":"synthetic only","runs":results,"aggregate":aggregate,"duplicate_stress":stress,"illustrative_action_policy":choose_action(base,actions)}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--n",type=int,default=300)
    p.add_argument("--seeds",type=int,nargs="+",default=[11,22,33,44,55])
    p.add_argument("--output",type=Path,default=Path("outputs/study.json"))
    a=p.parse_args()
    if a.n<12:
        p.error("n must be at least 12")
    a.output.parent.mkdir(parents=True,exist_ok=True)
    a.output.write_text(json.dumps(run(a.n,a.seeds),indent=2))
    print(a.output)
if __name__=="__main__":
    main()
