#!/usr/bin/env python3
"""
AI Canvas Backend Startup Script
This script validates the environment and starts the FastAPI server
"""

import os
import sys
import logging
import asyncio
from typing import List

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_environment() -> bool:
    """Check if all required environment variables are set"""
    logger.info("🔍 Checking environment variables...")
    
    required_vars = [
        "GOOGLE_API_KEY",
        "ELEVENLABS_API_KEY", 
        "SUPABASE_URL",
        "SUPABASE_API_KEY"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        logger.error(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        logger.info("💡 Please check your .env file or set these variables:")
        for var in missing_vars:
            logger.info(f"   {var}=your_value_here")
        return False
    
    logger.info("✅ All required environment variables are set")
    return True

def check_dependencies() -> bool:
    """Check if all required packages are installed"""
    logger.info("📦 Checking dependencies...")
    
    required_packages = [
        "fastapi",
        "uvicorn",
        "google.generativeai", 
        "faster_whisper",
        "elevenlabs",
        "supabase",
        "dotenv",   # python-dotenv imports as dotenv
        "PIL",      # Pillow imports as PIL
        "numpy",
        "aiohttp"   # needed for ElevenLabs
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        logger.error(f"❌ Missing required packages: {', '.join(missing_packages)}")
        logger.info("💡 Install missing packages with:")
        logger.info(f"   pip install {' '.join(missing_packages)}")
        return False
    
    logger.info("✅ All required packages are installed")
    return True

async def test_apis() -> bool:
    """Test API connections"""
    logger.info("🌐 Testing API connections...")
    
    try:
        # Test Gemini API
        import google.generativeai as genai
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        logger.info("✅ Gemini API configured")
        
        # Test ElevenLabs API (just check if key is valid format)
        elevenlabs_key = os.getenv("ELEVENLABS_API_KEY")
        if len(elevenlabs_key) < 20:
            logger.warning("⚠️  ElevenLabs API key seems too short")
        else:
            logger.info("✅ ElevenLabs API key format looks good")
        
        # Test Supabase connection
        from supabase import create_client
        supabase = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_API_KEY")
        )
        logger.info("✅ Supabase client created successfully")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ API test failed: {e}")
        return False

def start_server():
    """Start the FastAPI server"""
    import uvicorn
    from config import settings
    
    logger.info("🚀 Starting AI Canvas Backend...")
    logger.info(f"📍 Server will run at http://{settings.HOST}:{settings.PORT}")
    logger.info(f"🔧 Debug mode: {settings.DEBUG}")
    logger.info(f"🌍 CORS origins: {settings.CORS_ORIGINS}")
    
    try:
        uvicorn.run(
            "main:app",
            host=settings.HOST,
            port=settings.PORT,
            reload=settings.DEBUG,
            log_level=settings.LOG_LEVEL.lower()
        )
    except Exception as e:
        logger.error(f"❌ Failed to start server: {e}")
        sys.exit(1)

def main():
    """Main startup function"""
    logger.info("🧠 AI Canvas Backend - Starting up...")
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Run all checks
    checks_passed = True
    
    if not check_environment():
        checks_passed = False
    
    if not check_dependencies():
        checks_passed = False
    
    if checks_passed:
        # Test APIs asynchronously
        try:
            api_test_result = asyncio.run(test_apis())
            if not api_test_result:
                logger.warning("⚠️  Some API tests failed, but continuing...")
        except Exception as e:
            logger.warning(f"⚠️  API tests failed: {e}, but continuing...")
        
        # Start the server
        start_server()
    else:
        logger.error("❌ Pre-flight checks failed. Please fix the issues above.")
        sys.exit(1)

if __name__ == "__main__":
    main() 