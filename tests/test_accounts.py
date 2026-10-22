import random
import re
import uuid

import pytest

pytestmark = pytest.mark.browser
PASSWORD = "pump station at dawn"
REFERENCE = re.compile(r"MES-\d{2}-[0-9A-HJKMNP-TV-Z]{5}")


def new_page(browser, javascript=True):
    context = browser.new_context(java_script_enabled=javascript, viewport={"width": 1366, "height": 900},
                                  reduced_motion="no-preference" if javascript else "reduce",
                                  extra_http_headers={"x-forwarded-for": f"10.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"})
    return context.new_page()


def unique_email(prefix="customer"):
    return f"{prefix}-{uuid.uuid4().hex[:10]}@example.com"


def inbox_link(page, base_url, email, kind):
    page.goto(base_url + "/dev/inbox", wait_until="networkidle")
    message = page.locator(f'[data-email-kind="{kind}"][data-email-to="{email}"]').first
    return message.locator("[data-email-link]").get_attribute("href")


def sign_up(page, base_url, email, name="Test Customer", password=PASSWORD):
    page.goto(base_url + "/sign-up", wait_until="networkidle")
    page.get_by_label("Your name").fill(name)
    page.get_by_label("Email address").fill(email)
    page.get_by_label("Password").fill(password)
    page.get_by_role("button", name="Create account").click()
    page.get_by_role("heading", name="Check your email").wait_for()


def confirm(page, base_url, email):
    page.goto(inbox_link(page, base_url, email, "verify-email"), wait_until="networkidle")
    page.get_by_role("heading", name="Email confirmed").wait_for()


def sign_in(page, base_url, email, password=PASSWORD):
    page.goto(base_url + "/sign-in", wait_until="networkidle")
    page.get_by_label("Email address").fill(email)
    page.get_by_label("Password").fill(password)
    page.get_by_role("button", name="Sign in").click()


def customer(browser, base_url, name="Test Customer"):
    page, email = new_page(browser), unique_email()
    sign_up(page, base_url, email, name=name)
    confirm(page, base_url, email)
    sign_in(page, base_url, email)
    page.wait_for_url("**/account")
    return page, email


def owner(browser, base_url):
    page, email = new_page(browser), unique_email("owner")
    page.goto(base_url + "/dev/inbox", wait_until="networkidle")
    page.get_by_label("Owner name").fill("Test Owner")
    page.get_by_label("Owner email").fill(email)
    page.get_by_role("button", name="Create Owner invitation").click()
    page.goto(page.locator("[data-owner-invite]").get_attribute("href"), wait_until="networkidle")
    page.get_by_label("Choose a password").fill(PASSWORD)
    page.get_by_role("button", name="Create my account").click()
    page.wait_for_url("**/staff")
    return page, email


def invite_staff(owner_page, base_url, email, name="Test Staff"):
    owner_page.goto(base_url + "/staff/team", wait_until="networkidle")
    form = owner_page.locator("form[data-invite-form]")
    form.get_by_label("Name").fill(name)
    form.get_by_label("Email address").fill(email)
    form.get_by_label("Role").select_option("staff")
    form.get_by_role("button", name="Send invitation").click()
    owner_page.locator("[data-invitation]", has_text=email).wait_for()
    return inbox_link(owner_page, base_url, email, "invitation")


def test_sign_up_confirm_and_sign_in(browser, base_url):
    page, email = new_page(browser), unique_email()
    try:
        sign_up(page, base_url, email, name="Chanda Mwila")
        sign_in(page, base_url, email)
        page.get_by_text("Confirm your email first").wait_for()
        confirm(page, base_url, email)
        sign_in(page, base_url, email)
        page.wait_for_url("**/account")
        page.get_by_role("heading", name="My account").wait_for()
        assert "Chanda Mwila" in page.locator("main").inner_text() and email in page.locator("main").inner_text()
    finally:
        page.context.close()


def test_existing_email_sign_up_reveals_nothing(browser, base_url):
    page, email = customer(browser, base_url)
    other = new_page(browser)
    try:
        sign_up(other, base_url, email, name="Someone Else", password="another long passphrase")
        assert inbox_link(other, base_url, email, "signup-notice")
        sign_in(other, base_url, email)
        other.wait_for_url("**/account")
    finally:
        page.context.close()
        other.context.close()


def test_wrong_password_and_unknown_email_get_the_same_message(browser, base_url):
    page, email = customer(browser, base_url)
    other = new_page(browser)
    try:
        sign_in(other, base_url, email, password="not the right passphrase")
        wrong = other.locator("main").get_by_role("alert").inner_text()
        sign_in(other, base_url, unique_email(), password="not the right passphrase")
        unknown = other.locator("main").get_by_role("alert").inner_text()
        assert wrong == unknown and "don’t match" in wrong
    finally:
        page.context.close()
        other.context.close()


def test_sign_in_locks_after_five_failures(browser, base_url):
    page, email = customer(browser, base_url)
    other = new_page(browser)
    try:
        for _ in range(5):
            sign_in(other, base_url, email, password="not the right passphrase")
            other.locator("main").get_by_role("alert").wait_for()
        sign_in(other, base_url, email)
        other.locator("main").get_by_role("alert").get_by_text("Too many attempts").wait_for()
        assert "/sign-in" in other.url
    finally:
        page.context.close()
        other.context.close()


def test_password_reset(browser, base_url):
    signed_in, email = customer(browser, base_url)
    page = new_page(browser)
    try:
        page.goto(base_url + "/forgot-password", wait_until="networkidle")
        page.get_by_label("Email address").fill(unique_email())
        page.get_by_role("button", name="Email me a reset link").click()
        generic = page.locator("main").get_by_role("status").inner_text()
        page.goto(base_url + "/forgot-password", wait_until="networkidle")
        page.get_by_label("Email address").fill(email)
        page.get_by_role("button", name="Email me a reset link").click()
        assert page.locator("main").get_by_role("status").inner_text() == generic
        link = inbox_link(page, base_url, email, "reset-password")
        page.goto(link, wait_until="networkidle")
        page.get_by_label("New password").fill("a brand new passphrase")
        page.get_by_role("button", name="Set new password").click()
        page.get_by_role("heading", name="Password changed").wait_for()

        signed_in.goto(base_url + "/account", wait_until="networkidle")
        assert "/sign-in" in signed_in.url, "other sessions must end after a reset"
        sign_in(page, base_url, email)
        page.locator("main").get_by_role("alert").wait_for()
        sign_in(page, base_url, email, password="a brand new passphrase")
        page.wait_for_url("**/account")
        page.goto(link, wait_until="networkidle")
        page.get_by_label("New password").fill("yet another passphrase")
        page.get_by_role("button", name="Set new password").click()
        page.get_by_text("isn’t valid or has expired").wait_for()
    finally:
        signed_in.context.close()
        page.context.close()


def test_sign_out_and_role_boundaries(browser, base_url):
    page, _ = customer(browser, base_url)
    anonymous = new_page(browser)
    try:
        for path in ["/account", "/staff", "/staff/team"]:
            anonymous.goto(base_url + path, wait_until="networkidle")
            assert "/sign-in" in anonymous.url, path
        for path in ["/staff", "/staff/team", "/staff/inquiries/MES-26-AAAAA"]:
            response = page.goto(base_url + path, wait_until="networkidle")
            assert response.status == 403, path
            page.get_by_role("heading", name="You don’t have access to this page").wait_for()
        page.goto(base_url + "/account", wait_until="networkidle")
        page.locator("main").get_by_role("button", name="Sign out").click()  # the header has one too
        page.wait_for_url(base_url + "/")
        page.goto(base_url + "/account", wait_until="networkidle")
        assert "/sign-in" in page.url
    finally:
        page.context.close()
        anonymous.context.close()


def test_owner_invites_staff(browser, base_url):
    owner_page, _ = owner(browser, base_url)
    staff = new_page(browser)
    try:
        staff_email = unique_email("staff")
        link = invite_staff(owner_page, base_url, staff_email)
        staff.goto(link, wait_until="networkidle")
        staff.get_by_label("Choose a password").fill(PASSWORD)
        staff.get_by_role("button", name="Create my account").click()
        staff.wait_for_url("**/staff")
        staff.get_by_role("heading", name="Inquiries").wait_for()
        assert staff.goto(base_url + "/staff/team", wait_until="networkidle").status == 403

        staff.context.clear_cookies()
        staff.goto(link, wait_until="networkidle")
        staff.get_by_text("already been used").wait_for()

        cancelled_email = unique_email("staff")
        cancelled_link = invite_staff(owner_page, base_url, cancelled_email)
        owner_page.goto(base_url + "/staff/team", wait_until="networkidle")
        owner_page.locator("[data-invitation]", has_text=cancelled_email).get_by_role("button", name="Cancel invitation").click()
        owner_page.locator("[data-invitation]", has_text=cancelled_email).wait_for(state="detached")
        staff.goto(cancelled_link, wait_until="networkidle")
        staff.get_by_text("was cancelled").wait_for()
    finally:
        owner_page.context.close()
        staff.context.close()


def test_deactivated_staff_loses_access(browser, base_url):
    owner_page, _ = owner(browser, base_url)
    staff = new_page(browser)
    try:
        staff_email = unique_email("staff")
        staff.goto(invite_staff(owner_page, base_url, staff_email), wait_until="networkidle")
        staff.get_by_label("Choose a password").fill(PASSWORD)
        staff.get_by_role("button", name="Create my account").click()
        staff.wait_for_url("**/staff")

        owner_page.goto(base_url + "/staff/team", wait_until="networkidle")
        owner_page.locator("[data-person]", has_text=staff_email).get_by_role("button", name="Deactivate").click()
        owner_page.locator("[data-person]", has_text=staff_email).get_by_role("button", name="Reactivate").wait_for()

        staff.goto(base_url + "/staff", wait_until="networkidle")
        assert "/sign-in" in staff.url
        sign_in(staff, base_url, staff_email)
        staff.locator("main").get_by_role("alert").wait_for()
        assert "/sign-in" in staff.url
    finally:
        owner_page.context.close()
        staff.context.close()


def test_signed_in_inquiry_is_linked_and_findable(browser, base_url):
    page, email = customer(browser, base_url, name="Mutale Banda")
    owner_page = None
    try:
        page.goto(base_url + "/contact", wait_until="networkidle")
        assert page.get_by_label("Your name").input_value() == "Mutale Banda"
        assert page.get_by_label("Email address").input_value() == email
        page.get_by_role("radio", name="Email").check()
        page.get_by_label("Project details").fill("Solar quote for the farmhouse.")
        page.wait_for_timeout(3200)
        page.get_by_role("button", name="Send inquiry to Mias").click()
        reference = REFERENCE.search(page.locator("main").get_by_role("status").filter(has_text="Thank you").inner_text()).group(0)
        page.goto(base_url + "/account", wait_until="networkidle")
        assert reference in page.locator("main").inner_text()

        owner_page, _ = owner(browser, base_url)
        owner_page.get_by_label("Search inquiries").fill(reference)
        owner_page.get_by_role("button", name="Search").click()
        owner_page.get_by_role("link", name=reference).click()
        owner_page.wait_for_url(f"**/staff/inquiries/{reference}")
        assert "Solar quote for the farmhouse." in owner_page.locator("main").inner_text()
    finally:
        page.context.close()
        if owner_page:
            owner_page.context.close()


def test_sign_in_without_javascript_and_header_links(browser, base_url):
    page, email = customer(browser, base_url)
    plain = new_page(browser, javascript=False)
    try:
        page.goto(base_url + "/", wait_until="networkidle")
        header = page.locator("header.site-header")
        header.get_by_role("link", name="My account").wait_for()
        assert header.get_by_role("button", name="Sign out").count() == 1

        sign_in(plain, base_url, email)
        plain.wait_for_url("**/account")
        plain.get_by_role("heading", name="My account").wait_for()
    finally:
        page.context.close()
        plain.context.close()
