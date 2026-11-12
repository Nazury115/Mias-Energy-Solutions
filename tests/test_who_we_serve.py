import pytest


@pytest.mark.integration
def test_sector_navigation(browser, base_url):
    page = browser.new_page(java_script_enabled=False, reduced_motion="reduce")
    page.goto(base_url, wait_until="domcontentloaded", timeout=120000)
    index = page.locator("#who-we-serve")
    links = index.get_by_role("link").all()
    paths = [link.get_attribute("href") for link in links]
    assert len(set(paths)) == len(links) == 6
    assert all(path.startswith("/who-we-serve#") for path in paths)
    links[0].focus()
    for link in links[1:]:
        page.keyboard.press("Tab")
        assert link.evaluate("el => el === document.activeElement")
    links[1].click()
    assert page.locator(":target h2").inner_text() == "Farmers & Growers"
    nav = page.locator(".desktop-nav a").all_text_contents()
    assert nav[nav.index("Services") + 1] == "Sectors we serve"
    destinations = set()
    for path in paths:
        sector = page.locator("#" + path.split("#")[1])
        assert sector.get_by_role("heading", level=2).count() == 1
        assert sector.locator("h3").all_text_contents() == ["The challenge", "How Mias can help"]
        assert sector.locator('a[href="/contact"]').count() == 1
        destinations.update(a.get_attribute("href") for a in sector.locator('a[href^="/"]').all())
        image = sector.locator("img")
        image.scroll_into_view_if_needed()
        image.evaluate("el => el.decode()")
        assert image.get_attribute("alt")
    for path in destinations:
        assert page.request.get(base_url + path, timeout=120000).ok
    for width in (320, 390, 768, 1001, 1440):
        page.set_viewport_size({"width": width, "height": 900})
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    mobile = browser.new_page(viewport={"width":390,"height":844}, reduced_motion="reduce")
    mobile.goto(base_url + "/about")
    mobile.get_by_role("button", name="Open navigation").click()
    mobile.locator('#mobile-navigation a[href="/who-we-serve"]').click()
    assert mobile.get_by_role("heading", name="Sectors we serve", exact=True).is_visible()
    page.close()
    mobile.close()
