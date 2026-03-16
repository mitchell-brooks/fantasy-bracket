# ABOUTME: Shared Supabase client initialization for all pipeline modules
# ABOUTME: Reads credentials from environment variables or .env.local file
import os
from pathlib import Path
from supabase import create_client, Client


def get_client() -> Client:
    """Create and return a Supabase client.

    Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_SUPABASE_SERVICE_ROLE_KEY
    from environment variables. Falls back to reading .env.local from
    the project root.

    Returns:
        Authenticated Supabase client.

    Raises:
        ValueError: If required environment variables are not set.
    """
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("NEXT_SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        _load_env_file()
        url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
        key = os.environ.get("NEXT_SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        raise ValueError(
            "Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and "
            "NEXT_SUPABASE_SERVICE_ROLE_KEY environment variables, or ensure "
            ".env.local exists in the project root."
        )

    return create_client(url, key)


def _load_env_file() -> None:
    """Load environment variables from .env.local if it exists."""
    # Walk up from data/pipeline/ to find project root
    env_path = Path(__file__).parent.parent.parent / ".env.local"
    if not env_path.exists():
        return

    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                os.environ.setdefault(key.strip(), value.strip())
