from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
import uuid

class DrawingSession(BaseModel):
    """Drawing session model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    canvas_data: Optional[str] = None  # Base64 encoded image
    ai_analysis: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    metadata: Optional[Dict[str, Any]] = None

class VoiceInteraction(BaseModel):
    """Voice interaction model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_id: Optional[str] = None
    audio_file_path: Optional[str] = None
    transcribed_text: str
    ai_response: str
    language: str = "en"
    confidence_score: float = 0.0
    duration_seconds: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = None

class AIResponse(BaseModel):
    """AI response model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_id: Optional[str] = None
    input_type: str  # "drawing", "voice", "text"
    input_data: str
    response_text: str
    response_audio_path: Optional[str] = None
    model_used: str  # "gemini", "whisper", "elevenlabs"
    confidence_score: float = 0.0
    processing_time_ms: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = None

class User(BaseModel):
    """User model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: Optional[str] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_active: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class WebSocketMessage(BaseModel):
    """WebSocket message model"""
    type: str
    data: Dict[str, Any]
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AnalysisRequest(BaseModel):
    """Request model for drawing analysis"""
    prompt: Optional[str] = None
    conversation_history: Optional[str] = None
    user_question: Optional[str] = None
    analysis_type: str = "general"  # "general", "detailed", "creative", "technical"

class VoiceTranscriptionRequest(BaseModel):
    """Request model for voice transcription"""
    language: str = "auto"
    session_id: Optional[str] = None
    chunk_index: Optional[int] = None
    is_realtime: bool = False

class TTSRequest(BaseModel):
    """Request model for text-to-speech"""
    text: str
    voice_id: Optional[str] = "21m00Tcm4TlvDq8ikWAM"
    model_id: Optional[str] = "eleven_monolingual_v1"
    voice_settings: Optional[Dict[str, Any]] = None
    speed: Optional[float] = 1.0
    pitch: Optional[float] = 1.0

class SessionStats(BaseModel):
    """Session statistics model"""
    session_id: str
    total_interactions: int = 0
    drawing_analyses: int = 0
    voice_interactions: int = 0
    total_duration_seconds: int = 0
    ai_responses_generated: int = 0
    average_response_time_ms: float = 0.0
    languages_used: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ErrorLog(BaseModel):
    """Error logging model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    error_type: str
    error_message: str
    stack_trace: Optional[str] = None
    endpoint: Optional[str] = None
    request_data: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    severity: str = "error"  # "info", "warning", "error", "critical"

class APIUsageLog(BaseModel):
    """API usage tracking model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    api_type: str  # "gemini", "elevenlabs", "whisper"
    endpoint: str
    request_size_bytes: int = 0
    response_size_bytes: int = 0
    processing_time_ms: int = 0
    cost_estimate: Optional[float] = None
    status_code: int = 200
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Response models for API endpoints
class AnalysisResponse(BaseModel):
    """Response model for drawing analysis"""
    success: bool
    analysis: str
    prompt_used: str
    image_info: Dict[str, Any]
    processing_time_ms: int = 0
    confidence_score: float = 0.0

class TranscriptionResponse(BaseModel):
    """Response model for voice transcription"""
    success: bool
    transcription: str
    language: str
    confidence: float
    segments: List[Dict[str, Any]] = []
    audio_info: Dict[str, Any]
    processing_time_ms: int = 0

class TTSResponse(BaseModel):
    """Response model for text-to-speech"""
    success: bool
    audio_url: Optional[str] = None
    audio_duration_seconds: Optional[float] = None
    character_count: int
    voice_used: str
    processing_time_ms: int = 0

class HealthResponse(BaseModel):
    """Health check response model"""
    status: str = "healthy"
    version: str = "1.0.0"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    services: Dict[str, str] = {}
    uptime_seconds: int = 0 