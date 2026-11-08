from functools import wraps
from flask import g, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from app.extensions import db
from app.models.user import User
from app.middleware.error_handlers import UnauthorizedError, ForbiddenError

def get_current_user() -> User:
    """
    Extracts user identity strictly from the verified JWT token.
    Never accepts teacher_id / student_id / user_id from query params or body.
    """
    verify_jwt_in_request()
    identity = get_jwt_identity()
    if not identity:
        raise UnauthorizedError("Invalid or missing authentication token")
    
    # Identity in JWT is user.id (integer or string representation of integer)
    try:
        user_id = int(identity)
    except (ValueError, TypeError):
        raise UnauthorizedError("Malformed authentication token identity")
    
    user = db.session.get(User, user_id)
    if not user:
        raise UnauthorizedError("User associated with this token no longer exists")
    
    g.current_user = user
    return user


def role_required(*allowed_roles):
    """
    Decorator enforcing that the authenticated user possesses one of the allowed roles.
    Admins are always allowed access.
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = get_current_user()
            if user.role != "admin" and user.role not in allowed_roles:
                raise ForbiddenError(f"Access restricted to roles: {', '.join(allowed_roles)}")
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def verify_exam_ownership(exam, user: User):
    """
    Enforces that a teacher can only access or modify their own exams.
    """
    if user.role == "admin":
        return
    if exam.created_by != user.id:
        raise ForbiddenError("Access denied: You can only view and manage your own exams.")


def verify_attempt_ownership(student_exam, user: User):
    """
    Enforces that a student can only view/modify their own attempts,
    and a teacher can only view/evaluate attempts for exams they created.
    """
    if user.role == "admin":
        return
    if user.role == "student" and student_exam.student_id != user.id:
        raise ForbiddenError("Access denied: You can only view your own exam submissions.")
    if user.role == "teacher" and student_exam.exam.created_by != user.id:
        raise ForbiddenError("Access denied: You can only evaluate submissions for your own exams.")
