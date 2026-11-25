"""Fit a monotone score calibrator on validation data only."""
from math import log, exp

def sigmoid(z):
    return 1/(1+exp(-max(-60,min(60,z))))

def logit(p):
    p=max(1e-6,min(1-1e-6,p))
    return log(p/(1-p))

def fit(scores, labels, steps=1000, lr=.05):
    if len(scores)!=len(labels) or not scores or set(labels)!={0,1}:
        raise ValueError("calibration needs aligned validation scores from both classes")
    x=[logit(p) for p in scores]
    a,b=1.,0.
    for _ in range(steps):
        residual=[sigmoid(a*v+b)-y for v,y in zip(x,labels)]
        a=max(0.,a-lr*sum(r*v for r,v in zip(residual,x))/len(x))
        b-=lr*sum(residual)/len(x)
    return a,b

def predict(score, params):
    a,b=params
    return sigmoid(a*logit(score)+b)

def metrics(probabilities,labels,bins=10):
    if not labels or len(probabilities)!=len(labels) or bins<1:
        raise ValueError("invalid calibration inputs")
    bucket=[[] for _ in range(bins)]
    for p,y in zip(probabilities,labels):
        if not 0<=p<=1 or y not in (0,1):
            raise ValueError("invalid prediction or label")
        bucket[min(int(p*bins),bins-1)].append((p,y))
    ece=sum(len(b)/len(labels)*abs(sum(p for p,y in b)/len(b)-sum(y for p,y in b)/len(b)) for b in bucket if b)
    return {"ece":ece,"brier":sum((p-y)**2 for p,y in zip(probabilities,labels))/len(labels)}
