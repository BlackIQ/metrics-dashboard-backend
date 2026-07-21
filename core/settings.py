# Pydantic Settings
from pydantic_settings import BaseSettings, SettingsConfigDict


# Class Settings
class Settings(BaseSettings):
    database_url: str = ""

    model_config = SettingsConfigDict(env_file=".env")


# settings
settings = Settings()
