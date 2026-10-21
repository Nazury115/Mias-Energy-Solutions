import json
import os
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
pytestmark = pytest.mark.unit

PROVINCES = ["Central", "Copperbelt", "Eastern", "Luapula", "Lusaka", "Muchinga",
             "North-Western", "Northern", "Southern", "Western"]


def invoke(method, *args):
    target = ROOT / "src" / "lib" / "coverage.ts"
    assert target.is_file(), "REC-01/MAP-02: src/lib/coverage.ts is not implemented"
    result = subprocess.run(
        [os.environ.get("MIAS_NODE", "node"), str(ROOT / "tests/public_bridge.mjs"),
         str(target), method, json.dumps(args)], capture_output=True, text=True, timeout=15,
    )
    assert result.returncode == 0, result.stderr
    return json.loads(result.stdout)


def total(province, projects, sample=True, **extra):
    record = {"province": province, "projects": projects, "sample": sample}
    if not sample:
        record.update(confirmedBy="Israel Masauso", confirmedOn="2026-10")
    record.update(extra)
    return record


def story(slug, province, fictional=True, **extra):
    record = {"slug": slug, "title": slug.title(), "province": province, "family": "water", "fictional": fictional}
    if not fictional:
        record["approval"] = {"by": "Israel Masauso", "on": "2026-10-21"}
    record.update(extra)
    return record


def counts(coverage):
    return {item["province"]: item["projects"] for item in coverage["provinces"]}


def test_all_ten_provinces_in_order():
    assert invoke("listProvinces") == PROVINCES


def test_sample_mode_in_preview():
    coverage = invoke("buildCoverage", [total("Lusaka", 12), total("Western", 3)], [], False)
    assert coverage["mode"] == "sample"
    assert len(coverage["provinces"]) == 10
    assert counts(coverage)["Lusaka"] == 12 and counts(coverage)["Muchinga"] == 0
    assert coverage["covered"] == 2 and coverage["total"] == 15 and coverage["max"] == 12


def test_sample_data_never_reaches_launch_mode():
    coverage = invoke("buildCoverage", [total("Lusaka", 12)], [story("demo", "Lusaka")], True)
    assert coverage["mode"] == "none"
    assert coverage["covered"] == 0 and set(counts(coverage).values()) == {0}


def test_real_data_excludes_all_sample_data():
    coverage = invoke("buildCoverage", [total("Lusaka", 12), total("Copperbelt", 4, sample=False)],
                      [story("demo", "Western")], False)
    assert coverage["mode"] == "real"
    assert counts(coverage)["Copperbelt"] == 4
    assert counts(coverage)["Lusaka"] == 0 and counts(coverage)["Western"] == 0


def test_real_data_is_shown_in_launch_mode():
    coverage = invoke("buildCoverage", [total("Copperbelt", 4, sample=False)], [], True)
    assert coverage["mode"] == "real" and counts(coverage)["Copperbelt"] == 4


def test_count_is_the_larger_of_total_and_itemised_stories():
    stories = [story("a", "Southern", fictional=False), story("b", "Southern", fictional=False)]
    coverage = invoke("buildCoverage", [], stories, False)
    assert counts(coverage)["Southern"] == 2
    southern = next(item for item in coverage["provinces"] if item["province"] == "Southern")
    assert [entry["slug"] for entry in southern["stories"]] == ["a", "b"]


def test_province_details_collect_areas_services_and_years():
    coverage = invoke("buildCoverage", [total("Lusaka", 5, services={"water": 3, "electrical": 2}, areas=["Kafue"])],
                      [story("demo", "Lusaka", area="Chongwe", year=2024)], False)
    lusaka = next(item for item in coverage["provinces"] if item["province"] == "Lusaka")
    assert lusaka["services"] == {"water": 3, "electrical": 2}
    assert lusaka["areas"] == ["Kafue", "Chongwe"]
    assert lusaka["years"] == [2024]


@pytest.mark.parametrize("count,maximum,level", [(0, 24, 0), (1, 24, 1), (6, 24, 1), (7, 24, 2), (18, 24, 3), (19, 24, 4), (24, 24, 4), (1, 1, 4)])
def test_shade_levels_split_the_range_into_four_steps(count, maximum, level):
    assert invoke("shadeLevel", count, maximum) == level


def test_valid_content_has_no_errors():
    totals = [total("Lusaka", 3, services={"water": 2, "renewable-energy": 1}), total("Copperbelt", 2, sample=False)]
    stories = [story("demo", "Lusaka"), story("real", "Copperbelt", fictional=False, photos=["/images/work/crane-lift.jpeg"])]
    assert invoke("validateProjectContent", totals, stories, ["/images/work/crane-lift.jpeg"]) == []


@pytest.mark.parametrize("totals,stories,fragment", [
    ([total("Atlantis", 2)], [], "unknown province"),
    ([total("Lusaka", 2), total("Lusaka", 3)], [], "listed twice"),
    ([total("Lusaka", -1)], [], "whole number"),
    ([total("Lusaka", 2, sample=False, confirmedBy="")], [], "confirmation"),
    ([total("Lusaka", 4, services={"water": 1})], [], "services add up"),
    ([], [story("x", "Lusaka"), story("x", "Lusaka")], "duplicate slug"),
    ([], [story("x", "Lusaka", family="plumbing")], "unknown service family"),
    ([], [story("x", "Lusaka", fictional=False, approval=None)], "approval"),
    ([], [story("x", "Lusaka", customer={"name": "LWSC", "publishPermission": False})], "permission"),
    ([], [story("x", "Lusaka", photos=["/images/work/missing.jpeg"])], "photo"),
    ([total("Lusaka", 1, sample=False)], [story("a", "Lusaka", fictional=False), story("b", "Lusaka", fictional=False)], "lower than"),
])
def test_invalid_content_is_reported(totals, stories, fragment):
    errors = invoke("validateProjectContent", totals, stories, [])
    assert errors, f"expected an error mentioning '{fragment}'"
    assert any(fragment in error for error in errors), errors


@pytest.mark.parametrize("value,expected", [
    ("copperbelt", "Copperbelt"), (" Lusaka ", "Lusaka"), ("NORTH-WESTERN", "North-Western"),
    ("Mars", None), ("", None), ("Lusaka<script>", None),
])
def test_match_province(value, expected):
    assert invoke("matchProvince", value) == expected
