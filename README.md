# Perspectivity 🌿
### Go outside. See differently.

**Perspectivity** is an open-source, AI-powered field investigation experience that helps people rediscover the world around them. Instead of asking AI to do all the thinking, Perspectivity sends you outside with a mission: observe your surroundings, record what you notice, form a hypothesis, and challenge your own assumptions with an AI-generated debrief.

Built for the **DEV Hacktoberfest Week 1 2026 — "Touch Grass"** challenge.

## 💡 The Idea

We spend a lot of time looking at screens, often overlooking the details of the world around us. Perspectivity turns an ordinary walk or a small patch of ground into an opportunity to practise curiosity and critical thinking.

The experience is simple:

1. **Prepare:** Choose how much time you have and your experience level.
2. **Explore:** Receive an AI-generated field mission, put your phone away, and observe the real world.
3. **Record:** Save your observations using typed or voice-transcribed field notes.
4. **Reflect:** Form your own hypothesis and receive an AI debrief that evaluates your evidence, identifies assumptions, and suggests what to investigate next.

The goal isn't to find an instant answer. It's to learn how to ask better questions.

## ✨ Features

- **AI-generated field missions** tailored to your available time and experience level.
- **Real-world observation prompts** designed to work without photographs, purchases, or special equipment.
- **Voice-transcribed field notes** to make recording observations easier when you're ready to use your phone.
- **Hypothesis-driven reflection** that encourages users to explain patterns instead of simply listing details.
- **AI reasoning debriefs** that separate evidence from assumptions, consider alternative explanations, and suggest practical follow-up observations.
- **Session-based workflow** that connects each mission, its observations, and its final debrief.
- **Responsive, minimalist interface** designed to keep the experience focused on the investigation rather than the screen.

## 🧠 AI Integration

Perspectivity uses **Gemma**, accessed through Google's hosted API, to generate field missions and evaluate the user's reasoning.

The AI is designed to act as an investigation mentor rather than an answer engine. Its debriefs aim to:

- Identify what the user's observations actually support.
- Highlight assumptions that still need evidence.
- Distinguish plausible explanations from established conclusions.
- Recommend practical ways to investigate competing explanations.
- Ask a reflection question that encourages deeper reasoning.

AI-generated feedback can still make mistakes. Users should treat the debrief as guidance for further investigation, not as scientific proof.

## 🛠️ Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS

**Backend**
- Python
- FastAPI
- Pydantic

**AI**
- Gemma via Google's hosted Gen AI API
- Google Gen AI Python SDK

## 🏗️ Architecture

```text
React + Vite Frontend
        |
        | HTTP requests
        v
FastAPI Backend
        |
        +---- Session management
        |
        +---- Observation storage
        |
        +---- Gemma API
                  |
                  +---- Generate field mission
                  |
                  +---- Produce reasoning debrief
        |
        v
Structured JSON responses
        |
        v
Frontend renders the mission and debrief
```

**Current implementation note:** session data is stored in memory for the MVP. Sessions are not persistent across backend restarts.

## 🚀 Getting Started

### Prerequisites

- Python 3.10 or later
- Node.js and npm
- A Google AI Studio API key with access to the configured Gemma model

### 1. Clone the repository

```bash
git clone https://github.com/shujahaadi/perspectivity
cd perspectivity
```

### 2. Configure the environment

Create a `.env` file in the repository root:

```env
GEMINI_API_KEY=your_api_key_here
```

Get an API key from [Google AI Studio](https://aistudio.google.com/apikey).

**Never commit your real API key.** The `.env` file should remain ignored by Git. Use `.env.example` to document the required variable without including a real secret.

### 3. Start the backend

Open a terminal from the repository root:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

**Windows Command Prompt:**

```bat
venv\Scripts\activate.bat
```

Install dependencies and start FastAPI:

```bash
pip install -r requirements.txt
fastapi dev app/main.py
```

The backend should be available at `http://127.0.0.1:8000`.

Interactive API documentation is available at `http://127.0.0.1:8000/docs`.

### 4. Start the frontend

Open a second terminal from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

Keep both servers running while using the application.

## 🔒 Privacy and Safety

- The user is encouraged to put their phone away during the observation phase.
- Field missions should be possible without photography or special equipment.
- Users should respect public safety, personal boundaries, and private property.
- Voice recognition depends on browser support and may produce inaccurate transcripts. Review field notes before saving.
- The backend currently uses in-memory session storage; do not rely on it for permanent records.
- API credentials belong in environment variables, never in source control.

## 🗺️ Roadmap

- [ ] Persistent storage for field sessions and journals.
- [ ] More diverse mission types and environments.
- [ ] Improved validation of AI-generated responses.
- [ ] More robust speech transcription and error handling.
- [ ] A collection of completed investigations users can revisit.
- [ ] Automated tests for session management and debrief generation.

## 🤝 Contributing

Contributions are welcome! You can help improve mission design, reasoning quality, accessibility, documentation, tests, and the overall field investigation experience.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes and test them.
4. Open a pull request describing the change.

## 📄 License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE).

---

*Made for the curious. Grounded in the real world.*

**Crafted with curiosity by Shuja.**