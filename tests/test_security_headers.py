from urllib.request import urlopen

import pytest


@pytest.mark.parametrize("path", ["/sign-in", "/reset-password", "/job-invite"])
def test_account_pages_restrict_framing_and_referrers(base_url, path):
    with urlopen(base_url + path, timeout=90) as response:
        assert response.headers.get("X-Frame-Options") == "SAMEORIGIN"
        assert response.headers.get("Referrer-Policy") == "strict-origin"
