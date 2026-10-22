import os
import shutil
import urllib.error
import urllib.request
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[1]
# One request per route, so the dev server builds every page before a browser opens one.
WARM_UP_PATHS = ["/", "/services", "/services/warm-up", "/projects", "/projects/warm-up", "/about", "/contact", "/privacy",
                 "/sign-in", "/sign-up", "/verify-email", "/forgot-password", "/reset-password", "/invite", "/account",
                 "/staff", "/staff/team", "/staff/inquiries/MES-00-00000", "/dev/inbox", "/api/session", "/robots.txt"]
# Unit tests run Node. On this computer it is not on PATH, so fall back to the bundled copy the README describes.
BUNDLED_NODE = Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe"
if "MIAS_NODE" not in os.environ and not shutil.which("node") and BUNDLED_NODE.exists():
    os.environ["MIAS_NODE"] = str(BUNDLED_NODE)


@pytest.fixture(scope="session")
def base_url():
    return os.environ.get("MIAS_TEST_URL", "http://127.0.0.1:3000").rstrip("/")


def warm_up(base_url):
    # A dev server builds each page on its first visit and then reloads every open page, wiping half-filled forms
    # (the intermittent first sign-up failure in 007). Building everything first keeps browser tests independent of order.
    for path in WARM_UP_PATHS:
        try:
            urllib.request.urlopen(base_url + path, timeout=180).read()
        except urllib.error.HTTPError:
            pass  # 404s and refusals still build the route
        except urllib.error.URLError:
            return  # no server running; the browser tests report that themselves


@pytest.fixture(scope="session")
def browser(base_url):
    from playwright.sync_api import sync_playwright

    warm_up(base_url)
    with sync_playwright() as playwright:
        # Use the installed Chromium-based Edge browser; no browser download or user profile.
        instance = playwright.chromium.launch(channel=os.environ.get("MIAS_BROWSER_CHANNEL", "msedge"))
        yield instance
        instance.close()
