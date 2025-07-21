import os
import asyncio
import aiohttp
from typing import Dict, Any, Optional, Generator, AsyncGenerator
import json
import logging

logger = logging.getLogger(__name__)

class ElevenLabsTTS:
    """Helper class for ElevenLabs text-to-speech API"""
    
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_API_KEY")
        if not self.api_key:
            raise ValueError("ELEVENLABS_API_KEY environment variable is required")
        
        self.base_url = "https://api.elevenlabs.io/v1"
        self.headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": self.api_key
        }
        
        # Default voice settings
        self.default_voice_settings = {
            "stability": 0.5,
            "similarity_boost": 0.5,
            "style": 0.0,
            "use_speaker_boost": True
        }
    
    async def text_to_speech(
        self,
        text: str,
        voice_id: str = "21m00Tcm4TlvDq8ikWAM",  # Default voice
        model_id: str = "eleven_monolingual_v1",
        voice_settings: Optional[Dict] = None
    ) -> bytes:
        """
        Convert text to speech using ElevenLabs API
        
        Args:
            text: Text to convert to speech
            voice_id: ElevenLabs voice ID
            model_id: Model ID to use
            voice_settings: Voice settings dictionary
            
        Returns:
            Audio data as bytes (MP3 format)
        """
        try:
            if voice_settings is None:
                voice_settings = self.default_voice_settings
            
            url = f"{self.base_url}/text-to-speech/{voice_id}"
            
            data = {
                "text": text,
                "model_id": model_id,
                "voice_settings": voice_settings
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url,
                    headers=self.headers,
                    json=data
                ) as response:
                    if response.status == 200:
                        audio_data = await response.read()
                        logger.info(f"Generated speech for text length: {len(text)}")
                        return audio_data
                    else:
                        error_text = await response.text()
                        logger.error(f"ElevenLabs API error: {response.status} - {error_text}")
                        raise Exception(f"ElevenLabs API error: {response.status}")
                        
        except Exception as e:
            logger.error(f"Text-to-speech error: {e}")
            raise
    
    async def text_to_speech_stream(
        self,
        text: str,
        voice_id: str = "21m00Tcm4TlvDq8ikWAM",
        model_id: str = "eleven_monolingual_v1"
    ) -> AsyncGenerator[bytes, None]:
        """
        Stream text-to-speech conversion for real-time playback
        
        Args:
            text: Text to convert to speech
            voice_id: ElevenLabs voice ID
            model_id: Model ID to use
            
        Yields:
            Audio chunks as bytes
        """
        try:
            url = f"{self.base_url}/text-to-speech/{voice_id}/stream"
            
            data = {
                "text": text,
                "model_id": model_id,
                "voice_settings": self.default_voice_settings
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url,
                    headers=self.headers,
                    json=data
                ) as response:
                    if response.status == 200:
                        async for chunk in response.content.iter_chunked(1024):
                            yield chunk
                    else:
                        error_text = await response.text()
                        logger.error(f"ElevenLabs streaming error: {response.status} - {error_text}")
                        raise Exception(f"ElevenLabs streaming error: {response.status}")
                        
        except Exception as e:
            logger.error(f"Text-to-speech streaming error: {e}")
            raise
    
    async def get_voices(self) -> Dict[str, Any]:
        """
        Get list of available voices from ElevenLabs
        
        Returns:
            Dictionary with voice information
        """
        try:
            url = f"{self.base_url}/voices"
            headers = {"xi-api-key": self.api_key}
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Format voice data
                        voices = []
                        for voice in data.get("voices", []):
                            voices.append({
                                "voice_id": voice.get("voice_id"),
                                "name": voice.get("name"),
                                "category": voice.get("category"),
                                "description": voice.get("description"),
                                "preview_url": voice.get("preview_url"),
                                "settings": voice.get("settings")
                            })
                        
                        return {
                            "voices": voices,
                            "total_count": len(voices)
                        }
                    else:
                        error_text = await response.text()
                        logger.error(f"Error fetching voices: {response.status} - {error_text}")
                        raise Exception(f"Error fetching voices: {response.status}")
                        
        except Exception as e:
            logger.error(f"Get voices error: {e}")
            raise
    
    async def get_voice_settings(self, voice_id: str) -> Dict[str, Any]:
        """
        Get voice settings for a specific voice
        
        Args:
            voice_id: ElevenLabs voice ID
            
        Returns:
            Voice settings dictionary
        """
        try:
            url = f"{self.base_url}/voices/{voice_id}/settings"
            headers = {"xi-api-key": self.api_key}
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        error_text = await response.text()
                        logger.error(f"Error fetching voice settings: {response.status} - {error_text}")
                        return self.default_voice_settings
                        
        except Exception as e:
            logger.error(f"Get voice settings error: {e}")
            return self.default_voice_settings
    
    async def get_user_info(self) -> Dict[str, Any]:
        """
        Get user subscription information
        
        Returns:
            User information and usage stats
        """
        try:
            url = f"{self.base_url}/user"
            headers = {"xi-api-key": self.api_key}
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "character_count": data.get("subscription", {}).get("character_count", 0),
                            "character_limit": data.get("subscription", {}).get("character_limit", 0),
                            "can_extend_character_limit": data.get("subscription", {}).get("can_extend_character_limit", False),
                            "allowed_to_extend_character_limit": data.get("subscription", {}).get("allowed_to_extend_character_limit", False),
                            "next_character_count_reset_unix": data.get("subscription", {}).get("next_character_count_reset_unix", 0)
                        }
                    else:
                        logger.warning(f"Could not fetch user info: {response.status}")
                        return {}
                        
        except Exception as e:
            logger.error(f"Get user info error: {e}")
            return {}
    
    async def create_custom_voice(
        self,
        name: str,
        description: str,
        files: list,
        labels: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Create a custom voice (requires audio samples)
        
        Args:
            name: Name for the custom voice
            description: Description of the voice
            files: List of audio file paths for voice cloning
            labels: Optional labels for the voice
            
        Returns:
            Created voice information
        """
        try:
            url = f"{self.base_url}/voices/add"
            headers = {"xi-api-key": self.api_key}
            
            # This would need multipart/form-data handling
            # Implementation depends on specific use case
            logger.info("Custom voice creation requested")
            return {"message": "Custom voice creation not fully implemented"}
            
        except Exception as e:
            logger.error(f"Create custom voice error: {e}")
            raise
    
    def get_recommended_voices(self) -> Dict[str, str]:
        """
        Get recommended voice IDs for different use cases
        
        Returns:
            Dictionary mapping use cases to voice IDs
        """
        return {
            "general": "21m00Tcm4TlvDq8ikWAM",  # Rachel
            "professional": "EXAVITQu4vr4xnSDxMaL",  # Bella
            "storytelling": "MF3mGyEYCl7XYWbV9V6O",  # Elli
            "conversational": "TxGEqnHWrfWFTfGW9XjX",  # Josh
            "energetic": "pNInz6obpgDQGcFmaJgB",  # Adam
            "calm": "Xb7hH8MSUJpSbSDYk0k2",  # Alice
            "authoritative": "onwK4e9ZLuTAKqWW03F9",  # Daniel
            "friendly": "pqHfZKP75CvOlQylNhV4",  # Bill
        }
    
    async def test_voice(self, voice_id: str, test_text: str = "Hello, this is a test.") -> bytes:
        """
        Test a voice with sample text
        
        Args:
            voice_id: Voice ID to test
            test_text: Text to use for testing
            
        Returns:
            Audio data for the test
        """
        return await self.text_to_speech(
            text=test_text,
            voice_id=voice_id,
            model_id="eleven_monolingual_v1"
        ) 