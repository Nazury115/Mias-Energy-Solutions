"""Capture local review artifacts; does not publish or collect customer data."""
import os
from pathlib import Path

from playwright.sync_api import sync_playwright


output = Path(__file__).resolve().parents[1] / "test-results"
output.mkdir(exist_ok=True)
base_url = os.environ.get("MIAS_TEST_URL", "http://127.0.0.1:3000")

def load_visible_images(page):
    """Scroll lazy images into view and fail if an actual image cannot decode."""
    for picture in page.locator("img").all():
        picture.scroll_into_view_if_needed()
        picture.evaluate("image => image.decode()")
    page.evaluate("window.scrollTo(0, 0)")


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(channel=os.environ.get("MIAS_BROWSER_CHANNEL", "msedge"))
    for name, width, height in [("desktop", 1440, 1080), ("mobile", 390, 844)]:
        page = browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=1)
        page.goto(base_url, wait_until="networkidle")
        load_visible_images(page)
        page.screenshot(path=str(output / f"{name}-preview.png"))
        page.screenshot(path=str(output / f"{name}-full-page.png"), full_page=True)
        print(f"{name}: {output / f'{name}-full-page.png'}")
        for label, path in [("services", "/services/water"), ("projects", "/projects"),
                            ("story", "/projects/home-solar-backup"), ("contact", "/contact")]:
            page.goto(base_url + path, wait_until="networkidle")
            load_visible_images(page)
            page.screenshot(path=str(output / f"{name}-{label}.png"), full_page=True)
        page.close()
    browser.close()
