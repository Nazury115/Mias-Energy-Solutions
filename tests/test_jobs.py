"""Increment 008 journeys, written before the job implementation."""
import re
import uuid
from pathlib import Path
from urllib.parse import urlsplit

import pytest

from test_accounts import PASSWORD, customer, inbox_link, new_page, owner, sign_in, unique_email

pytestmark = pytest.mark.browser


def request_job(browser, base_url, phone=True, email=True, simulate=None):
    page = new_page(browser)
    console, navigations = [], []
    page.on("console", lambda message: console.append(message.text) if message.type == "error" or "Fast Refresh" in message.text else None)
    page.on("framenavigated", lambda frame: navigations.append(frame.url) if frame == page.main_frame else None)
    contact = unique_email("job") if email else ""
    number = "+260977" + str(int(uuid.uuid4().hex[:8], 16) % 1_000_000).zfill(6) if phone else ""
    if simulate:
        page.context.add_cookies([{"name": "mias-simulate", "value": simulate, "url": base_url}])
    page.goto(base_url + "/contact", wait_until="networkidle")
    page.get_by_role("button", name="Prepare WhatsApp message", exact=True).wait_for()
    page.get_by_label("Your name").fill("Job Test Customer")
    if email:
        page.get_by_label("Email address").fill(contact)
        page.get_by_role("radio", name="Email", exact=True).check()
    if phone:
        page.get_by_label("Phone number", exact=True).fill(number)
    page.get_by_label("Project details").fill("Please assess our booster set.")
    navigations.clear()
    page.wait_for_timeout(3200)
    page.get_by_role("button", name="Send inquiry to Mias").click()
    try:
        page.get_by_role("status").get_by_text("Thank you").wait_for()
    except Exception:
        snapshot = page.locator("main").inner_text()[:1200]
        page.screenshot(path=str(Path(__file__).resolve().parents[1] / "test-results/008-contact-failure.png"))
        page.context.close()
        raise AssertionError({"contact_page": snapshot, "navigations_after_fill": navigations, "console": console[-5:]})
    reference = re.search(r"MES-\d{2}-[0-9A-HJKMNP-TV-Z]{5}", page.locator("main").inner_text()).group()
    page.context.close()
    return reference, contact, number


def accept_job(staff, base_url, reference):
    staff.goto(base_url + "/staff?q=" + reference, wait_until="networkidle")
    row = staff.locator("tbody tr", has_text=reference)
    row.get_by_role("link", name="Review / accept", exact=True).click()
    form = staff.locator("form[data-accept-job]")
    form.get_by_label("Agreed scope").fill("Assess and repair the booster set")
    form.get_by_label("Next step").fill("Arrange a site visit")
    form.get_by_label("Reason").fill("Customer confirmed the assessment")
    form.get_by_role("button", name="Accept and create job").click()
    staff.wait_for_url("**/staff/jobs/*")
    staff.get_by_role("heading", level=1, name=re.compile(r"^JOB-")).wait_for()
    staff.wait_for_load_state("networkidle")
    return urlsplit(staff.url)._replace(query="", fragment="").geturl()


def invite_customer(staff, base_url, job_url, email):
    staff.goto(job_url, wait_until="networkidle")
    form = staff.locator("form[data-customer-invite]")
    form.get_by_label("Customer name").fill("Job Test Customer")
    form.get_by_label("Customer email").fill(email)
    form.get_by_label("I have checked this customer's identity and contact details").check()
    form.get_by_role("button", name="Invite customer").click()
    form.get_by_role("status").wait_for()
    return inbox_link(staff, base_url, email, "job-invitation")


def open_new_customer(page, invite):
    page.goto(invite, wait_until="networkidle")
    page.get_by_label("Choose a password").fill(PASSWORD)
    page.get_by_role("button", name="Create account and open job").click()
    page.wait_for_url("**/account/jobs/*")


@pytest.mark.parametrize("phone,email,channels", [(True, True, ["email", "sms"]), (False, True, ["email"]), (True, False, ["sms"])])
def test_receipts_are_captured_once_per_available_channel(browser, base_url, phone, email, channels):
    ref, address, number = request_job(browser, base_url, phone, email)
    page = new_page(browser)
    try:
        page.goto(base_url + "/dev/inbox", wait_until="networkidle")
        for channel in channels:
            row = page.locator(f'[data-notification-kind="request-receipt"][data-channel="{channel}"]', has_text=ref)
            assert row.count() == 1
            assert row.get_attribute("data-delivery-status") == "sent"
        if not phone:
            assert page.locator('[data-notification-kind="request-receipt"][data-channel="sms"]', has_text=ref).count() == 0
    finally:
        page.context.close()


@pytest.mark.parametrize("failed,successful", [("sms", "email"), ("email", "sms")])
def test_channel_failure_does_not_block_the_other_and_is_retried(browser, base_url, failed, successful):
    ref, _, _ = request_job(browser, base_url, simulate=f"{failed}-failure")
    page = new_page(browser)
    try:
        page.context.add_cookies([{"name": "mias-simulate", "value": f"{failed}-failure", "url": base_url}])
        page.goto(base_url + "/dev/inbox", wait_until="networkidle")
        receipt = '[data-notification-kind="request-receipt"]'
        assert page.locator(receipt + f'[data-channel="{successful}"]', has_text=ref).get_attribute("data-delivery-status") == "sent"
        assert page.locator(receipt + f'[data-channel="{failed}"]', has_text=ref).get_attribute("data-delivery-status") == "failed"
        page.context.clear_cookies()
        page.reload(wait_until="networkidle")
        assert page.locator(receipt + f'[data-channel="{failed}"]', has_text=ref).get_attribute("data-delivery-status") == "sent"
        assert page.locator(receipt + f'[data-channel="{successful}"]', has_text=ref).get_attribute("data-attempts") == "1"
    finally:
        page.context.close()


def test_guest_request_becomes_private_job_with_progress_and_messages(browser, base_url):
    ref, email, _ = request_job(browser, base_url)
    staff, _ = owner(browser, base_url)
    visitor = new_page(browser)
    stranger = None
    try:
        job_url = accept_job(staff, base_url, ref)
        customer_url = base_url + "/account/jobs/" + job_url.rsplit("/", 1)[1]
        # Staff-only notes and public updates are separate stored events.
        staff.get_by_label("Internal note", exact=True).fill("PRIVATE-008-SENTINEL")
        staff.get_by_role("button", name="Save private note").click()
        staff.get_by_text("Private note saved.", exact=True).wait_for()
        staff.get_by_label("Customer update", exact=True).fill("We are arranging your site assessment.")
        staff.get_by_role("button", name="Publish update").click()
        staff.get_by_text("Customer update saved.", exact=True).wait_for()
        invite = invite_customer(staff, base_url, job_url, email)
        for channel in ["email", "sms"]:
            assert staff.locator(f'[data-notification-kind="request-accepted"][data-channel="{channel}"]', has_text=job_url.rsplit("/", 1)[1]).count() == 1
        open_new_customer(visitor, invite)
        assert visitor.url == customer_url
        text = visitor.locator("main").inner_text()
        assert "Arrange a site visit" in text and "We are arranging your site assessment." in text
        assert "PRIVATE-008-SENTINEL" not in visitor.content()
        visitor.get_by_label("Message to Mias").fill("Please call before visiting.")
        visitor.get_by_role("button", name="Send message", exact=True).click()
        visitor.locator("main").get_by_role("status").wait_for()
        no_js = browser.new_context(java_script_enabled=False, reduced_motion="reduce", storage_state=visitor.context.storage_state())
        plain = no_js.new_page()
        plain.goto(customer_url, wait_until="networkidle")
        plain.get_by_label("Message to Mias").fill("No-JavaScript job message")
        plain.get_by_role("button", name="Send message", exact=True).click()
        plain.locator("main").get_by_role("status").wait_for()
        no_js.close()
        staff.goto(job_url, wait_until="networkidle")
        assert "Please call before visiting." in staff.locator("main").inner_text()
        assert "No-JavaScript job message" in staff.locator("main").inner_text()
        for width in [320, 390, 768, 1366, 1440]:
            for view in [visitor, staff]:
                view.set_viewport_size({"width": width, "height": 900})
                assert view.evaluate("document.documentElement.scrollWidth <= innerWidth"), f"Job overflow at {width}px"
            if width in [390, 1440]:
                output = Path(__file__).resolve().parents[1] / "test-results"
                visitor.screenshot(path=str(output / f"008-customer-{width}.png"))
                staff.screenshot(path=str(output / f"008-staff-{width}.png"))
        stranger, _ = customer(browser, base_url, name="Other Customer")
        response = stranger.goto(customer_url, wait_until="networkidle")
        assert response.status == 404
        response = stranger.goto(job_url, wait_until="networkidle")
        assert response.status == 403
        visitor.goto(invite, wait_until="networkidle")
        assert "already been used" in visitor.locator("main").inner_text()
    finally:
        staff.context.close()
        visitor.context.close()
        if stranger: stranger.context.close()


def test_existing_customer_must_sign_in_before_accepting_job_access(browser, base_url):
    existing, email = customer(browser, base_url)
    ref, _, _ = request_job(browser, base_url)
    staff, _ = owner(browser, base_url)
    signed_out = new_page(browser)
    try:
        job_url = accept_job(staff, base_url, ref)
        invite = invite_customer(staff, base_url, job_url, email)
        signed_out.goto(invite, wait_until="networkidle")
        signed_out.get_by_role("link", name="Sign in to accept").wait_for()
        existing.goto(invite, wait_until="networkidle")
        existing.get_by_role("button", name="Accept job access").click()
        existing.wait_for_url("**/account/jobs/*")
        staff.goto(job_url, wait_until="networkidle")
        staff.get_by_label("Reason for revoking access").fill("Test revocation after identity review")
        staff.get_by_role("button", name="Revoke customer access").click()
        staff.locator("main").get_by_role("status").wait_for()
        assert existing.reload(wait_until="networkidle").status == 404
    finally:
        existing.context.close()
        staff.context.close()
        signed_out.context.close()


def test_stale_job_edit_is_rejected_and_history_is_retained(browser, base_url):
    ref, _, _ = request_job(browser, base_url)
    staff, _ = owner(browser, base_url)
    second = staff.context.new_page()
    try:
        job_url = accept_job(staff, base_url, ref)
        second.goto(job_url, wait_until="networkidle")
        form = staff.locator("form[data-workflow-form]")
        form.get_by_label("Stage", exact=True).select_option("scheduled")
        form.get_by_label("Reason").fill("Visit agreed with customer")
        form.get_by_role("button", name="Update job").click()
        staff.locator("main").get_by_role("status").wait_for()
        old = second.locator("form[data-workflow-form]")
        old.get_by_label("Next step").fill("This stale change must not win")
        old.get_by_label("Reason").fill("Outdated edit")
        # A different form refreshes the page's server data. The edited workflow must
        # retain its old version rather than silently adopting the newer record.
        second.get_by_label("Internal note", exact=True).fill("Refresh while a draft is open")
        second.get_by_role("button", name="Save private note").click()
        second.locator("main").get_by_role("status").wait_for()
        old.get_by_role("button", name="Update job").click()
        second.locator("main").get_by_role("alert").wait_for()
        assert "changed" in second.locator("main").get_by_role("alert").inner_text().lower()
        staff.reload(wait_until="networkidle")
        assert "Visit agreed with customer" in staff.locator("main").inner_text()
        assert "This stale change must not win" not in staff.locator("main").inner_text()
        staff.goto(base_url + "/staff/inquiries/" + ref, wait_until="networkidle")
        assert staff.locator("form[data-accept-job]").count() == 0
        staff.get_by_role("link", name="Open job").wait_for()
    finally:
        staff.context.close()


def test_new_job_routes_require_sign_in(browser, base_url):
    page = new_page(browser)
    try:
        for path in ["/staff/jobs", "/staff/jobs/JOB-26-ABCDE", "/account/jobs/JOB-26-ABCDE"]:
            page.goto(base_url + path, wait_until="networkidle")
            assert "/sign-in?next=" in page.url
    finally:
        page.context.close()


def test_resending_and_cancelling_customer_invitation_and_wrong_account(browser, base_url):
    ref, email, _ = request_job(browser, base_url)
    staff, _ = owner(browser, base_url)
    other, _ = customer(browser, base_url)
    guest = new_page(browser)
    try:
        job_url = accept_job(staff, base_url, ref)
        old = invite_customer(staff, base_url, job_url, email)
        current = invite_customer(staff, base_url, job_url, email)
        guest.goto(old, wait_until="networkidle")
        assert "cancelled" in guest.locator("main").inner_text()
        other.goto(current, wait_until="networkidle")
        assert "Sign out" in other.locator("main").inner_text()
        assert other.get_by_role("button", name="Accept job access").count() == 0
        staff.goto(job_url, wait_until="networkidle")
        staff.get_by_role("button", name="Cancel customer invitation").click()
        staff.locator("main").get_by_role("status").wait_for()
        guest.goto(current, wait_until="networkidle")
        assert "cancelled" in guest.locator("main").inner_text()
    finally:
        staff.context.close()
        other.context.close()
        guest.context.close()


def test_customer_cannot_post_a_copied_staff_action(browser, base_url):
    ref, _, _ = request_job(browser, base_url)
    staff, _ = owner(browser, base_url)
    attacker, _ = customer(browser, base_url)
    try:
        job_url = accept_job(staff, base_url, ref)
        form = staff.locator("form[data-workflow-form]")
        form.get_by_label("Reason").fill("Authorized control update")
        with staff.expect_request(lambda request: request.method == "POST" and request.url == job_url) as captured:
            form.get_by_role("button", name="Update job").click()
        staff.locator("main").get_by_role("status").wait_for()
        request = captured.value
        # Replay a valid wire-format action with the customer's cookies. Reconstructing the
        # progressive-form encoding instead produced an unrelated 400, before authorization.
        headers = {key: value for key, value in request.headers.items() if key in ["next-action", "content-type", "accept", "next-router-state-tree"]}
        headers["Origin"] = base_url
        body = request.post_data.replace("Authorized control update", "FORGED CUSTOMER EDIT")
        assert "FORGED CUSTOMER EDIT" in body
        response = attacker.request.post(job_url, data=body, headers=headers)
        assert response.status == 403
        staff.goto(job_url, wait_until="networkidle")
        assert "FORGED CUSTOMER EDIT" not in staff.locator("main").inner_text()
    finally:
        staff.context.close()
        attacker.context.close()


def test_invalid_stage_change_preserves_the_staff_edit(browser, base_url):
    ref, _, _ = request_job(browser, base_url)
    staff, _ = owner(browser, base_url)
    try:
        accept_job(staff, base_url, ref)
        form = staff.locator("form[data-workflow-form]")
        form.get_by_label("Next step").fill("Keep this unsaved next step for correction")
        form.get_by_label("Reason").fill("Keep this unsaved reason")
        form.get_by_label("Stage", exact=True).select_option("completed")
        assert form.get_by_label("Next step").input_value() == "Keep this unsaved next step for correction"
        form.get_by_role("button", name="Update job").click()
        form.get_by_role("alert").wait_for()
        assert form.get_by_label("Next step").input_value() == "Keep this unsaved next step for correction"
        assert form.get_by_label("Reason").input_value() == "Keep this unsaved reason"
    finally:
        staff.context.close()


def test_acceptance_shortcut_without_javascript_opens_new_job_at_top(browser, base_url):
    reference, _, _ = request_job(browser, base_url)
    staff, _ = owner(browser, base_url)
    plain_context = browser.new_context(java_script_enabled=False, reduced_motion="reduce", storage_state=staff.context.storage_state(), viewport={"width": 1366, "height": 900})
    try:
        page = plain_context.new_page()
        page.goto(base_url + "/staff?q=" + reference, wait_until="networkidle")
        page.get_by_role("link", name="Review / accept", exact=True).click()
        form = page.locator("form[data-accept-job]")
        form.get_by_label("Agreed scope").fill("Assess the booster set")
        form.get_by_label("Next step").fill("Arrange the assessment")
        form.get_by_label("Reason").fill("Customer confirmed the assessment")
        form.get_by_role("button", name="Accept and create job", exact=True).click()
        page.wait_for_url("**/staff/jobs/*")
        assert urlsplit(page.url).fragment == "main-content"
        heading = page.get_by_role("heading", level=1)
        assert heading.inner_text().startswith("JOB-")
        assert 0 <= heading.bounding_box()["y"] < 900
    finally:
        plain_context.close()
        staff.context.close()
