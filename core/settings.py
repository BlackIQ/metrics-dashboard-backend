# Pydantic Settings
from pydantic_settings import BaseSettings, SettingsConfigDict

# Path
from pathlib import Path

# JSON
import json

ROOT_DIR = Path(__file__).resolve().parent.parent


# Class Settings
class Settings(BaseSettings):
    # Database - PostgreSQL
    postgresql_url: str = ""

    # Database - TimescaleDB

    # Security
    secret: str = ""
    algorithm: str = ""

    # Sentry
    sentry_dsn: str = ""

    # Firebase
    firebase_credentials: str = ""

    # Resend
    resend_apikey: str = ""

    # Email
    email_endpoint: str = ""
    email_port: int = 0
    email_username: str = ""
    email_password: str = ""

    # Config Model
    model_config = SettingsConfigDict(env_file=".env")

    # Get firebase cerds
    def get_firebase_credentials_dict(self) -> dict:
        raw_val = self.firebase_credentials.strip()

        if raw_val.startswith("{"):
            return json.loads(raw_val)

        path = Path(raw_val) if raw_val else ROOT_DIR / "openhubble-cloud-firebase.json"
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)

        raise ValueError(f"Firebase credentials not found or invalid at: {path}")


# settings
settings = Settings()
