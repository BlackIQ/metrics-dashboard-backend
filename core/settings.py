# Pydantic Settings
from pydantic_settings import BaseSettings, SettingsConfigDict


# Class Settings
class Settings(BaseSettings):
    # Database - PostgreSQL
    postgresql_url: str = ""

    # Database - TimescaleDB

    # Security
    secret: str = ""
    algorithm: str = ""

    # Config Model
    model_config = SettingsConfigDict(env_file=".env")


# settings
settings = Settings()
