from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Flimod Catalog Demo API"
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/flimod_catalog_demo"
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:5173"]
    SECRET_KEY: str = "change-me-in-local-env"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    CREATE_DEV_ADMIN: bool = False
    DEV_ADMIN_EMAIL: str | None = None
    DEV_ADMIN_PASSWORD: str | None = None
    DEV_ADMIN_FULL_NAME: str = "Local Admin"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
