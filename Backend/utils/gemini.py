import google.generativeai as genai
import os
from PIL import Image
import asyncio
from typing import Optional, Dict, Any
import logging
from config import settings

logger = logging.getLogger(__name__)

class GeminiVisionAnalyzer:
    """Helper class for Gemini Vision API interactions"""
    
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        
        # Initialize models - using Gemini 2.0 Flash for faster responses
        self.vision_model = genai.GenerativeModel(settings.GEMINI_MODEL)
        self.text_model = genai.GenerativeModel(settings.GEMINI_MODEL)
        
        # Safety settings
        self.safety_settings = [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            }
        ]
    
    async def analyze_image(self, image: Image.Image, prompt: str = None) -> str:
        """
        Analyze an image using Gemini Vision
        
        Args:
            image: PIL Image object
            prompt: Custom prompt for analysis
            
        Returns:
            Analysis text from Gemini
        """
        try:
            if prompt is None:
                prompt = """
                You are an AI art critic and friendly assistant observing a drawing canvas. 
                Describe what you see in this drawing with enthusiasm and creativity. 
                Be engaging, ask thoughtful questions, and provide constructive feedback. 
                If it's a sketch or rough drawing, encourage the artist and suggest improvements.
                """
            
            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.vision_model.generate_content(
                    [prompt, image],
                    safety_settings=self.safety_settings
                )
            )
            
            if response.parts:
                return response.text
            else:
                return "I can see your drawing, but I'm having trouble analyzing it right now. Could you try again?"
                
        except Exception as e:
            logger.error(f"Error in Gemini vision analysis: {e}")
            return f"I apologize, but I encountered an error while analyzing your drawing: {str(e)}"
    
    async def generate_contextual_response(
        self, 
        image: Image.Image, 
        conversation_history: str, 
        user_input: str
    ) -> str:
        """
        Generate a contextual response based on image, history, and user input
        
        Args:
            image: Current drawing image
            conversation_history: Previous conversation
            user_input: Current user message
            
        Returns:
            Contextual response from Gemini
        """
        try:
            context_prompt = f"""
            You are an AI assistant helping with an interactive drawing session.
            
            Conversation History:
            {conversation_history}
            
            Current User Message: {user_input}
            
            Please analyze the current drawing and respond to the user in a conversational, 
            helpful way that considers both the image and our previous discussion.
            """
            
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.vision_model.generate_content(
                    [context_prompt, image],
                    safety_settings=self.safety_settings
                )
            )
            
            return response.text if response.parts else "I'm here to help with your drawing!"
            
        except Exception as e:
            logger.error(f"Error generating contextual response: {e}")
            return "Let me take another look at your drawing and help you with that."
    
    async def analyze_text_only(self, prompt: str) -> str:
        """
        Generate text response without image
        
        Args:
            prompt: Text prompt for generation
            
        Returns:
            Generated text response
        """
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.text_model.generate_content(
                    prompt,
                    safety_settings=self.safety_settings
                )
            )
            
            return response.text if response.parts else "I'd be happy to help!"
            
        except Exception as e:
            logger.error(f"Error in text generation: {e}")
            return f"I encountered an error: {str(e)}"
    
    async def suggest_improvements(self, image: Image.Image) -> Dict[str, Any]:
        """
        Provide specific suggestions for improving the drawing
        
        Args:
            image: Drawing image to analyze
            
        Returns:
            Dictionary with improvement suggestions
        """
        try:
            improvement_prompt = """
            As an art instructor, analyze this drawing and provide specific, constructive feedback:
            
            1. What's working well in this drawing?
            2. What specific techniques could improve it?
            3. What should the artist focus on next?
            4. Any composition or color suggestions?
            
            Be encouraging and specific in your feedback.
            """
            
            response = await self.analyze_image(image, improvement_prompt)
            
            return {
                "suggestions": response,
                "confidence": 0.8,
                "focus_areas": ["technique", "composition", "details"]
            }
            
        except Exception as e:
            logger.error(f"Error generating improvement suggestions: {e}")
            return {
                "suggestions": "Keep practicing and experimenting with your art!",
                "confidence": 0.0,
                "focus_areas": []
            } 