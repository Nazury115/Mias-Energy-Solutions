import json
import os
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
pytestmark = pytest.mark.unit


def invoke(module, method, *args):
    target = ROOT / "src" / "lib" / module
    assert target.is_file(), f"WEB-07/08: {module} is not implemented"
    result = subprocess.run(
        [os.environ.get("MIAS_NODE", "node"), str(ROOT / "tests/public_bridge.mjs"),
         str(target), method, json.dumps(args)], capture_output=True, text=True, timeout=15,
    )
    assert result.returncode == 0, result.stderr
    return json.loads(result.stdout)


def prepare(**overrides):
    data = {"name": "Test Visitor", "service": "water", "area": "Lusaka", "message": "Please assess a booster pump."}
    data.update(overrides)
    return invoke("inquiry.ts", "prepareInquiry", data)


@pytest.mark.parametrize("field,value", [
    ("name", " "), ("name", "a" * 81), ("message", ""), ("message", "a" * 1501),
    ("area", "a" * 121), ("service", "invented-service"),
])
def test_inquiry_invalid_fields(field, value):
    result = prepare(**{field: value})
    assert result["ok"] is False
    assert field in result["errors"]
    assert "message" not in result or field == "message" and not isinstance(result["message"], str)


def test_inquiry_preserves_context_and_trims_input():
    result = prepare(name="  Test Visitor  ", area="  Lusaka  ", message=" Need pumps & controls? #1 ")
    assert result["ok"] is True
    assert "Test Visitor" in result["message"] and "  Test Visitor" not in result["message"]
    assert "Water solutions" in result["message"]
    assert "Need pumps & controls? #1" in result["message"]
    assert "Lusaka" in result["message"]


def test_optional_area_and_valid_length_boundaries():
    assert prepare(name="a" * 80, area="", message="b" * 1500)["ok"] is True


def test_demo_visibility_guard():
    records = [{"slug": "demo", "fictional": True}, {"slug": "verified", "fictional": False}]
    assert invoke("project-visibility.ts", "visibleProjects", records, False) == records
    assert invoke("project-visibility.ts", "visibleProjects", records, True) == [records[1]]
