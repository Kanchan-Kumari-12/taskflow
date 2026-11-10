from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/.env ka path (config.py se do folder upar)
ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(env_file=ENV_FILE)


settings = Settings()