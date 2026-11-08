from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.exam import StudentExam
from app.middleware.auth_guards import get_current_user, role_required
from app.middleware.error_handlers import ValidationError, NotFoundError, ForbiddenError
from app.services.exam_service import ExamService
from app.utils.pagination import paginate_query

student_bp = Blueprint("student", __name__, url_prefix="/student")

@student_bp.route("/my-assignments", methods=["GET"])
@role_required("student", "admin")
def my_assignments():
    """List exams assigned to the authenticated student"""
    user = get_current_user()
    query = StudentExam.query.filter_by(student_id=user.id).order_by(StudentExam.assigned_at.desc())
    result = paginate_query(query, serialize_fn=lambda s: s.to_dict(include_exam=True))
    return jsonify({"success": True, "data": result}), 200


@student_bp.route("/start-exam", methods=["POST"])
@role_required("student", "admin")
def start_exam():
    """
    Start an exam attempt. Starts server timer and returns questions without answer keys.
    """
    user = get_current_user()
    data = request.get_json(silent=True) or {}
    exam_id = data.get("exam_id")
    if not exam_id:
        raise ValidationError("exam_id is required", details={"field": "exam_id"})

    result = ExamService.start_exam(int(exam_id), user.id)
    return jsonify({
        "success": True,
        "message": "Exam started successfully",
        "data": result
    }), 200


@student_bp.route("/save-progress", methods=["POST"])
@role_required("student", "admin")
def save_progress():
    """
    Autosave student answers. Validates that server time limit has not expired.
    """
    user = get_current_user()
    data = request.get_json(silent=True) or {}
    attempt_id = data.get("attempt_id")
    answers = data.get("answers") or []

    if not attempt_id:
        raise ValidationError("attempt_id is required", details={"field": "attempt_id"})

    result = ExamService.save_progress(int(attempt_id), user.id, answers)
    return jsonify({
        "success": True,
        "message": "Progress autosaved successfully",
        "data": result
    }), 200


@student_bp.route("/submit-exam", methods=["POST"])
@role_required("student", "admin")
def submit_exam():
    """
    Submit exam answers. Strictly validates server timer and auto-grades objective items.
    """
    user = get_current_user()
    data = request.get_json(silent=True) or {}
    attempt_id = data.get("attempt_id")
    answers = data.get("answers") or []

    if not attempt_id:
        raise ValidationError("attempt_id is required", details={"field": "attempt_id"})

    result = ExamService.submit_exam(int(attempt_id), user.id, answers)
    return jsonify({
        "success": True,
        "message": "Exam submitted successfully",
        "data": result
    }), 200


@student_bp.route("/my-results", methods=["GET"])
@role_required("student", "admin")
def my_results():
    """List completed/evaluated exams for the student"""
    user = get_current_user()
    query = StudentExam.query.filter(
        StudentExam.student_id == user.id,
        StudentExam.status.in_(["completed", "evaluated"])
    ).order_by(StudentExam.submitted_at.desc())

    result = paginate_query(query, serialize_fn=lambda s: s.to_dict(include_exam=True))
    return jsonify({"success": True, "data": result}), 200


@student_bp.route("/results/<int:attempt_id>", methods=["GET"])
@role_required("student", "admin")
def get_result_detail(attempt_id):
    """Get detailed scorecard for a student's own exam attempt"""
    user = get_current_user()
    student_exam = db.session.get(StudentExam, attempt_id)
    if not student_exam:
        raise NotFoundError("Exam submission not found")

    if student_exam.student_id != user.id and user.role != "admin":
        raise ForbiddenError("Access denied: You can only view your own exam results")

    return jsonify({
        "success": True,
        "data": student_exam.to_dict(include_exam=True, include_answers=True)
    }), 200

