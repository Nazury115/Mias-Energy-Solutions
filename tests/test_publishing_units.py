import json
import os
import subprocess
from pathlib import Path
import pytest

ROOT = Path(__file__).resolve().parents[1]
pytestmark = pytest.mark.unit

def problems(kind, draft, sample):
    result = subprocess.run([os.environ.get("MIAS_NODE","node"), str(ROOT/"tests/public_bridge.mjs"),
        str(ROOT/"src/lib/publishing.ts"),"publicationProblems",json.dumps([kind,draft,sample])],
        capture_output=True,text=True)
    assert result.returncode == 0, result.stderr
    return json.loads(result.stdout)

def project(**changes):
    draft = {"title":"Assessment","summary":"Verified summary","family":"water","province":"Lusaka",
             "area":"","year":"","problem":"Need","approach":"Work","outcome":"Result","quote":"","attribution":"","permission":"","photoIds":[],"existingPhoto":""}
    return {**draft, **changes}

def test_publication_needs_real_permission_and_project_fields():
    errors = problems("project",project(),False)
    assert any("permission" in problem.lower() for problem in errors)
    assert any("photo" in problem.lower() for problem in errors)
    assert problems("project",project(),True) == []

@pytest.mark.parametrize("field,value", [("title",""),("summary","x"*501),("province","Mars"),("family","unknown"),("year","2026x"),("outcome","")])
def test_project_publication_rejects_incomplete_or_invalid_facts(field,value):
    assert problems("project",project(**{field:value}),True)

def test_testimonial_needs_quotation_attribution_and_permission():
    draft = project(quote="Fictional quotation",attribution="Fictional Customer")
    assert problems("testimonial",draft,True) == []
    assert problems("testimonial",draft,False)
    assert problems("testimonial",{**draft,"permission":"Confirmed with customer"},False) == []
    assert problems("testimonial",{**draft,"attribution":""},True)

def test_publication_photos_are_validated_resized_and_stripped():
    result = subprocess.run([os.environ.get("MIAS_NODE","node"),str(ROOT/"tests/check-publication-photo.mjs")],
        capture_output=True,text=True)
    assert result.returncode == 0, result.stderr

def test_real_testimonial_suppresses_sample_projects_and_map_totals():
    result = subprocess.run([os.environ.get("MIAS_NODE","node"),str(ROOT/"tests/public_bridge.mjs"),
        str(ROOT/"src/lib/publishing.ts"),"filterPublicationCollections",
        json.dumps([[{"fictional":True}],[{"sample":True}],[{"sample":False}],False])],
        capture_output=True,text=True)
    assert result.returncode == 0,result.stderr
    assert json.loads(result.stdout)=={"projects":[],"totals":[],"testimonials":[{"sample":False}]}
