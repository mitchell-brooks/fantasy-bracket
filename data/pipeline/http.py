# ABOUTME: HTTP session factory with optional IP rotation and configurable retry
# ABOUTME: Creates requests.Session instances that can be injected into the scraper
import logging
import time
from typing import Any

import requests

logger = logging.getLogger(__name__)

_DEFAULT_REGIONS = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1', 'eu-central-1',
    'ca-central-1', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1',
    'ap-northeast-2', 'ap-south-1', 'sa-east-1',
]

_HOST = "https://www.sports-reference.com/"


class RetrySession(requests.Session):
    """A requests.Session that retries on 403 with configurable backoff."""

    def __init__(self, max_attempts: int = 5, backoff_base: float = 3.0):
        super().__init__()
        self._max_attempts = max_attempts
        self._backoff_base = backoff_base

    def get(self, url, **kwargs):
        for attempt in range(self._max_attempts):
            response = super().get(url, **kwargs)
            if response.status_code != 403:
                return response
            if attempt < self._max_attempts - 1:
                wait = self._backoff_base * (attempt + 1)
                logger.warning(
                    "403 on attempt %d for %s, retrying in %.0fs",
                    attempt + 1, url[:80], wait
                )
                time.sleep(wait)
        logger.error("All %d attempts returned 403 for %s", self._max_attempts, url[:80])
        return response


def create_session(config: dict[str, Any]) -> requests.Session:
    """Create an HTTP session based on config."""
    http_config = config.get("http", {})
    retry_config = http_config.get("retry", {})
    max_attempts = retry_config.get("max_attempts", 5)
    backoff_base = retry_config.get("backoff_base_seconds", 3.0)

    session = RetrySession(max_attempts=max_attempts, backoff_base=backoff_base)

    if http_config.get("ip_rotation", False):
        try:
            from requests_ip_rotator import ApiGateway
        except ImportError:
            raise ImportError(
                "IP rotation requires requests-ip-rotator: pip install requests-ip-rotator"
            )
        regions = http_config.get("regions", _DEFAULT_REGIONS)
        gateway = ApiGateway(_HOST, regions=regions)
        gateway.start()
        session.mount(_HOST, gateway)
        session._gateway = gateway
        logger.info("API Gateway established with %d regions", len(regions))

    return session


def shutdown_session(session: requests.Session) -> None:
    """Shut down any API Gateway resources on the session."""
    gateway = getattr(session, '_gateway', None)
    if gateway:
        try:
            gateway.shutdown()
            logger.info("API Gateway shut down")
        except Exception as e:
            logger.warning("Error shutting down gateway: %s", e)
