import os
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[1]


@pytest.fixture(scope="session")
def base_url():
    return os.environ.get("MIAS_TEST_URL", "http://127.0.0.1:3000").rstrip("/")


@pytest.fixture(scope="session")
def browser():
    from playwright.sync_api import sync_playwright

    with sync_playwright() as playwright:
        # Use the installed Chromium-based Edge browser; no browser download or user profile.
        instance = playwright.chromium.launch(channel=os.environ.get("MIAS_BROWSER_CHANNEL", "msedge"))
        yield instance
        instance.close()
