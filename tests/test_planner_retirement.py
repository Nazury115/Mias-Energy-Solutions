from urllib.error import HTTPError
from urllib.request import Request, urlopen
import pytest
from test_foundation import Document
from test_inquiries import new_page, unique_email, fill_form, send, REFERENCE
from test_accounts import owner


@pytest.mark.integration
@pytest.mark.parametrize("method",["GET","POST"])
def test_retired_planner_returns_not_found(base_url,method):
    request=Request(base_url+"/solar-planner",method=method,data=b"intent=send" if method=="POST" else None)
    with pytest.raises(HTTPError) as response:
        urlopen(request,timeout=60)
    assert response.value.code==404


@pytest.mark.integration
def test_public_pages_and_mobile_choices_no_longer_offer_planner(base_url):
    for path in ["/","/services/renewable-energy","/dev/mobile","/privacy"]:
        with urlopen(base_url+path,timeout=60) as response:
            html=response.read().decode()
        doc=Document(html)
        assert not any(attrs.get("href")=="/solar-planner" or attrs.get("value")=="/solar-planner" for _,attrs in doc.tags)
        if path=="/services/renewable-energy":
            assert any(attrs.get("href")=="/contact?service=renewable-energy" for _,attrs in doc.tags)
        if path=="/privacy":
            assert "Solar load planner" not in html


@pytest.mark.browser
def test_assessment_request_uses_normal_inquiry_and_rejects_retired_payload(browser,base_url):
    page=new_page(browser,base_url)
    admin=None
    try:
        page.goto(base_url+"/services/renewable-energy",wait_until="networkidle")
        page.get_by_role("link",name="Request a solar assessment",exact=True).click()
        page.get_by_role("button",name="Prepare WhatsApp message",exact=True).wait_for()
        assert page.get_by_label("Service",exact=True).input_value()=="renewable-energy"
        fill_form(page,unique_email(),details="Synthetic request for a staff-reviewed solar quotation.")
        page.evaluate("""() => {const field=document.createElement('input');field.type='hidden';field.name='solarPlan';field.value='{}';document.querySelector('form[data-inquiry-form]').append(field);} """)
        send(page)
        page.get_by_text("The solar planner is no longer available. Describe your requirements in Project details instead.",exact=True).first.wait_for()
        assert not REFERENCE.search(page.locator("main").inner_text())
        assert page.get_by_label("Your name",exact=True).input_value()=="Test Visitor"
        assert page.get_by_role("radio",name="Email",exact=True).is_checked()
        page.evaluate("document.querySelector('input[name=solarPlan]').remove()")
        send(page)
        page.get_by_role("status").get_by_text("Thank you",exact=False).wait_for()
        reference=REFERENCE.search(page.locator("main").inner_text()).group()
        admin,_=owner(browser,base_url)
        admin.goto(base_url+"/staff/inquiries/"+reference,wait_until="networkidle")
        assert "Synthetic request for a staff-reviewed solar quotation." in admin.locator("main").inner_text()
        assert admin.locator("[data-solar-summary]").count()==0
        for width in [320,390,768,1440]:
            admin.set_viewport_size({"width":width,"height":900})
            assert admin.evaluate("document.documentElement.scrollWidth<=innerWidth")
    finally:
        page.context.close()
        if admin:admin.context.close()
