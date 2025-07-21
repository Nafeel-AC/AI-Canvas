import os
from typing import List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings:
    """Application settings and configuration"""
    
    # API Keys
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_API_KEY: str = os.getenv("SUPABASE_API_KEY", "")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
    
    # CORS settings
    CORS_ORIGINS: List[str] = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    
    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # AI Model settings
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")
    WHISPER_MODEL: str = os.getenv("WHISPER_MODEL", "base")
    ELEVENLABS_DEFAULT_VOICE: str = os.getenv("ELEVENLABS_DEFAULT_VOICE", "21m00Tcm4TlvDq8ikWAM")
    
    # File upload limits
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "50"))
    MAX_AUDIO_DURATION_SECONDS: int = int(os.getenv("MAX_AUDIO_DURATION_SECONDS", "300"))
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Database settings
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")
    
    # WebSocket settings
    WEBSOCKET_TIMEOUT: int = int(os.getenv("WEBSOCKET_TIMEOUT", "300"))
    MAX_WEBSOCKET_CONNECTIONS: int = int(os.getenv("MAX_WEBSOCKET_CONNECTIONS", "100"))
    
    @classmethod
    def validate_required_keys(cls) -> List[str]:
        """Validate that all required API keys are present"""
        missing_keys = []
        
        if not cls.GOOGLE_API_KEY:
            missing_keys.append("GOOGLE_API_KEY")
        if not cls.ELEVENLABS_API_KEY:
            missing_keys.append("ELEVENLABS_API_KEY")
        if not cls.SUPABASE_URL:
            missing_keys.append("SUPABASE_URL")
        if not cls.SUPABASE_API_KEY:
            missing_keys.append("SUPABASE_API_KEY")
            
        return missing_keys
    
    @classmethod
    def get_database_config(cls) -> dict:
        """Get database configuration for Supabase"""
        return {
            "url": cls.SUPABASE_URL,
            "key": cls.SUPABASE_API_KEY,
        }

# Create global settings instance
settings = Settings() 