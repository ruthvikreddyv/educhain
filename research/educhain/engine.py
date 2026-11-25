"""Conservative evidence reasoning. Scores are heuristic, not probabilities."""
from dataclasses import dataclass
from itertools import combinations
from math import exp, isfinite
from typing import Iterable

REQUIRED = ("identity", "issuer", "status", "integrity")

@dataclass(frozen=True)
class Evidence:
    id: str
    claim: str
    source: str
    polarity: int
    reliability: float
    authenticated: bool = False
    parents: tuple[str, ...] = ()
    def __post_init__(self):
        if not self.id or not self.claim or not self.source:
            raise ValueError("id, claim and source required")
        if self.polarity not in (-1, 1) or not isfinite(self.reliability) or not 0 <= self.reliability <= 1:
            raise ValueError("invalid evidence")

@dataclass(frozen=True)
class Decision:
    state: str
    score: float
    conflicts: tuple[str, ...]
    missing: tuple[str, ...]
    components: int

def groups(items):
    """Connected components of declared source and derivation dependencies."""
    by_id = {e.id:e for e in items}
    if len(by_id) != len(items):
        raise ValueError("duplicate evidence id")
    visiting, done = set(), set()
    def visit(i):
        if i in visiting:
            raise ValueError("cyclic derivation")
        if i in done:
            return
        visiting.add(i)
        for p in by_id[i].parents:
            if p not in by_id:
                raise ValueError("missing parent")
            visit(p)
        visiting.remove(i)
        done.add(i)
    for i in by_id:
        visit(i)
    root = {i:i for i in by_id}
    def find(i):
        while root[i] != i:
            root[i] = root[root[i]]
            i = root[i]
        return i
    def union(a,b):
        root[find(a)] = find(b)
    sources = {}
    for e in items:
        if e.source in sources:
            union(e.id,sources[e.source])
        sources[e.source] = e.id
        for p in e.parents:
            union(e.id,p)
    out = {}
    for e in items:
        out.setdefault(find(e.id),[]).append(e)
    return list(out.values())

def verify(evidence: Iterable[Evidence], required=REQUIRED, *, threshold=.80, provenance=True):
    items = tuple(evidence)
    if not .5 < threshold < 1 or not required:
        raise ValueError("invalid threshold or required claims")
    components = groups(items)
    if not provenance:
        components = [[e] for e in items]
    missing, conflicts, scores = [], [], []
    veto = False
    for claim in required:
        relevant = [e for e in items if e.claim == claim]
        trusted = [e for e in relevant if e.authenticated and e.reliability >= .8]
        if not any(e.polarity == 1 for e in trusted):
            missing.append(claim)
        if any(e.polarity == 1 for e in relevant) and any(e.polarity == -1 for e in relevant):
            conflicts.append(claim)
        if any(e.polarity == -1 for e in trusted) and not any(e.polarity == 1 for e in trusted):
            veto = True
        votes = []
        for g in components:
            pos = max((e.reliability * (1 if e.authenticated else .5) for e in g if e.claim == claim and e.polarity == 1), default=0)
            neg = max((e.reliability * (1 if e.authenticated else .5) for e in g if e.claim == claim and e.polarity == -1), default=0)
            votes.append(pos-neg)
        z = max(-700,min(700,3*sum(votes)))
        scores.append(1/(1+exp(-z)))
    score = min(scores)
    state = "REJECT" if veto else "ACCEPT" if not missing and not conflicts and score >= threshold else "REVIEW"
    return Decision(state,score,tuple(conflicts),tuple(missing),len(components))

def remove_evidence(items, ids):
    removed = set(ids)
    while True:
        expanded = removed | {e.id for e in items if removed.intersection(e.parents)}
        if expanded == removed:
            return tuple(e for e in items if e.id not in removed)
        removed = expanded

def counterfactual(items, required=REQUIRED, max_edits=2, max_trials=5000):
    """Find minimum observation-removal sets within explicit search bounds.
    Descendants disappear with their parents. No synthetic trusted evidence.
    Minimality refers to explicitly selected removals, not cascade size.
    """
    items = tuple(items)
    initial = verify(items,required)
    trials = 0
    for size in range(1,min(max_edits,len(items))+1):
        found = []
        for subset in combinations(items,size):
            if trials >= max_trials:
                return {"complete":False,"trials":trials,"interventions":found}
            trials += 1
            ids = tuple(e.id for e in subset)
            remaining = remove_evidence(items,ids)
            result = verify(remaining,required)
            if result.state != initial.state:
                found.append({"removed":ids,"cascade":sorted({e.id for e in items}-{e.id for e in remaining}),"state":result.state,"score":result.score})
        if found:
            return {"complete":True,"trials":trials,"interventions":found}
    return {"complete":True,"trials":trials,"interventions":[]}

@dataclass(frozen=True)
class Action:
    id: str
    cost: float
    privacy: float
    outcomes: tuple[tuple[float,tuple[Evidence,...]], ...]

def decision_risk(decision):
    # Research utility only: not a calibrated expected classification loss.
    return .25 if decision.state == "REVIEW" else (1-decision.score if decision.state == "ACCEPT" else decision.score)

def choose_action(items, actions, required=REQUIRED, cost_weight=.05, privacy_weight=.1):
    items = tuple(items)
    base = decision_risk(verify(items,required))
    ranked = []
    for a in actions:
        if not isfinite(a.cost) or not isfinite(a.privacy) or min(a.cost,a.privacy)<0:
            raise ValueError("invalid action cost")
        if not a.outcomes or any(not isfinite(p) or p<0 for p,_ in a.outcomes) or abs(sum(p for p,_ in a.outcomes)-1)>1e-8:
            raise ValueError("invalid action probabilities")
        risk = sum(p*decision_risk(verify(items+tuple(extra),required)) for p,extra in a.outcomes)
        utility = base-risk-cost_weight*a.cost-privacy_weight*a.privacy
        ranked.append((utility,a.id))
    ranked.sort(key=lambda x:(-x[0],x[1]))
    return {"selected":ranked[0][1] if ranked and ranked[0][0]>0 else None,"ranking":ranked}
