from datetime import datetime
from app.extensions import db, bcrypt

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="student")  # 'teacher', 'student', 'admin'
    is_online = db.Column(db.Boolean, default=False)
    last_active = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    exams_created = db.relationship("Exam", back_populates="creator", cascade="all, delete-orphan", lazy="dynamic")
    exam_attempts = db.relationship("StudentExam", back_populates="student", cascade="all, delete-orphan", lazy="dynamic")
    activities = db.relationship("UserActivity", back_populates="user", cascade="all, delete-orphan", lazy="dynamic")
    stats = db.relationship("UserStats", back_populates="user", uselist=False, cascade="all, delete-orphan")
    cohorts_taught = db.relationship("Cohort", back_populates="teacher", cascade="all, delete-orphan", lazy="dynamic")
    cohort_memberships = db.relationship("CohortMember", back_populates="student", cascade="all, delete-orphan", lazy="dynamic")
    documents = db.relationship("Document", back_populates="uploader", cascade="all, delete-orphan", lazy="dynamic")
    conversations = db.relationship("Conversation", back_populates="user", cascade="all, delete-orphan", lazy="dynamic")

    def set_password(self, password: str):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password: str) -> bool:
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "is_online": self.is_online,
            "last_active": self.last_active.isoformat() if self.last_active else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class UserActivity(db.Model):
    __tablename__ = "user_activities"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    user = db.relationship("User", back_populates="activities")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "activity_type": self.activity_type,
            "description": self.description,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }


class UserStats(db.Model):
    __tablename__ = "user_stats"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    total_questions_generated = db.Column(db.Integer, default=0)
    total_study_materials = db.Column(db.Integer, default=0)
    total_chat_sessions = db.Column(db.Integer, default=0)
    exams_completed = db.Column(db.Integer, default=0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("User", back_populates="stats")

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "total_questions_generated": self.total_questions_generated,
            "total_study_materials": self.total_study_materials,
            "total_chat_sessions": self.total_chat_sessions,
            "exams_completed": self.exams_completed,
            "last_updated": self.last_updated.isoformat() if self.last_updated else None
        }

