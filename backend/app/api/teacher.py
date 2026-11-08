from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.exam import Exam, StudentExam, Answer
from app.models.cohort import Cohort, CohortMember
from app.models.user import User
from app.middleware.auth_guards import get_current_user, role_required
from app.middleware.error_handlers import ValidationError, NotFoundError, ForbiddenError
from app.services.exam_service import ExamService
from app.utils.pagination import paginate_query

teacher_bp = Blueprint("teacher", __name__, url_prefix="/teacher")

@teacher_bp.route("/create-assignment", methods=["POST"])
@role_required("teacher", "admin")
def create_assignment():
    """
    Create a new assignment/exam with multiple questions
    ---
    tags:
      - Teacher Workflow
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - title
            - time_limit
            - questions
          properties:
            title:
              type: string
            description:
              type: string
            time_limit:
              type: integer
              default: 60
            document_id:
              type: integer
            questions:
              type: array
              items:
                type: object
                required:
                  - question_text
                  - question_type
                  - correct_answer
    """
    user = get_current_user()
    data = request.get_json(silent=True) or {}
    
    exam = ExamService.create_exam(
        creator_id=user.id,
        title=data.get("title"),
        description=data.get("description", ""),
        time_limit=int(data.get("time_limit", 60)),
        questions_data=data.get("questions") or [],
        document_id=data.get("document_id")
    )

    return jsonify({
        "success": True,
        "message": "Assignment created successfully",
        "data": exam.to_dict(include_questions=True)
    }), 201


@teacher_bp.route("/exams", methods=["GET"])
@role_required("teacher", "admin")
def list_teacher_exams():
    """List exams created by the authenticated teacher"""
    user = get_current_user()
    query = Exam.query.filter_by(created_by=user.id).order_by(Exam.created_at.desc())
    result = paginate_query(query, serialize_fn=lambda e: e.to_dict(include_questions=False))
    return jsonify({"success": True, "data": result}), 200


@teacher_bp.route("/exams/<int:exam_id>", methods=["GET"])
@role_required("teacher", "admin")
def get_teacher_exam(exam_id):
    """Get full details of an exam created by the teacher"""
    user = get_current_user()
    exam = db.session.get(Exam, exam_id)
    if not exam:
        raise NotFoundError("Exam not found")
    if exam.created_by != user.id and user.role != "admin":
        raise ForbiddenError("You can only access exams you created")

    return jsonify({
        "success": True,
        "data": exam.to_dict(include_questions=True, is_student=False)
    }), 200


@teacher_bp.route("/assign-to-students", methods=["POST"])
@role_required("teacher", "admin")
def assign_to_students():
    """Assign an exam to selected students or cohorts"""
    user = get_current_user()
    data = request.get_json(silent=True) or {}
    exam_id = data.get("exam_id")
    student_ids = data.get("student_ids") or []
    cohort_id = data.get("cohort_id")

    if not exam_id:
        raise ValidationError("exam_id is required", details={"field": "exam_id"})

    if cohort_id:
        cohort = db.session.get(Cohort, cohort_id)
        if not cohort or (cohort.teacher_id != user.id and user.role != "admin"):
            raise NotFoundError("Cohort not found or access denied")
        member_ids = [m.student_id for m in cohort.members]
        student_ids = list(set(student_ids + member_ids))

    assigned = ExamService.assign_exam_to_students(exam_id, user.id, student_ids)
    return jsonify({
        "success": True,
        "message": f"Exam assigned to {assigned} student(s)",
        "assignments_created": assigned
    }), 200


@teacher_bp.route("/pending-evaluations", methods=["GET"])
@role_required("teacher", "admin")
def pending_evaluations():
    """List student submissions awaiting subjective grading"""
    user = get_current_user()
    # Find all attempts for exams created by this teacher where status is 'completed' (awaiting evaluation)
    query = StudentExam.query.join(Exam).filter(
        Exam.created_by == user.id,
        StudentExam.status.in_(["completed", "evaluated"])
    ).order_by(StudentExam.submitted_at.desc())

    def serialize_pending(item):
        d = item.to_dict(include_exam=True)
        unverified = sum(1 for a in item.answers if not a.is_verified)
        d["unverified_count"] = unverified
        return d

    result = paginate_query(query, serialize_fn=serialize_pending)
    return jsonify({"success": True, "data": result}), 200


@teacher_bp.route("/submissions/<int:attempt_id>", methods=["GET"])
@role_required("teacher", "admin")
def get_submission_for_evaluation(attempt_id):
    """Get submission details with model answers and student answers for grading"""
    user = get_current_user()
    student_exam = db.session.get(StudentExam, attempt_id)
    if not student_exam:
        raise NotFoundError("Submission not found")
    if student_exam.exam.created_by != user.id and user.role != "admin":
        raise ForbiddenError("You can only grade submissions for exams you created")

    return jsonify({
        "success": True,
        "data": student_exam.to_dict(include_exam=True, include_answers=True)
    }), 200


@teacher_bp.route("/evaluate-answer", methods=["POST"])
@role_required("teacher", "admin")
def evaluate_answer():
    """Submit teacher grade score and feedback for a student answer"""
    user = get_current_user()
    data = request.get_json(silent=True) or {}
    answer_id = data.get("answer_id")
    score = data.get("score")
    feedback = data.get("feedback", "")

    if answer_id is None or score is None:
        raise ValidationError("answer_id and score are required")

    result = ExamService.evaluate_answer(
        teacher_id=user.id,
        answer_id=int(answer_id),
        score=int(score),
        feedback=feedback
    )
    return jsonify({
        "success": True,
        "message": "Answer evaluated successfully",
        "data": result
    }), 200


@teacher_bp.route("/exam-overview/<int:exam_id>", methods=["GET"])
@role_required("teacher", "admin")
def exam_overview(exam_id):
    """Get class overview and question accuracy statistics"""
    user = get_current_user()
    overview = ExamService.get_exam_overview(exam_id, user.id)
    return jsonify({"success": True, "data": overview}), 200


@teacher_bp.route("/question-analytics/<int:exam_id>/<int:question_id>", methods=["GET"])
@role_required("teacher", "admin")
def question_analytics(exam_id, question_id):
    """Get detailed question failure rate and answer distribution"""
    user = get_current_user()
    analytics = ExamService.get_question_analytics(exam_id, question_id, user.id)
    return jsonify({"success": True, "data": analytics}), 200


# Cohort Management
@teacher_bp.route("/cohorts", methods=["POST"])
@role_required("teacher", "admin")
def create_cohort():
    """Create a new student cohort / class section"""
    user = get_current_user()
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        raise ValidationError("Cohort name is required", details={"field": "name"})

    cohort = Cohort(
        name=name,
        description=data.get("description", ""),
        teacher_id=user.id
    )
    db.session.add(cohort)
    db.session.commit()
    return jsonify({"success": True, "data": cohort.to_dict()}), 201


@teacher_bp.route("/cohorts", methods=["GET"])
@role_required("teacher", "admin")
def list_cohorts():
    """List teacher cohorts"""
    user = get_current_user()
    cohorts = Cohort.query.filter_by(teacher_id=user.id).order_by(Cohort.created_at.desc()).all()
    return jsonify({"success": True, "data": [c.to_dict() for c in cohorts]}), 200


@teacher_bp.route("/cohorts/<int:cohort_id>/members", methods=["POST"])
@role_required("teacher", "admin")
def add_cohort_members(cohort_id):
    """Add student IDs to cohort"""
    user = get_current_user()
    cohort = db.session.get(Cohort, cohort_id)
    if not cohort or (cohort.teacher_id != user.id and user.role != "admin"):
        raise NotFoundError("Cohort not found")

    data = request.get_json(silent=True) or {}
    student_ids = data.get("student_ids") or []
    added = 0
    for s_id in student_ids:
        if not CohortMember.query.filter_by(cohort_id=cohort.id, student_id=s_id).first():
            db.session.add(CohortMember(cohort_id=cohort.id, student_id=s_id))
            added += 1

    db.session.commit()
    return jsonify({"success": True, "added_count": added}), 200

