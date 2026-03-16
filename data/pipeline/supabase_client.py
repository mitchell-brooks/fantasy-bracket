# ABOUTME: Shared Supabase client initialization for all pipeline modules
# ABOUTME: Reads credentials from environment variables or .env.local file
import os
from pathlib import Path
from supabase import create_client, Client


def get_client() -> Client:
    """Create and return a Supabase client.

    Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_SUPABASE_SERVICE_ROLE_KEY
    from environment variables. Falls back to reading .env.local from
    the project root via python-dotenv.

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

    missing = []
    if not url:
        missing.append("NEXT_PUBLIC_SUPABASE_URL")
    if not key:
        missing.append("NEXT_SUPABASE_SERVICE_ROLE_KEY")

    if missing:
        raise ValueError(
            f"Missing Supabase credentials: {', '.join(missing)}. "
            "Set them as environment variables or ensure .env.local "
            "exists in the project root."
        )

    return create_client(url, key)


def _load_env_file() -> None:
    """Load environment variables from .env.local if it exists."""
    from dotenv import load_dotenv

    # Walk up from data/pipeline/ to find project root
    env_path = Path(__file__).parent.parent.parent / ".env.local"
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
