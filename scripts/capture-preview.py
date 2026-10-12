"""Capture local review artifacts; does not publish or collect customer data."""
import os
from pathlib import Path

from playwright.sync_api import sync_playwright


output = Path(__file__).resolve().parents[1] / "test-results"
output.mkdir(exist_ok=True)
base_url = os.environ.get("MIAS_TEST_URL", "http://127.0.0.1:3000")

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(channel=os.environ.get("MIAS_BROWSER_CHANNEL", "msedge"))
    for name, width, height in [("desktop", 1440, 1080), ("mobile", 390, 844)]:
        page = browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=1)
        page.goto(base_url, wait_until="networkidle")
        page.screenshot(path=str(output / f"{name}-preview.png"))
        page.screenshot(path=str(output / f"{name}-full-page.png"), full_page=True)
        print(f"{name}: {output / f'{name}-full-page.png'}")
        page.close()
    browser.close()
