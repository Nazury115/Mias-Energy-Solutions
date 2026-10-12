import json
import os
import subprocess
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import pytest


ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / "src" / "lib" / "contact-links.ts"
pytestmark = pytest.mark.unit


def contact_links(contacts, context=""):
    assert MODULE.is_file(), "FND-05: the actual contact-link module has not been implemented"
    process = subprocess.run(
        [os.environ.get("MIAS_NODE", "node"), str(ROOT / "tests" / "contact_bridge.mjs"),
         str(MODULE), json.dumps({"contacts": contacts, "context": context})],
        text=True, capture_output=True, timeout=15, check=False,
    )
    assert process.returncode == 0, process.stderr
    return json.loads(process.stdout)


def test_unknown_destinations_create_no_links():
    assert contact_links({"phone": None, "whatsapp": None, "email": None}) == []


@pytest.mark.parametrize("value", ["", " ", "not-confirmed", "javascript:alert(1)", "+260 97 123 4567", "+000"])
def test_malformed_phone_destinations_create_no_links(value):
    assert contact_links({"phone": value, "whatsapp": value, "email": None}) == []


@pytest.mark.parametrize("value", ["", "no-at-sign", "person@example.com\nBcc:other@example.com", "javascript:alert(1)"])
def test_malformed_email_destinations_create_no_links(value):
    assert contact_links({"phone": None, "whatsapp": None, "email": value}) == []


def test_valid_destinations_and_context_are_encoded():
    # Fictional test fixtures, not Mias contact information.
    links = contact_links({"phone": "+260971234567", "whatsapp": "+260971234567", "email": "test@example.com"}, "Borehole & booster pumps / Lusaka?")
    assert len(links) == 3
    by_kind = {link["kind"]: link for link in links}
    assert by_kind["phone"]["href"] == "tel:+260971234567"
    whatsapp = urlparse(by_kind["whatsapp"]["href"])
    assert whatsapp.scheme == "https" and whatsapp.netloc == "wa.me"
    assert whatsapp.path == "/260971234567"
    assert parse_qs(whatsapp.query)["text"] == ["Borehole & booster pumps / Lusaka?"]
    email = urlparse(by_kind["email"]["href"])
    assert email.scheme == "mailto" and email.path == "test@example.com"
    assert parse_qs(email.query)["subject"] == ["Borehole & booster pumps / Lusaka?"]


def test_a_valid_channel_is_not_hidden_by_an_invalid_one():
    links = contact_links({"phone": None, "whatsapp": "bad", "email": "test@example.com"})
    assert [link["kind"] for link in links] == ["email"]
