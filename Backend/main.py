from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

from routes import drawing, voice_to_text, text_to_speech
from websocket import ConnectionManager

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AI Canvas Backend",
    description="Backend for AI Canvas - an AI-powered interactive drawing platform",
    version="1.0.0",
)

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include route modules
app.include_router(drawing.router, prefix="/api", tags=["drawing"])
app.include_router(voice_to_text.router, prefix="/api", tags=["voice"])
app.include_router(text_to_speech.router, prefix="/api", tags=["speech"])

# WebSocket connection manager
manager = ConnectionManager()

@app.get("/")
async def root():
    return {
        "message": "AI Canvas Backend is running!",
        "version": "1.0.0",
        "endpoints": {
            "analyze_drawing": "/api/analyze-drawing",
            "analyze_with_context": "/api/analyze-drawing-with-context", 
            "text_chat": "/api/text-chat",
            "voice_to_text": "/api/voice-to-text",
            "text_to_speech": "/api/text-to-speech",
            "websocket": "/ws"
        }
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Handle different types of WebSocket messages
            if data.get("type") == "drawing_update":
                # Process drawing updates
                await manager.broadcast({"type": "drawing_response", "data": "Drawing received"})
            elif data.get("type") == "voice_message":
                # Process voice messages
                await manager.broadcast({"type": "voice_response", "data": "Voice message received"})
            else:
                await manager.send_personal_message({"error": "Unknown message type"}, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 