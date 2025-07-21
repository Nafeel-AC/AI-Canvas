from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from utils.elevenlabs import ElevenLabsTTS
import io
from typing import Optional

router = APIRouter()

# Initialize ElevenLabs TTS
tts_engine = ElevenLabsTTS()

class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = "21m00Tcm4TlvDq8ikWAM"  # Default voice
    model_id: Optional[str] = "eleven_monolingual_v1"
    voice_settings: Optional[dict] = None

class TTSStreamRequest(BaseModel):
    text: str
    voice_id: Optional[str] = "21m00Tcm4TlvDq8ikWAM"
    model_id: Optional[str] = "eleven_monolingual_v1"

@router.post("/text-to-speech")
async def text_to_speech(request: TTSRequest):
    """
    Convert text to speech using ElevenLabs
    
    Args:
        request: TTS request with text and voice settings
        
    Returns:
        Audio file (MP3) as streaming response
    """
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        if len(request.text) > 5000:
            raise HTTPException(status_code=400, detail="Text too long (max 5000 characters)")
        
        # Generate speech
        audio_data = await tts_engine.text_to_speech(
            text=request.text,
            voice_id=request.voice_id,
            model_id=request.model_id,
            voice_settings=request.voice_settings
        )
        
        # Return audio as streaming response
        return StreamingResponse(
            io.BytesIO(audio_data),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "attachment; filename=speech.mp3",
                "Content-Length": str(len(audio_data))
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")

@router.post("/text-to-speech-stream")
async def text_to_speech_stream(request: TTSStreamRequest):
    """
    Convert text to speech with streaming response
    
    Args:
        request: TTS stream request
        
    Returns:
        Streaming audio response
    """
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Generate streaming audio
        audio_stream = tts_engine.text_to_speech_stream(
            text=request.text,
            voice_id=request.voice_id,
            model_id=request.model_id
        )
        
        return StreamingResponse(
            audio_stream,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=speech_stream.mp3"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error streaming speech: {str(e)}")

@router.get("/voices")
async def get_available_voices():
    """
    Get list of available ElevenLabs voices
    
    Returns:
        JSON response with available voices
    """
    try:
        voices = await tts_engine.get_voices()
        return {
            "success": True,
            "voices": voices
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching voices: {str(e)}")

@router.get("/voice-settings/{voice_id}")
async def get_voice_settings(voice_id: str):
    """
    Get voice settings for a specific voice
    
    Args:
        voice_id: ElevenLabs voice ID
        
    Returns:
        JSON response with voice settings
    """
    try:
        settings = await tts_engine.get_voice_settings(voice_id)
        return {
            "success": True,
            "voice_id": voice_id,
            "settings": settings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching voice settings: {str(e)}") 