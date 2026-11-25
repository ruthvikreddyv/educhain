"""Run actual synthetic benchmark experiments and save measured counts."""
import argparse
import csv
import json
from pathlib import Path
from collections import Counter
from .benchmark import generate
from .engine import verify, counterfactual, remove_evidence, REQUIRED

def evaluate(cases, model):
    counts = Counter()
    decisions = []
    for case in cases:
        if model=="independent":
            result = verify(case.evidence,provenance=False)
        else:
            result = verify(case.evidence)
        counts[result.state] += 1
        counts["false_accept"] += int(result.state=="ACCEPT" and not case.genuine)
        counts["false_reject"] += int(result.state=="REJECT" and case.genuine)
        counts["fraud"] += int(not case.genuine)
        counts["genuine"] += int(case.genuine)
        counts["covered_errors"] += int((result.state=="ACCEPT" and not case.genuine) or (result.state=="REJECT" and case.genuine))
        decisions.append({"case":case.id,"attack":case.attack,"model":model,"genuine":case.genuine,"decision":result.state,"score":result.score})
    n = len(cases)
    covered = counts["ACCEPT"]+counts["REJECT"]
    summary = {"model":model,"n":n,"coverage":covered/n,"selective_error":counts["covered_errors"]/covered if covered else None,"false_accept_rate":counts["false_accept"]/counts["fraud"] if counts["fraud"] else None,"false_reject_rate":counts["false_reject"]/counts["genuine"] if counts["genuine"] else None,"counts":dict(counts)}
    return summary,decisions

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--n",type=int,default=300)
    parser.add_argument("--seed",type=int,default=42)
    parser.add_argument("--output",type=Path,default=Path("outputs"))
    args=parser.parse_args()
    args.output.mkdir(parents=True,exist_ok=True)
    cases=list(generate(args.n,args.seed))
    summaries,rows=[],[]
    for model in ("provenance","independent"):
        s,r=evaluate(cases,model)
        summaries.append(s)
        rows.extend(r)
    cf=[]
    for case in cases[:min(30,len(cases))]:
        result=counterfactual(case.evidence)
        cf.append({"case":case.id,**result})
    payload={"dataset":"synthetic mechanism test","seed":args.seed,"summaries":summaries,"counterfactuals":cf}
    (args.output/"summary.json").write_text(json.dumps(payload,indent=2))
    with (args.output/"predictions.csv").open("w",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    print(json.dumps(summaries,indent=2))

if __name__=="__main__":
    main()
