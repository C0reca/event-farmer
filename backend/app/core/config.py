from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://teamevents:teamevents123@localhost:5432/teamevents"
    SECRET_KEY: str = "your-secret-key-change-in-production-12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Email settings
    EMAIL_ENABLED: bool = False
    EMAIL_FROM: str = "noreply@teamsync.com"
    EMAIL_FROM_NAME: str = "TeamSync"
    RESEND_API_KEY: Optional[str] = None  # Para integração com Resend
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()

