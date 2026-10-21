from urllib.error import HTTPError
from urllib.parse import parse_qs, urlparse
from urllib.request import urlopen

import pytest
from test_foundation import Document

ROUTES = ["/services", "/services/water", "/services/electrical", "/services/renewable-energy",
          "/services/solar-water-pumping", "/projects", "/about", "/contact"]
DEMOS = ["home-water-pressure", "control-panel-renewal", "home-solar-backup"]
CUSTOMERS = ["Lusaka Water and Sewerage Company", "Plumbfix", "Family Legacy"]


def document(base_url, path):
    with urlopen(base_url + path, timeout=45) as response:
        assert response.status == 200
        return Document(response.read().decode())


@pytest.mark.integration
@pytest.mark.parametrize("path", ROUTES)
def test_public_routes_semantics_and_indexing(base_url, path):
    doc = document(base_url, path)
    assert sum(tag == "h1" for tag, _ in doc.tags) == 1
    assert sum(tag == "main" for tag, _ in doc.tags) == 1
    assert any(tag == "meta" and a.get("name") == "robots" and "noindex" in a.get("content", "") for tag, a in doc.tags)
    assert all(a.get("alt") is not None for tag, a in doc.tags if tag == "img")


@pytest.mark.integration
def test_customers_and_private_contact_boundaries(base_url):
    home = " ".join(document(base_url, "/").text)
    for customer in CUSTOMERS:
        assert customer in home
    about = " ".join(document(base_url, "/about").text)
    assert "Israel Masauso" in about and "Director" in about
    for path in ["/", "/about", "/contact"]:
        text = " ".join(document(base_url, path).text)
        assert "henrymasauso85@gmail.com" not in text
        assert "158 8827" not in text and "miasenergysolutions@gmail.com" not in text


@pytest.mark.integration
@pytest.mark.parametrize("slug", DEMOS)
def test_fictional_stories_are_not_customer_claims(base_url, slug):
    doc = document(base_url, "/projects/" + slug)
    text = " ".join(doc.text)
    assert "Fictional example" in text
    assert "not a completed customer project" in text
    assert "not verified as this example project" in text
    assert all(name not in text for name in CUSTOMERS)


@pytest.mark.integration
@pytest.mark.parametrize("path", ["/services/unknown", "/projects/unknown"])
def test_unknown_content_returns_404(base_url, path):
    with pytest.raises(HTTPError) as error:
        urlopen(base_url + path, timeout=30)
    assert error.value.code == 404


@pytest.mark.browser
def test_project_filters(browser, base_url):
    page = browser.new_page(viewport={"width": 390, "height": 844})
    try:
        page.goto(base_url + "/projects", wait_until="networkidle")
        assert page.locator("[data-project-card]").count() == 3
        page.get_by_role("button", name="Water", exact=True).click()
        assert page.locator("[data-project-card]").count() == 1
        assert "1 project" in page.get_by_role("status").inner_text()
        page.get_by_role("button", name="All projects", exact=True).click()
        assert page.locator("[data-project-card]").count() == 3
    finally:
        page.close()


@pytest.mark.browser
def test_inquiry_context_validation_and_manual_handoff(browser, base_url):
    page = browser.new_page(viewport={"width": 390, "height": 844})
    try:
        page.goto(base_url + "/services/water", wait_until="networkidle")
        page.get_by_role("link", name="Discuss water solutions", exact=True).click()
        assert page.locator("select[name=service]").input_value() == "water"
        page.get_by_role("button", name="Prepare WhatsApp message").click()
        assert page.get_by_text("Enter your name.", exact=True).is_visible()
        assert page.get_by_role("link", name="Open WhatsApp to send").count() == 0
        page.get_by_label("Your name").fill("Test Visitor")
        page.get_by_label("Project details").fill("Pump & controls? #1")
        page.get_by_role("button", name="Prepare WhatsApp message").click()
        link = page.get_by_role("link", name="Open WhatsApp to send")
        url = urlparse(link.get_attribute("href"))
        assert url.netloc == "wa.me" and url.path == "/260977747285"
        message = parse_qs(url.query)["text"][0]
        assert "Pump & controls? #1" in message and "Water solutions" in message
        assert page.get_by_text("Nothing has been sent yet.", exact=True).is_visible()
        page.get_by_label("Project details").fill("A changed request")
        assert page.get_by_role("link", name="Open WhatsApp to send").count() == 0
        assert page.get_by_label("Your name").input_value() == "Test Visitor"
        page.goto(base_url + "/contact?service=unapproved", wait_until="networkidle")
        assert page.locator("select[name=service]").input_value() == "general"
    finally:
        page.close()


@pytest.mark.browser
@pytest.mark.parametrize("width", [320, 390, 768, 1366, 1440])
def test_new_pages_reflow(browser, base_url, width):
    page = browser.new_page(viewport={"width": width, "height": 900})
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    try:
        for route in ["/services/water", "/projects", "/projects/home-solar-backup", "/about", "/contact"]:
            page.goto(base_url + route, wait_until="networkidle")
            assert page.locator("h1").is_visible()
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), (route, width)
        assert not errors
    finally:
        page.close()


@pytest.mark.browser
def test_work_gallery_viewer(browser, base_url):
    page = browser.new_page(viewport={"width": 1366, "height": 900})
    try:
        page.goto(base_url + "/projects", wait_until="networkidle")
        photos = page.locator("[data-work-photo]")
        assert photos.count() >= 12
        photos.first.click()
        viewer = page.get_by_role("dialog", name="Work photo viewer")
        assert viewer.is_visible()
        first = viewer.locator("figcaption").inner_text()
        page.keyboard.press("ArrowRight")
        assert viewer.locator("figcaption").inner_text() != first
        page.get_by_role("button", name="Previous photo").click()
        assert viewer.locator("figcaption").inner_text() == first
        page.keyboard.press("Escape")
        assert not viewer.is_visible()
    finally:
        page.close()
