import pytest
from pathlib import Path
from urllib.request import build_opener, HTTPRedirectHandler
from urllib.error import HTTPError
from test_accounts import customer, invite_staff, owner, new_page, unique_email, PASSWORD
from test_job_files import PNG

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args):
        return None

@pytest.mark.browser
def test_publishing_requires_staff(base_url):
    with pytest.raises(HTTPError) as denied:
        build_opener(NoRedirect).open(base_url + "/staff/content")
    assert denied.value.code == 307

@pytest.mark.browser
def test_owner_publishes_snapshot_and_unpublishes(browser, base_url):
    staff, _ = owner(browser, base_url)
    public = new_page(browser)
    try:
        staff.goto(base_url + "/staff/content", wait_until="networkidle")
        staff.get_by_label("Content type").select_option("project")
        staff.get_by_label("Title",exact=True).fill("Fictional publishing assessment")
        staff.get_by_label("Fictional test content").check()
        staff.get_by_role("button",name="Create draft").click()
        staff.wait_for_url("**/staff/content/*")
        draft_url = staff.url
        assert public.goto(draft_url, wait_until="networkidle").url.split("?")[0].endswith("/sign-in")
        staff.get_by_label("Photo",exact=True).set_input_files({"name":"site.png","mimeType":"image/png","buffer":PNG})
        staff.get_by_label("Photo description").fill("Fictional test image")
        staff.get_by_label("Photo source").fill("Synthetic test fixture")
        staff.get_by_role("button",name="Register photo").click()
        staff.get_by_text("Photo registered. Select it in the draft and save.",exact=True).wait_for()
        private_image = staff.locator(".content-photo img").get_attribute("src")
        assert public.request.get(base_url + private_image, max_redirects=0).status == 307
        editor = staff.locator("[data-content-editor]")
        editor.get_by_label("Fictional test image",exact=True).check()
        for label, value in [("Summary","Fictional test summary"),("Challenge","Fictional challenge"),("Work carried out","Fictional assessment"),("Outcome","Fictional handover")]:
            editor.get_by_label(label,exact=True).fill(value)
        editor.get_by_role("button",name="Save draft").click()
        editor.get_by_role("status").wait_for()
        preview = staff.get_by_role("link",name="Preview saved draft").get_attribute("href")
        assert public.goto(base_url+preview,wait_until="networkidle").url.split("?")[0].endswith("/sign-in")
        staff.get_by_label("Approval reason").fill("Approve fictional workflow test")
        staff.get_by_label("I checked the facts and publication permissions").check()
        staff.get_by_role("button",name="Publish saved draft").click()
        staff.get_by_text("Publication updated.",exact=True).wait_for()
        path = staff.get_by_role("link",name="View published content").get_attribute("href")
        assert public.goto(base_url+path,wait_until="networkidle").status == 200
        assert "Fictional test summary" in public.locator("main").inner_text()
        public_image = public.locator(".publication-gallery img").get_attribute("src")
        image = public.request.get(base_url+public_image)
        assert image.status == 200 and image.headers["content-type"] == "image/jpeg"
        assert path in public.request.get(base_url+"/sitemap.xml").text()
        for width in [320,390,768,1440]:
            public.set_viewport_size({"width":width,"height":900})
            staff.set_viewport_size({"width":width,"height":900})
            for page in (staff,public):
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        editor.get_by_label("Summary",exact=True).fill("Unapproved replacement")
        editor.get_by_role("button",name="Save draft").click()
        editor.get_by_role("status").wait_for()
        public.reload(wait_until="networkidle")
        assert "Unapproved replacement" not in public.locator("main").inner_text()
        staff.get_by_label("Approval reason").fill("Approve the replacement test version")
        staff.get_by_label("I checked the facts and publication permissions").check()
        staff.get_by_role("button",name="Publish saved draft").click()
        public.wait_for_function("async path => (await (await fetch(path)).text()).includes('Unapproved replacement')",arg=path)
        output=Path(__file__).resolve().parents[1]/"test-results"
        staff.screenshot(path=str(output/"009-editor.png"),full_page=True)
        public.set_viewport_size({"width":390,"height":844})
        public.emulate_media(reduced_motion="reduce")
        public.reload(wait_until="networkidle")
        public.screenshot(path=str(output/"009-project-mobile.png"),full_page=True)
        staff.get_by_label("Unpublish reason").fill("Fictional test complete")
        staff.get_by_role("button",name="Unpublish").click()
        staff.get_by_text("Content unpublished.",exact=True).wait_for()
        assert public.reload(wait_until="networkidle").status == 404
        assert public.request.get(base_url+public_image).status == 404
        assert path not in public.request.get(base_url+"/sitemap.xml").text()
    finally:
        staff.context.close()
        public.context.close()


@pytest.mark.browser
def test_staff_draft_owner_review_and_customer_denial(browser,base_url):
    admin,_=owner(browser,base_url)
    writer=new_page(browser)
    outsider,_=customer(browser,base_url)
    try:
        invitation=invite_staff(admin,base_url,unique_email("publisher"),name="Test Publisher")
        writer.goto(invitation,wait_until="networkidle")
        writer.get_by_label("Choose a password").fill(PASSWORD)
        writer.get_by_role("button",name="Create my account").click()
        writer.wait_for_url("**/staff")
        writer.goto(base_url+"/staff/content",wait_until="networkidle")
        writer.get_by_label("Content type").select_option("testimonial")
        writer.get_by_label("Title",exact=True).fill("Fictional permission test")
        writer.get_by_role("button",name="Create draft").click()
        writer.wait_for_url("**/staff/content/*")
        entry_url=writer.url
        assert outsider.goto(entry_url,wait_until="networkidle").status == 403
        assert writer.get_by_role("button",name="Publish saved draft").count()==0
        editor=writer.locator("[data-content-editor]")
        editor.get_by_label("Customer quotation").fill("Fictional customer quotation for testing.")
        editor.get_by_label("Approved attribution").fill("Fictional Customer")
        editor.get_by_role("button",name="Save draft").click()
        editor.get_by_role("status").wait_for()
        admin.goto(entry_url,wait_until="networkidle")
        admin.get_by_label("Approval reason").fill("Approve fictional testimonial")
        admin.get_by_label("I checked the facts and publication permissions").check()
        with admin.expect_request(lambda r:r.method=="POST" and r.url==entry_url) as sent:
            admin.get_by_role("button",name="Publish saved draft").click()
        admin.get_by_text("Publication updated.",exact=True).wait_for()
        request=sent.value
        headers={k:v for k,v in request.headers.items() if k in ["next-action","content-type","accept","next-router-state-tree"]}
        headers["Origin"]=base_url
        assert writer.request.post(entry_url,data=request.post_data,headers=headers).status==403
        assert outsider.request.post(entry_url,data=request.post_data,headers=headers).status==403
        outsider.goto(base_url+"/projects",wait_until="networkidle")
        assert "Fictional customer quotation for testing." in outsider.locator("main").inner_text()
        assert "Fictional test testimonial" in outsider.locator("main").inner_text()
        # A second editor must not overwrite a newer saved draft.
        writer.goto(entry_url,wait_until="networkidle")
        admin.locator("[data-content-editor]").get_by_label("Title",exact=True).fill("Revised testimonial title")
        admin.locator("[data-content-editor]").get_by_role("button",name="Save draft").click()
        admin.get_by_text("Draft saved.",exact=True).wait_for()
        writer.locator("[data-content-editor]").get_by_label("Title",exact=True).fill("Stale draft title")
        writer.locator("[data-content-editor]").get_by_role("button",name="Save draft").click()
        writer.get_by_role("alert").wait_for()
        assert writer.get_by_label("Title",exact=True).input_value()=="Stale draft title"
    finally:
        for page in (admin,writer,outsider):
            page.context.close()
