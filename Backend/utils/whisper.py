from faster_whisper import WhisperModel
import asyncio
import os
import numpy as np
import librosa
from typing import Dict, Any, Optional
import logging
from pydub import AudioSegment

logger = logging.getLogger(__name__)

class WhisperTranscriber:
    """Helper class for Faster-Whisper speech-to-text transcription"""
    
    def __init__(self, model_size: str = "base"):
        """
        Initialize Whisper transcriber
        
        Args:
            model_size: Whisper model size ('tiny', 'base', 'small', 'medium', 'large')
        """
        self.model_size = model_size
        self.model = None
        self.session_cache = {}  # For real-time transcription sessions
        
        # Load model in background
        asyncio.create_task(self._load_model())
    
    async def _load_model(self):
        """Load Whisper model asynchronously"""
        try:
            loop = asyncio.get_event_loop()
            self.model = await loop.run_in_executor(
                None, 
                lambda: WhisperModel(self.model_size, device="cpu", compute_type="int8")
            )
            logger.info(f"Faster-Whisper model '{self.model_size}' loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
            raise
    
    async def _ensure_model_loaded(self):
        """Ensure model is loaded before use"""
        if self.model is None:
            await self._load_model()
    
    async def transcribe(
        self, 
        audio_path: str, 
        language: Optional[str] = None,
        temperature: float = 0.0
    ) -> Dict[str, Any]:
        """
        Transcribe audio file using Whisper
        
        Args:
            audio_path: Path to audio file
            language: Language code (e.g., 'en', 'es') or None for auto-detection
            temperature: Sampling temperature (0.0 = deterministic)
            
        Returns:
            Dictionary with transcription results
        """
        try:
            await self._ensure_model_loaded()
            
            # Preprocess audio
            audio_data = await self._preprocess_audio(audio_path)
            
            # Run transcription in thread pool
            loop = asyncio.get_event_loop()
            segments, info = await loop.run_in_executor(
                None,
                lambda: self.model.transcribe(
                    audio_data,
                    language=language,
                    temperature=temperature
                )
            )
            
            # Convert segments to list and extract text
            segments_list = list(segments)
            full_text = " ".join([segment.text for segment in segments_list])
            
            # Calculate confidence score (approximate)
            confidence = self._calculate_confidence_faster(segments_list)
            
            return {
                "text": full_text.strip(),
                "language": info.language,
                "segments": [{"text": s.text, "start": s.start, "end": s.end} for s in segments_list],
                "confidence": confidence,
                "duration": len(audio_data) / 16000  # Assuming 16kHz sample rate
            }
            
        except Exception as e:
            logger.error(f"Transcription error: {e}")
            return {
                "text": "",
                "language": "unknown",
                "segments": [],
                "confidence": 0.0,
                "error": str(e)
            }
    
    async def transcribe_chunk(
        self,
        audio_path: str,
        session_id: str,
        chunk_index: int
    ) -> Dict[str, Any]:
        """
        Transcribe audio chunk for real-time processing
        
        Args:
            audio_path: Path to audio chunk
            session_id: Unique session identifier
            chunk_index: Index of this chunk in the session
            
        Returns:
            Dictionary with partial transcription results
        """
        try:
            await self._ensure_model_loaded()
            
            # Initialize session if needed
            if session_id not in self.session_cache:
                self.session_cache[session_id] = {
                    "chunks": [],
                    "full_text": "",
                    "last_chunk_index": -1
                }
            
            session = self.session_cache[session_id]
            
            # Transcribe current chunk
            result = await self.transcribe(audio_path)
            
            # Update session
            session["chunks"].append({
                "index": chunk_index,
                "text": result["text"],
                "confidence": result["confidence"]
            })
            session["last_chunk_index"] = chunk_index
            
            # Determine if this should be considered "final"
            is_final = self._is_chunk_final(result["text"])
            
            if is_final:
                # Combine chunks for better context
                combined_text = self._combine_chunks(session["chunks"])
                session["full_text"] = combined_text
            
            return {
                "text": result["text"],
                "confidence": result["confidence"],
                "is_final": is_final,
                "session_text": session["full_text"],
                "chunk_index": chunk_index
            }
            
        except Exception as e:
            logger.error(f"Chunk transcription error: {e}")
            return {
                "text": "",
                "confidence": 0.0,
                "is_final": False,
                "error": str(e)
            }
    
    async def _preprocess_audio(self, audio_path: str) -> np.ndarray:
        """
        Preprocess audio file for Whisper
        
        Args:
            audio_path: Path to audio file
            
        Returns:
            Audio data as numpy array
        """
        try:
            # Convert to supported format if needed
            if audio_path.endswith(('.mp3', '.m4a', '.webm')):
                audio_segment = AudioSegment.from_file(audio_path)
                audio_segment = audio_segment.set_frame_rate(16000).set_channels(1)
                
                # Convert to numpy array
                audio_data = np.array(audio_segment.get_array_of_samples(), dtype=np.float32)
                audio_data = audio_data / np.max(np.abs(audio_data))  # Normalize
            else:
                # Load with librosa for other formats
                audio_data, _ = librosa.load(audio_path, sr=16000, mono=True)
            
            return audio_data
            
        except Exception as e:
            logger.error(f"Audio preprocessing error: {e}")
            raise
    
    def _calculate_confidence_faster(self, segments: list) -> float:
        """
        Calculate approximate confidence score for faster-whisper
        
        Args:
            segments: List of transcription segments
            
        Returns:
            Confidence score between 0.0 and 1.0
        """
        try:
            if not segments:
                return 0.5  # Default confidence
            
            # Average the probability scores from segments
            total_prob = 0.0
            total_segments = len(segments)
            
            for segment in segments:
                # faster-whisper provides avg_logprob
                if hasattr(segment, 'avg_logprob'):
                    # Convert log probability to probability
                    prob = np.exp(segment.avg_logprob)
                    total_prob += prob
                else:
                    total_prob += 0.5  # Default if no probability available
            
            if total_segments > 0:
                return min(total_prob / total_segments, 1.0)
            else:
                return 0.5
                
        except Exception:
            return 0.5
    
    def _is_chunk_final(self, text: str) -> bool:
        """
        Determine if a transcribed chunk represents a complete thought
        
        Args:
            text: Transcribed text
            
        Returns:
            True if chunk seems complete
        """
        if not text.strip():
            return False
        
        # Check for sentence endings
        ending_punctuation = ['.', '!', '?']
        if any(text.strip().endswith(punct) for punct in ending_punctuation):
            return True
        
        # Check for pause words that might indicate end of statement
        pause_words = ['um', 'uh', 'well', 'so', 'okay']
        if text.strip().lower() in pause_words:
            return True
        
        return False
    
    def _combine_chunks(self, chunks: list) -> str:
        """
        Combine multiple chunks into coherent text
        
        Args:
            chunks: List of chunk dictionaries
            
        Returns:
            Combined text
        """
        sorted_chunks = sorted(chunks, key=lambda x: x["index"])
        texts = [chunk["text"] for chunk in sorted_chunks if chunk["text"].strip()]
        return " ".join(texts)
    
    def clear_session(self, session_id: str):
        """Clear session cache for a specific session"""
        if session_id in self.session_cache:
            del self.session_cache[session_id]
    
    def get_supported_languages(self) -> list:
        """Get list of supported languages"""
        return [
            "en", "zh", "de", "es", "ru", "ko", "fr", "ja", "pt", "tr", "pl", "ca", "nl",
            "ar", "sv", "it", "id", "hi", "fi", "vi", "he", "uk", "el", "ms", "cs", "ro",
            "da", "hu", "ta", "no", "th", "ur", "hr", "bg", "lt", "la", "mi", "ml", "cy",
            "sk", "te", "fa", "lv", "bn", "sr", "az", "sl", "kn", "et", "mk", "br", "eu",
            "is", "hy", "ne", "mn", "bs", "kk", "sq", "sw", "gl", "mr", "pa", "si", "km",
            "sn", "yo", "so", "af", "oc", "ka", "be", "tg", "sd", "gu", "am", "yi", "lo",
            "uz", "fo", "ht", "ps", "tk", "nn", "mt", "sa", "lb", "my", "bo", "tl", "mg",
            "as", "tt", "haw", "ln", "ha", "ba", "jw", "su"
        ] 