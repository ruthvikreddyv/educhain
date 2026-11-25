import unittest
from educhain.engine import Evidence, verify, counterfactual, remove_evidence, Action, choose_action, REQUIRED
from educhain.benchmark import generate
from educhain.evaluate import evaluate

class EngineTests(unittest.TestCase):
    def setUp(self):
        self.good=tuple(Evidence(c,c,c,1,.95,True) for c in REQUIRED)

    def test_valid(self):
        self.assertEqual(verify(self.good).state,"ACCEPT")

    def test_missing(self):
        self.assertEqual(verify(self.good[:-1]).state,"REVIEW")

    def test_duplicate_invariance(self):
        original=self.good[:-1]+(Evidence("a","integrity","image",1,.95),)
        copies=tuple(Evidence(str(i),"integrity","image",1,.95) for i in range(20))
        self.assertAlmostEqual(verify(original).score,verify(original+copies).score)
        self.assertEqual(verify(original+copies).state,"REVIEW")

    def test_revoked(self):
        evidence=tuple(e for e in self.good if e.claim!="status")+(Evidence("r","status","registry",-1,.99,True),)
        self.assertEqual(verify(evidence).state,"REJECT")

    def test_conflict(self):
        self.assertEqual(verify(self.good+(Evidence("x","identity","image",-1,.9),)).state,"REVIEW")

    def test_cascade(self):
        child=Evidence("child","identity","ocr",1,.8,parents=("identity",))
        self.assertNotIn(child,remove_evidence(self.good+(child,),("identity",)))

    def test_counterfactual(self):
        result=counterfactual(self.good)
        self.assertTrue(result["complete"])
        self.assertTrue(result["interventions"])
        for x in result["interventions"]:
            self.assertEqual(len(x["removed"]),1)
            self.assertEqual(x["state"],"REVIEW")

    def test_invalid_graph(self):
        with self.assertRaises(ValueError):
            verify((Evidence("x","identity","s",1,.9,parents=("missing",)),))

    def test_action(self):
        action=Action("registry",.01,0,((1.,(self.good[-1],)),))
        self.assertEqual(choose_action(self.good[:-1],(action,))["selected"],"registry")

    def test_benchmark(self):
        cases=list(generate(60))
        summary,rows=evaluate(cases,"provenance")
        self.assertEqual(len(rows),60)
        self.assertEqual(summary["n"],60)

if __name__=="__main__":
    unittest.main()
