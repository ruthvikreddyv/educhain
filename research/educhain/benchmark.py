"""Synthetic mechanism tests, NOT real-world credential fraud data."""
from dataclasses import dataclass
from random import Random
from .engine import Evidence, REQUIRED

@dataclass(frozen=True)
class Case:
    id: str
    institution: str
    template: str
    attack: str
    genuine: bool
    evidence: tuple[Evidence,...]

def generate(n=300, seed=42, split="test"):
    if n < 1 or split not in ("train","validation","test"):
        raise ValueError("invalid split or size")
    rng = Random(seed)
    families = ("genuine","missing","duplicate","conflict","issuer_fraud","revoked")
    for i in range(n):
        tag = f"{split}-{seed}-{i}"
        family = families[i % len(families)]
        institution = f"{split}-institution-{i%5}"
        template = f"{split}-template-{i%7}"
        evidence = []
        for c in REQUIRED:
            source = f"{tag}-registry-{c}"
            polarity = -1 if (family=="issuer_fraud" and c=="identity") or (family=="revoked" and c=="status") else 1
            if family in ("missing","duplicate") and c=="issuer":
                continue
            evidence.append(Evidence(f"{tag}-{c}",c,source,polarity,rng.uniform(.85,.99),True))
        if family=="duplicate":
            for j in range(12):
                evidence.append(Evidence(f"{tag}-copy-{j}","issuer",f"{tag}-image",1,.95))
        if family=="conflict":
            evidence.append(Evidence(f"{tag}-altered","identity",f"{tag}-image",-1,.95))
        # Missing evidence and duplicated claims do not establish fraud.
        genuine = family not in ("issuer_fraud","revoked","conflict")
        yield Case(tag,institution,template,family,genuine,tuple(evidence))
