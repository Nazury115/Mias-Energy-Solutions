"""Job chat, first-view receipts and independent portal sessions."""
import pytest
from urllib.request import build_opener, HTTPRedirectHandler
from urllib.error import HTTPError
from test_accounts import new_page, owner, unique_email
from test_jobs import accept_job, invite_customer, open_new_customer, request_job


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args):
        return None


@pytest.mark.browser
def test_conversation_requires_session(base_url):
    with pytest.raises(HTTPError) as denied:
        build_opener(NoRedirect).open(base_url + "/api/jobs/JOB-DEMO/conversation?portal=customer")
    assert denied.value.code in (401, 307)


@pytest.mark.browser
def test_job_conversation_views(browser, base_url):
    ref, email, _ = request_job(browser, base_url)
    staff, _ = owner(browser, base_url)
    customer = new_page(browser)
    try:
        job = accept_job(staff, base_url, ref)
        staff.get_by_label("Internal note", exact=True).fill("PRIVATE CHAT SENTINEL")
        staff.get_by_role("button", name="Save private note").click()
        staff.get_by_text("Private note saved.", exact=True).wait_for()
        staff.get_by_label("Message to customer").fill("Can we visit tomorrow?")
        staff.get_by_role("button", name="Send message").click()
        staff.locator(".chat-bubble", has_text="Can we visit tomorrow?").wait_for()
        invite = invite_customer(staff, base_url, job, email)
        staff.goto(job, wait_until="networkidle")
        # Deterministically model a background tab until explicitly focused below.
        customer.add_init_script("window.testFocused = false; document.hasFocus = () => window.testFocused")
        open_new_customer(customer, invite)
        api = base_url + "/api/jobs/" + job.rsplit("/", 1)[1] + "/conversation"
        data = staff.request.get(api + "?portal=staff").json()
        assert data[0]["reads"] == []
        assert staff.request.post(api + "?portal=staff", data={"ids": [data[0]["id"]]},
                                  headers={"Origin":base_url}).status == 204
        assert staff.request.get(api + "?portal=staff").json()[0]["reads"] == []
        assert customer.request.post(api + "?portal=customer", data={"ids": [data[0]["id"]]},
                                     headers={"Origin":"https://example.invalid"}).status == 403
        assert customer.request.get(api + "?portal=staff").status == 403
        assert "PRIVATE CHAT SENTINEL" not in customer.content()
        bubble = customer.locator(".chat-bubble", has_text="Can we visit tomorrow?")
        bubble.scroll_into_view_if_needed()
        customer.wait_for_timeout(1100)
        assert staff.request.get(api + "?portal=staff").json()[0]["reads"] == []
        customer.evaluate("window.testFocused = true; window.dispatchEvent(new Event('focus'))")
        staff.locator(".chat-bubble", has_text="Read by Job Test Customer").wait_for(timeout=20000)
        first = staff.request.get(api + "?portal=staff").json()[0]["reads"]
        customer.get_by_label("Message to Mias").fill("Yes, I will be there.")
        staff.get_by_label("Message to customer").fill("Unsent staff draft")
        def lose_acknowledgement(route):
            if route.request.method == "POST" and "next-action" in route.request.headers:
                response = route.fetch()
                assert response.ok
                route.abort("failed")
            else:
                route.continue_()
        customer.route(customer.url, lose_acknowledgement)
        customer.get_by_role("button", name="Send message").click()
        customer.get_by_role("button", name="Retry message").wait_for()
        customer.unroute(customer.url, lose_acknowledgement)
        assert customer.get_by_label("Message to Mias").input_value() == "Yes, I will be there."
        customer.get_by_role("button", name="Retry message").click()
        customer.get_by_text("Your message was saved.", exact=True).wait_for()
        staff.locator(".chat-bubble", has_text="Yes, I will be there.").wait_for(timeout=20000)
        assert staff.get_by_label("Message to customer").input_value() == "Unsent staff draft"
        saved = staff.request.get(api + "?portal=staff").json()
        assert saved[0]["reads"] == first
        assert sum(row["body"] == "Yes, I will be there." for row in saved) == 1
        second = new_page(browser)
        try:
            other_invite = invite_customer(staff, base_url, job, unique_email("chat-contact"))
            open_new_customer(second, other_invite)
            second.bring_to_front()
            second.locator(".chat-bubble", has_text="Can we visit tomorrow?").scroll_into_view_if_needed()
            # Wait for the sender to receive both distinct first-view receipts.
            # A browser evaluation returning a Promise can resolve before a view is saved.
            from time import monotonic, sleep
            deadline = monotonic() + 20
            while True:
                reads = staff.request.get(api + "?portal=staff").json()[0]["reads"]
                if len(reads) == 2 or monotonic() >= deadline:
                    break
                sleep(0.25)
            assert len(reads) == 2 and reads[0] == first[0]
            assert second.request.get(api + "?portal=customer").json()[0]["seen"]
        finally:
            second.context.close()
        staff.goto(job, wait_until="networkidle")
        contact = staff.locator("[data-job-contact]", has_text=email)
        contact.get_by_label("Reason for revoking access").fill("Test complete")
        contact.get_by_role("button", name="Revoke customer access").click()
        staff.get_by_text("Customer access revoked.", exact=True).wait_for()
        assert customer.request.get(api + "?portal=customer").status == 404
        assert customer.request.post(api + "?portal=customer", data={"ids":[data[0]["id"]]}, headers={"Origin":base_url}).status == 404
    finally:
        customer.context.close()
        staff.context.close()


@pytest.mark.browser
def test_scrolling_earlier_messages_keeps_position_and_draft(browser, base_url):
    ref, email, _ = request_job(browser, base_url)
    staff, _ = owner(browser, base_url)
    reader = new_page(browser)
    try:
        job = accept_job(staff, base_url, ref)
        for i in range(3):
            staff.get_by_label("Message to customer").fill(f"Earlier {i}\n" + "Assessment detail\n" * 20)
            staff.get_by_role("button", name="Send message").click()
            staff.locator(".chat-bubble", has_text=f"Earlier {i}").wait_for()
        invite = invite_customer(staff, base_url, job, email)
        staff.goto(job, wait_until="networkidle")
        open_new_customer(reader, invite)
        box = reader.get_by_role("list", name="Conversation history")
        box.scroll_into_view_if_needed()
        reader.wait_for_function("document.querySelector('.chat-thread').scrollTop > 0")
        api = base_url + "/api/jobs/" + job.rsplit("/", 1)[1] + "/conversation?portal=staff"
        reader.wait_for_timeout(3500)
        assert not staff.request.get(api).json()[0]["reads"]
        reader.get_by_label("Message to Mias").fill("Keep this draft")
        box.evaluate("el => { el.scrollTop = 0; }")
        staff.get_by_label("Message to customer").fill("Latest reply")
        staff.get_by_role("button", name="Send message").click()
        button = reader.get_by_role("button", name="New messages")
        button.wait_for(timeout=20000)
        assert box.evaluate("el => el.scrollTop") < 5
        button.click()
        assert box.evaluate("el => el.scrollHeight - el.scrollTop - el.clientHeight") < 5
        assert reader.get_by_label("Message to Mias").input_value() == "Keep this draft"
    finally:
        reader.context.close()
        staff.context.close()
