from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.extensions import db
from app.models.exam import Exam, Question, StudentExam, Answer
from app.models.cohort import Cohort, CohortMember
from app.models.user import User, UserActivity
from app.services.ai_service import AIService
from app.middleware.error_handlers import ValidationError, NotFoundError, ForbiddenError

GRACE_PERIOD_SECONDS = 30  # Allow 30 seconds buffer for network latency

class ExamService:
    @staticmethod
    def create_exam(
        creator_id: int,
        title: str,
        description: str,
        time_limit: int,
        questions_data: List[Dict[str, Any]],
        document_id: Optional[int] = None
    ) -> Exam:
        if not title or len(title.strip()) < 3:
            raise ValidationError("Exam title must be at least 3 characters long", details={"field": "title"})

        if time_limit < 1 or time_limit > 360:
            raise ValidationError("Time limit must be between 1 and 360 minutes", details={"field": "time_limit"})

        if not questions_data:
            raise ValidationError("At least one question is required to create an exam", details={"field": "questions"})

        total_points = sum(int(q.get("points", 1)) for q in questions_data)

        exam = Exam(
            title=title.strip(),
            description=description.strip() if description else "",
            created_by=creator_id,
            time_limit=time_limit,
            total_points=total_points
        )
        db.session.add(exam)
        db.session.flush()

        for q_data in questions_data:
            q_text = (q_data.get("question_text") or q_data.get("question") or "").strip()
            q_type = (q_data.get("question_type") or q_data.get("type") or "multiple_choice").lower()
            correct_ans = (q_data.get("correct_answer") or "").strip()
            pts = int(q_data.get("points", 1))

            if not q_text:
                raise ValidationError("Question text cannot be empty")
            if not correct_ans:
                raise ValidationError(f"Question '{q_text[:30]}' is missing a correct answer")

            question = Question(
                exam_id=exam.id,
                document_id=document_id or q_data.get("document_id"),
                question_text=q_text,
                question_type=q_type,
                options=q_data.get("options") or [],
                correct_answer=correct_ans,
                points=pts,
                ai_model_answer=q_data.get("ai_model_answer"),
                ai_suggested_rubric=q_data.get("ai_suggested_rubric")
            )
            db.session.add(question)

        db.session.add(UserActivity(
            user_id=creator_id,
            activity_type="create_exam",
            description=f"Created exam: '{title}' ({len(questions_data)} questions, {total_points} pts)"
        ))
        db.session.commit()
        return exam

    @staticmethod
    def assign_exam_to_students(exam_id: int, teacher_id: int, student_ids: List[int]) -> int:
        exam = db.session.get(Exam, exam_id)
        if not exam:
            raise NotFoundError("Exam not found")
        if exam.created_by != teacher_id:
            raise ForbiddenError("You can only assign exams you created")

        if not student_ids:
            raise ValidationError("No student IDs provided for assignment")

        assigned_count = 0
        for s_id in student_ids:
            student = db.session.get(User, s_id)
            if not student or student.role != "student":
                continue

            existing = StudentExam.query.filter_by(exam_id=exam.id, student_id=student.id).first()
            if not existing:
                student_exam = StudentExam(
                    exam_id=exam.id,
                    student_id=student.id,
                    status="pending",
                    max_score=exam.total_points
                )
                db.session.add(student_exam)
                assigned_count += 1

        db.session.add(UserActivity(
            user_id=teacher_id,
            activity_type="assign_exam",
            description=f"Assigned exam '{exam.title}' to {assigned_count} students"
        ))
        db.session.commit()
        return assigned_count

    @staticmethod
    def start_exam(exam_id: int, student_id: int) -> Dict[str, Any]:
        student_exam = StudentExam.query.filter_by(exam_id=exam_id, student_id=student_id).first()
        if not student_exam:
            raise NotFoundError("This exam has not been assigned to you")

        if student_exam.status in ("completed", "evaluated"):
            raise ValidationError("You have already submitted this exam")

        now = datetime.utcnow()
        if student_exam.status == "pending":
            student_exam.status = "in_progress"
            student_exam.started_at = now
            student_exam.last_saved_at = now
            db.session.commit()

        # Calculate remaining time in seconds
        exam = student_exam.exam
        deadline = student_exam.started_at + timedelta(minutes=exam.time_limit)
        remaining_seconds = max(0, int((deadline - now).total_seconds()))

        # Sanitize questions: NEVER leak correct_answer or ai_model_answer to student!
        sanitized_questions = [
            q.to_dict(include_answer=False) for q in exam.questions
        ]

        # Fetch any existing autosaved answers
        saved_answers = {
            a.question_id: a.student_answer for a in student_exam.answers
        }

        return {
            "attempt_id": student_exam.id,
            "exam": exam.to_dict(include_questions=False),
            "status": student_exam.status,
            "started_at": student_exam.started_at.isoformat(),
            "time_limit_minutes": exam.time_limit,
            "remaining_seconds": remaining_seconds,
            "questions": sanitized_questions,
            "saved_answers": saved_answers
        }

    @staticmethod
    def save_progress(attempt_id: int, student_id: int, answers_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        student_exam = db.session.get(StudentExam, attempt_id)
        if not student_exam or student_exam.student_id != student_id:
            raise NotFoundError("Exam attempt not found")

        if student_exam.status != "in_progress":
            raise ValidationError(f"Cannot save progress on an exam that is {student_exam.status}")

        # Check server timer
        now = datetime.utcnow()
        exam = student_exam.exam
        deadline = student_exam.started_at + timedelta(minutes=exam.time_limit) + timedelta(seconds=GRACE_PERIOD_SECONDS)
        if now > deadline:
            raise ValidationError("Exam time limit has expired. Progress cannot be saved.")

        student_exam.last_saved_at = now

        for item in answers_data:
            q_id = item.get("question_id")
            s_answer = item.get("answer_text") or item.get("student_answer") or ""

            answer = Answer.query.filter_by(student_exam_id=student_exam.id, question_id=q_id).first()
            if not answer:
                answer = Answer(
                    student_exam_id=student_exam.id,
                    question_id=q_id,
                    student_answer=s_answer
                )
                db.session.add(answer)
            else:
                answer.student_answer = s_answer

        db.session.commit()
        return {
            "attempt_id": student_exam.id,
            "last_saved_at": student_exam.last_saved_at.isoformat(),
            "saved_count": len(answers_data)
        }

    @staticmethod
    def submit_exam(attempt_id: int, student_id: int, answers_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        student_exam = db.session.get(StudentExam, attempt_id)
        if not student_exam or student_exam.student_id != student_id:
            raise NotFoundError("Exam attempt not found")

        if student_exam.status in ("completed", "evaluated"):
            raise ValidationError("Exam has already been submitted")

        # STRICT SERVER-SIDE TIMER ENFORCEMENT
        now = datetime.utcnow()
        exam = student_exam.exam
        if not student_exam.started_at:
            student_exam.started_at = now

        deadline = student_exam.started_at + timedelta(minutes=exam.time_limit) + timedelta(seconds=GRACE_PERIOD_SECONDS)
        if now > deadline:
            student_exam.status = "completed"
            student_exam.submitted_at = deadline
            db.session.commit()
            raise ValidationError(
                "Submission rejected: The exam time limit has expired. Server-side timer is strictly enforced."
            )

        student_exam.submitted_at = now
        answers_by_qid = {item.get("question_id"): (item.get("answer_text") or item.get("student_answer") or "") for item in answers_data}

        total_score = 0
        has_subjective = False

        for question in exam.questions:
            student_ans_text = answers_by_qid.get(question.id, "").strip()
            answer = Answer.query.filter_by(student_exam_id=student_exam.id, question_id=question.id).first()
            if not answer:
                answer = Answer(
                    student_exam_id=student_exam.id,
                    question_id=question.id,
                    student_answer=student_ans_text
                )
                db.session.add(answer)
            else:
                answer.student_answer = student_ans_text

            # Auto-grading for objective types: multiple_choice & true_false
            if question.question_type in ("multiple_choice", "true_false"):
                # Clean answer for comparison (e.g., "A) Option text" -> "A" or exact match)
                correct_norm = question.correct_answer.strip().lower()
                student_norm = student_ans_text.strip().lower()

                # Check exact match or option prefix match (e.g. 'A' matching 'A) ...')
                is_correct = (
                    student_norm == correct_norm or
                    (len(student_norm) == 1 and correct_norm.startswith(student_norm)) or
                    (len(correct_norm) == 1 and student_norm.startswith(correct_norm))
                )

                if is_correct:
                    answer.score = question.points
                    answer.is_verified = True
                    answer.feedback = "Correct"
                    total_score += question.points
                else:
                    answer.score = 0
                    answer.is_verified = True
                    answer.feedback = f"Incorrect. Correct answer: {question.correct_answer}"
            else:
                # Subjective questions (short_answer, essay) require teacher evaluation
                has_subjective = True
                answer.is_verified = False
                
                # Pre-generate AI suggested score and rationale for teacher convenience
                eval_res = AIService.evaluate_subjective_answer(
                    question_text=question.question_text,
                    correct_answer=question.correct_answer,
                    student_answer=student_ans_text,
                    max_points=question.points
                )
                answer.ai_suggested_score = eval_res.suggested_score
                answer.ai_rationale = eval_res.rationale

        student_exam.total_score = total_score
        student_exam.max_score = exam.total_points
        student_exam.percentage = round((total_score / max(1, exam.total_points)) * 100.0, 2)
        student_exam.status = "completed" if has_subjective else "evaluated"

        # Update student stats
        student = student_exam.student
        if student and student.stats:
            student.stats.exams_completed += 1

        db.session.add(UserActivity(
            user_id=student_id,
            activity_type="submit_exam",
            description=f"Submitted exam '{exam.title}' - Initial Score: {total_score}/{exam.total_points}"
        ))
        db.session.commit()

        return {
            "attempt_id": student_exam.id,
            "status": student_exam.status,
            "total_score": student_exam.total_score,
            "max_score": student_exam.max_score,
            "percentage": student_exam.percentage,
            "needs_manual_grading": has_subjective
        }

    @staticmethod
    def evaluate_answer(
        teacher_id: int,
        answer_id: int,
        score: int,
        feedback: str
    ) -> Dict[str, Any]:
        answer = db.session.get(Answer, answer_id)
        if not answer:
            raise NotFoundError("Answer not found")

        exam = answer.student_exam.exam
        if exam.created_by != teacher_id:
            raise ForbiddenError("You can only grade submissions for exams you created")

        max_pts = answer.question.points
        if score < 0 or score > max_pts:
            raise ValidationError(f"Score must be between 0 and maximum points ({max_pts})")

        answer.score = score
        answer.feedback = feedback.strip() if feedback else ""
        answer.is_verified = True
        answer.evaluated_at = datetime.utcnow()
        answer.evaluated_by = teacher_id

        # Recalculate student exam total score
        student_exam = answer.student_exam
        all_answers = student_exam.answers
        new_total = sum(a.score for a in all_answers)
        student_exam.total_score = new_total
        student_exam.percentage = round((new_total / max(1, student_exam.max_score)) * 100.0, 2)

        # If all answers are verified, update status to 'evaluated'
        if all(a.is_verified for a in all_answers):
            student_exam.status = "evaluated"

        db.session.commit()
        return {
            "answer_id": answer.id,
            "score": answer.score,
            "is_verified": answer.is_verified,
            "feedback": answer.feedback,
            "student_exam_status": student_exam.status,
            "updated_total_score": student_exam.total_score,
            "updated_percentage": student_exam.percentage
        }

    @staticmethod
    def get_exam_overview(exam_id: int, teacher_id: int) -> Dict[str, Any]:
        exam = db.session.get(Exam, exam_id)
        if not exam:
            raise NotFoundError("Exam not found")
        if exam.created_by != teacher_id:
            raise ForbiddenError("You can only view analytics for your own exams")

        attempts = exam.student_exams.all()
        submitted = [a for a in attempts if a.status in ("completed", "evaluated")]

        total_submissions = len(submitted)
        avg_score = round(sum(a.total_score for a in submitted) / max(1, total_submissions), 2) if total_submissions > 0 else 0.0
        pending_evaluations = sum(1 for a in submitted if a.status == "completed")

        # Question performance breakdown
        question_stats = []
        for q in exam.questions:
            q_answers = Answer.query.filter_by(question_id=q.id).all()
            q_submitted = [a for a in q_answers if a.student_exam.status in ("completed", "evaluated")]
            count = len(q_submitted)
            correct_count = sum(1 for a in q_submitted if a.score == q.points)
            accuracy = round((correct_count / max(1, count)) * 100.0, 1) if count > 0 else 0.0
            question_stats.append({
                "question_id": q.id,
                "question_text": q.question_text[:60] + "...",
                "question_type": q.question_type,
                "points": q.points,
                "total_responses": count,
                "accuracy_percentage": accuracy
            })

        return {
            "exam_id": exam.id,
            "title": exam.title,
            "total_assigned": len(attempts),
            "total_submissions": total_submissions,
            "average_score": avg_score,
            "max_score": exam.total_points,
            "pending_evaluations": pending_evaluations,
            "question_stats": question_stats,
            "submissions": [a.to_dict(include_exam=False) for a in attempts]
        }

    @staticmethod
    def get_question_analytics(exam_id: int, question_id: int, teacher_id: int) -> Dict[str, Any]:
        exam = db.session.get(Exam, exam_id)
        if not exam:
            raise NotFoundError("Exam not found")
        if exam.created_by != teacher_id:
            raise ForbiddenError("You can only view analytics for your own exams")

        question = db.session.get(Question, question_id)
        if not question or question.exam_id != exam.id:
            raise NotFoundError("Question not found in this exam")

        answers = Answer.query.filter_by(question_id=question.id).all()
        total_answers = len(answers)
        correct_count = sum(1 for a in answers if a.score == question.points)
        accuracy = round((correct_count / max(1, total_answers)) * 100.0, 1) if total_answers > 0 else 0.0

        # Distribution for multiple choice
        distribution = {}
        for a in answers:
            ans_key = (a.student_answer or "").strip()[:1].upper() or "None"
            distribution[ans_key] = distribution.get(ans_key, 0) + 1

        student_responses = [
            {
                "answer_id": a.id,
                "student_name": a.student_exam.student.username,
                "student_answer": a.student_answer,
                "score": a.score,
                "is_verified": a.is_verified,
                "ai_suggested_score": a.ai_suggested_score,
                "ai_rationale": a.ai_rationale
            }
            for a in answers
        ]

        return {
            "question": question.to_dict(include_answer=True),
            "statistics": {
                "total_answers": total_answers,
                "correct_count": correct_count,
                "accuracy_percentage": accuracy,
                "answer_distribution": distribution
            },
            "student_responses": student_responses
        }

