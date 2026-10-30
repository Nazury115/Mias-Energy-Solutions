"""Exercise the built 008 portal with a disposable local database; sends no messages."""
import json
import os
from pathlib import Path
import re
import secrets
import socket
import subprocess
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.request import HTTPRedirectHandler, build_opener, urlopen
import uuid

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tests"))
from test_jobs import accept_job  # reuse the tested staff form journey

NODE = os.environ.get("MIAS_NODE", str(Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe"))
BASE = "http://127.0.0.1:3210"
ENV = {**os.environ, "MIAS_SITE_URL": BASE, "MIAS_BUILD_DIR": ".next-verification",
       "MIAS_DB_DIR": str(ROOT / ".data/verification-008" / ("production-" + uuid.uuid4().hex[:8]) / "pglite"),
       "MIAS_FORM_SECRET": secrets.token_urlsafe(48), "BETTER_AUTH_SECRET": secrets.token_urlsafe(48),
       "MIAS_EMAIL_TRANSPORT": "dev-inbox", "MIAS_SMS_TRANSPORT": "dev-inbox"}
FLAGS = subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0


def run_node(*args):
    result = subprocess.run([NODE, *args], cwd=ROOT, env=ENV, capture_output=True, text=True, timeout=90, creationflags=FLAGS)
    if result.returncode:
        raise RuntimeError("Production setup/query failed: " + result.stderr[:1000])
    return result.stdout


def start():
    process = subprocess.Popen([NODE, "node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3210"],
                               cwd=ROOT, env=ENV, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=FLAGS)
    for _ in range(80):
        if process.poll() is not None:
            raise RuntimeError("The production server exited before it was ready.")
        try:
            with urlopen(BASE, timeout=2) as response:
                if response.status == 200:
                    return process
        except (URLError, TimeoutError):
            time.sleep(.5)
    process.terminate()
    process.wait(timeout=10)
    raise RuntimeError("Production server did not become ready.")


def stop(process):
    if process and process.poll() is None:
        process.terminate()
        try:
            process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=10)


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args):
        return None


with socket.socket() as probe:
    if probe.connect_ex(("127.0.0.1", 3210)) == 0:
        raise RuntimeError("Port 3210 is occupied; stop that server before this isolated production check.")
setup = run_node("scripts/db.mjs", "create-owner", "--email", "production-owner@example.com", "--name", "Production Test Owner")
owner_link = re.search(r"https?://\S+", setup).group()
server = None
try:
    server = start()
    expected = {"/": 200, "/contact": 200, "/sign-in": 200, "/job-invite": 200, "/dev/inbox": 404,
                "/staff/jobs": 307, "/staff/jobs/JOB-26-UNKNOWN": 307, "/account/jobs/JOB-26-UNKNOWN": 307}
    opener = build_opener(NoRedirect)
    for path, status in expected.items():
        try:
            response = opener.open(BASE + path, timeout=60)
        except HTTPError as error:
            response = error
        assert response.code == status, (path, response.code)
        response.close()
    print("Production routes and development-inbox protection passed.", flush=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="msedge")
        owner = browser.new_page(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
        errors = []
        owner.on("pageerror", lambda error: errors.append(str(error)))
        owner.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        owner.goto(owner_link, wait_until="networkidle", timeout=90000)
        owner.get_by_label("Choose a password").fill("production pump inlet at sunrise")
        owner.get_by_role("button", name="Create my account").click()
        owner.wait_for_url("**/staff")
        guest = browser.new_page(reduced_motion="reduce", extra_http_headers={"x-forwarded-for": "192.0.2.128"})
        guest.context.add_cookies([{"name": "mias-simulate", "value": "db-failure", "url": BASE}])
        guest.goto(BASE + "/contact", wait_until="networkidle")
        guest.get_by_role("button", name="Prepare WhatsApp message", exact=True).wait_for()
        guest.get_by_label("Your name").fill("Production Test Customer")
        guest.get_by_label("Phone number", exact=True).fill("0977 555 801")
        guest.get_by_label("Email address").fill("production-customer@example.com")
        guest.get_by_role("radio", name="Email", exact=True).check()
        guest.get_by_label("Project details").fill("Production verification inquiry; local capture only.")
        guest.wait_for_timeout(3200)
        guest.get_by_role("button", name="Send inquiry to Mias").click()
        guest.get_by_role("status").get_by_text("Thank you").wait_for()
        reference = re.search(r"MES-\d{2}-[0-9A-HJKMNP-TV-Z]{5}", guest.locator("main").inner_text()).group()
        job_url = accept_job(owner, BASE, reference)
        assert owner.locator("main").get_by_text("Captured locally", exact=False).count() >= 4
        owner.get_by_label("Internal note", exact=True).fill("PRODUCTION-PRIVATE-SENTINEL")
        owner.get_by_role("button", name="Save private note").click()
        owner.locator("main").get_by_role("status").wait_for()
        form = owner.locator("form[data-customer-invite]")
        form.get_by_label("Customer name").fill("Production Test Customer")
        form.get_by_label("Customer email").fill("production-customer@example.com")
        form.get_by_label("I have checked this customer's identity and contact details").check()
        form.get_by_role("button", name="Invite customer").click()
        form.get_by_role("status").wait_for()
        print("Production Owner setup, guest saving, acceptance, local email/SMS and invitation passed.", flush=True)
        # Stop the sole database owner before reading the captured invitation offline.
        stop(server)
        server = None
        try:
            with urlopen(BASE, timeout=2):
                raise RuntimeError("Refusing to open the database while its server still responds.")
        except URLError:
            pass
        invite_link = run_node("--input-type=module", "--eval", "import {PGlite} from '@electric-sql/pglite'; const db=await PGlite.create(process.env.MIAS_DB_DIR); try { const result=await db.query(\"select body from notifications where kind='job-invitation' order by created_at desc limit 1\"); process.stdout.write(result.rows[0].body.match(/https?:\\/\\/\\S+/)[0]); } finally { await db.close(); }")
        server = start()
        customer = browser.new_page(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
        customer.on("pageerror", lambda error: errors.append(str(error)))
        customer.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        customer.goto(invite_link, wait_until="networkidle", timeout=90000)
        customer.get_by_label("Choose a password").fill("production customer water inlet")
        customer.get_by_role("button", name="Create account and open job").click()
        customer.wait_for_url("**/account/jobs/*")
        assert "PRODUCTION-PRIVATE-SENTINEL" not in customer.content()
        assert customer.evaluate("document.documentElement.scrollWidth <= innerWidth")
        customer.get_by_label("Message to Mias").fill("Production portal reply")
        customer.get_by_role("button", name="Send message", exact=True).click()
        customer.locator("main").get_by_role("status").wait_for()
        owner.goto(job_url, wait_until="networkidle")
        assert "Production portal reply" in owner.locator("main").inner_text()
        assert not errors, errors
        customer.screenshot(path=str(ROOT / "test-results/008-production-customer.png"))
        browser.close()
        print(json.dumps({"production_routes": len(expected), "owner_and_customer_journey": "passed", "private_notes_excluded": True,
                          "production_simulation_cookie_inert": True, "runtime_errors": errors}), flush=True)
finally:
    stop(server)
