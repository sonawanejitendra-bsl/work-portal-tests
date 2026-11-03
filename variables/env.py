"""Load JD Edwards settings for the Robot suite. Passwords stay out of the test log arguments."""

from __future__ import annotations

import os
from pathlib import Path


def get_variables() -> dict[str, str]:
    try:
        from dotenv import dotenv_values
    except ImportError:
        dotenv_values = None
    root = Path(__file__).resolve().parents[1]
    if dotenv_values is not None:
        path = root / ".env"
        if path.is_file():
            for key, value in dotenv_values(path).items():
                if key and value:
                    os.environ.setdefault(key, value)
    base = os.environ.get("JDE_BASE_URL", "https://mirajde-dvtrweb.birlasoft.com").rstrip("/")
    return {
        "LOGIN_URL": f"{base}/jde/E1Menu.maf?",
        "JDE_USER": os.environ.get("JDE_USER", os.environ.get("TEST_USER_JDE", "")),
        "JDE_PASSWORD": os.environ.get("JDE_PASSWORD", os.environ.get("TEST_PASSWORD_JDE", "")),
        "JDE_ENVIRONMENT": os.environ.get("JDE_ENVIRONMENT", "JTR920") or "JTR920",
        "JDE_ROLE": os.environ.get("JDE_ROLE", "*ALL") or "*ALL",
    }
