import pytest
from flask import Blueprint, jsonify, request
from app.middleware.auth_guards import role_required, get_current_user

# Create a test blueprint to thoroughly test role decorators
test_bp = Blueprint("test_roles", __name__, url_prefix="/api/v1/test-roles")

@test_bp.route("/teacher-only", methods=["GET"])
@role_required("teacher")
def teacher_only():
    user = get_current_user()
    return jsonify({"success": True, "user_id": user.id, "role": user.role})


@test_bp.route("/student-only", methods=["GET"])
@role_required("student")
def student_only():
    user = get_current_user()
    return jsonify({"success": True, "user_id": user.id, "role": user.role})


@test_bp.route("/identity-check", methods=["POST"])
@role_required("teacher", "student")
def identity_check():
    user = get_current_user()
    # Notice: we ignore any user_id or teacher_id provided in query or body
    return jsonify({
        "success": True,
        "derived_user_id": user.id,
        "derived_role": user.role
    })


def test_teacher_can_access_teacher_route(app, client, teacher_headers, teacher_user):
    app.register_blueprint(test_bp)
    res = client.get("/api/v1/test-roles/teacher-only", headers=teacher_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["user_id"] == teacher_user["id"]
    assert data["role"] == "teacher"


def test_student_forbidden_from_teacher_route(app, client, student_headers):
    # Blueprint might already be registered
    if "test_roles" not in app.blueprints:
        app.register_blueprint(test_bp)
    res = client.get("/api/v1/test-roles/teacher-only", headers=student_headers)
    assert res.status_code == 403
    data = res.get_json()
    assert "error" in data
    assert data["error"]["code"] == "FORBIDDEN"


def test_teacher_forbidden_from_student_route(app, client, teacher_headers):
    if "test_roles" not in app.blueprints:
        app.register_blueprint(test_bp)
    res = client.get("/api/v1/test-roles/student-only", headers=teacher_headers)
    assert res.status_code == 403
    data = res.get_json()
    assert "error" in data
    assert data["error"]["code"] == "FORBIDDEN"


def test_identity_cannot_be_spoofed_in_query_or_body(app, client, student_headers, student_user, teacher_user):
    if "test_roles" not in app.blueprints:
        app.register_blueprint(test_bp)
    
    # Student attempts to claim they are the teacher by passing teacher_id in query and body
    res = client.post(
        f"/api/v1/test-roles/identity-check?teacher_id={teacher_user['id']}&user_id={teacher_user['id']}",
        headers=student_headers,
        json={"teacher_id": teacher_user["id"], "user_id": teacher_user["id"], "role": "teacher"}
    )
    assert res.status_code == 200
    data = res.get_json()
    # Derived identity MUST STILL BE the student from the JWT!
    assert data["derived_user_id"] == student_user["id"]
    assert data["derived_role"] == "student"
    assert data["derived_user_id"] != teacher_user["id"]

