# ABOUTME: Tests for the HTTP session factory
# ABOUTME: Verifies session creation with and without IP rotation, and retry behavior
import requests
import pytest
from pipeline.http import create_session, shutdown_session


def test_create_session_without_ip_rotation():
    """A session without IP rotation is a plain RetrySession."""
    config = {"http": {"ip_rotation": False}}
    session = create_session(config)
    assert isinstance(session, requests.Session)
    shutdown_session(session)


def test_create_session_default_config():
    """Missing http config returns a plain session."""
    config = {}
    session = create_session(config)
    assert isinstance(session, requests.Session)
    shutdown_session(session)


def test_retry_on_403():
    """Session retries on 403 responses up to max_attempts."""
    config = {
        "http": {
            "ip_rotation": False,
            "retry": {"max_attempts": 3, "backoff_base_seconds": 0},
        }
    }
    session = create_session(config)
    call_count = 0
    original_get = requests.Session.get

    def mock_get(self, url, **kwargs):
        nonlocal call_count
        call_count += 1
        resp = requests.Response()
        resp.status_code = 403 if call_count < 3 else 200
        resp._content = b"<html></html>"
        return resp

    # Monkeypatch the parent class get
    old_get = requests.Session.get
    requests.Session.get = mock_get
    try:
        response = session.get("http://example.com")
        assert response.status_code == 200
        assert call_count == 3
    finally:
        requests.Session.get = old_get
    shutdown_session(session)
