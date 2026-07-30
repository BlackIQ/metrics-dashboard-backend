# Pydantic Settings
from pydantic_settings import BaseSettings, SettingsConfigDict

# Path
from pathlib import Path

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
    firebase_cerds: str = f"{ROOT_DIR}/openhubble-cloud-firebase.json"

    # Config Model
    model_config = SettingsConfigDict(env_file=".env")


# settings
settings = Settings()
