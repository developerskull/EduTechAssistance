# 🏛️ EduTechAssistance Architecture & System Blueprint

## 1. High-Level Architecture

EduTechAssistance is built with a decoupled client-server architecture:
- **Presentation Layer**: React 18 SPA (Tailwind CSS, Lucide Icons, Axios).
- **Application & API Gateway**: Python Flask 2.3+ REST API running with Alembic, Flask-SQLAlchemy, Flask-JWT-Extended, and Flask-Limiter.
- **AI & RAG Engine**: Google Gemini (`gemini-2.5-flash`), with vector embedding storage, semantic retrieval, and local rule-based fallback.
- **Persistence Layer**: Relational database (SQLite for development, PostgreSQL with pgvector for production).

```mermaid
flowchart TB
    subgraph ClientLayer["Presentation Tier"]
        Web["React 18 SPA (Vite, Tailwind CSS, Lucide)"]
        Mobile["(Phase 5) React Native / Expo App"]
    end

    subgraph SecurityGateway["API & Security Gateway (/api/v1)"]
        CORS["Flask-CORS Middleware"]
        Limiter["Flask-Limiter (Rate Limiting)"]
        JWTMiddleware["JWT Identity Validation"]
        RoleGuard["@role_required('teacher'|'student'|'admin')"]
        ErrorHandler["Uniform Error Formatter: {'error': {'code', 'message'}}"]
    end

    subgraph ServiceModules["Core Domain Services"]
        AuthSvc["AuthService (Bcrypt, JWT Tokens)"]
        ExamSvc["ExamService (Timer, Scoring, State Machine)"]
        AISvc["AIService (Gemini Structured Output, Pydantic, Fallback)"]
        RAGSvc["RAGService (PyPDF2, Chunking, Vector Search)"]
    end

    subgraph DataTier["Data Persistence"]
        DB[(PostgreSQL / SQLite)]
        VectorStore[(Vector Store / pgvector / SQLite Embedding)]
    end

    Web -->|HTTP / Bearer Token| CORS
    Mobile -.->|HTTP / Bearer Token| CORS
    CORS --> Limiter --> JWTMiddleware --> RoleGuard
    RoleGuard --> AuthSvc
    RoleGuard --> ExamSvc
    RoleGuard --> AISvc
    AISvc --> RAGSvc
    AuthSvc --> DB
    ExamSvc --> DB
    RAGSvc --> VectorStore
```

---

## 2. Authentication, Role Enforcement & Ownership Model

All security is token-driven. Client identity is derived strictly from the cryptographically verified JWT (`get_jwt_identity()`), **never** from request body parameters or query strings.

```mermaid
sequenceDiagram
    autonumber
    actor User as Teacher / Student
    participant API as /api/v1 Endpoint
    participant Guard as @role_required Guard
    participant Service as Domain Service
    participant DB as Database

    User->>API: HTTP Request + Authorization: Bearer <JWT>
    API->>Guard: Verify JWT Token
    alt Invalid / Expired Token
        Guard-->>User: 401 Unauthorized {"error": {"code": "UNAUTHORIZED"}}
    else Valid Token
        Guard->>DB: Fetch user record & check role
        alt Role mismatch
            Guard-->>User: 403 Forbidden {"error": {"code": "FORBIDDEN"}}
        else Authorized Role
            Guard->>Service: Execute action with verified user_id
            Service->>DB: Query strictly scoped to verified user_id
            DB-->>Service: Return isolated data
            Service-->>User: 200 OK Response
        end
    end
```

---

## 3. Relational Database Schema & Data Models

The system is normalized across 12 relational tables:

```mermaid
erDiagram
    User ||--o{ Exam : "creates"
    User ||--o{ StudentExam : "takes"
    User ||--o{ UserActivity : "logs"
    User ||--|| UserStats : "aggregates"
    User ||--o{ Cohort : "manages"
    User ||--o{ CohortMember : "joins"
    User ||--o{ Document : "uploads"
    User ||--o{ Conversation : "has"
    Cohort ||--o{ CohortMember : "contains"
    Document ||--o{ DocumentChunk : "chunked_into"
    Exam ||--o{ Question : "contains"
    Exam ||--o{ StudentExam : "assigned_to"
    StudentExam ||--o{ Answer : "submits"
    Question ||--o{ Answer : "grades"
    Conversation ||--o{ Message : "contains"

    User {
        int id PK
        string username UK
        string email UK
        string password_hash
        string role "teacher | student | admin"
        boolean is_online
        datetime last_active
        datetime created_at
    }

    Cohort {
        int id PK
        string name
        text description
        int teacher_id FK
        datetime created_at
    }

    CohortMember {
        int id PK
        int cohort_id FK
        int student_id FK
        datetime joined_at
    }

    Document {
        int id PK
        string title
        string filename
        string file_path
        int file_size
        string mime_type
        text text_content
        int page_count
        int uploaded_by FK
        datetime created_at
    }

    DocumentChunk {
        int id PK
        int document_id FK
        int chunk_index
        text chunk_text
        text embedding_json
        int token_count
        datetime created_at
    }

    Exam {
        int id PK
        string title
        text description
        int created_by FK
        int time_limit "minutes"
        int total_points
        datetime created_at
        datetime updated_at
    }

    Question {
        int id PK
        int exam_id FK
        int document_id FK
        text question_text
        string question_type "multiple_choice | true_false | short_answer | essay"
        text options_json
        text correct_answer
        int points
        text ai_model_answer
        text ai_suggested_rubric
        datetime created_at
    }

    StudentExam {
        int id PK
        int exam_id FK
        int student_id FK
        string status "pending | in_progress | completed | evaluated"
        datetime assigned_at
        datetime started_at
        datetime submitted_at
        datetime last_saved_at
        int total_score
        int max_score
        float percentage
    }

    Answer {
        int id PK
        int student_exam_id FK
        int question_id FK
        text student_answer
        int score
        boolean is_verified
        text feedback
        int ai_suggested_score
        text ai_rationale
        datetime evaluated_at
        int evaluated_by FK
    }

    Conversation {
        int id PK
        int user_id FK
        string title
        datetime created_at
        datetime updated_at
    }

    Message {
        int id PK
        int conversation_id FK
        string sender_role "user | assistant | system"
        text content
        datetime created_at
    }

    UserActivity {
        int id PK
        int user_id FK
        string activity_type
        string description
        datetime timestamp
    }

    UserStats {
        int id PK
        int user_id FK
        int total_questions_generated
        int total_study_materials
        int total_chat_sessions
        int exams_completed
        datetime last_updated
    }
```

