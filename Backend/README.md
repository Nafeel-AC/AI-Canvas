# 🧠 AI Canvas - Backend

The backend for **AI Canvas**, an AI-powered interactive platform where users can draw freely on a canvas while a real-time **voice assistant** observes and discusses the drawing with them. This backend uses **FastAPI**, integrates with **Gemini 2.0 Flash (Google Generative AI)** for vision and text understanding, **Whisper** for speech-to-text, **ElevenLabs** for text-to-speech, and **Supabase** for storing metadata and logs.

---

## ⚙️ Tech Stack

| Component      | Tool / API              |
| -------------- | ----------------------- |
| Framework      | FastAPI                 |
| LLM            | Gemini 2.0 Flash / Vision |
| Speech-to-Text | OpenAI Whisper (local)  |
| Text-to-Speech | ElevenLabs API          |
| Storage / Auth | Supabase                |
| Realtime       | WebSockets via FastAPI  |

---

## 📁 Project Structure

```
backend/
├── main.py                  # FastAPI app entrypoint
├── websocket.py             # WebSocket handler for real-time events
├── config.py                # Configuration and settings
├── database.py              # Supabase database manager
├── models.py                # Pydantic models and data structures
├── routes/
│   ├── __init__.py
│   ├── drawing.py           # Gemini Vision endpoint
│   ├── voice_to_text.py     # Whisper speech-to-text endpoint
│   └── text_to_speech.py    # ElevenLabs TTS endpoint
├── utils/
│   ├── __init__.py
│   ├── gemini.py            # Gemini API helper
│   ├── whisper.py           # Whisper STT handler
│   └── elevenlabs.py        # ElevenLabs TTS handler
├── .env                     # Environment variables (create from .env.example)
├── .env.example             # Environment variables template
└── requirements.txt         # Python dependencies
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-canvas-backend.git
cd ai-canvas-backend
```

---

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

**Note:** Installing Whisper and PyTorch may take some time and disk space. For faster setup, you can use the "tiny" model by setting `WHISPER_MODEL=tiny` in your environment.

---

### 3. Set up environment variables

Copy the example environment file and fill in your API keys:

```bash
cp .env.example .env
```

Edit `.env` file with your API keys:

```env
# Required API Keys
GOOGLE_API_KEY=your_gemini_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_API_KEY=your_supabase_anon_key_here

# Optional Configuration
JWT_SECRET_KEY=your_jwt_secret_key_here
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
WHISPER_MODEL=base
GEMINI_MODEL=gemini-2.0-flash-exp
DEBUG=True
```

#### 🔑 How to get API Keys:

1. **Gemini API Key**: 
   - Go to [Google AI Studio](https://ai.google.dev/)
   - Create a new project and get your API key

2. **ElevenLabs API Key**:
   - Sign up at [ElevenLabs](https://elevenlabs.io/)
   - Go to your profile settings to find your API key

3. **Supabase**:
   - Create a new project at [Supabase](https://supabase.com/)
   - Go to Settings > API to get your URL and anon key

---

### 4. Set up Supabase Database (Optional)

If you want to store conversation logs and session data, you'll need to create tables in Supabase:

```sql
-- Drawing sessions table
CREATE TABLE drawing_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT,
    description TEXT,
    canvas_data TEXT,
    ai_analysis TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB
);

-- Voice interactions table
CREATE TABLE voice_interactions (
    id TEXT PRIMARY KEY,
    session_id TEXT REFERENCES drawing_sessions(id),
    user_id TEXT,
    audio_file_path TEXT,
    transcribed_text TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    confidence_score FLOAT DEFAULT 0.0,
    duration_seconds FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- AI responses table
CREATE TABLE ai_responses (
    id TEXT PRIMARY KEY,
    session_id TEXT REFERENCES drawing_sessions(id),
    user_id TEXT,
    input_type TEXT NOT NULL,
    input_data TEXT NOT NULL,
    response_text TEXT NOT NULL,
    response_audio_path TEXT,
    model_used TEXT NOT NULL,
    confidence_score FLOAT DEFAULT 0.0,
    processing_time_ms INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    preferences JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Session statistics table
CREATE TABLE session_stats (
    session_id TEXT PRIMARY KEY REFERENCES drawing_sessions(id),
    total_interactions INTEGER DEFAULT 0,
    drawing_analyses INTEGER DEFAULT 0,
    voice_interactions INTEGER DEFAULT 0,
    total_duration_seconds INTEGER DEFAULT 0,
    ai_responses_generated INTEGER DEFAULT 0,
    average_response_time_ms FLOAT DEFAULT 0.0,
    languages_used TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Error logs table
CREATE TABLE error_logs (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    user_id TEXT,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    endpoint TEXT,
    request_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    severity TEXT DEFAULT 'error'
);

-- API usage logs table
CREATE TABLE api_usage_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    api_type TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    request_size_bytes INTEGER DEFAULT 0,
    response_size_bytes INTEGER DEFAULT 0,
    processing_time_ms INTEGER DEFAULT 0,
    cost_estimate FLOAT,
    status_code INTEGER DEFAULT 200,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 5. Run the server

```bash
uvicorn main:app --reload
```

The backend will run at `http://localhost:8000`

You can also run with custom host/port:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🔄 API Endpoints

### 🎨 Drawing Analysis

#### `POST /api/analyze-drawing`
Analyze a drawing using Gemini Vision API.

**Parameters:**
- `image`: Image file (canvas screenshot)
- `prompt`: Optional custom prompt for analysis

**Response:**
```json
{
  "success": true,
  "analysis": "I can see a beautiful landscape drawing...",
  "prompt_used": "Describe what you see...",
  "image_info": {
    "filename": "drawing.png",
    "size": "800x600",
    "format": "PNG"
  }
}
```

#### `POST /api/analyze-drawing-with-context`
Analyze a drawing with conversation context.

**Parameters:**
- `image`: Image file
- `conversation_history`: Previous conversation context
- `user_question`: Specific question about the drawing

#### `POST /api/text-chat`
Chat with AI using text only (no image required).

**Parameters:**
- `message`: User's text message
- `conversation_history`: Previous conversation context

**Response:**
```json
{
  "success": true,
  "analysis": "That's a great question about color theory...",
  "message_processed": "How do I choose good colors?",
  "context_used": true
}
```

---

### 🎤 Voice Processing

#### `POST /api/voice-to-text`
Convert voice audio to text using Whisper.

**Parameters:**
- `audio`: Audio file (WAV, MP3, M4A, WebM)
- `language`: Language code ('en', 'es', 'fr', etc.) or 'auto'

**Response:**
```json
{
  "success": true,
  "transcription": "Hello, can you analyze my drawing?",
  "language": "en",
  "confidence": 0.95,
  "segments": [...],
  "audio_info": {
    "filename": "voice.wav",
    "content_type": "audio/wav",
    "size_bytes": 48000
  }
}
```

#### `POST /api/voice-to-text-realtime`
Real-time voice transcription for streaming audio.

---

### 🔊 Text-to-Speech

#### `POST /api/text-to-speech`
Convert text to speech using ElevenLabs.

**Body:**
```json
{
  "text": "Hello! I can see your drawing is really creative.",
  "voice_id": "21m00Tcm4TlvDq8ikWAM",
  "model_id": "eleven_monolingual_v1"
}
```

**Response:** Audio file (MP3) as streaming response

#### `GET /api/voices`
Get list of available ElevenLabs voices.

#### `GET /api/voice-settings/{voice_id}`
Get voice settings for a specific voice.

---

### 🌐 WebSocket

#### `WS /ws`
Real-time WebSocket connection for live interactions.

**Message Types:**
- `drawing_update`: Send drawing updates
- `voice_message`: Send voice messages

**Example:**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.send(JSON.stringify({
  type: 'drawing_update',
  data: { canvas_data: 'base64_image_data' }
}));
```

---

## 📊 Monitoring and Logs

### Health Check
- `GET /`: Basic health check and API information

### Database Logging
If Supabase is configured, the backend automatically logs:
- Drawing sessions
- Voice interactions
- AI responses
- Error logs
- API usage statistics

---

## 🎛️ Configuration

The backend can be configured through environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `8000` | Server port |
| `DEBUG` | `True` | Debug mode |
| `WHISPER_MODEL` | `base` | Whisper model size |
| `MAX_FILE_SIZE_MB` | `50` | Max upload size |
| `RATE_LIMIT_PER_MINUTE` | `60` | API rate limit |
| `LOG_LEVEL` | `INFO` | Logging level |

---

## 🚨 Error Handling

The backend includes comprehensive error handling:

- **File validation**: Checks file types and sizes
- **API rate limiting**: Prevents abuse
- **Graceful degradation**: Falls back when services are unavailable
- **Detailed logging**: All errors are logged with context

---

## 🔧 Development

### Running with hot reload:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Running tests:
```bash
pytest tests/
```

### Code formatting:
```bash
black .
isort .
```

---

## 📦 Deployment

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t ai-canvas-backend .
docker run -p 8000:8000 --env-file .env ai-canvas-backend
```

### Cloud Deployment

The backend can be deployed to various cloud platforms:
- **Railway**: `railway up`
- **Heroku**: Use the provided `Procfile`
- **DigitalOcean App Platform**: Connect your GitHub repository
- **AWS/GCP/Azure**: Use their container services

---

## ✨ Future Enhancements

- [ ] Session authentication with JWT
- [ ] Contextual conversation memory
- [ ] Diagram detection (flowcharts, graphs)
- [ ] Math recognition using Mathpix
- [ ] Real-time collaborative drawing
- [ ] Voice command processing
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Custom voice training
- [ ] Drawing style analysis

---

## 📃 License

[MIT](LICENSE)

---

## 🙋 Contributing

PRs are welcome! For major changes, please open an issue first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🐛 Troubleshooting

### Common Issues:

1. **Whisper model loading slowly**: Use smaller model (`WHISPER_MODEL=tiny`)
2. **ElevenLabs API errors**: Check your API key and usage limits
3. **Gemini API errors**: Ensure you have the correct API key and permissions
4. **CORS issues**: Add your frontend URL to `CORS_ORIGINS`
5. **Large file uploads**: Adjust `MAX_FILE_SIZE_MB` as needed

### Getting Help:

- Check the logs for detailed error messages
- Ensure all API keys are correctly set
- Verify your internet connection for API calls
- Check the official documentation for each service

---

## 😊 Acknowledgements

- [Gemini API](https://ai.google.dev/) - Advanced vision and language AI
- [Whisper](https://github.com/openai/whisper) - Robust speech recognition
- [ElevenLabs](https://www.elevenlabs.io/) - Natural text-to-speech
- [Supabase](https://supabase.com/) - Backend-as-a-service
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework 