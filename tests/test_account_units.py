import json
import os
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
pytestmark = pytest.mark.unit
HOUR = 3_600_000


def invoke(method, *args):
    target = ROOT / "src" / "lib" / "accounts.ts"
    assert target.is_file(), "AUTH-01/SEC-01: src/lib/accounts.ts is not implemented"
    result = subprocess.run(
        [os.environ.get("MIAS_NODE", "node"), str(ROOT / "tests/public_bridge.mjs"),
         str(target), method, json.dumps(args)], capture_output=True, text=True, timeout=15,
    )
    assert result.returncode == 0, result.stderr
    return json.loads(result.stdout)


@pytest.mark.parametrize("password,fragment", [
    ("short123", "10 characters"), ("a" * 129, "128 characters"), ("password123", "too common"),
    ("1234567890", "too common"), ("chanda.mwila", "email address"),
])
def test_weak_passwords_are_explained(password, fragment):
    problem = invoke("passwordProblem", password, {"email": "chanda.mwila@example.com"})
    assert problem and fragment in problem


def test_long_unusual_passphrase_is_accepted():
    assert invoke("passwordProblem", "pump station at dawn", {"email": "chanda.mwila@example.com"}) is None


def test_sign_up_is_trimmed_and_normalised():
    result = invoke("validateSignUp", {"name": "  Chanda Mwila ", "email": " Chanda@Example.COM ", "phone": "0977 123 456", "password": "pump station at dawn"})
    assert result["ok"] is True
    assert result["value"] == {"name": "Chanda Mwila", "email": "chanda@example.com", "phone": "+260977123456", "password": "pump station at dawn"}


@pytest.mark.parametrize("overrides,field", [
    ({"name": ""}, "name"), ({"name": "a" * 81}, "name"), ({"email": "not-an-email"}, "email"),
    ({"phone": "12345"}, "phone"), ({"password": "short"}, "password"),
])
def test_sign_up_errors_name_the_field(overrides, field):
    data = {"name": "Chanda Mwila", "email": "chanda@example.com", "phone": "", "password": "pump station at dawn"}
    data.update(overrides)
    result = invoke("validateSignUp", data)
    assert result["ok"] is False and field in result["errors"]


@pytest.mark.parametrize("role,age_hours,expired", [
    ("customer", 24 * 29, False), ("staff", 11.9, False), ("staff", 12.1, True), ("owner", 13, True),
])
def test_staff_and_owner_sessions_last_twelve_hours(role, age_hours, expired):
    now = 1_800_000_000_000
    assert invoke("sessionTooOld", role, now - int(age_hours * HOUR), now) is expired


@pytest.mark.parametrize("invitation,state", [
    ({"expiresAt": "2026-10-28T00:00:00Z", "acceptedAt": None, "cancelledAt": None}, "valid"),
    ({"expiresAt": "2026-10-28T00:00:00Z", "acceptedAt": "2026-10-22T00:00:00Z", "cancelledAt": None}, "used"),
    ({"expiresAt": "2026-10-28T00:00:00Z", "acceptedAt": None, "cancelledAt": "2026-10-22T00:00:00Z"}, "cancelled"),
    ({"expiresAt": "2026-10-20T00:00:00Z", "acceptedAt": None, "cancelledAt": None}, "expired"),
])
def test_invitation_states(invitation, state):
    assert invoke("invitationState", invitation, "2026-10-21T12:00:00Z") == state


@pytest.mark.parametrize("change,allowed", [
    ({"activeOwners": 1, "targetRole": "owner", "targetStatus": "active", "newRole": "staff"}, False),
    ({"activeOwners": 1, "targetRole": "owner", "targetStatus": "active", "newStatus": "deactivated"}, False),
    ({"activeOwners": 2, "targetRole": "owner", "targetStatus": "active", "newStatus": "deactivated"}, True),
    ({"activeOwners": 1, "targetRole": "staff", "targetStatus": "active", "newStatus": "deactivated"}, True),
    ({"activeOwners": 1, "targetRole": "staff", "targetStatus": "active", "newRole": "owner"}, True),
])
def test_last_active_owner_is_protected(change, allowed):
    problem = invoke("ownerChangeProblem", change)
    assert (problem is None) is allowed
    if not allowed:
        assert "at least one active Owner" in problem


@pytest.mark.parametrize("value,expected", [
    ("/account", "/account"), ("/staff/team?x=1", "/staff/team?x=1"),
    ("//evil.example", None), ("https://evil.example", None), ("/\\evil.example", None), ("", None),
])
def test_only_local_return_paths_are_followed(value, expected):
    assert invoke("safeNextPath", value) == expected
