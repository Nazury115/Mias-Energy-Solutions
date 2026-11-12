import json
import os
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
pytestmark = pytest.mark.unit


def invoke(method, *args):
    target = ROOT / "src/lib/jobs.ts"
    assert target.is_file(), "008: job rules have not been implemented"
    result = subprocess.run([os.environ.get("MIAS_NODE", "node"), str(ROOT / "tests/public_bridge.mjs"),
                             str(target), method, json.dumps(args)], capture_output=True, text=True, timeout=15)
    assert result.returncode == 0, result.stderr
    return json.loads(result.stdout)


@pytest.mark.parametrize("before,after", [
    ("assessment", "awaiting-quotation"), ("assessment", "scheduled"),
    ("awaiting-quotation", "assessment"), ("awaiting-quotation", "scheduled"),
    ("scheduled", "in-progress"), ("in-progress", "completed"),
    ("in-progress", "on-hold"), ("on-hold", "in-progress"),
    ("on-hold", "assessment"), ("scheduled", "cancelled"),
])
def test_approved_job_transitions(before, after):
    assert invoke("jobTransitionProblem", before, after) is None


@pytest.mark.parametrize("before,after", [
    ("assessment", "completed"), ("completed", "assessment"), ("completed", "cancelled"),
    ("cancelled", "in-progress"), ("on-hold", "completed"), ("unknown", "assessment"),
    ("assessment", "unknown"),
])
def test_invalid_and_terminal_transitions_are_explained(before, after):
    assert invoke("jobTransitionProblem", before, after)


@pytest.mark.parametrize("value,expected", [("1", 1), ("12", 12), ("0", None), ("-1", None),
    ("1.5", None), ("1x", None), ("", None), ("9007199254740992", None)])
def test_versions_must_be_positive_safe_integers(value, expected):
    assert invoke("parseVersion", value) == expected


def test_job_details_are_trimmed_and_validated():
    result = invoke("validateJobDetails", {"scope": "  Assess booster set  ", "nextStep": "  Arrange site visit ",
                                         "assigneeId": "staff-id", "reason": "Customer agreed", "expectedVersion": "1"})
    assert result["ok"] is True
    assert result["value"]["scope"] == "Assess booster set"
    assert result["value"]["nextStep"] == "Arrange site visit"


@pytest.mark.parametrize("field,value", [("scope", ""), ("scope", "x" * 1501), ("nextStep", ""),
    ("nextStep", "x" * 501), ("assigneeId", ""), ("reason", ""), ("reason", "x" * 501), ("expectedVersion", "bad")])
def test_invalid_job_details_name_the_field(field, value):
    details = {"scope": "Assess booster set", "nextStep": "Arrange site visit", "assigneeId": "staff-id",
               "reason": "Customer agreed", "expectedVersion": "1"}
    details[field] = value
    result = invoke("validateJobDetails", details)
    assert result["ok"] is False and field in result["errors"]


@pytest.mark.parametrize("contact,channels", [
    ({"email": "customer@example.com", "phone": "+260977555123"}, ["email"]),
    ({"email": "customer@example.com", "phone": None}, ["email"]),
    ({"email": None, "phone": "+260977555123"}, []),
    ({"email": None, "phone": None}, []),
])
def test_receipt_channels_match_supplied_destinations(contact, channels):
    assert [item["channel"] for item in invoke("notificationDestinations", contact)] == channels


def test_guest_receipt_contains_only_reference_and_fixed_wording():
    text = invoke("receiptText", "MES-26-ABCDE")
    assert "MES-26-ABCDE" in text["body"]
    assert "not yet" in text["body"].lower()
    assert "http" not in text["body"]


def test_acceptance_wording_contains_the_agreed_next_step():
    text = invoke("acceptanceText", "JOB-26-ABCDE", "Assess booster set", "Arrange site visit")
    assert "JOB-26-ABCDE" in text["body"] and "Arrange site visit" in text["body"]
