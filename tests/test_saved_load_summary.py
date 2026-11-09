import json
import os
from pathlib import Path
import subprocess
import pytest

pytestmark=pytest.mark.unit
ROOT=Path(__file__).resolve().parents[1]

@pytest.mark.parametrize("method,value,expected",[("toKw","0","0"),("toKw","1250.5","1.2505"),("toKw","40","0.04"),("toKwh","160","0.16"),("toKwh","40.875","0.040875"),("toKwh","0","0")])
def test_historical_snapshot_units_keep_original_precision(method,value,expected):
    script="const m=await import(process.argv[1]);process.stdout.write(JSON.stringify(m[process.argv[2]](process.argv[3])));"
    result=subprocess.run([os.environ.get("MIAS_NODE","node"),"--input-type=module","-e",script,(ROOT/"src/lib/saved-load-summary.ts").as_uri(),method,value],capture_output=True,text=True)
    assert result.returncode==0,result.stderr
    assert json.loads(result.stdout)==expected
