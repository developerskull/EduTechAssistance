from datetime import datetime
from app.extensions import db

class Cohort(db.Model):
    __tablename__ = "cohorts"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    teacher = db.relationship("User", back_populates="cohorts_taught")
    members = db.relationship("CohortMember", back_populates="cohort", cascade="all, delete-orphan", lazy="dynamic")

    def to_dict(self, include_members_count=True):
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "teacher_id": self.teacher_id,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
        if include_members_count:
            data["members_count"] = self.members.count()
        return data


class CohortMember(db.Model):
    __tablename__ = "cohort_members"

    id = db.Column(db.Integer, primary_key=True)
    cohort_id = db.Column(db.Integer, db.ForeignKey("cohorts.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("cohort_id", "student_id", name="uq_cohort_student"),
    )

    # Relationships
    cohort = db.relationship("Cohort", back_populates="members")
    student = db.relationship("User", back_populates="cohort_memberships")

    def to_dict(self):
        return {
            "id": self.id,
            "cohort_id": self.cohort_id,
            "student_id": self.student_id,
            "student": self.student.to_dict() if self.student else None,
            "joined_at": self.joined_at.isoformat() if self.joined_at else None
        }

