import random
import re
import uuid
from urllib.request import urlopen

import pytest
from test_foundation import Document

REFERENCE = re.compile(r"MES-\d{2}-[0-9A-HJKMNP-TV-Z]{5}")
MIN_FILL_WAIT_MS = 3200  # the form rejects submissions sent within 3 seconds of opening it


def fetch(base_url, path):
    with urlopen(base_url + path, timeout=45) as response:
        assert response.status == 200
        return Document(response.read().decode())


def new_page(browser, base_url, javascript=True, simulate=None, address=None):
    # Without JavaScript, Playwright's automatic scrolling fights the site's CSS smooth scrolling and the
    # target never settles; "reduce motion" switches smooth scrolling off without changing what is tested.
    context = browser.new_context(java_script_enabled=javascript, viewport={"width": 1366, "height": 900},
                                  reduced_motion="no-preference" if javascript else "reduce",
                                  extra_http_headers={"x-forwarded-for": address or f"10.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"})
    if simulate:
        context.add_cookies([{"name": "mias-simulate", "value": simulate, "url": base_url}])
    return context.new_page()


def unique_email():
    return f"visitor-{uuid.uuid4().hex[:10]}@example.com"


def open_form(page, base_url, javascript=True):
    page.goto(base_url + "/contact", wait_until="networkidle")
    if javascript:
        # This enhancement appears after React's mount effect. Network idle alone
        # can occur before hydration on a busy development server.
        page.get_by_role("button", name="Prepare WhatsApp message", exact=True).wait_for()


def fill_form(page, email, name="Test Visitor", details="Please check our booster pump."):
    page.get_by_label("Your name").fill(name)
    page.get_by_label("Email address").fill(email)
    page.get_by_role("radio", name="Email").check()
    page.get_by_label("Project details").fill(details)


def send(page, wait=True):
    if wait:
        page.wait_for_timeout(MIN_FILL_WAIT_MS)
    page.get_by_role("button", name="Send inquiry to Mias").click()


def inbox_entry(page, base_url, email):
    page.goto(base_url + "/dev/inbox", wait_until="networkidle")
    return page.locator("[data-inquiry]", has_text=email)


@pytest.mark.integration
def test_contact_form_markup(base_url):
    doc = fetch(base_url, "/contact")
    inputs = {attrs.get("name"): attrs for tag, attrs in doc.tags if tag == "input"}
    assert inputs["formToken"].get("type") == "hidden" and inputs["formToken"].get("value")
    assert inputs["idempotencyKey"].get("type") == "hidden" and inputs["idempotencyKey"].get("value")
    trap = inputs["mias_check"]
    assert trap.get("tabindex") == "-1" and trap.get("autocomplete") == "off"
    assert {"phone", "email", "name", "area"} <= set(inputs)
    assert any(tag == "a" and attrs.get("href") == "/privacy" for tag, attrs in doc.tags)


@pytest.mark.integration
def test_privacy_notice_page(base_url):
    doc = fetch(base_url, "/privacy")
    assert sum(tag == "h1" for tag, _ in doc.tags) == 1
    assert any(tag == "meta" and attrs.get("name") == "robots" and "noindex" in attrs.get("content", "") for tag, attrs in doc.tags)
    text = " ".join(doc.text)
    assert "Draft" in text and "phone" in text and "email" in text and "delete" in text


@pytest.mark.integration
def test_development_inbox_is_available_in_development(base_url):
    doc = fetch(base_url, "/dev/inbox")
    assert any(tag == "meta" and attrs.get("name") == "robots" and "noindex" in attrs.get("content", "") for tag, attrs in doc.tags)


@pytest.mark.browser
def test_inquiry_is_received_and_notified(browser, base_url):
    page, email = new_page(browser, base_url), unique_email()
    try:
        open_form(page, base_url)
        fill_form(page, email, details="Booster pump keeps cycling on and off.")
        send(page)
        success = page.get_by_role("status")
        success.get_by_text("Thank you").wait_for()
        reference = REFERENCE.search(success.inner_text()).group(0)
        entry = inbox_entry(page, base_url, email)
        assert entry.count() == 1
        assert entry.get_attribute("data-inquiry") == reference
        assert entry.get_attribute("data-notification-status") == "sent"
        assert "Booster pump keeps cycling" in entry.inner_text()
    finally:
        page.context.close()


@pytest.mark.browser
def test_validation_keeps_input_and_focuses_first_error(browser, base_url):
    page = new_page(browser, base_url)
    try:
        open_form(page, base_url)
        page.get_by_label("Your name").fill("Test Visitor")
        page.get_by_label("Project details").fill("No contact details given.")
        send(page)
        page.get_by_text("Give a phone number or an email address").first.wait_for()
        assert page.evaluate("document.activeElement.name") == "phone"
        assert page.get_by_label("Your name").input_value() == "Test Visitor"
        assert page.get_by_label("Phone number").get_attribute("aria-invalid") == "true"
    finally:
        page.context.close()


@pytest.mark.browser
def test_database_failure_is_reported_honestly(browser, base_url):
    page, email = new_page(browser, base_url, simulate="db-failure"), unique_email()
    try:
        open_form(page, base_url)
        fill_form(page, email)
        send(page)
        alert = page.get_by_role("alert")
        alert.get_by_text("couldn’t save your inquiry").wait_for()
        assert alert.locator('a[href="tel:+260977747285"]').count() == 1
        assert page.get_by_label("Email address").input_value() == email
        assert page.get_by_role("status").filter(has_text="Thank you").count() == 0
        page.context.clear_cookies()
        assert inbox_entry(page, base_url, email).count() == 0
    finally:
        page.context.close()


@pytest.mark.browser
def test_notification_failure_is_reported_and_retried(browser, base_url):
    page, email = new_page(browser, base_url, simulate="notify-failure"), unique_email()
    try:
        open_form(page, base_url)
        fill_form(page, email)
        send(page)
        status = page.get_by_role("status")
        status.get_by_text("is saved").wait_for()
        assert REFERENCE.search(status.inner_text())
        assert "also" in status.inner_text()
        assert inbox_entry(page, base_url, email).get_attribute("data-notification-status") == "failed"
        page.context.clear_cookies()
        assert inbox_entry(page, base_url, email).get_attribute("data-notification-status") == "sent"
    finally:
        page.context.close()


@pytest.mark.browser
@pytest.mark.parametrize("trick", ["honeypot", "too-fast"])
def test_spam_looks_accepted_but_is_not_stored(browser, base_url, trick):
    page, email = new_page(browser, base_url), unique_email()
    try:
        open_form(page, base_url)
        fill_form(page, email)
        if trick == "honeypot":
            page.locator("input[name=mias_check]").evaluate("field => { field.value = 'http://spam.example'; }")
        else:
            # Page load time varies, so swap in a token issued a moment ago to guarantee a too-fast submission.
            fresh = re.search(r'name="formToken" value="([^"]+)"', page.request.get(base_url + "/contact").text()).group(1)
            page.locator("input[name=formToken]").evaluate("(field, value) => { field.value = value; }", fresh)
        send(page, wait=trick != "too-fast")
        page.get_by_role("status").get_by_text("Thank you").wait_for()
        assert inbox_entry(page, base_url, email).count() == 0
    finally:
        page.context.close()


@pytest.mark.browser
def test_hourly_limit_per_network_address(browser, base_url):
    address = f"172.16.{random.randint(0, 255)}.{random.randint(1, 254)}"
    page = new_page(browser, base_url, address=address)
    try:
        for _ in range(5):
            open_form(page, base_url)
            fill_form(page, unique_email())
            send(page)
            page.get_by_role("status").get_by_text("Thank you").wait_for()
        open_form(page, base_url)
        fill_form(page, unique_email())
        send(page)
        page.get_by_role("alert").get_by_text("sent several inquiries recently").wait_for()
    finally:
        page.context.close()


@pytest.mark.browser
def test_daily_limit_per_contact(browser, base_url):
    email = unique_email()
    for attempt in range(4):
        page = new_page(browser, base_url)
        try:
            open_form(page, base_url)
            fill_form(page, email)
            send(page)
            if attempt < 3:
                page.get_by_role("status").get_by_text("Thank you").wait_for()
            else:
                page.get_by_role("alert").get_by_text("sent several inquiries recently").wait_for()
        finally:
            page.context.close()


@pytest.mark.browser
def test_repeated_submission_creates_one_inquiry(browser, base_url):
    page, email = new_page(browser, base_url), unique_email()
    try:
        open_form(page, base_url)
        fill_form(page, email)
        page.wait_for_timeout(MIN_FILL_WAIT_MS)
        page.evaluate("() => { const form = document.querySelector('form[data-inquiry-form]'); form.requestSubmit(); form.requestSubmit(); }")
        page.get_by_role("status").get_by_text("Thank you").wait_for()
        page.wait_for_timeout(1500)
        assert inbox_entry(page, base_url, email).count() == 1
    finally:
        page.context.close()


@pytest.mark.browser
def test_details_entered_before_hydration_are_retained(browser, base_url):
    page, email = new_page(browser, base_url), unique_email()
    page.emulate_media(reduced_motion="reduce")
    delayed_scripts = []
    release_scripts = False
    scripts = re.compile(r"/_next/static/.*\.js(?:\?|$)")
    def hold_script(route):
        if release_scripts:
            route.continue_()
        else:
            delayed_scripts.append(route)
    page.route(scripts, hold_script)
    try:
        # Render the usable server form while holding its JavaScript, as on a slow connection.
        page.goto(base_url + "/contact", wait_until="commit")
        fill_form(page, email, name="Early Visitor", details="Details typed before JavaScript loaded.")
        assert delayed_scripts
        release_scripts = True
        for route in list(delayed_scripts):
            route.continue_()
        page.get_by_role("button", name="Prepare WhatsApp message", exact=True).wait_for()
        assert page.get_by_label("Your name").input_value() == "Early Visitor"
        assert page.get_by_label("Email address").input_value() == email
        assert page.get_by_role("radio", name="Email", exact=True).is_checked()
        assert page.get_by_label("Project details").input_value() == "Details typed before JavaScript loaded."
        send(page)
        page.get_by_role("status").get_by_text("Thank you").wait_for()
        assert inbox_entry(page, base_url, email).count() == 1
    finally:
        page.context.close()


@pytest.mark.browser
def test_form_works_without_javascript(browser, base_url):
    page, email = new_page(browser, base_url, javascript=False), unique_email()
    try:
        open_form(page, base_url, javascript=False)
        fill_form(page, email)
        send(page)
        page.get_by_text("Thank you").first.wait_for()
        assert REFERENCE.search(page.locator("main").inner_text())
    finally:
        page.context.close()
    checker = new_page(browser, base_url)
    try:
        assert inbox_entry(checker, base_url, email).count() == 1
    finally:
        checker.context.close()
