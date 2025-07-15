# 🎨 AI Canvas – Multimodal AI Interaction Platform

AI Canvas is a full-stack, multimodal AI application that allows users to **interact with a Large Language Model (LLM)** through **text**, **voice**, or by **drawing** on a canvas. The AI responds via **text and realistic speech**, creating an intuitive and immersive experience.

Built with **React** (frontend), **FastAPI** (backend), and powered by **Gemini**, **Vapi**, **Whisper**, **ElevenLabs**, and **Supabase**.

---

## 🌟 Features

* 🧠 Interact with **Gemini LLM** using multiple modalities.
* 🗣️ **Voice input** (via Vapi + Whisper).
* 💬 **Text-based chat interface**.
* 🎨 **Canvas input** to draw questions/diagrams.
* 🔊 **Voice output** using ElevenLabs.
* 🔐 **User authentication** with Supabase.
* 🗂️ **Conversation metadata** stored in Supabase.
* 🖼️ **Dedicated canvas page** separate from chat.
* 🧾 **Conversation history** and session management.
* 🌐 Optional **multilingual support**.
* 📊 Optional **usage analytics dashboard**.

---

## 💠 Tech Stack

| Layer        | Technology                     |
| ------------ | ------------------------------ |
| Frontend     | React, TailwindCSS, Vapi       |
| Canvas       | Konva.js / Fabric.js (drawing) |
| Backend      | FastAPI, Python                |
| Voice Input  | Whisper (via Vapi)             |
| Voice Output | ElevenLabs                     |
| LLM          | Gemini (Google)                |
| Database     | Supabase (Postgres + Auth)     |

---

## 📁 Project Structure

```
ai-canvas/
├── client/                  # React frontend
│   ├── pages/
│   │   ├── ChatPage.jsx
│   │   ├── CanvasPage.jsx
│   ├── components/
│   │   ├── VoiceButton.jsx
│   │   ├── CanvasInput.jsx
│   ├── utils/
│   │   ├── vapi.js
│   │   └── supabase.js
│   └── App.jsx
│
├── server/                  # FastAPI backend
│   ├── main.py
│   ├── routes/
│   │   ├── chat.py
│   │   ├── whisper.py
│   │   ├── elevenlabs.py
│   │   └── canvas.py
│   ├── services/
│   │   ├── gemini.py
│   │   ├── vapi.py
│   │   └── supabase.py
│
├── .env                     # Environment variables
├── README.md
└── requirements.txt
```

---

## 🚀 Getting Started

### 📟 Prerequisites

* Node.js (v18+)
* Python (3.10+)
* Supabase project
* ElevenLabs API Key
* Gemini API Key
* Vapi Key

### 1. 🔧 Clone the Repository

```bash
git clone https://github.com/yourusername/ai-canvas.git
cd ai-canvas
```

### 2. 👤 Frontend Setup

```bash
cd client
npm install
touch .env
```

**`.env` Example:**

```env
VITE_SUPABASE_URL=https://xyz.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_VAPI_KEY=your_vapi_key
```

Start the React app:

```bash
npm run dev
```

### 3. ⚙️ Backend Setup

```bash
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
touch .env
```

**`.env` Example:**

```env
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_SERVICE_ROLE=your_service_role
GEMINI_API_KEY=your_gemini_key
ELEVENLABS_API_KEY=your_elevenlabs_key
```

Start FastAPI server:

```bash
uvicorn main:app --reload
```

---

## 🧪 Example Use Cases

| Mode   | Input                        | Output (LLM)                      |
| ------ | ---------------------------- | --------------------------------- |
| Text   | "What is quantum computing?" | Text + voice explanation          |
| Voice  | "Explain gravity" (spoken)   | Gemini response in voice + text   |
| Canvas | Draw a triangle with angles  | "This is a triangle with angles…" |

---

## 📊 Optional Enhancements

* 👨‍🏫 AI Tutor Mode (for students & teachers)
* 📄 Image upload & OCR
* 🌍 Multilingual chat mode
* 🔒 Role-Based Access Control (RLS in Supabase)
* 📊 Analytics with PostHog or Supabase dashboard

---

## 🧠 Gemini LLM Integration

Uses Google's Gemini LLM via Google Generative AI SDK or LangChain interface.

---

## 🔐 Authentication

Supabase Auth supports:

* Email/password
* OAuth (Google, GitHub)
* Session tokens for protecting API endpoints

---

## 🗒️ License

MIT License – [LICENSE](./LICENSE)

---

## 👨‍💼 Author

**Built with ❤️ by [Your Name](https://github.com/yourusername)**
Contact: [your@email.com](mailto:your@email.com)
