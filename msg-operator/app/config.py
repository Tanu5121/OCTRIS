from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "OCTRIS MSG Operator"
    database_url: str = "sqlite:///./msg_operator.db"

    duplicate_window_seconds: int = 300
    unread_limit: int = 100

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()