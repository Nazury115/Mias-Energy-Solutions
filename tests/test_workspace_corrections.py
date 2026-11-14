import pytest
from pathlib import Path
from test_accounts import owner,new_page,invite_staff,unique_email,PASSWORD,customer
from test_jobs import request_job,accept_job
from test_documents import prepare,configure,approve
from test_job_files import PNG

pytestmark=pytest.mark.browser

def writer_account(browser,admin,base_url):
    invite=invite_staff(admin,base_url,unique_email("workspace"),name="Workspace Writer")
    page=new_page(browser)
    page.goto(invite,wait_until="networkidle")
    page.get_by_label("Choose a password").fill(PASSWORD)
    page.get_by_role("button",name="Create my account").click()
    page.wait_for_url("**/staff")
    return page

def test_submission_visible_before_template_setup_but_issue_requires_review(browser,base_url):
    reference,_,_=request_job(browser,base_url)
    admin,_=owner(browser,base_url)
    writer=writer_account(browser,admin,base_url)
    stale=admin.context.new_page()
    try:
        # Run on a fresh isolated database: the template has not yet been reviewed.
        job=accept_job(admin,base_url,reference)
        url=prepare(writer,job)
        writer.get_by_role("button",name="Submit for review",exact=True).click()
        writer.get_by_text("Draft submitted for Owner review.",exact=True).wait_for()
        admin.goto(base_url+"/staff",wait_until="networkidle")
        assert admin.locator("[data-document-review]").count()==1
        admin.get_by_role("link",name="Review documents",exact=True).click()
        assert admin.get_by_role("heading",name="Awaiting Owner review",exact=True).count()==1
        admin.set_viewport_size({"width":390,"height":844})
        admin.emulate_media(reduced_motion="reduce")
        admin.screenshot(path=str(Path(__file__).resolve().parents[1]/"test-results/workspace-document-mobile.png"),animations="disabled")
        admin.set_viewport_size({"width":1366,"height":900})
        admin.goto(url,wait_until="networkidle")
        assert "Business settings await Owner review" in admin.locator("main").inner_text()
        admin.get_by_role("link",name="Preview draft",exact=True).click()
        assert "28900.00" in admin.locator(".document-paper").inner_text()
        admin.goto(url,wait_until="networkidle")
        admin.get_by_label("Issue reason",exact=True).fill("Attempt before settings review")
        admin.get_by_label("I reviewed the saved draft and its PDF preview").check()
        admin.get_by_role("button",name="Approve and issue",exact=True).click()
        admin.get_by_role("alert").wait_for()
        assert not admin.get_by_role("heading",level=1).inner_text().startswith("TEST-")
        configure(admin,base_url)
        admin.goto(url,wait_until="networkidle")
        stale.goto(url,wait_until="networkidle")
        admin.get_by_role("button",name="Refresh preview with reviewed settings",exact=True).click()
        admin.get_by_text("Review preview updated with reviewed business settings.",exact=True).wait_for()
        stale.get_by_label("Issue reason",exact=True).fill("Stale template preview")
        stale.get_by_label("I reviewed the saved draft and its PDF preview").check()
        stale.get_by_role("button",name="Approve and issue",exact=True).click()
        stale.get_by_role("alert").wait_for()
        approve(admin)
        assert admin.get_by_role("heading",level=1).inner_text().startswith("TEST-I-")
        assert writer.request.get(base_url+"/staff/documents/settings").status==403
        for width in [320,390,768,1440]:
            admin.set_viewport_size({"width":width,"height":900})
            assert admin.evaluate("document.documentElement.scrollWidth<=innerWidth")
    finally:
        admin.context.close();writer.context.close()

def test_existing_project_preview_edit_publish_trash_restore_and_permissions(browser,base_url):
    admin,_=owner(browser,base_url)
    writer=writer_account(browser,admin,base_url)
    public=new_page(browser)
    outsider,_=customer(browser,base_url)
    source="gwembe-booster-pumps"
    try:
        writer.goto(base_url+"/staff/content",wait_until="networkidle")
        row=writer.locator(f'[data-repository-project="{source}"]')
        row.get_by_role("link",name="Preview project",exact=True).click()
        writer.get_by_role("heading",name="Booster pumps in Gwembe",exact=True).wait_for()
        assert "Gwembe" in writer.locator("main").inner_text()
        assert outsider.request.get(writer.url).status==403
        writer.get_by_role("button",name="Edit project",exact=True).click()
        writer.wait_for_url(lambda url:"/staff/content/" in str(url) and "/repository/" not in str(url))
        url=writer.url
        assert writer.get_by_role("button",name="Publish saved draft").count()==0
        writer.get_by_label("Photo",exact=True).set_input_files({"name":"workspace.png","mimeType":"image/png","buffer":PNG})
        writer.get_by_label("Photo description",exact=True).fill("Synthetic workspace photo")
        writer.get_by_label("Photo permission evidence").fill("Generated test image in disposable database")
        writer.get_by_label("Photo source",exact=True).fill("Synthetic regression fixture")
        writer.get_by_role("button",name="Register photo",exact=True).click()
        writer.get_by_text("Photo registered. Select it in the draft and save.",exact=True).wait_for()
        private_image=writer.locator(".content-photo img").get_attribute("src")
        public_image="/media/publishing/"+private_image.rsplit("/",1)[1]
        form=writer.locator("[data-content-editor]")
        form.get_by_label("Publication permission evidence").fill("Isolated test copy")
        form.get_by_label("Synthetic workspace photo",exact=True).check()
        form.get_by_label("Summary",exact=True).fill("Fictional managed replacement for the existing example")
        form.get_by_role("button",name="Save draft",exact=True).click()
        form.get_by_text("Draft saved.",exact=True).wait_for()
        old=public.request.get(base_url+"/projects/"+source)
        assert old.status==200 and "Fictional managed replacement" not in old.text()
        admin.goto(url,wait_until="networkidle")
        admin.get_by_label("Approval reason",exact=True).fill("Approve fictional repository management check")
        admin.get_by_label("I checked the facts and publication permissions").check()
        admin.get_by_role("button",name="Publish saved draft",exact=True).click()
        admin.get_by_text("Publication updated.",exact=True).wait_for()
        visible=public.request.get(base_url+"/projects/"+source)
        assert visible.status==200 and "Fictional managed replacement" in visible.text()
        assert public.request.get(base_url+public_image).status==200
        public.goto(base_url+"/projects",wait_until="networkidle")
        assert public.locator(f'[data-project-card] a[href="/projects/{source}"]').count()==1
        stale=admin.context.new_page()
        stale.goto(url,wait_until="networkidle")
        admin.get_by_label("Delete reason",exact=True).fill("Remove the fictional example during verification")
        admin.get_by_label("I understand this removes the public version and moves the record to Trash").check()
        with admin.expect_request(lambda request:request.method=="POST" and request.url==url) as sent:
            admin.get_by_role("button",name="Delete project",exact=True).click()
        admin.get_by_text("Content moved to Trash.",exact=True).wait_for()
        request=sent.value
        headers={key:value for key,value in request.headers.items() if key in ["next-action","content-type","accept","next-router-state-tree"]}
        headers["Origin"]=base_url
        assert writer.request.post(url,data=request.post_data,headers=headers).status==403
        assert outsider.request.post(url,data=request.post_data,headers=headers).status==403
        assert public.request.get(base_url+"/projects/"+source).status==404
        assert writer.request.get(url).status==404
        assert writer.request.get(base_url+private_image).status==404
        assert public.request.get(base_url+public_image).status==404
        assert writer.request.get(base_url+f"/staff/content/repository/{source}/preview").status==404
        assert outsider.request.get(base_url+"/staff/content?view=trash").status==403
        assert writer.request.get(base_url+"/staff/content?view=trash").status==403
        stale.get_by_label("Summary",exact=True).fill("Stale edit after deletion")
        stale.get_by_role("button",name="Save draft",exact=True).click()
        stale.get_by_role("alert").wait_for()
        admin.get_by_role("button",name="Restore as draft",exact=True).click()
        admin.get_by_text("Content restored as a draft.",exact=True).wait_for()
        assert public.request.get(base_url+"/projects/"+source).status==404
        assert public.request.get(base_url+public_image).status==404
        assert admin.request.get(base_url+private_image).status==200
        admin.goto(url,wait_until="networkidle")
        assert "Fictional managed replacement" in admin.get_by_label("Summary",exact=True).input_value()
        for width in [320,390,768,1440]:
            admin.set_viewport_size({"width":width,"height":900})
            assert admin.evaluate("document.documentElement.scrollWidth<=innerWidth")
        admin.set_viewport_size({"width":390,"height":844})
        admin.emulate_media(reduced_motion="reduce")
        admin.screenshot(path=str(Path(__file__).resolve().parents[1]/"test-results/workspace-project-mobile.png"))
    finally:
        for page in (admin,writer,public,outsider):page.context.close()


def test_live_mobile_preview_validates_frame_and_keeps_login_protection(browser,base_url):
    page=new_page(browser)
    try:
        page.goto(base_url+"/dev/mobile?path=%2Fstaff&width=320",wait_until="networkidle")
        frame=page.locator('iframe[title="Live mobile website preview"]')
        assert frame.get_attribute("src")=="/staff"
        assert frame.get_attribute("width")=="320"
        frame.content_frame.get_by_role("heading",name="Sign in",exact=True).wait_for()
        page.goto(base_url+"/dev/mobile?path=https://example.com&width=10000",wait_until="networkidle")
        assert frame.get_attribute("src")=="/"
        assert frame.get_attribute("width")=="390"
        for width in [320,390,768,1440]:
            page.set_viewport_size({"width":width,"height":900})
            assert page.evaluate("document.documentElement.scrollWidth<=innerWidth")
    finally:page.context.close()
