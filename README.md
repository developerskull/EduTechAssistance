# 🎓 EduTechAssistance

<div align="center">

**AI-Powered Question Paper Generator & Comprehensive Exam Management System**

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3-lightgrey.svg)](https://palletsprojects.com/p/flask/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%202.5%20Flash-orange.svg)](https://ai.google.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 🌟 Overview

**EduTechAssistance** is a dual-engine educational technology platform that unites **generative AI-powered document understanding (RAG)** with a **complete exam authoring, distribution, and grading lifecycle**:
- **Educators**: Drag & drop course PDFs (up to 10MB) to synthesize balanced exam papers (Multiple Choice, True/False, Short Answer, Essay). Schedule exams, assign to student cohorts, and grade subjective answers with AI-assisted side-by-side rubrics.
- **Learners**: Take timed exams with live countdown and background autosave, receive immediate auto-graded objective feedback, generate personalized topic study guides, and chat with an AI tutor.

---

## 📸 Screenshots & UI Previews

<!-- screenshot placeholders -->
```text
┌────────────────────────────────────────────────────────────────────────┐
│                        EduTechAssistance                               │
│  [Teacher Dashboard] [AI Question Generator] [Grading Workspace]      │
│                                                                        │
│  ┌───────────────────────┐   ┌──────────────────────────────────────┐  │
│  │ 1. PDF Course Ingest  │   │ 2. Synthesized Question Paper        │  │
│  │ [Drag & drop PDF here]│ → │ Q1: Multiple Choice (1 pt)           │  │
│  │ • 10MB max            │   │ Q2: True / False (1 pt)              │  │
│  │ • Semantic chunking   │   │ Q3: Short Answer (2 pts)             │  │
│  └───────────────────────┘   └──────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Side-by-Side Teacher Grading Workspace                           │  │
│  │  Model Answer (Green)      │  Student Answer (Indigo)            │  │
│  │  AI Suggested Score: 2/2   │  Score Input: [2] [Save & Continue] │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Core Features

### 🤖 1. AI Document Ingestion & RAG Pipeline
- **Smart PDF Extraction**: Extracts text with page-level awareness; detects and flags scanned/empty documents.
- **Semantic Chunking & Vector Search**: Overlapping text chunks embedded via Gemini Embeddings / local cosine similarity.
- **Multi-Format Generation**: Structured JSON output validated by Pydantic models with 2x retry resilience.
- **AI-Suggested Grading**: Pre-computes suggested scores and rationale for subjective items to accelerate grading.
- **Zero-Downtime Local Fallback**: Heuristic generator ensures uninterrupted operation even without API keys.

### 📝 2. Exam Management & Timer Enforcement
- **2-Step Assignment Wizard**: Curate questions (AI-generated or custom authored), set time limit, and assign to cohorts.
- **Server-Side Countdown Enforcement**: Exam submissions strictly validate `started_at + time_limit` (with a 30-second network buffer). Late submissions are rejected by the server.
- **Continuous Autosave**: Periodic background autosave endpoint (`POST /api/v1/student/save-progress`).
- **Instant Objective Grading**: Immediate auto-scoring for Multiple Choice and True/False questions.

### ⚖️ 3. Teacher Evaluation & Analytics
- **Dual-Pane Grading Modal**: Model answer in emerald green side-by-side with student text in indigo blue.
- **Class Analytics Overview**: Average scores, submission completion rates, and question accuracy bars.
- **Question Deep-Dive**: Visual distribution charts identifying common student mistakes.

---

## 🚀 Quick Start Guide

### Option 1: Docker Compose (Recommended)

Run the full stack (PostgreSQL + Flask REST API + React Frontend) with one command:

```bash
docker-compose up --build
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API & Telemetry**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)
- **Interactive Swagger / OpenAPI Docs**: [http://localhost:5000/api/v1/docs](http://localhost:5000/api/v1/docs)

---

### Option 2: Manual Development Setup

#### 1. Backend Setup (Terminal 1)
```bash
# Navigate to backend
cd backend

# Create & activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
python wsgi.py
```
*Backend runs on `http://localhost:5000`.*

#### 2. Frontend Setup (Terminal 2)
```bash
# Navigate to frontend
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
```
*Frontend runs on `http://localhost:3000` with proxy to backend.*

---

## 🔑 Environment Variables Reference

Create a `backend/.env` file from `backend/.env.example`:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `FLASK_ENV` | `development` | Environment mode (`development`, `production`, `testing`) |
| `DATABASE_URL` | `sqlite:///exam_system.db` | Connection string (`sqlite:///...` or `postgresql://...`) |
| `SECRET_KEY` | *(Required in prod)* | Secret key used for session signing |
| `JWT_SECRET_KEY` | *(Required in prod)* | Cryptographic secret for signing JWT tokens |
| `JWT_ACCESS_TOKEN_EXPIRES_MINUTES` | `60` | Lifespan of access tokens in minutes |
| `JWT_REFRESH_TOKEN_EXPIRES_DAYS` | `30` | Lifespan of refresh tokens in days |
| `GEMINI_API_KEY` | *(Optional)* | Google Gemini API key for live AI generation |
| `GEMINI_PRIMARY_MODEL` | `gemini-2.5-flash` | Primary generative LLM model |
| `GEMINI_FALLBACK_MODEL` | `gemini-1.5-pro` | Fallback model if primary exceeds rate limits |
| `MAX_CONTENT_LENGTH` | `10485760` | Maximum file upload size in bytes (10 MB) |
| `PORT` | `5000` | Backend listening port |

---

## 🧪 Running Automated Tests

Run the complete test suite (27 tests covering authentication, tokens, role-based access, PDF parsing, Gemini structured validation, auto-grading, and server timer enforcement):

```bash
# From workspace root
backend\venv\Scripts\pytest -v
```

---

## 📜 Architectural Blueprints & Roadmap

- **[ARCHITECTURE.md](ARCHITECTURE.md)**: System architecture flowcharts, sequence diagrams, and 12-table ER diagram.
- **[ROADMAP.md](ROADMAP.md)**: Verified feature checklist and phase completion status.
- **[condition.md](condition.md)**: Initial forensic codebase condition and restoration log.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
