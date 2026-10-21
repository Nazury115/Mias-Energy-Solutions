import json
import os
import re
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
pytestmark = pytest.mark.unit


def invoke(method, *args):
    target = ROOT / "src" / "lib" / "inquiry-submission.ts"
    assert target.is_file(), "INQ-01/03: src/lib/inquiry-submission.ts is not implemented"
    result = subprocess.run(
        [os.environ.get("MIAS_NODE", "node"), str(ROOT / "tests/public_bridge.mjs"),
         str(target), method, json.dumps(args)], capture_output=True, text=True, timeout=15,
    )
    assert result.returncode == 0, result.stderr
    return json.loads(result.stdout)


def submission(**overrides):
    data = {"name": "Test Visitor", "phone": "0977 123 456", "email": "", "preferredReply": "whatsapp",
            "service": "water", "area": "Lusaka", "message": "Please check our booster pump."}
    data.update(overrides)
    return invoke("validateInquirySubmission", data)


@pytest.mark.parametrize("raw,expected", [
    ("0977 123 456", "+260977123456"), ("+260 977 123 456", "+260977123456"), ("260977123456", "+260977123456"),
    ("00260977123456", "+260977123456"), ("(097) 712-3456", "+260977123456"), ("+44 20 7946 0958", "+442079460958"),
    ("12345", None), ("phone me", None), ("", None), ("+260 977 123 456 789 012", None),
])
def test_phone_numbers_are_normalised(raw, expected):
    assert invoke("normalizePhone", raw) == expected


def test_valid_submission_is_trimmed_and_normalised():
    result = submission(name="  Test Visitor ", area="  Lusaka ", message="  Please check our booster pump. ")
    assert result["ok"] is True
    value = result["value"]
    assert value["name"] == "Test Visitor" and value["area"] == "Lusaka"
    assert value["phone"] == "+260977123456" and value["email"] is None
    assert value["message"] == "Please check our booster pump."


def test_email_only_submission_with_email_reply():
    result = submission(phone="", email=" Visitor@Example.COM ", preferredReply="email", area="")
    assert result["ok"] is True
    assert result["value"]["email"] == "visitor@example.com"
    assert result["value"]["phone"] is None and result["value"]["area"] is None


@pytest.mark.parametrize("overrides,field", [
    ({"name": " "}, "name"),
    ({"name": "a" * 81}, "name"),
    ({"phone": "", "email": ""}, "phone"),
    ({"phone": "12345"}, "phone"),
    ({"email": "not-an-email"}, "email"),
    ({"preferredReply": "email"}, "preferredReply"),
    ({"phone": "", "email": "a@b.co", "preferredReply": "whatsapp"}, "preferredReply"),
    ({"preferredReply": "fax"}, "preferredReply"),
    ({"service": "invented-service"}, "service"),
    ({"area": "a" * 121}, "area"),
    ({"message": ""}, "message"),
    ({"message": "a" * 1501}, "message"),
    ({"message": "see http://a.example https://b.example www.c.example http://d.example"}, "message"),
])
def test_invalid_submissions_name_the_field(overrides, field):
    result = submission(**overrides)
    assert result["ok"] is False
    assert field in result["errors"], result["errors"]


def test_contact_error_explains_what_to_do():
    result = submission(phone="", email="")
    assert "phone number or an email address" in result["errors"]["phone"]


def test_reference_format_uses_unambiguous_characters():
    assert invoke("formatReference", 2026, [0, 1, 10, 31, 17]) == "MES-26-01AZH"
    reference = invoke("formatReference", 2027, [18, 19, 20, 21, 22])
    assert re.fullmatch(r"MES-27-[0-9A-HJKMNP-TV-Z]{5}", reference) and reference == "MES-27-JKMNP"


@pytest.mark.parametrize("stored,shown", [("+260977123456", "+260 977 123 456"), ("+442079460958", "+442079460958")])
def test_display_phone(stored, shown):
    assert invoke("displayPhone", stored) == shown


@pytest.mark.parametrize("text,count", [("no links here", 0), ("http://a.example and https://b.example", 2), ("visit www.mias.example", 1)])
def test_count_links(text, count):
    assert invoke("countLinks", text) == count
