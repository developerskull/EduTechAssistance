import json
from datetime import datetime
from app.extensions import db

class Exam(db.Model):
    __tablename__ = "exams"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    time_limit = db.Column(db.Integer, nullable=False, default=60)  # In minutes
    total_points = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    creator = db.relationship("User", back_populates="exams_created")
    questions = db.relationship("Question", back_populates="exam", cascade="all, delete-orphan", order_by="Question.id")
    student_exams = db.relationship("StudentExam", back_populates="exam", cascade="all, delete-orphan", lazy="dynamic")

    def to_dict(self, include_questions=False, is_student=False):
        data = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "created_by": self.created_by,
            "time_limit": self.time_limit,
            "total_points": self.total_points,
            "questions_count": len(self.questions) if self.questions else 0,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
        if include_questions and self.questions:
            data["questions"] = [q.to_dict(include_answer=not is_student) for q in self.questions]
        return data


class Question(db.Model):
    __tablename__ = "questions"

    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = db.Column(db.Integer, db.ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(30), nullable=False)  # 'multiple_choice', 'true_false', 'short_answer', 'essay'
    options_json = db.Column(db.Text, nullable=True)  # JSON-encoded array for MCQ options
    correct_answer = db.Column(db.Text, nullable=False)
    points = db.Column(db.Integer, default=1)
    ai_model_answer = db.Column(db.Text, nullable=True)
    ai_suggested_rubric = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    exam = db.relationship("Exam", back_populates="questions")
    document = db.relationship("Document", back_populates="questions")
    answers = db.relationship("Answer", back_populates="question", cascade="all, delete-orphan", lazy="dynamic")

    @property
    def options(self):
        if self.options_json:
            try:
                return json.loads(self.options_json)
            except Exception:
                return []
        return []

    @options.setter
    def options(self, val):
        if val is not None:
            self.options_json = json.dumps(val)
        else:
            self.options_json = None

    def to_dict(self, include_answer=True):
        data = {
            "id": self.id,
            "exam_id": self.exam_id,
            "document_id": self.document_id,
            "question_text": self.question_text,
            "question_type": self.question_type,
            "options": self.options,
            "points": self.points,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
        if include_answer:
            data["correct_answer"] = self.correct_answer
            data["ai_model_answer"] = self.ai_model_answer
            data["ai_suggested_rubric"] = self.ai_suggested_rubric
        return data


class StudentExam(db.Model):
    __tablename__ = "student_exams"

    VALID_STATUSES = ("pending", "in_progress", "completed", "evaluated")

    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = db.Column(db.String(20), nullable=False, default="pending")  # ONLY: pending, in_progress, completed, evaluated
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    started_at = db.Column(db.DateTime, nullable=True)
    submitted_at = db.Column(db.DateTime, nullable=True)
    last_saved_at = db.Column(db.DateTime, nullable=True)
    total_score = db.Column(db.Integer, default=0)
    max_score = db.Column(db.Integer, default=0)
    percentage = db.Column(db.Float, default=0.0)

    __table_args__ = (
        db.UniqueConstraint("exam_id", "student_id", name="uq_exam_student"),
    )

    # Relationships
    exam = db.relationship("Exam", back_populates="student_exams")
    student = db.relationship("User", back_populates="exam_attempts")
    answers = db.relationship("Answer", back_populates="student_exam", cascade="all, delete-orphan")

    def to_dict(self, include_exam=True, include_answers=False):
        data = {
            "id": self.id,
            "exam_id": self.exam_id,
            "student_id": self.student_id,
            "status": self.status,
            "assigned_at": self.assigned_at.isoformat() if self.assigned_at else None,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
            "last_saved_at": self.last_saved_at.isoformat() if self.last_saved_at else None,
            "total_score": self.total_score,
            "max_score": self.max_score,
            "percentage": self.percentage
        }
        if include_exam and self.exam:
            data["exam"] = self.exam.to_dict()
        if self.student:
            data["student_name"] = self.student.username
            data["student_email"] = self.student.email
        if include_answers and self.answers:
            data["answers"] = [a.to_dict() for a in self.answers]
        return data


class Answer(db.Model):
    __tablename__ = "answers"

    id = db.Column(db.Integer, primary_key=True)
    student_exam_id = db.Column(db.Integer, db.ForeignKey("student_exams.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = db.Column(db.Integer, db.ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    student_answer = db.Column(db.Text, nullable=True)
    score = db.Column(db.Integer, default=0)
    is_verified = db.Column(db.Boolean, default=False)
    feedback = db.Column(db.Text, nullable=True)
    ai_suggested_score = db.Column(db.Integer, nullable=True)
    ai_rationale = db.Column(db.Text, nullable=True)
    evaluated_at = db.Column(db.DateTime, nullable=True)
    evaluated_by = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    __table_args__ = (
        db.UniqueConstraint("student_exam_id", "question_id", name="uq_attempt_question"),
    )

    # Relationships
    student_exam = db.relationship("StudentExam", back_populates="answers")
    question = db.relationship("Question", back_populates="answers")
    evaluator = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "student_exam_id": self.student_exam_id,
            "question_id": self.question_id,
            "student_answer": self.student_answer,
            "score": self.score,
            "is_verified": self.is_verified,
            "feedback": self.feedback,
            "ai_suggested_score": self.ai_suggested_score,
            "ai_rationale": self.ai_rationale,
            "evaluated_at": self.evaluated_at.isoformat() if self.evaluated_at else None,
            "evaluated_by": self.evaluated_by,
            "question": self.question.to_dict(include_answer=True) if self.question else None
        }

