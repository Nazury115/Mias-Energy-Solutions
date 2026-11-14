import json
import re
from urllib.error import HTTPError
from urllib.request import urlopen

import pytest
from test_foundation import Document

PROVINCES = ["Central", "Copperbelt", "Eastern", "Luapula", "Lusaka", "Muchinga",
             "North-Western", "Northern", "Southern", "Western"]
ROUTES = ["/", "/services", "/services/water", "/projects", "/about", "/contact"]


def fetch(base_url, path):
    with urlopen(base_url + path, timeout=45) as response:
        assert response.status == 200
        return response.read().decode()


def document(base_url, path):
    return Document(fetch(base_url, path))


@pytest.mark.integration
def test_coverage_map_markup(base_url):
    html = fetch(base_url, "/projects")
    doc = Document(html)
    ids = {attrs.get("id") for _, attrs in doc.tags}
    assert "coverage" in ids
    paths = [attrs.get("data-province") for tag, attrs in doc.tags if tag == "path" and attrs.get("data-province")]
    assert sorted(paths) == PROVINCES
    options = [attrs.get("data-province-option") for tag, attrs in doc.tags if attrs.get("data-province-option")]
    assert sorted(options) == PROVINCES
    text = " ".join(doc.text)
    assert "Sample data" not in text and "Gwembe" in text
    assert "geoBoundaries" in text and "CC BY 4.0" in text
    assert re.search(r"of 10 provinces", text)


@pytest.mark.integration
@pytest.mark.parametrize("query,expected", [("copperbelt", "Copperbelt"), ("North-Western", "North-Western"), ("Mars", ""), ("%3Cb%3E", "")])
def test_contact_area_prefill(base_url, query, expected):
    doc = document(base_url, "/contact?area=" + query)
    area = next(attrs for tag, attrs in doc.tags if tag == "input" and attrs.get("name") == "area")
    assert area.get("value", "") == expected


@pytest.mark.integration
def test_sitemap_lists_publishable_routes(base_url):
    xml = fetch(base_url, "/sitemap.xml")
    locations = re.findall(r"<loc>([^<]+)</loc>", xml)
    paths = {re.sub(r"^https?://[^/]+", "", location) or "/" for location in locations}
    assert {"/", "/services", "/services/water", "/services/solar-water-pumping", "/projects", "/projects/gwembe-booster-pumps", "/about", "/contact"} <= paths


@pytest.mark.integration
def test_robots_blocks_crawling_during_preview(base_url):
    robots = fetch(base_url, "/robots.txt")
    assert re.search(r"Disallow:\s*/\s*$", robots, re.MULTILINE)


@pytest.mark.integration
@pytest.mark.parametrize("path", ROUTES)
def test_share_previews_on_every_route(base_url, path):
    doc = document(base_url, path)
    properties = {attrs.get("property") or attrs.get("name"): attrs.get("content", "") for tag, attrs in doc.tags if tag == "meta"}
    for key in ["og:title", "og:description", "og:image", "twitter:card"]:
        assert properties.get(key), f"{path} is missing {key}"
    assert properties["twitter:card"] == "summary_large_image"


@pytest.mark.integration
def test_local_business_structured_data_uses_confirmed_facts_only(base_url):
    html = fetch(base_url, "/")
    blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
    assert blocks, "SEO-04: no structured data on the homepage"
    data = json.loads(blocks[0])
    assert data["@type"] == "LocalBusiness"
    assert data["name"] == "Mias Energy Solutions"
    assert data["telephone"] == "+260977747285" and data["email"] == "imasauso@gmail.com"
    assert {area["name"] for area in data["areaServed"]} >= {"Lusaka", "Zambia"}
    for invented in ["address", "aggregateRating", "review", "priceRange", "openingHours"]:
        assert invented not in data, f"{invented} must not be published until confirmed"


@pytest.mark.integration
def test_not_found_page_offers_main_routes(base_url):
    with pytest.raises(HTTPError) as error:
        urlopen(base_url + "/missing-page", timeout=30)
    assert error.value.code == 404
    main = re.search(r"<main\b.*?</main>", error.value.read().decode(), re.DOTALL)
    assert main, "404 page has no main landmark"
    links = {attrs.get("href") for tag, attrs in Document(main.group(0)).tags if tag == "a"}
    assert {"/", "/services", "/projects", "/contact"} <= links, "ERR-01: the 404 content itself must offer the main routes"


@pytest.mark.browser
def test_map_selection_by_keyboard_and_pointer(browser, base_url):
    page = browser.new_page(viewport={"width": 1366, "height": 900})
    try:
        page.goto(base_url + "/projects", wait_until="networkidle")
        panel = page.locator("[data-province-panel]")
        option = page.locator('[data-province-option="Copperbelt"]')
        option.focus()
        page.keyboard.press("Enter")
        assert panel.get_by_role("heading", name="Copperbelt", exact=True).is_visible()
        assert option.get_attribute("aria-pressed") == "true"
        assert page.locator('path[data-province="Copperbelt"]').get_attribute("data-selected") == "true"

        page.locator('path[data-province="Western"]').click()
        assert panel.get_by_role("heading", name="Western", exact=True).is_visible()
        assert page.locator('[data-province-option="Western"]').get_attribute("aria-pressed") == "true"
        assert option.get_attribute("aria-pressed") == "false"

        # Hovering another province must not change the panel; only selection does.
        page.locator('path[data-province="Eastern"]').hover()
        assert panel.get_by_role("heading", name="Western", exact=True).is_visible()

        panel.get_by_role("link", name="Discuss a project in Western", exact=True).click()
        page.wait_for_url(re.compile(r"/contact\?area=Western"))
        assert page.get_by_label("Project area").input_value() == "Western"
    finally:
        page.close()
