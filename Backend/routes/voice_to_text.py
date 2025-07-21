from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from utils.whisper import WhisperTranscriber
import tempfile
import os

router = APIRouter()

# Initialize Whisper transcriber
whisper_transcriber = WhisperTranscriber()

@router.post("/voice-to-text")
async def voice_to_text(
    audio: UploadFile = File(...),
    language: str = Form(default="auto")
):
    """
    Convert voice audio to text using Whisper
    
    Args:
        audio: Audio file (WAV, MP3, M4A, etc.)
        language: Language code (e.g., 'en', 'es', 'fr') or 'auto' for auto-detection
        
    Returns:
        JSON response with transcribed text
    """
    try:
        # Validate audio file
        allowed_types = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/webm']
        if audio.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported audio format. Allowed: {', '.join(allowed_types)}"
            )
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{audio.filename.split('.')[-1]}") as temp_file:
            contents = await audio.read()
            temp_file.write(contents)
            temp_file_path = temp_file.name
        
        try:
            # Transcribe audio
            result = await whisper_transcriber.transcribe(
                temp_file_path, 
                language=None if language == "auto" else language
            )
            
            return JSONResponse(content={
                "success": True,
                "transcription": result["text"],
                "language": result["language"],
                "confidence": result.get("confidence", 0.0),
                "segments": result.get("segments", []),
                "audio_info": {
                    "filename": audio.filename,
                    "content_type": audio.content_type,
                    "size_bytes": len(contents)
                }
            })
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error transcribing audio: {str(e)}")

@router.post("/voice-to-text-realtime")
async def voice_to_text_realtime(
    audio_chunk: UploadFile = File(...),
    session_id: str = Form(...),
    chunk_index: int = Form(...)
):
    """
    Real-time voice transcription for streaming audio
    
    Args:
        audio_chunk: Audio chunk from real-time stream
        session_id: Unique session identifier
        chunk_index: Index of this audio chunk in the session
        
    Returns:
        JSON response with partial transcription
    """
    try:
        # Save audio chunk temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            contents = await audio_chunk.read()
            temp_file.write(contents)
            temp_file_path = temp_file.name
        
        try:
            # Transcribe chunk
            result = await whisper_transcriber.transcribe_chunk(
                temp_file_path,
                session_id=session_id,
                chunk_index=chunk_index
            )
            
            return JSONResponse(content={
                "success": True,
                "session_id": session_id,
                "chunk_index": chunk_index,
                "partial_text": result["text"],
                "is_final": result.get("is_final", False),
                "confidence": result.get("confidence", 0.0)
            })
            
        finally:
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in realtime transcription: {str(e)}") 