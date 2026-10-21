import pytest


pytestmark = pytest.mark.browser


@pytest.mark.parametrize("width", [320, 390, 768, 1366, 1440])
def test_responsive_sections_and_no_overflow(browser, base_url, width):
    page = browser.new_page(viewport={"width": width, "height": 900})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    try:
        page.goto(base_url, wait_until="networkidle")
        assert page.locator("h1").is_visible()
        for section in ["#services", "#about", "#contact"]:
            assert page.locator(section).is_visible()
        assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), f"Horizontal overflow at {width}px"
        assert not errors, errors
    finally:
        page.close()


def test_mobile_menu_selection_and_escape(browser, base_url):
    page = browser.new_page(viewport={"width": 390, "height": 844})
    try:
        page.goto(base_url, wait_until="networkidle")
        toggle = page.get_by_role("button", name="Open navigation")
        toggle.click()
        assert page.get_by_role("button", name="Close navigation").get_attribute("aria-expanded") == "true"
        page.get_by_role("navigation", name="Mobile navigation").get_by_role("link", name="Services", exact=True).click()
        assert page.url.endswith("/services")
        assert page.get_by_role("button", name="Open navigation").get_attribute("aria-expanded") == "false"
        page.get_by_role("button", name="Open navigation").click()
        page.keyboard.press("Escape")
        assert page.get_by_role("button", name="Open navigation").get_attribute("aria-expanded") == "false"
    finally:
        page.close()


def test_skip_link_and_contact_entry(browser, base_url):
    page = browser.new_page(viewport={"width": 1366, "height": 900})
    try:
        page.goto(base_url, wait_until="networkidle")
        page.keyboard.press("Tab")
        assert page.locator(":focus").inner_text() == "Skip to content"
        page.keyboard.press("Enter")
        assert page.url.endswith("#main-content")
        page.get_by_role("link", name="Discuss your project", exact=True).click()
        assert page.url.endswith("#contact")
        assert page.get_by_role("link", name="WhatsApp Mias", exact=True).first.is_visible()
    finally:
        page.close()
