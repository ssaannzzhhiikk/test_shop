from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Flimod Catalog Demo API"
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/flimod_catalog_demo"
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
