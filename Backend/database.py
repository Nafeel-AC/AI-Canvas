from supabase import create_client, Client
from typing import Dict, Any, List, Optional
import asyncio
import json
import logging
from datetime import datetime

from config import settings
from models import DrawingSession, VoiceInteraction, AIResponse, User, SessionStats, ErrorLog, APIUsageLog

logger = logging.getLogger(__name__)

class SupabaseManager:
    """Manager class for Supabase database operations"""
    
    def __init__(self):
        self.supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_API_KEY
        )
    
    async def create_drawing_session(self, session: DrawingSession) -> Dict[str, Any]:
        """Create a new drawing session"""
        try:
            data = session.dict()
            result = self.supabase.table("drawing_sessions").insert(data).execute()
            logger.info(f"Created drawing session: {session.id}")
            return {"success": True, "data": result.data}
        except Exception as e:
            logger.error(f"Error creating drawing session: {e}")
            return {"success": False, "error": str(e)}
    
    async def update_drawing_session(self, session_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing drawing session"""
        try:
            updates["updated_at"] = datetime.utcnow().isoformat()
            result = self.supabase.table("drawing_sessions").update(updates).eq("id", session_id).execute()
            logger.info(f"Updated drawing session: {session_id}")
            return {"success": True, "data": result.data}
        except Exception as e:
            logger.error(f"Error updating drawing session: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_drawing_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get a drawing session by ID"""
        try:
            result = self.supabase.table("drawing_sessions").select("*").eq("id", session_id).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting drawing session: {e}")
            return None
    
    async def log_voice_interaction(self, interaction: VoiceInteraction) -> Dict[str, Any]:
        """Log a voice interaction"""
        try:
            data = interaction.dict()
            result = self.supabase.table("voice_interactions").insert(data).execute()
            logger.info(f"Logged voice interaction: {interaction.id}")
            return {"success": True, "data": result.data}
        except Exception as e:
            logger.error(f"Error logging voice interaction: {e}")
            return {"success": False, "error": str(e)}
    
    async def log_ai_response(self, response: AIResponse) -> Dict[str, Any]:
        """Log an AI response"""
        try:
            data = response.dict()
            result = self.supabase.table("ai_responses").insert(data).execute()
            logger.info(f"Logged AI response: {response.id}")
            return {"success": True, "data": result.data}
        except Exception as e:
            logger.error(f"Error logging AI response: {e}")
            return {"success": False, "error": str(e)}
    
    async def create_user(self, user: User) -> Dict[str, Any]:
        """Create a new user"""
        try:
            data = user.dict()
            result = self.supabase.table("users").insert(data).execute()
            logger.info(f"Created user: {user.id}")
            return {"success": True, "data": result.data}
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a user by ID"""
        try:
            result = self.supabase.table("users").select("*").eq("id", user_id).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting user: {e}")
            return None
    
    async def update_session_stats(self, stats: SessionStats) -> Dict[str, Any]:
        """Update session statistics"""
        try:
            data = stats.dict()
            # Try to update existing record, or insert new one
            existing = self.supabase.table("session_stats").select("*").eq("session_id", stats.session_id).execute()
            
            if existing.data:
                result = self.supabase.table("session_stats").update(data).eq("session_id", stats.session_id).execute()
            else:
                result = self.supabase.table("session_stats").insert(data).execute()
            
            return {"success": True, "data": result.data}
        except Exception as e:
            logger.error(f"Error updating session stats: {e}")
            return {"success": False, "error": str(e)}
    
    async def log_error(self, error_log: ErrorLog) -> Dict[str, Any]:
        """Log an error"""
        try:
            data = error_log.dict()
            result = self.supabase.table("error_logs").insert(data).execute()
            return {"success": True, "data": result.data}
        except Exception as e:
            logger.error(f"Error logging error: {e}")
            return {"success": False, "error": str(e)}
    
    async def log_api_usage(self, usage_log: APIUsageLog) -> Dict[str, Any]:
        """Log API usage"""
        try:
            data = usage_log.dict()
            result = self.supabase.table("api_usage_logs").insert(data).execute()
            return {"success": True, "data": result.data}
        except Exception as e:
            logger.error(f"Error logging API usage: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_user_sessions(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get all sessions for a user"""
        try:
            result = self.supabase.table("drawing_sessions").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting user sessions: {e}")
            return []
    
    async def get_session_interactions(self, session_id: str) -> Dict[str, List[Dict[str, Any]]]:
        """Get all interactions for a session"""
        try:
            # Get voice interactions
            voice_result = self.supabase.table("voice_interactions").select("*").eq("session_id", session_id).order("created_at").execute()
            
            # Get AI responses
            ai_result = self.supabase.table("ai_responses").select("*").eq("session_id", session_id).order("created_at").execute()
            
            return {
                "voice_interactions": voice_result.data or [],
                "ai_responses": ai_result.data or []
            }
        except Exception as e:
            logger.error(f"Error getting session interactions: {e}")
            return {"voice_interactions": [], "ai_responses": []}
    
    async def cleanup_old_sessions(self, days_old: int = 30) -> Dict[str, Any]:
        """Clean up old inactive sessions"""
        try:
            cutoff_date = datetime.utcnow().replace(day=datetime.utcnow().day - days_old)
            
            # Mark old sessions as inactive
            result = self.supabase.table("drawing_sessions").update({"is_active": False}).lt("created_at", cutoff_date.isoformat()).execute()
            
            logger.info(f"Cleaned up sessions older than {days_old} days")
            return {"success": True, "cleaned_count": len(result.data or [])}
        except Exception as e:
            logger.error(f"Error cleaning up old sessions: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_usage_statistics(self, user_id: Optional[str] = None, days: int = 7) -> Dict[str, Any]:
        """Get usage statistics"""
        try:
            cutoff_date = datetime.utcnow().replace(day=datetime.utcnow().day - days)
            
            # Build query
            query = self.supabase.table("api_usage_logs").select("*").gte("created_at", cutoff_date.isoformat())
            
            if user_id:
                query = query.eq("user_id", user_id)
            
            result = query.execute()
            
            # Process statistics
            logs = result.data or []
            stats = {
                "total_requests": len(logs),
                "gemini_requests": len([l for l in logs if l["api_type"] == "gemini"]),
                "elevenlabs_requests": len([l for l in logs if l["api_type"] == "elevenlabs"]),
                "whisper_requests": len([l for l in logs if l["api_type"] == "whisper"]),
                "total_processing_time": sum(l["processing_time_ms"] for l in logs),
                "average_processing_time": sum(l["processing_time_ms"] for l in logs) / len(logs) if logs else 0,
                "total_cost_estimate": sum(l.get("cost_estimate", 0) or 0 for l in logs)
            }
            
            return {"success": True, "stats": stats}
        except Exception as e:
            logger.error(f"Error getting usage statistics: {e}")
            return {"success": False, "error": str(e)}

# Global database manager instance
db_manager = SupabaseManager() 