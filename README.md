🎙️ AI Mock Interview Studio (Face-to-Face)
An interactive, high-fidelity Mock Interview platform built with Next.js and FastAPI. This studio allows candidates to practice technical interviews with an AI agent that speaks, listens, and records the session.

🌟 Key Features
Manual Camera Authority: You have total control. The interview only begins once you manually enable the camera.

AI Voice Interaction (TTS): The interviewer speaks questions aloud using a natural cadence.

Voice-to-Text (STT): Respond naturally using your microphone; the AI transcribes your answers in real-time.

Hindsight Memory: The AI maintains the full context of the conversation, allowing for follow-up questions and a final performance analysis.

Session Recording: Record your entire interview (video + audio) and download it as a .webm file for self-review.

Live Transcript: A synchronized sidebar that logs every exchange for visual reference.

🛠️ Tech Stack
Frontend: Next.js 14, Tailwind CSS, Lucide React.

APIs: Web Speech API (SpeechSynthesis & SpeechRecognition).

Backend: Python (FastAPI / Flask).

AI Model: Integrated via OpenAI GPT-4o or equivalent via your custom backend.

🚀 Installation & Setup
1. Prerequisites
Node.js (v18+)

Python (v3.10+)

Google Chrome or Microsoft Edge (Required for Web Speech API support)

2. Backend Setup
3. Frontend Setup
Visit http://localhost:3000 to start your session.

🧠 Understanding "Hindsight Memory"
This project uses a Stateful History approach.

Frontend: Stores the entire conversation in a React messages state.

Payload: Every time you send a message, the entire history is sent to the /api/chat endpoint.

Hindsight: Because the backend receives the full transcript, it can "look back" at your earlier answers to ask challenging follow-up questions or provide a final score.

Note: For the best hindsight analysis, ensure your backend system prompt includes:
"You are an expert interviewer. Analyze previous answers in the history to find inconsistencies or areas for deeper technical diving."

📁 Project Structure
⚠️ Known Browser Policies
Most modern browsers (Chrome/Edge) block Autoplay Audio.

The Fix: You must click anywhere on the page once after it loads to "unlock" the AI's voice engine.

Trigger: The AI greeting is programmed to trigger specifically when the Camera is toggled ON.

🤝 Contributing
If you'd like to improve the Hindsight Analysis or add new Interview Personas, feel free to fork this repo and submit a pull request!

🎙️ AI Mock Interview Studio (Face-to-Face)
An interactive, high-fidelity Mock Interview platform built with Next.js and FastAPI. This studio allows candidates to practice technical interviews with an AI agent that speaks, listens, and records the session.

🚀 How to Run the Project
Follow these steps in order to get the full Face-to-Face experience working.

1. Prerequisites
Node.js (v18 or higher)

Python (v3.10 or higher)

Browser: Google Chrome or Microsoft Edge (Required for Web Speech API support)

2. Run the Backend (Python)
Open a new terminal window:

Bash

# 1. Navigate to the backend folder
cd backend

# 2. Create a virtual environment (Recommended)
python -m venv venv

# 3. Activate the environment
# On Windows: 
venv\Scripts\activate
# On Mac/Linux: 
source venv/bin/activate

# 4. Install requirements
pip install -r requirements.txt

# 5. Start the server (Port 8000)
uvicorn main:app --reload
3. Run the Frontend (Next.js)
Open a second terminal window:

Bash

# 1. Navigate to the frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start the development server (Port 3000)
npm run dev
4. Start the Interview
Open your browser to http://localhost:3000.

Important: Click once anywhere on the white background (this "unlocks" the AI's voice engine for Chrome).

Click the Camera Icon in the video box.

The AI will detect your camera and say: "Hello! I am your interviewer today..."

🌟 Key Features
Manual Camera Authority: You have total control. The interview only begins once you manually enable the camera.

AI Voice Interaction (TTS): The interviewer speaks questions aloud using a natural cadence.

Voice-to-Text (STT): Respond naturally using your microphone; the AI transcribes your answers in real-time.

Hindsight Memory: The AI maintains the full context of the conversation, allowing for follow-up questions and a final performance analysis.

Session Recording: Record your entire interview (video + audio) and download it as a .webm file for self-review.

📁 Project Structure
Plaintext

├── frontend/
│   ├── app/
│   │   └── studio/page.tsx   # Main Interview Logic
│   └── package.json          # Frontend dependencies
├── backend/
│   ├── main.py               # FastAPI Logic & AI Integration
│   └── requirements.txt      # Python dependencies
└── README.md                 # Project Documentation
🧠 Understanding "Hindsight Memory"
This project uses a Stateful History approach.

Frontend: Stores the entire conversation in a React messages state.

Payload: Every time you send a message, the entire history is sent to the /api/chat endpoint.

Analysis: Because the backend receives the full transcript, it can "look back" at your earlier answers to provide a final score.

⚠️ Known Browser Policies
Most modern browsers block Autoplay Audio.

The Fix: You must click anywhere on the page once after it loads to "unlock" the AI's voice engine.

The Trigger: The AI greeting is programmed to trigger specifically when the Camera is toggled ON.

🤝 Contributing
Feel free to fork this repo and submit a pull request!