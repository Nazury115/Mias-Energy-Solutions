import json
import os
import subprocess
import io
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
import pytest

ROOT=Path(__file__).resolve().parents[1]
pytestmark=pytest.mark.unit
def calculate(lines,discount="0"):
    result=subprocess.run([os.environ.get("MIAS_NODE","node"),str(ROOT/"tests/public_bridge.mjs"),
        str(ROOT/"src/lib/commercial-documents.ts"),"calculateDocument",json.dumps([lines,discount])],
        capture_output=True,text=True)
    assert result.returncode==0,result.stderr
    return json.loads(result.stdout)

def test_supplied_invoice_worked_totals():
    result=calculate([{"description":"Test labour","quantity":"9","unitPrice":"2800","discount":"0","unit":"sites"},
        {"description":"Test commissioning","quantity":"1","unitPrice":"3700","discount":"0","unit":"job"}])
    assert result["total"]=="28900.00" and result["subtotal"]=="28900.00"

def test_line_amount_discount_then_overall_percentage():
    result=calculate([{"description":"Test","quantity":"3","unitPrice":"100","discount":"10","unit":"items"}],"10")
    assert result["subtotal"]=="290.00" and result["discount"]=="29.00" and result["total"]=="261.00"

def test_exact_rounding():
    result=calculate([{"description":"Test","quantity":"1.005","unitPrice":"1","discount":"0","unit":"items"}])
    assert result["total"]=="1.01"

@pytest.mark.parametrize("field,value",[("quantity","-1"),("quantity","0"),("quantity","1.0001"),("unitPrice","NaN"),("discount","11")])
def test_bad_lines_are_explained(field,value):
    line={"description":"Test","quantity":"1","unitPrice":"10","discount":"0","unit":"items",field:value}
    assert "error" in calculate([line])

def invoke(method,value):
    result=subprocess.run([os.environ.get("MIAS_NODE","node"),str(ROOT/"tests/public_bridge.mjs"),
        str(ROOT/"src/lib/commercial-documents.ts"),method,json.dumps([value])],capture_output=True,text=True)
    assert result.returncode==0,result.stderr
    return json.loads(result.stdout)

def test_template_text_bounds_protect_pdf_layout():
    template={"name":"Test company","address":"","phone":"","email":"","bankDetails":"","preparedBy":"","taxNote":"Test tax note"}
    assert invoke("templateProblem",template) is None
    assert invoke("templateProblem",{**template,"name":"x"*141})

def test_invalid_calendar_date_is_reported():
    draft={"customer":"Test","attention":"","address":"","contact":"","customerId":"","terms":"COD","deadline":"2026-99-99","notes":"","overallDiscount":"0",
        "lines":[{"description":"Test","quantity":"1","unit":"","unitPrice":"10","discount":"0"}]}
    assert "date" in invoke("documentProblem",draft)


@pytest.mark.parametrize("date",["2026-11-05","Not issued"])
def test_excel_maximum_lines_cached_totals_dates_and_literal_text(date):
    lines=[{"description":'Literal <scope> & "work" '+("long scope "*40),"quantity":"1.005","unitPrice":"1","discount":"0","unit":"job"} for _ in range(40)]
    totals=calculate(lines,"10")
    draft={"customer":"=1+1","attention":"","address":"Test address","contact":"test@example.com","customerId":"","terms":"COD","deadline":"","notes":"Literal & text\nSecond line","overallDiscount":"10","lines":lines}
    snapshot={"kind":"quotation","reference":"TEST-Q-2026-000001","jobReference":"JOB-TEST","date":date,"draft":draft,
              "template":{"name":"Fictional business","address":"","phone":"","email":"","bankDetails":"Test only","preparedBy":"Test","taxNote":"Test tax note"},"totals":totals,"issuedBy":"Test Owner","revisionOf":None}
    script="const m=await import(process.argv[1]);let input='';for await(const chunk of process.stdin)input+=chunk;process.stdout.write(await m.createDocumentExcel(JSON.parse(input)));"
    result=subprocess.run([os.environ.get("MIAS_NODE","node"),"--input-type=module","-e",script,(ROOT/"src/server/document-excel.ts").as_uri()],input=json.dumps(snapshot).encode(),capture_output=True)
    assert result.returncode==0,result.stderr.decode()
    with zipfile.ZipFile(io.BytesIO(result.stdout)) as book:
        assert book.testzip() is None
        root=ET.fromstring(book.read("xl/worksheets/sheet1.xml"))
        ns={"s":"http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
        cells={c.attrib["r"]:c for c in root.findall(".//s:c",ns)}
        assert cells["A8"].attrib["t"]=="inlineStr" and cells["A8"].find("s:f",ns) is None
        assert cells["A56"].find("s:is/s:t",ns).text==lines[-1]["description"]
        assert cells["F56"].find("s:v",ns).text=="1.01"
        assert cells["F58"].find("s:v",ns).text=="40.40"
        assert cells["F59"].find("s:v",ns).text=="4.04"
        assert cells["F60"].find("s:v",ns).text=="36.36"
        if date=="Not issued":assert cells["B5"].find("s:is/s:t",ns).text==date
        else:assert cells["B5"].find("s:v",ns).text=="46331"
