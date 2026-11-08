from flask import Blueprint
from app.api.auth import auth_bp
from app.api.health import health_bp
from app.api.ai import ai_bp
from app.api.teacher import teacher_bp
from app.api.student import student_bp

api_v1 = Blueprint("api_v1", __name__, url_prefix="/api/v1")

# Register component sub-blueprints
api_v1.register_blueprint(auth_bp)
api_v1.register_blueprint(health_bp)
api_v1.register_blueprint(ai_bp)
api_v1.register_blueprint(teacher_bp)
api_v1.register_blueprint(student_bp)

# Export blueprint
__all__ = ["api_v1"]
