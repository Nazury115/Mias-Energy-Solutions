import os
import subprocess
from pathlib import Path

import pytest


@pytest.mark.unit
@pytest.mark.parametrize("trusted, real_ip, expected", [
    (None, "192.0.2.10", "local"),
    ("true", "192.0.2.10", "192.0.2.10"),
    ("true", "", "local"),
    ("true", "not an address", "local"),
])
def test_production_network_identity(trusted, real_ip, expected):
    script = """
        import { networkAddress } from './src/server/network-address.ts';
        const headers = new Headers({'x-forwarded-for': '192.0.2.20', 'x-real-ip': process.argv[1]});
        process.stdout.write(networkAddress(headers));
    """
    env = {**os.environ, "NODE_ENV": "production"}
    env.pop("MIAS_TRUST_PROXY", None)
    if trusted is not None:
        env["MIAS_TRUST_PROXY"] = trusted
    result = subprocess.run(
        [os.environ.get("MIAS_NODE", "node"), "--input-type=module", "-e", script, real_ip],
        cwd=Path(__file__).resolve().parents[1], capture_output=True, text=True, check=True,
        env=env,
    )
    assert result.stdout == expected
