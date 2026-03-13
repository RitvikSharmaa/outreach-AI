from pydantic import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # App Config
    app_name: str = "AutoPilot-Outreach"
    environment: str = "development"
    log_level: str = "INFO"
    app_url: str = "http://localhost:3000"
    api_url: str = "http://localhost:8000"
    
    # LLM / AI
    groq_api_key: str
    together_api_key: str = ""
    
    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str
    
    # Vector DB
    chroma_persist_dir: str = "./chroma_data"
    
    # Email / SMTP
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_email: str = ""
    smtp_app_password: str = ""
    
    # Email Finding
    hunter_api_key: str = ""
    
    # Scraper
    scraper_timeout: int = 30
    scraper_user_agent: str = "Mozilla/5.0"
    
    # Rate Limiting
    max_research_requests_per_minute: int = 10
    max_email_sends_per_minute: int = 20
    
    # Security
    jwt_secret: str
    session_secret: str
    
    # Tracking
    enable_email_tracking: bool = True
    enable_open_tracking: bool = True
    enable_click_tracking: bool = True
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    return Settings()
