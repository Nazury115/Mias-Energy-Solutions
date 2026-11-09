import uuid
import io
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
import pytest
from test_accounts import PASSWORD, customer as new_customer, invite_staff, new_page, owner, unique_email
from test_jobs import accept_job, invite_customer, open_new_customer, request_job

pytestmark=pytest.mark.browser
ROOT=Path(__file__).resolve().parents[1]

def configure(admin,base_url):
    admin.goto(base_url+"/staff/documents/settings",wait_until="networkidle")
    admin.get_by_label("Business name",exact=True).fill("Mias Energy Solutions")
    admin.get_by_label("Bank instructions").fill("Fictional test bank instructions")
    admin.get_by_label("Prepared by",exact=True).fill("Test preparer")
    admin.get_by_label("I checked the business and bank details for document use").check()
    admin.get_by_role("button",name="Save document settings").click()
    admin.get_by_text("Document settings saved.",exact=True).wait_for()

def prepare(admin,job_url,kind="invoice"):
    admin.goto(job_url,wait_until="networkidle")
    admin.get_by_label("Document type").select_option(kind)
    admin.get_by_role("button",name="Create document draft").click()
    admin.wait_for_url("**/staff/documents/*")
    admin.get_by_role("heading",name="Draft "+kind,exact=True).wait_for()
    form=admin.locator("[data-document-editor]")
    form.get_by_label("Payment terms",exact=True).fill("COD")
    form.get_by_label("Description line 1",exact=True).fill("Fictional pump labour")
    form.get_by_label("Quantity line 1",exact=True).fill("9")
    form.get_by_label("Unit price line 1",exact=True).fill("2800")
    form.get_by_role("button",name="Add line",exact=True).click()
    form.get_by_label("Description line 2",exact=True).fill("Fictional commissioning")
    form.get_by_label("Unit price line 2",exact=True).fill("3700")
    form.get_by_role("button",name="Save document draft").click()
    form.get_by_text("Document draft saved.",exact=True).wait_for()
    return admin.url

def issue(admin):
    admin.get_by_role("button",name="Submit for review",exact=True).click()
    admin.get_by_text("Draft submitted for Owner review.",exact=True).wait_for()
    approve(admin)


def approve(admin):
    admin.get_by_label("Issue reason",exact=True).fill("Approve fictional local test")
    admin.get_by_label("I reviewed the saved draft and its PDF preview").check()
    admin.get_by_role("button",name="Approve and issue",exact=True).click()
    admin.get_by_text("Test document issued.",exact=True).wait_for()

def test_draft_issue_pdf_revision_and_revocation(browser,base_url):
    ref,email,_=request_job(browser,base_url)
    admin,_=owner(browser,base_url)
    client=new_page(browser)
    stranger,_=new_customer(browser,base_url)
    try:
        configure(admin,base_url)
        job=accept_job(admin,base_url,ref)
        draft_url=prepare(admin,job)
        draft_id=draft_url.rsplit("/",1)[1]
        preview=admin.request.get(base_url+"/documents/"+draft_id+"/pdf?portal=staff")
        assert preview.status==200 and preview.headers["content-type"]=="application/pdf"
        invite=invite_customer(admin,base_url,job,email)
        open_new_customer(client,invite)
        customer_url=base_url+"/account/documents/"+draft_id
        pdf_url=base_url+"/documents/"+draft_id+"/pdf"
        assert client.request.get(customer_url).status==404
        assert client.request.get(pdf_url).status==404
        admin.goto(draft_url,wait_until="networkidle")
        issue(admin)
        reference=admin.get_by_role("heading",level=1).inner_text()
        assert reference.startswith("TEST-I-")
        client.goto(customer_url,wait_until="networkidle")
        assert "28900.00" in client.locator("main").inner_text()
        original=client.request.get(pdf_url)
        assert original.status==200 and "no-store" in original.headers["cache-control"]
        excel_url=base_url+"/documents/"+draft_id+"/download?format=xlsx"
        original_excel=client.request.get(excel_url)
        workbook_cells(original_excel)
        output=ROOT/"test-results/010-issued.pdf"
        output.write_bytes(original.body())
        assert stranger.request.get(pdf_url).status==404
        assert stranger.request.get(excel_url).status==404
        assert client.request.get(pdf_url+"?portal=staff").status==403
        for width in [320,390,768,1440]:
            for page in (client,admin):
                page.set_viewport_size({"width":width,"height":900})
                assert page.evaluate("document.documentElement.scrollWidth<=innerWidth")
        admin.get_by_role("button",name="Create revision draft").click()
        admin.wait_for_url(lambda url:"/staff/documents/" in str(url) and draft_id not in str(url))
        admin.get_by_role("heading",name="Draft invoice",exact=True).wait_for()
        revision_url=admin.url
        assert revision_url!=draft_url
        form=admin.locator("[data-document-editor]")
        form.get_by_label("Notes",exact=True).fill("Fictional correction")
        form.get_by_role("button",name="Save document draft").click()
        form.get_by_text("Document draft saved.",exact=True).wait_for()
        issue(admin)
        client.reload(wait_until="networkidle")
        assert "superseded" in client.locator("main").inner_text()
        assert client.request.get(pdf_url).body()==original.body()
        assert client.request.get(excel_url).body()==original_excel.body()
        revision_id=revision_url.rsplit("/",1)[1]
        client.goto(base_url+"/account/documents/"+revision_id,wait_until="networkidle")
        assert "Fictional correction" in client.locator("main").inner_text()
        admin.get_by_label("Cancellation reason").fill("Fictional correction withdrawn")
        admin.get_by_role("button",name="Cancel document",exact=True).click()
        admin.get_by_text("Document cancelled.",exact=True).wait_for()
        client.reload(wait_until="networkidle")
        assert "cancelled" in client.locator("main").inner_text()
        admin.goto(job,wait_until="networkidle")
        admin.get_by_label("Reason for revoking access").fill("Test complete")
        admin.get_by_role("button",name="Revoke customer access").click()
        admin.get_by_text("Customer access revoked.",exact=True).wait_for()
        assert client.request.get(pdf_url).status==404
        assert client.request.get(excel_url).status==404
    finally:
        for page in (admin,client,stranger):page.context.close()

def test_staff_cannot_issue_and_stale_document_draft_is_preserved(browser,base_url):
    ref,_,_=request_job(browser,base_url)
    admin,_=owner(browser,base_url)
    staff=new_page(browser)
    second=admin.context.new_page()
    try:
        configure(admin,base_url)
        job=accept_job(admin,base_url,ref)
        url=prepare(admin,job)
        invitation=invite_staff(admin,base_url,unique_email("commercial"),name="Test Writer")
        staff.goto(invitation,wait_until="networkidle")
        staff.get_by_label("Choose a password").fill(PASSWORD)
        staff.get_by_role("button",name="Create my account").click()
        staff.wait_for_url("**/staff")
        staff.goto(url,wait_until="networkidle")
        assert staff.get_by_role("button",name="Approve and issue").count()==0
        second.goto(url,wait_until="networkidle")
        admin.goto(url,wait_until="networkidle")
        admin.locator("[data-document-editor]").get_by_label("Notes",exact=True).fill("New notes")
        admin.get_by_role("button",name="Save document draft").click()
        admin.get_by_text("Document draft saved.",exact=True).wait_for()
        second.locator("[data-document-editor]").get_by_label("Notes",exact=True).fill("Stale notes")
        second.get_by_role("button",name="Save document draft").click()
        second.get_by_role("alert").wait_for()
        assert second.get_by_label("Notes",exact=True).input_value()=="Stale notes"
        admin.get_by_role("button",name="Submit for review",exact=True).click()
        admin.get_by_text("Draft submitted for Owner review.",exact=True).wait_for()
        admin.get_by_label("Issue reason").fill("Approve test")
        admin.get_by_label("I reviewed the saved draft and its PDF preview").check()
        with admin.expect_request(lambda request:request.method=="POST" and request.url.split("?",1)[0]==url.split("?",1)[0]) as sent:
            admin.get_by_role("button",name="Approve and issue",exact=True).click()
        admin.get_by_text("Test document issued.",exact=True).wait_for()
        request=sent.value
        headers={key:value for key,value in request.headers.items() if key in ["next-action","content-type","accept","next-router-state-tree"]}
        headers["Origin"]=base_url
        assert staff.request.post(url,data=request.post_data,headers=headers).status==403
        assert admin.request.post(url,data=request.post_data,headers=headers).status in (200,303)
    finally:
        for page in (admin,staff):page.context.close()


def workbook_cells(response):
    assert response.status==200
    assert response.headers["content-type"]=="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    with zipfile.ZipFile(io.BytesIO(response.body())) as book:
        root=ET.fromstring(book.read("xl/worksheets/sheet1.xml"))
        ns={"s":"http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
        return {cell.attrib["r"]:cell for cell in root.findall(".//s:c",ns)},ns


def test_review_return_edit_frozen_preview_and_excel(browser,base_url):
    ref,email,_=request_job(browser,base_url)
    admin,_=owner(browser,base_url)
    writer=new_page(browser)
    client=new_page(browser,javascript=False)
    stale=admin.context.new_page()
    try:
        configure(admin,base_url)
        job=accept_job(admin,base_url,ref)
        url=prepare(admin,job)
        document_id=url.rsplit("/",1)[1]
        invite=invite_customer(admin,base_url,job,email)
        with client.expect_request(lambda request:request.method=="POST" and request.url.startswith(base_url+"/job-invite")) as invitation_post:
            open_new_customer(client,invite)
        assert invitation_post.value.headers.get("origin")==base_url
        assert invitation_post.value.headers.get("referer")==base_url+"/","Invitation tokens must stay out of referrer headers."
        staff_invite=invite_staff(admin,base_url,unique_email("review"),name="Review Writer")
        writer.goto(staff_invite,wait_until="networkidle")
        writer.get_by_label("Choose a password").fill(PASSWORD)
        writer.get_by_role("button",name="Create my account").click()
        writer.wait_for_url("**/staff")
        writer.goto(url,wait_until="networkidle")
        writer.get_by_role("link",name="Preview draft",exact=True).click()
        writer.get_by_role("heading",name="Draft preview",exact=True).wait_for()
        assert "28900.00" in writer.locator("main").inner_text()
        writer.get_by_role("link",name="Edit draft",exact=True).click()
        writer.get_by_role("button",name="Submit for review",exact=True).click()
        writer.get_by_text("Draft submitted for Owner review.",exact=True).wait_for()
        customer_job=base_url+"/account/jobs/"+job.rsplit("/",1)[1]
        assert document_id not in client.request.get(customer_job).text()
        for suffix in ["/account/documents/"+document_id,"/documents/"+document_id+"/download?format=xlsx","/documents/"+document_id+"/pdf"]:
            assert client.request.get(base_url+suffix).status==404
        admin.goto(base_url+"/staff/documents",wait_until="networkidle")
        admin.get_by_role("heading",name="Awaiting Owner review",exact=True).wait_for()
        admin.goto(url,wait_until="networkidle")
        for width in [320,390,768,1440]:
            admin.set_viewport_size({"width":width,"height":900})
            assert admin.evaluate("document.documentElement.scrollWidth<=innerWidth")
        admin.get_by_label("Return reason",exact=True).fill("Please clarify the scope")
        admin.get_by_role("button",name="Deny draft",exact=True).click()
        admin.get_by_text("Draft returned for changes.",exact=True).wait_for()
        assert document_id not in client.request.get(customer_job).text()
        assert client.request.get(base_url+"/documents/"+document_id+"/download?format=xlsx").status==404
        writer.reload(wait_until="networkidle")
        assert "Please clarify the scope" in writer.locator("main").inner_text()
        writer.get_by_label("Description line 2",exact=True).fill('=HYPERLINK("https://example.invalid","literal text")')
        writer.get_by_role("button",name="Save document draft").click()
        writer.get_by_text("Document draft saved.",exact=True).wait_for()
        writer.get_by_role("button",name="Submit for review",exact=True).click()
        writer.get_by_text("Draft submitted for Owner review.",exact=True).wait_for()
        stale.goto(url,wait_until="networkidle")
        writer.get_by_label("Notes",exact=True).fill("Amended after submission")
        writer.get_by_role("button",name="Save document draft").click()
        writer.get_by_text("Document draft saved.",exact=True).wait_for()
        stale.get_by_label("Issue reason",exact=True).fill("Outdated approval")
        stale.get_by_label("I reviewed the saved draft and its PDF preview").check()
        stale.get_by_role("button",name="Approve and issue",exact=True).click()
        stale.get_by_role("alert").wait_for()
        writer.get_by_role("button",name="Submit for review",exact=True).click()
        writer.get_by_text("Draft submitted for Owner review.",exact=True).wait_for()
        # Changing global settings must not change the version already submitted.
        admin.goto(base_url+"/staff/documents/settings",wait_until="networkidle")
        admin.get_by_label("Bank instructions").fill("Different future bank instructions")
        admin.get_by_label("I checked the business and bank details for document use").check()
        admin.get_by_role("button",name="Save document settings").click()
        admin.get_by_text("Document settings saved.",exact=True).wait_for()
        admin.goto(url,wait_until="networkidle")
        assert "Fictional test bank instructions" in admin.locator(".document-paper").inner_text()
        assert "Different future bank instructions" not in admin.locator("main").inner_text()
        admin.get_by_label("Issue reason",exact=True).fill("Reviewed submitted copy")
        admin.get_by_label("I reviewed the saved draft and its PDF preview").check()
        admin.get_by_role("button",name="Approve and issue",exact=True).click()
        admin.get_by_text("Test document issued.",exact=True).wait_for()
        response=client.request.get(base_url+"/documents/"+document_id+"/download?format=xlsx")
        cells,ns=workbook_cells(response)
        assert cells["F17"].find("s:f",ns).text=="ROUND(B17*D17,2)-E17"
        assert cells["F17"].find("s:v",ns).text=="25200.00"
        assert cells["A18"].attrib["t"]=="inlineStr"
        assert cells["A18"].find("s:f",ns) is None
        assert cells["A18"].find("s:is/s:t",ns).text.startswith("=HYPERLINK")
        assert any(c.find("s:v",ns) is not None and c.find("s:v",ns).text=="28900.00" for c in cells.values())
        (ROOT/"test-results/010-issued.xlsx").write_bytes(response.body())
        assert client.request.get(base_url+"/documents/"+document_id+"/download?format=xlsx&portal=staff").status==403
        client.goto(base_url+"/account/documents/"+document_id,wait_until="networkidle")
        client.goto(customer_job + "#documents",wait_until="networkidle")
        listed = client.locator(".portal-documents li").filter(has_text="28900.00")
        assert "Issued " in listed.inner_text()
        listed.get_by_role("link").click()
        with client.expect_download() as pdf:
            client.get_by_role("link",name="Download PDF").click()
        assert pdf.value.suggested_filename.endswith(".pdf")
        with client.expect_download() as download:
            client.get_by_role("link",name="Download Excel",exact=True).click()
        assert download.value.suggested_filename.endswith(".xlsx")
        for width in [320,390,768,1440]:
            admin.set_viewport_size({"width":width,"height":900})
            assert admin.evaluate("document.documentElement.scrollWidth<=innerWidth")
    finally:
        for page in (admin,writer,client):page.context.close()
