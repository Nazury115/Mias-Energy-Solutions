import pytest
from playwright.sync_api import expect
from test_accounts import customer, invite_staff, new_page, owner, PASSWORD, sign_in, unique_email
from test_jobs import accept_job, request_job

pytestmark = pytest.mark.browser


def test_customer_profile_persists(browser, base_url):
    page, _ = customer(browser, base_url)
    try:
        page.get_by_text("Edit contact details", exact=True).click()
        page.get_by_label("Your name").fill("Review Customer")
        page.get_by_label("Phone number").fill("0977555123")
        page.get_by_role("button", name="Save details").click()
        page.get_by_text("Your details are saved.").wait_for()
        page.reload(wait_until="networkidle")
        page.get_by_text("Edit contact details", exact=True).click()
        expect(page.get_by_label("Your name")).to_have_value("Review Customer")
        assert page.get_by_label("Phone number").input_value().replace(" ", "").endswith("977555123")
    finally:
        page.context.close()


def test_staff_review_and_cancellation_after_owner_reactivation(browser, base_url):
    admin, _ = owner(browser, base_url)
    employee = new_page(browser)
    address = unique_email("role-review")
    try:
        invitation = invite_staff(admin, base_url, address)
        employee.goto(invitation)
        employee.get_by_label("Choose a password").fill(PASSWORD)
        employee.get_by_role("button", name="Create my account").click()
        employee.wait_for_url("**/staff")
        admin.goto(base_url + "/staff/team")
        row = admin.locator("[data-person]", has_text=address)
        for role in ("owner", "staff"):
            row.locator('select[name="role"]').select_option(role)
            row.get_by_role("button", name="Change role").click()
            expect(row.locator("span").first).to_contain_text(role.capitalize())
        row.get_by_role("button", name="Deactivate").click()
        row.get_by_role("button", name="Reactivate").click()
        expect(row.get_by_role("button", name="Deactivate")).to_be_visible()
        sign_in(employee, base_url, address)
        employee.wait_for_url("**/staff")
        reference, _, _ = request_job(browser, base_url)
        path = base_url + "/staff/inquiries/" + reference
        for stage in ("under-review", "awaiting-information", "closed", "under-review"):
            employee.goto(path, wait_until="networkidle")
            employee.get_by_label("Review status").select_option(stage)
            employee.get_by_label("Review reason").fill("Test review decision " + stage)
            employee.get_by_role("button", name="Save review").click()
            employee.get_by_text("Request review saved.", exact=True).wait_for()
        job = accept_job(employee, base_url, reference)
        form = employee.locator("form[data-workflow-form]")
        form.get_by_label("Stage", exact=True).select_option("cancelled")
        form.get_by_label("Reason").fill("Customer withdrew test request")
        form.get_by_role("button", name="Update job").click()
        employee.get_by_text("This job is closed. Its history is retained.", exact=True).wait_for()
        employee.goto(job)
        assert "Cancelled" in employee.locator("main").inner_text()
    finally:
        employee.context.close()
        admin.context.close()


@pytest.mark.integration
def test_stock_photographs_have_distinct_public_placements(base_url):
    from hashlib import sha256
    from pathlib import Path
    from urllib.parse import parse_qs, urlsplit
    from test_public_website import document, ROUTES

    public = Path(__file__).resolve().parents[1] / "public"
    seen = {}
    project_links = {attrs["href"] for tag, attrs in document(base_url, "/projects").tags
                     if tag == "a" and attrs.get("href", "").startswith("/projects/")}
    for path in ["/", "/who-we-serve", *ROUTES, *sorted(project_links)]:
        on_page = set()
        for tag, attrs in document(base_url, path).tags:
            if tag != "img":
                continue
            src = urlsplit(attrs.get("src", ""))
            asset = parse_qs(src.query).get("url", [src.path])[0]
            if asset.startswith(("/images/stock/", "/images/zambia/")):
                on_page.add(asset)
        for asset in on_page:
            digest = sha256((public / asset.lstrip("/")).read_bytes()).hexdigest()
            assert digest not in seen, (asset, path, seen.get(digest))
            seen[digest] = path
