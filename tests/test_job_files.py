import base64
import os
import subprocess
from pathlib import Path

import pytest

from playwright.sync_api import expect
from test_accounts import customer, inbox_link, new_page, owner, unique_email
from test_jobs import accept_job, invite_customer, open_new_customer, request_job

ROOT = Path(__file__).resolve().parents[1]
PNG = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC")


@pytest.mark.unit
@pytest.mark.parametrize("script", ["check-job-file-validation.mjs", "check-job-file-migration.mjs"])
def test_job_file_rules(script):
    result = subprocess.run([os.environ.get("MIAS_NODE", "node"), str(ROOT / "tests" / script)],
        cwd=ROOT, capture_output=True, text=True)
    assert result.returncode == 0, result.stderr


@pytest.mark.browser
def test_shared_files_and_independent_contacts(browser, base_url):
    ref, email, _ = request_job(browser, base_url)
    staff, _ = owner(browser, base_url)
    first, second, guest = (new_page(browser) for _ in range(3))
    try:
        job = accept_job(staff, base_url, ref)
        invite_one = invite_customer(staff, base_url, job, email)
        other = unique_email("colleague")
        invite_two = invite_customer(staff, base_url, job, other)
        old_invite = invite_one
        invite_one = invite_customer(staff, base_url, job, email)
        guest.goto(old_invite, wait_until="networkidle")
        assert "cancelled" in guest.locator("main").inner_text()
        open_new_customer(first, invite_one)
        open_new_customer(second, invite_two)
        first.get_by_role("link", name="Messages", exact=True).click()
        first.get_by_text("Attach a photo or file", exact=True).click()
        first.get_by_label("Choose an attachment").set_input_files(
            {"name": "inspection.png", "mimeType": "image/png", "buffer": PNG})
        first.get_by_role("button", name="Send attachment").click()
        first.get_by_role("link", name="inspection.png").wait_for()
        chat_link = first.get_by_role("link", name="inspection.png").get_attribute("href")
        second.get_by_role("link", name="Documents & files", exact=True).click()
        link = second.get_by_role("link", name="inspection.png").get_attribute("href")
        assert link == chat_link
        download = second.request.get(base_url + link)
        assert download.status == 200 and download.body() == PNG
        assert "no-store" in download.headers["cache-control"]
        assert "attachment" in download.headers["content-disposition"]
        assert guest.request.get(base_url + link, max_redirects=0).status != 200
        staff.goto(job, wait_until="networkidle")
        assert staff.locator(".chat-thread a[download]").get_attribute("href") == link
        contact = staff.locator("[data-job-contact]", has_text=email)
        contact.get_by_label("Reason for revoking access").fill("Fictional contact changed")
        contact.get_by_role("button", name="Revoke customer access").click()
        staff.get_by_text("Customer access revoked.", exact=True).wait_for()
        assert first.request.get(base_url + link).status == 404
        assert second.request.get(base_url + link).body() == PNG
        staff.get_by_label("Reason for removing inspection.png").fill("Superseded")
        staff.get_by_role("button", name="Remove file").click()
        staff.get_by_text("File removed.", exact=True).wait_for()
        assert second.request.get(base_url + link).status == 404
        second.get_by_role("link", name="Messages", exact=True).click()
        expect(second.locator(".chat-thread")).to_contain_text("Attachment removed")
        expect(second.locator(".chat-thread a[download]")).to_have_count(0)
        second.get_by_role("link", name="Progress", exact=True).click()
        form = staff.locator("form[data-workflow-form]")
        form.get_by_label("Stage", exact=True).select_option("scheduled")
        form.get_by_label("Reason").fill("Site visit agreed")
        form.get_by_role("button", name="Update job").click()
        expect(second.locator('[aria-current="step"]')).to_contain_text("Scheduled", timeout=35000)
    finally:
        for page in (staff, first, second, guest):
            page.context.close()


@pytest.mark.browser
def test_staff_upload_replays_capacity_and_terminal_job(browser, base_url):
    ref, _, _ = request_job(browser, base_url)
    staff, _ = owner(browser, base_url)
    try:
        job = accept_job(staff, base_url, ref)
        # Replay ordinary multipart forms as a browser with JS disabled would send them.
        # These use the real action, cookie, submission key and uploaded bytes.
        results = staff.evaluate("""async ({png, job}) => {
          const html = await (await fetch(job)).text();
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const form = doc.querySelector('input[type=file]').form;
          const bytes = Uint8Array.from(atob(png), char => char.charCodeAt(0));
          async function send(key, name) {
            const data = new FormData(form);
            data.set('submission', key);
            data.set('file', new File([bytes], name, {type:'image/png'}));
            const response = await fetch(job, {method:'POST', body:data});
            const page = new DOMParser().parseFromString(await response.text(), 'text/html');
            return page.querySelector('[role=alert]')?.textContent || '';
          }
          const key = crypto.randomUUID();
          await Promise.all([send(key,'same.png'), send(key,'same.png')]);
          for (let i=0; i<18; i++) await send(crypto.randomUUID(), 'slot-' + i + '.png');
          return await Promise.all([send(crypto.randomUUID(),'last-a.png'), send(crypto.randomUUID(),'last-b.png')]);
        }""", {"png": base64.b64encode(PNG).decode(), "job": job})
        staff.reload(wait_until="networkidle")
        assert staff.locator(".job-file-list a[download]").count() == 20
        assert staff.get_by_role("link", name="same.png").count() == 1
        assert sum("20 files" in message for message in results) == 1
        workflow = staff.locator("form[data-workflow-form]")
        workflow.get_by_label("Stage", exact=True).select_option("cancelled")
        workflow.get_by_label("Reason").fill("Fictional job closed for verification")
        workflow.get_by_role("button", name="Update job").click()
        staff.get_by_text("Uploads are closed for this job.").wait_for()
        assert staff.get_by_label("Choose a job file").count() == 0
        href = staff.get_by_role("link", name="same.png").get_attribute("href")
        assert staff.request.get(base_url + href).body() == PNG
    finally:
        staff.context.close()


@pytest.mark.browser
def test_same_company_has_no_implicit_access(browser, base_url):
    staff, _ = owner(browser, base_url)
    contact, email = customer(browser, base_url)
    other, other_email = customer(browser, base_url)
    try:
        for recipient, authorized, outsider in [(email, contact, other), (other_email, other, contact)]:
            ref, _, _ = request_job(browser, base_url)
            job = accept_job(staff, base_url, ref)
            form = staff.locator("form[data-customer-invite]")
            form.get_by_label("Company for this job").fill("Fictional Company")
            form.get_by_label("Customer email").fill(recipient)
            form.get_by_label("I have checked").check()
            form.get_by_role("button", name="Invite customer").click()
            form.get_by_role("status").wait_for()
            invite = inbox_link(staff, base_url, recipient, "job-invitation")
            authorized.goto(invite, wait_until="networkidle")
            authorized.get_by_role("button", name="Accept job access").click()
            authorized.wait_for_url("**/account/jobs/*")
            assert outsider.goto(authorized.url, wait_until="networkidle").status == 404
            authorized.goto(base_url + "/account", wait_until="networkidle")
            assert job.rsplit("/", 1)[1] in authorized.locator("main").inner_text()
            outsider.goto(base_url + "/account", wait_until="networkidle")
            assert job.rsplit("/", 1)[1] not in outsider.locator("main").inner_text()
        # Explicitly add the first contact to the second job. Only this invitation
        # gives them both jobs, even though the company label was identical all along.
        second_invite = invite_customer(staff, base_url, job, email)
        contact.goto(second_invite, wait_until="networkidle")
        contact.get_by_role("button", name="Accept job access").click()
        contact.wait_for_url("**/account/jobs/*")
        contact.goto(base_url + "/account", wait_until="networkidle")
        assert contact.locator('a[href^="/account/jobs/"]').count() == 2
    finally:
        for page in (staff, contact, other):
            page.context.close()
