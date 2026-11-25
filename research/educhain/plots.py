"""Render plots from an actual study output, not prefilled values."""
import argparse,json
from pathlib import Path
def main():
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    p=argparse.ArgumentParser()
    p.add_argument("--input",type=Path,default=Path("outputs/study.json"))
    p.add_argument("--output",type=Path,default=Path("outputs/plots"))
    a=p.parse_args()
    data=json.loads(a.input.read_text())
    a.output.mkdir(parents=True,exist_ok=True)
    rows=data["duplicate_stress"]
    fig,ax=plt.subplots()
    for m in ("provenance","independent"):
        ax.plot([r["copies"] for r in rows],[r[m] for r in rows],marker="o",label=m)
    ax.set(xlabel="Copies from same source",ylabel="Heuristic score",title="EduChain: synthetic duplication stress test")
    ax.set_xscale("log",base=2)
    ax.legend()
    fig.tight_layout()
    fig.savefig(a.output/"duplicate_stress.pdf")
    plt.close(fig)
    fig,ax=plt.subplots()
    names=list(data["aggregate"])
    for i,name in enumerate(names):
        vals=[data["aggregate"][name][metric] for metric in ("coverage","selective_error","false_accept_rate","false_reject_rate")]
        valid=[(j,v) for j,v in enumerate(vals) if v is not None]
        ax.bar([j+(i-.5)*.3 for j,v in valid],[v["mean"] for j,v in valid],width=.3,yerr=[v["sd"] or 0 for j,v in valid],label=name)
    ax.set_xticks(range(4),["Coverage","Selective error","False accept","False reject"],rotation=15)
    ax.set_ylim(0,1.05)
    ax.set_title("Synthetic benchmark; mean and seed SD")
    ax.legend()
    fig.tight_layout()
    fig.savefig(a.output/"benchmark.pdf")
    plt.close(fig)
if __name__=="__main__":
    main()
