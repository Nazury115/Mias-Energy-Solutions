"""Exercise the built 008 portal with a disposable local database; sends no messages."""
import json
import os
from pathlib import Path
import re
import secrets
import socket
import struct
import subprocess
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.request import HTTPRedirectHandler, build_opener, urlopen
import uuid
import zlib

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tests"))
from test_jobs import accept_job  # reuse the tested staff form journey
from test_job_files import PNG
from test_documents import approve as approve_document, configure as configure_documents, prepare as prepare_document, issue as issue_document, workbook_cells

NODE = os.environ.get("MIAS_NODE", str(Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe"))
BASE = "http://127.0.0.1:3210"
ENV = {**os.environ, "MIAS_SITE_URL": BASE, "MIAS_BUILD_DIR": os.environ.get("MIAS_VERIFY_BUILD_DIR", ".next-verification"),
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
    expected = {"/": 200, "/contact": 200, "/sign-in": 200, "/job-invite": 200, "/dev/inbox": 404, "/dev/mobile":404,
                "/solar-planner":404,
                "/staff/jobs": 307, "/staff/jobs/JOB-26-UNKNOWN": 307, "/account/jobs/JOB-26-UNKNOWN": 307}
    opener = build_opener(NoRedirect)
    for path, status in expected.items():
        try:
            response = opener.open(BASE + path, timeout=60)
        except HTTPError as error:
            response = error
        assert response.code == status, (path, response.code)
        if path in ("/sign-in", "/job-invite", "/staff/jobs"):
            assert response.headers.get("X-Frame-Options") == "SAMEORIGIN", path
            assert response.headers.get("Referrer-Policy") == "strict-origin", path
        response.close()
    print("Production routes and development-inbox protection passed.", flush=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="msedge")
        owner_context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
        owner = owner_context.new_page()
        errors = []
        owner.on("pageerror", lambda error: errors.append(str(error)))
        owner.on("console", lambda message: errors.append(message.text+" "+str(message.location)) if message.type == "error" else None)
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
        guest.evaluate("""() => {const field=document.createElement('input');field.type='hidden';field.name='solarPlan';field.value='{}';document.querySelector('form[data-inquiry-form]').append(field);} """)
        guest.wait_for_timeout(3200)
        guest.get_by_role("button", name="Send inquiry to Mias").click()
        guest.get_by_text("The solar planner is no longer available. Describe your requirements in Project details instead.",exact=True).first.wait_for()
        guest.evaluate("document.querySelector('input[name=solarPlan]').remove()")
        guest.get_by_role("button", name="Send inquiry to Mias").click()
        guest.get_by_role("status").get_by_text("Thank you").wait_for()
        reference = re.search(r"MES-\d{2}-[0-9A-HJKMNP-TV-Z]{5}", guest.locator("main").inner_text()).group()
        job_url = accept_job(owner, BASE, reference)
        assert owner.locator("[data-solar-summary]").count()==0
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
        # Close the live conversation first so the planned outage does not generate
        # a connection-refused error from a background refresh.
        owner.goto("about:blank")
        stop(server)
        server = None
        try:
            with urlopen(BASE, timeout=2):
                raise RuntimeError("Refusing to open the database while its server still responds.")
        except URLError:
            pass
        invite_link = run_node("--input-type=module", "--eval", "import {PGlite} from '@electric-sql/pglite'; const db=await PGlite.create(process.env.MIAS_DB_DIR); try { const result=await db.query(\"select body from notifications where kind='job-invitation' order by created_at desc limit 1\"); process.stdout.write(result.rows[0].body.match(/https?:\\/\\/\\S+/)[0]); } finally { await db.close(); }")
        saved=json.loads(run_node("--input-type=module","--eval","import {PGlite} from '@electric-sql/pglite';const db=await PGlite.create(process.env.MIAS_DB_DIR);try {const r=await db.query(\"select solar_plan from inquiries where email='production-customer@example.com'\");process.stdout.write(JSON.stringify(r.rows));}finally{await db.close();}"))
        assert len(saved)==1 and saved[0]["solar_plan"] is None
        # Seed a synthetic historic snapshot only while the isolated database is closed.
        run_node("--input-type=module","--eval","import {readFileSync} from 'node:fs';import {PGlite} from '@electric-sql/pglite';const db=await PGlite.create(process.env.MIAS_DB_DIR);try{const plan=JSON.parse(readFileSync('tests/fixtures/saved-load-summary.json','utf8'));await db.query(\"update inquiries set solar_plan=$1 where email='production-customer@example.com'\",[JSON.stringify(plan)]);}finally{await db.close();}")
        server = start()
        customer = browser.new_page(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
        customer.on("pageerror", lambda error: errors.append(str(error)))
        customer.on("console", lambda message: errors.append(message.text+" "+str(message.location)) if message.type == "error" else None)
        customer.goto(invite_link, wait_until="networkidle", timeout=90000)
        customer.get_by_label("Choose a password").fill("production customer water inlet")
        customer.get_by_role("button", name="Create account and open job").click()
        customer.wait_for_url("**/account/jobs/*")
        assert "PRODUCTION-PRIVATE-SENTINEL" not in customer.content()
        assert "160 Wh" in customer.locator("[data-solar-summary]").inner_text()
        assert "Original request load details" in customer.locator("[data-solar-summary]").inner_text()
        assert customer.request.get(BASE+"/staff/inquiries/"+reference).status==403
        assert customer.evaluate("document.documentElement.scrollWidth <= innerWidth")
        scope = "Assess and repair the booster set"
        customer.goto(BASE+"/account", wait_until="networkidle")
        assert customer.locator("main h2").first.inner_text() == "Your jobs"
        customer.screenshot(path=str(ROOT/"test-results/customer-account-phone.png"))
        customer.get_by_role("link", name=scope, exact=True).click()
        customer.get_by_role("heading", name=scope, level=1).wait_for()
        for width in [320, 390, 768, 1440]:
            customer.set_viewport_size({"width":width,"height":844})
            customer.evaluate("() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")
            assert customer.evaluate("document.documentElement.scrollWidth <= innerWidth")
            if width in [390, 1440]:
                customer.screenshot(path=str(ROOT/f"test-results/customer-job-{width}.png"))
        customer.set_viewport_size({"width":390,"height":844})
        customer.get_by_role("link",name="Message Mias").click()
        assert customer.get_by_label("Message to Mias").evaluate("el => document.activeElement === el")
        customer.get_by_label("Message to Mias").fill("Production portal reply")
        customer.get_by_role("button", name="Send message", exact=True).click()
        customer.locator("main").get_by_role("status").wait_for()
        owner.goto(job_url, wait_until="networkidle")
        assert "Production portal reply" in owner.locator("main").inner_text()
        owner.bring_to_front()
        owner.locator(".chat-bubble", has_text="Production portal reply").scroll_into_view_if_needed()
        api = BASE + "/api/jobs/" + job_url.rsplit("/", 1)[1] + "/conversation?portal=customer"
        customer.wait_for_function("""async url => (await (await fetch(url)).json())
            .some(row => row.body === 'Production portal reply' && row.reads.length === 1)""",
            arg=api, polling=500, timeout=20000)
        print("Production conversation and authenticated first-view receipt passed.", flush=True)
        plain_context=browser.new_context(java_script_enabled=False,reduced_motion="reduce",storage_state=customer.context.storage_state())
        try:
            plain=plain_context.new_page()
            plain.goto(BASE+"/account/jobs/"+job_url.rsplit("/",1)[1],wait_until="networkidle")
            plain.get_by_label("Message to Mias",exact=True).fill("Production native form reply")
            with plain.expect_request(lambda request:request.method=="POST" and "/account/jobs/" in request.url) as native_post:
                plain.get_by_role("button",name="Send message",exact=True).click()
            plain.get_by_text("Your message was saved.",exact=True).wait_for()
            assert native_post.value.headers.get("origin")==BASE
            assert native_post.value.headers.get("referer")==BASE+"/"
        finally:
            plain_context.close()
        print("Production native form action and origin-only referrer passed.",flush=True)
        # Build a real PNG exactly at the file limit, including a valid ancillary chunk.
        payload = b"Comment\0".ljust(5 * 1024 * 1024 - len(PNG) - 12, b"A")
        chunk = b"tEXt" + payload
        image = PNG[:-12] + struct.pack(">I", len(payload)) + chunk + struct.pack(">I", zlib.crc32(chunk)) + PNG[-12:]
        customer.get_by_label("Choose a job file").set_input_files({"name": "site-check.png", "mimeType": "image/png", "buffer": image})
        customer.get_by_role("button", name="Upload file").click()
        customer.get_by_role("link", name="site-check.png").wait_for()
        owner.reload(wait_until="networkidle")
        href = owner.get_by_role("link", name="site-check.png").get_attribute("href")
        assert owner.request.get(BASE + href).body() == image
        assert guest.request.get(BASE + href, max_redirects=0).status in (303, 307)
        print("Production 5 MiB customer upload, staff download and signed-out denial passed.", flush=True)
        assert not errors, errors
        customer.screenshot(path=str(ROOT / "test-results/008-production-customer.png"))
        # Commercial documents use the same explicit job association.
        # A valid draft enters the queue even before Owner template setup.
        setup_draft=prepare_document(owner,job_url)
        owner.get_by_role("button",name="Submit for review",exact=True).click()
        owner.get_by_text("Draft submitted for Owner review.",exact=True).wait_for()
        assert "Business settings await Owner review" in owner.locator("main").inner_text()
        owner.get_by_label("Issue reason",exact=True).fill("Unreviewed settings must block issue")
        owner.get_by_label("I reviewed the saved draft and its PDF preview").check()
        owner.get_by_role("button",name="Approve and issue",exact=True).click()
        owner.get_by_role("alert").wait_for()
        owner.goto(BASE+"/staff",wait_until="networkidle")
        assert "1 awaiting Owner review" in owner.locator("[data-document-review]").inner_text()
        configure_documents(owner, BASE)
        owner.goto(setup_draft,wait_until="networkidle")
        owner.get_by_role("button",name="Refresh preview with reviewed settings",exact=True).click()
        owner.get_by_text("Review preview updated with reviewed business settings.",exact=True).wait_for()
        approve_document(owner)
        print("Production pre-settings submission, Owner queue, issue gate and reviewed preview refresh passed.",flush=True)
        document_refs=[]
        customer_url=BASE+"/account/jobs/"+job_url.rsplit("/",1)[1]
        for kind in ["invoice","quotation"]:
            draft_url=prepare_document(owner,job_url,kind)
            document_id=draft_url.rsplit("/",1)[1]
            pdf_url=BASE+"/documents/"+document_id+"/pdf"
            assert customer.request.get(pdf_url).status==404
            if kind=="invoice":
                owner.get_by_role("button",name="Submit for review",exact=True).click()
                owner.get_by_text("Draft submitted for Owner review.",exact=True).wait_for()
                owner.get_by_role("link",name="Preview draft",exact=True).click()
                owner.get_by_role("heading",name="Draft preview",exact=True).wait_for()
                owner.get_by_role("link",name="Review draft",exact=True).click()
                assert document_id not in customer.request.get(customer_url).text()
                owner.get_by_label("Return reason",exact=True).fill("PRIVATE-REVIEW-REASON: clarify scope")
                owner.get_by_role("button",name="Deny draft",exact=True).click()
                owner.get_by_text("Draft returned for changes.",exact=True).wait_for()
                assert "PRIVATE-REVIEW-REASON" in owner.locator("main").inner_text()
                assert document_id not in customer.request.get(customer_url).text()
                assert customer.request.get(BASE+"/documents/"+document_id+"/download?format=xlsx").status==404
                owner.get_by_label("Description line 2",exact=True).fill('=HYPERLINK("https://example.invalid","literal text")')
                owner.get_by_role("button",name="Save document draft").click()
                owner.get_by_text("Document draft saved.",exact=True).wait_for()
                owner.get_by_role("button",name="Submit for review",exact=True).click()
                owner.get_by_text("Draft submitted for Owner review.",exact=True).wait_for()
                stale=owner.context.new_page()
                stale.goto(draft_url,wait_until="networkidle")
                owner.get_by_label("Notes",exact=True).fill("Reviewed fictional correction")
                owner.get_by_role("button",name="Save document draft").click()
                owner.get_by_text("Document draft saved.",exact=True).wait_for()
                stale.get_by_label("Issue reason",exact=True).fill("Outdated approval")
                stale.get_by_label("I reviewed the saved draft and its PDF preview").check()
                stale.get_by_role("button",name="Approve and issue",exact=True).click()
                stale.get_by_role("alert").wait_for()
                stale.close()
                owner.get_by_role("button",name="Submit for review",exact=True).click()
                owner.get_by_text("Draft submitted for Owner review.",exact=True).wait_for()
                owner.goto(BASE+"/staff/documents/settings",wait_until="networkidle")
                owner.get_by_label("Bank instructions").fill("Future document bank settings")
                owner.get_by_label("I checked the business and bank details for document use").check()
                owner.get_by_role("button",name="Save document settings").click()
                owner.get_by_text("Document settings saved.",exact=True).wait_for()
                owner.goto(draft_url,wait_until="networkidle")
                assert "Fictional test bank instructions" in owner.locator(".document-paper").inner_text()
                assert "Future document bank settings" not in owner.locator("main").inner_text()
                for width in [320,390,768,1440]:
                    owner.set_viewport_size({"width":width,"height":900})
                    assert owner.evaluate("document.documentElement.scrollWidth<=innerWidth")
                approve_document(owner)
                print("Production denial, returned-draft editing, resubmission, stale approval and frozen review settings passed.",flush=True)
            else:
                issue_document(owner)
            document_refs.append(owner.get_by_role("heading",level=1).inner_text())
            customer.goto(BASE+"/account/jobs/"+job_url.rsplit("/",1)[1], wait_until="networkidle")
            customer.get_by_role("link",name="Documents",exact=True).click()
            row = customer.locator(".portal-documents li").filter(has_text=document_refs[-1])
            assert "Issued " in row.inner_text() and "ZMW 28900.00" in row.inner_text()
            row.get_by_role("link").click()
            assert "28900.00" in customer.locator("main").inner_text()
            issued=customer.request.get(pdf_url)
            assert issued.status==200 and issued.headers["content-type"]=="application/pdf"
            excel_url=BASE+"/documents/"+document_id+"/download?format=xlsx"
            excel=customer.request.get(excel_url)
            assert excel.status==200 and excel.body().startswith(b"PK")
            cells,ns=workbook_cells(excel)
            assert cells["F17"].find("s:v",ns).text=="25200.00"
            if kind=="invoice":
                assert cells["A18"].attrib["t"]=="inlineStr" and cells["A18"].find("s:f",ns) is None
                (ROOT/"test-results/010-issued.xlsx").write_bytes(excel.body())
            for format in ["pdf","xlsx"]:
                label = "Download PDF" if format == "pdf" else "Download Excel"
                with customer.expect_download() as download:
                    customer.get_by_role("link",name=label,exact=True).click()
                assert download.value.suggested_filename.endswith("."+format)
            assert guest.request.get(excel_url,max_redirects=0).status==307
            assert guest.request.get(pdf_url,max_redirects=0).status==307
        assert document_refs[0].startswith("TEST-I-") and document_refs[1].startswith("TEST-Q-")
        print("Production document submission, separate test sequences, Owner approval and protected PDF/Excel access passed.",flush=True)
        assert not errors,errors
        # Increment 009 publication must also work without a development inbox.
        owner.goto(BASE + "/staff/content", wait_until="networkidle")
        owner.get_by_label("Title", exact=True).fill("Fictional production publishing check")
        owner.get_by_role("button", name="Create draft").click()
        owner.wait_for_url("**/staff/content/*")
        draft_url = owner.url
        photo_form = owner.get_by_role("button", name="Register photo").locator("..")
        photo_form.get_by_label("Photo", exact=True).set_input_files({"name": "test.png", "mimeType": "image/png", "buffer": PNG})
        photo_form.get_by_label("Photo description").fill("Synthetic production image")
        photo_form.get_by_label("Photo source").fill("Synthetic test fixture")
        photo_form.get_by_role("button", name="Register photo").click()
        photo_form.get_by_role("status").wait_for()
        editor = owner.locator("[data-content-editor]")
        for label, value in [("Summary", "Fictional production summary"), ("Challenge", "Fictional challenge"),
                             ("Work carried out", "Fictional work"), ("Outcome", "Fictional outcome")]:
            editor.get_by_label(label, exact=True).fill(value)
        editor.get_by_label("Synthetic production image", exact=True).check()
        editor.get_by_role("button", name="Save draft").click()
        editor.get_by_role("status").wait_for()
        preview = owner.get_by_role("link", name="Preview saved draft").get_attribute("href")
        assert guest.request.get(BASE + preview, max_redirects=0).status == 307
        owner.get_by_label("Approval reason").fill("Approve fictional production test")
        owner.get_by_label("I checked the facts and publication permissions").check()
        owner.get_by_role("button", name="Publish saved draft").click()
        owner.get_by_text("Publication updated.", exact=True).wait_for()
        public_path = owner.get_by_role("link", name="View published content").get_attribute("href")
        guest.goto(BASE + public_path, wait_until="networkidle")
        assert "Fictional production summary" in guest.locator("main").inner_text()
        media_path = guest.locator(".publication-gallery img").get_attribute("src")
        assert guest.request.get(BASE + media_path).headers["content-type"] == "image/jpeg"
        editor.get_by_label("Summary", exact=True).fill("Private replacement draft")
        editor.get_by_role("button", name="Save draft").click()
        editor.get_by_role("status").wait_for()
        assert "Private replacement draft" not in guest.request.get(BASE + public_path).text()
        owner.get_by_label("Unpublish reason").fill("Verify removal")
        owner.get_by_role("button", name="Unpublish", exact=True).click()
        owner.get_by_text("Content unpublished.", exact=True).wait_for()
        assert guest.request.get(BASE + public_path).status == 404
        assert guest.request.get(BASE + media_path).status == 404
        # Existing repository projects retain their URL and do not reappear after Trash/restore.
        owner.goto(BASE+"/staff/content",wait_until="networkidle")
        owner.locator('[data-repository-project="home-water-pressure"]').get_by_role("link",name="Preview project",exact=True).click()
        owner.get_by_role("button",name="Edit project",exact=True).click()
        owner.wait_for_url(lambda url:"/staff/content/" in str(url) and "/repository/" not in str(url))
        source_draft=owner.url
        owner.get_by_label("Summary",exact=True).fill("Fictional production repository replacement")
        owner.get_by_role("button",name="Save draft",exact=True).click()
        owner.get_by_text("Draft saved.",exact=True).wait_for()
        owner.get_by_label("Approval reason",exact=True).fill("Check managed repository publication")
        owner.get_by_label("I checked the facts and publication permissions").check()
        owner.get_by_role("button",name="Publish saved draft",exact=True).click()
        owner.get_by_text("Publication updated.",exact=True).wait_for()
        source_path="/projects/home-water-pressure"
        assert "Fictional production repository replacement" in guest.request.get(BASE+source_path).text()
        assert customer.request.get(source_draft).status==403
        owner.get_by_label("Delete reason",exact=True).fill("Check recoverable deletion")
        owner.get_by_label("I understand this removes the public version and moves the record to Trash").check()
        owner.get_by_role("button",name="Delete project",exact=True).click()
        owner.get_by_text("Content moved to Trash.",exact=True).wait_for()
        assert guest.request.get(BASE+source_path).status==404
        owner.get_by_role("button",name="Restore as draft",exact=True).click()
        owner.get_by_text("Content restored as a draft.",exact=True).wait_for()
        assert guest.request.get(BASE+source_path).status==404
        assert source_path not in guest.request.get(BASE+"/sitemap.xml").text()
        print("Production existing-project replacement, stable URL, Owner Trash and unpublished restore passed.",flush=True)
        owner.goto(draft_url,wait_until="networkidle")
        # Republish the sample, then check the launch-mode filter on the same data.
        owner.get_by_label("Approval reason").fill("Republish for launch filter check")
        owner.get_by_label("I checked the facts and publication permissions").check()
        owner.get_by_role("button", name="Publish saved draft").click()
        owner.get_by_text("Publication updated.", exact=True).wait_for()
        owner.goto("about:blank")
        customer.goto("about:blank")
        guest.goto("about:blank")
        owner.goto(job_url,wait_until="networkidle")
        assert "160 Wh" in owner.locator("[data-solar-summary]").inner_text()
        owner.get_by_label("Reason for revoking access").fill("Historical snapshot verification complete")
        owner.get_by_role("button",name="Revoke customer access").click()
        owner.get_by_text("Customer access revoked.",exact=True).wait_for()
        assert customer.request.get(BASE+"/account/jobs/"+job_url.rsplit("/",1)[1]).status==404
        owner.goto("about:blank")
        print("Production retired planner, normal intake, historical request details and revoked access passed.",flush=True)
        stop(server)
        server = None
        ENV["MIAS_PUBLIC_LAUNCH"] = "true"
        server = start()
        assert guest.request.get(BASE + public_path).status == 404
        assert guest.request.get(BASE + media_path).status == 404
        assert public_path not in guest.request.get(BASE + "/sitemap.xml").text()
        assert "Fictional example" not in guest.request.get(BASE + "/projects").text()
        assert not errors, errors
        print("Production publishing, private preview, snapshot isolation, unpublish and launch filtering passed.", flush=True)
        browser.close()
        print(json.dumps({"production_routes": len(expected), "owner_and_customer_journey": "passed", "private_notes_excluded": True,
                          "production_simulation_cookie_inert": True, "runtime_errors": errors}), flush=True)
finally:
    stop(server)
