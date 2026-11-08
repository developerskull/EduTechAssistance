from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.auth_service import AuthService
from app.middleware.auth_guards import get_current_user
from app.middleware.error_handlers import ValidationError
from app.extensions import db

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user (teacher or student)
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - username
            - email
            - password
            - role
          properties:
            username:
              type: string
              example: prof_smith
            email:
              type: string
              example: prof_smith@university.edu
            password:
              type: string
              example: SecretPass123!
            role:
              type: string
              enum: [teacher, student, admin]
              example: teacher
    responses:
      201:
        description: User registered successfully
      400:
        description: Validation error
    """
    data = request.get_json(silent=True) or {}
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "student")

    result = AuthService.register_user(username, email, password, role)
    return jsonify({
        "success": True,
        "message": "User registered successfully",
        "data": result
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticate user and return JWT access and refresh tokens
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - username_or_email
            - password
          properties:
            username_or_email:
              type: string
              example: prof_smith
            password:
              type: string
              example: SecretPass123!
    responses:
      200:
        description: Authentication successful
      401:
        description: Invalid credentials
    """
    data = request.get_json(silent=True) or {}
    identifier = data.get("username_or_email") or data.get("username") or data.get("email")
    password = data.get("password")

    result = AuthService.login_user(identifier, password)
    return jsonify({
        "success": True,
        "message": "Login successful",
        "data": result
    }), 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """
    Refresh access token using valid refresh token
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: New access token generated
      401:
        description: Invalid or expired refresh token
    """
    identity = get_jwt_identity()
    result = AuthService.refresh_access_token(int(identity))
    return jsonify({
        "success": True,
        "message": "Token refreshed successfully",
        "data": result
    }), 200


@auth_bp.route("/me", methods=["GET"])
def get_profile():
    """
    Get current user profile derived strictly from JWT identity
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: Current user profile
      401:
        description: Missing or invalid token
    """
    user = get_current_user()
    stats = user.stats.to_dict() if user.stats else None
    return jsonify({
        "success": True,
        "data": {
            "user": user.to_dict(),
            "stats": stats
        }
    }), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """
    Logout current user
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: Logged out successfully
    """
    user = get_current_user()
    user.is_online = False
    db.session.commit()
    return jsonify({
        "success": True,
        "message": "Logged out successfully"
    }), 200

