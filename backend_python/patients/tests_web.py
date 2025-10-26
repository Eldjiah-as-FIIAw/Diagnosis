import pytest
from patients.utils.web_utils import build_query, fetch_snippet, search_web_serpapi

class DummySearch:
    def __init__(self, params): pass
    def get_dict(self):
        return { "organic_results": [{"title":"T","link":"http://x"}] }

@pytest.fixture(autouse=True)
def patch_serpapi(monkeypatch):
    import patients.utils.web_utils as w
    monkeypatch.setattr(w, 'GoogleSearch', DummySearch)

def test_build_query():
    q = build_query(["fever"], "flu", site="who.int")
    assert "fever+symptoms+flu" in q and "site%3Awho.int" in q

def test_search_web_serpapi():
    results = search_web_serpapi("q", num_results=1)
    assert results == [("T","http://x")]

def test_fetch_snippet():
    html = "<p>Short</p><p>" + "x"*100 + "</p>"
    s = fetch_snippet("http://dummy", )
    assert "x"*100 in s
