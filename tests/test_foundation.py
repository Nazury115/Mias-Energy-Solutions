from html.parser import HTMLParser
from urllib.error import HTTPError
from urllib.request import urlopen

import pytest


pytestmark = pytest.mark.integration


class Document(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.tags = []
        self.text = []
        self.hidden_depth = 0
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))
        if tag in {"script", "style"}:
            self.hidden_depth += 1

    def handle_endtag(self, tag):
        if tag in {"script", "style"}:
            self.hidden_depth = max(0, self.hidden_depth - 1)

    def handle_data(self, data):
        if not self.hidden_depth:
            self.text.append(data)


@pytest.fixture(scope="module")
def homepage(base_url):
    with urlopen(base_url, timeout=30) as response:
        assert response.status == 200
        return Document(response.read().decode("utf-8"))


def test_business_identity_and_semantics(homepage):
    text = " ".join(homepage.text)
    assert "Mias Energy Solutions" in text
    assert "Lusaka" in text and "Zambia" in text
    assert sum(tag == "h1" for tag, _ in homepage.tags) == 1
    assert sum(tag == "main" for tag, _ in homepage.tags) == 1
    assert any(tag == "title" for tag, _ in homepage.tags)


@pytest.mark.parametrize("service", ["Borehole", "Booster", "Solar water pumping", "Solar PV", "Water treatment", "Control panels", "Electrical", "Plumbing", "Water infrastructure", "Maintenance"])
def test_supplied_services_are_explained(homepage, service):
    assert service.casefold() in " ".join(homepage.text).casefold()


def test_all_fragment_links_have_real_destinations(homepage):
    ids = {attrs["id"] for _, attrs in homepage.tags if "id" in attrs}
    fragments = [attrs["href"] for tag, attrs in homepage.tags if tag == "a" and attrs.get("href", "").startswith("#")]
    assert len(fragments) >= 4
    assert all(fragment[1:] in ids for fragment in fragments)
    assert {"services", "about", "contact", "main-content"} <= ids


def test_unknown_contacts_are_truthful_and_not_submittable(homepage):
    text = " ".join(homepage.text)
    assert "TODO: Confirm with business owner" in text
    links = [attrs.get("href", "") for tag, attrs in homepage.tags if tag == "a"]
    assert not any(link.startswith(("tel:", "mailto:", "https://wa.me")) for link in links)
    assert not any(tag == "form" for tag, _ in homepage.tags)


def test_preview_metadata_and_local_artwork(homepage):
    metas = {attrs.get("name"): attrs.get("content", "") for tag, attrs in homepage.tags if tag == "meta"}
    assert "noindex" in metas.get("robots", "")
    assert len(metas.get("description", "")) >= 40
    images = [attrs for tag, attrs in homepage.tags if tag == "img"]
    assert images and all("alt" in image for image in images)
    assert all(not image.get("src", "").startswith("http") for image in images)


def test_missing_route_returns_404_with_a_route_home(base_url):
    with pytest.raises(HTTPError) as error:
        urlopen(f"{base_url}/a-page-that-does-not-exist", timeout=30)
    assert error.value.code == 404
    document = Document(error.value.read().decode("utf-8"))
    assert any(tag == "a" and attrs.get("href") == "/" for tag, attrs in document.tags)
