🎯 AI Career Advisor

An end-to-end AI-powered career development platform that identifies skill gaps, generates personalized learning roadmaps, conducts proctored certification exams, and automatically upgrades your resume with verified skills.


📋 Table of Contents

What This Project Does
Live Demo Walkthrough
Features
Tech Stack
Setup Instructions
Docker Setup
Project Structure
Skill Gap Analysis — Logic Overview
Adaptive Pathing Algorithm
API Endpoints
Dependencies


What This Project Does
Most job seekers don't know exactly which skills they're missing for a specific role. AI Career Advisor solves this by:

Reading your resume and a job description — extracts and compares skills using Llama 3.3 70B
Identifying the exact gaps — tells you which skills the JD requires that your resume doesn't have
Building a personalised roadmap — generates a curated learning path with real course links (YouTube, Udemy, Coursera, NPTEL)
Testing you on each skill — runs a 10-question AI-proctored adaptive exam per module
Upgrading your resume automatically — injects verified skills into your resume and exports a professional PDF


🎬 Live Demo Walkthrough (For Examiners)
Follow these steps in order to see the complete end-to-end journey:
Step 1 — Create an Account

Open http://localhost:3000 (or http://localhost if using Docker)
Click Sign Up
Enter a username and password (minimum 4 characters)
Click Create Account → you will be redirected to the dashboard

Step 2 — Analyse Your Skill Gaps

On the dashboard, upload two PDF files:

Resume PDF — the candidate's current resume
Job Description PDF — the target job posting


Click Identify Technical Gaps
Wait 10–15 seconds for the AI to process both documents
You will see:

A reasoning summary from the AI
Red skill badges showing exactly what is missing
The candidate's name is automatically extracted




💡 Sample files for testing: Use any software engineer resume and any software engineer job description from LinkedIn or Naukri saved as PDFs.

Step 3 — Generate the Roadmap

Click Build Personalized Roadmap
Wait 10–15 seconds
A 3-module learning path appears, each containing:

The skill to learn
A syllabus of sub-topics
Clickable course links from YouTube, Udemy, Coursera, and NPTEL
Recommended effort time
AI guidance reasoning



Step 4 — Take a Skill Certification Exam

Check the "I've completed this module" checkbox on any roadmap module
Click START SKILL VERIFICATION TEST
You are taken to the AI Exam Studio
Answer 10 questions — difficulty escalates automatically:

Questions 1–3: Easy (definitions, syntax)
Questions 4–9: Moderate (scenarios, logic)
Question 10: Hard (optimisation, edge cases)


You can answer by typing or using the microphone (voice input)
After 10 answers, the AI evaluates your performance
Pass (8/10 correct): Confetti 🎉 + "Skill Certified!" screen
Fail: "Unverified Proficiency" screen with retry option

Step 5 — Evolve Your Resume

Navigate to Resume Evolution in the sidebar
Upload your original resume PDF again
Click Evolve My Resume
The AI rewrites the resume with:

Verified skills added to the Skills section
New bullet points under relevant work experience
An "AI-Verified Certifications" section listing each passed exam


Preview all sections on screen
Click Download Evolved Resume (.pdf) to save the updated document

Step 6 — Track Your Progress

Navigate to Skill Gap Analysis in the sidebar
See Pending Gaps (skills not yet verified) vs Verified Skills (exams passed)
Profile Match % updates dynamically as you pass more exams
Click Test Now on any pending gap to jump straight to that exam

Step 7 — Sign Out and Sign Back In

Click Sign Out at the bottom of the sidebar
Sign back in with the same username and password
Your roadmap, gaps, and verified skills are automatically restored
Header shows "Welcome back, [Name]" for returning users


✨ Features
FeatureDescription🔐 Auth SystemUsername + password login. SHA-256 hashed passwords. Unique username enforcement.📄 PDF Skill Gap AnalysisUpload Resume + JD PDFs. Llama 3.3 70B extracts and compares skills.🗺️ Personalized Roadmap3-module learning path per gap. Course links from 4 platforms only.🎙️ AI Mock Interview10-question proctored exam. Progressive difficulty. Voice input supported.📈 Adaptive DifficultyQ1–3 Easy → Q4–9 Moderate → Q10 Hard. Automated by question counter.📝 Resume EvolutionAI injects verified skills into resume structure. Exports formatted PDF.✅ Skill VerificationPass 8/10 → VERIFIED_MASTERY stored. Skills removed from pending gaps list.💾 User PersistenceAll data stored in memory.json. Restored automatically on next login.🔄 Session ContinuityRoadmap, gaps, verified skills all restored on returning user login.📊 Gap TrackerLive dashboard showing pending vs verified skills with match percentage.

🛠 Tech Stack
LayerTechnologyPurposeFrontendNext.js 14, React 18, TypeScriptUI frameworkStylingTailwind CSS, Framer MotionStyling and animationsBackendFastAPI (Python 3.11), UvicornREST API serverLLMLlama 3.3 70B via Groq APIAll AI reasoningPDF ParsingpypdfExtract text from uploaded PDFsPDF GenerationReportLabGenerate evolved resume PDFAuthhashlib SHA-256Password hashingStorageJSON file (memory.json)Lightweight user persistenceProxyNginx (Docker only)Routes frontend/backend traffic

⚙️ Setup Instructions
Prerequisites

Node.js 20 or higher
Python 3.11 or higher
A free Groq API key → get one at https://console.groq.com


Option A — Run Locally (Recommended for Development)
1. Clone the repository
bashgit clone https://github.com/YOUR_USERNAME/ai-career-advisor.git
cd ai-career-advisor
2. Backend setup
bashcd backend
python -m venv venv

# Activate virtual environment
source venv/bin/activate        # Mac / Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt
Create a .env file inside backend/:
GROQ_API_KEY=your_groq_api_key_here
Start the backend:
bashuvicorn main:app --reload --port 8000
Backend will be live at: http://localhost:8000
3. Frontend setup
Open a new terminal:
bashcd frontend
npm install
npm run dev
Open your browser at: http://localhost:3000

Option B — Docker (For Judges / Reproducible Environment)
Prerequisites

Docker Desktop installed and running

Steps
bash# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/ai-career-advisor.git
cd ai-career-advisor

# 2. Create a .env file in the ROOT folder
echo "GROQ_API_KEY=your_groq_api_key_here" > .env

# 3. Build and run all containers
docker-compose up --build
Open your browser at: http://localhost

Note: First build takes 3–5 minutes. Subsequent starts are fast.

To stop:
bashdocker-compose down

🐳 Docker Architecture
Browser
  │
  ├── localhost:80   → Nginx → Frontend container (Next.js :3000)
  └── localhost:8000 → Nginx → Backend container  (FastAPI :8000)
No frontend code changes needed — Nginx transparently proxies all localhost:8000 API calls to the backend container.

📁 Project Structure
ai-career-advisor-main/
├── docker-compose.yml          # Orchestrates all 3 containers
├── nginx.conf                  # Reverse proxy config
├── .env                        # Root env (GROQ_API_KEY for Docker)
├── README.md
│
├── backend/
│   ├── main.py                 # All FastAPI endpoints + business logic
│   ├── memory.json             # Auto-created user data store
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Backend env (GROQ_API_KEY for local dev)
│   └── Dockerfile
│
└── frontend/
    ├── app/
    │   ├── page.tsx                    # Dashboard (skill gap + roadmap)
    │   ├── login/page.tsx              # Login + Signup page
    │   ├── mock-interview/page.tsx     # AI Exam Studio
    │   ├── resume-evolution/page.tsx   # Resume upgrader + PDF export
    │   └── skill-gap-analysis/page.tsx # Gap tracker + progress
    ├── next.config.mjs
    ├── package.json
    └── Dockerfile

🧠 Skill Gap Analysis — Logic Overview
Resume PDF ──┐
             ├──► pypdf text extraction
JD PDF ──────┘         │
                        ▼
              Llama 3.3 70B prompt:
              "Extract name, skills_found,
               skills_missing, reasoning"
                        │
                        ▼
              Structured JSON response
              { name, skills_found,
                skills_missing, reasoning }
                        │
                        ▼
              Each missing skill stored as:
              "Gap Identified: <skill>"
              in memory.json
                        │
                        ▼
              Roadmap generation:
              Gaps → LLM → 3-module path
              with YouTube/Udemy/Coursera/NPTEL
              search URLs (never hallucinated links)
Key design decisions:

Temperature 0.1 for gap analysis (maximum accuracy)
Temperature 0.5 for roadmap (some creativity for course suggestions)
unquote_plus() decodes URL-encoded gap strings before passing to LLM
Search URLs used instead of direct course links to avoid broken/hallucinated URLs


🎯 Adaptive Pathing Algorithm
The exam difficulty is controlled entirely by a question counter (q_num) tracked server-side:
pythonuser_msgs = [m for m in request.messages if m.get('role') == 'user']
q_num = len(user_msgs) + 1

if q_num <= 3:
    level = "Foundational/Easy — Syntax, definitions, core concepts"
elif q_num <= 9:
    level = "Application-based/Moderate — Scenario handling, common logic"
else:
    level = "Deep Logic/Hard — Optimization, edge cases, complex problems"
Pass criteria: 8 out of 10 correct answers (evaluated by LLM after Q10)
On pass: VERIFIED_MASTERY: <topic> written to memory.json
On fail: User is shown retry option and directed back to the roadmap
The system prompt also enforces exam silence — no feedback or hints are given between questions, maintaining test integrity.

🔌 API Endpoints
MethodEndpointDescriptionPOST/api/signupCreate new user (username + hashed password)POST/api/loginAuthenticate user, return profile dataPOST/api/analyze-gapUpload resume + JD PDFs, returns skill gapsGET/api/generate-roadmapGenerate 3-module roadmap from stored gapsPOST/api/chatSend exam answer, receive next questionPOST/api/evolve-resumeAI rewrites resume with verified skillsPOST/api/generate-resume-docxExport evolved resume as PDFGET/api/check-user?name=XCheck if user exists, restore their dataGET/api/hindsightReturn raw memory feedGET/api/all-usersList all users (debug endpoint)GET/Health check

📦 Dependencies
Backend (requirements.txt)
fastapi
uvicorn
python-multipart
groq
python-dotenv
pypdf
reportlab
pydantic
Frontend (package.json key packages)
next: 14.x
react: 18.x
typescript
tailwindcss
framer-motion
lucide-react
canvas-confetti

🔑 Environment Variables
VariableWhereDescriptionGROQ_API_KEYbackend/.envRequired for local developmentGROQ_API_KEY.env (root)Required for Docker deployment
Get your free API key at: https://console.groq.com

📝 Notes for Judges

The app uses a single JSON file (memory.json) as the database — intentionally lightweight and inspectable
All AI responses are structured JSON — the LLM is never allowed to return free text for data endpoints
Passwords are SHA-256 hashed server-side and never returned to the frontend
The roadmap uses search URLs (not direct links) to guarantee zero broken links
Voice input works in Chrome and Edge only (Web Speech API limitation)
The resume PDF export uses ReportLab — pure Python, no external services


👩‍💻 Built With

Groq — Ultra-fast LLM inference
Meta Llama 3.3 70B — Foundation model
FastAPI — Backend framework
Next.js — Frontend framework
ReportLab — PDF generation