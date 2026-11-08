import os
from flask import Flask, jsonify, redirect
from app.config import config_by_name
from app.extensions import db, migrate, jwt, bcrypt, cors, limiter, swagger
from app.middleware.error_handlers import register_error_handlers
from app.api import api_v1

def create_app(config_name=None):
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)
    config_obj = config_by_name.get(config_name, config_by_name["default"])
    app.config.from_object(config_obj)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, origins=app.config.get("CORS_ORIGINS", "*"), supports_credentials=True)
    limiter.init_app(app)
    swagger.init_app(app)

    # Register standardized error handlers
    register_error_handlers(app)

    # Register API v1 blueprint
    app.register_blueprint(api_v1)

    # Legacy / convenience compatibility endpoints
    @app.route("/api/health", methods=["GET", "OPTIONS"])
    def legacy_health():
        from app.api.health import health_check
        return health_check()

    @app.route("/api/test-connection", methods=["GET", "OPTIONS"])
    def legacy_test_connection():
        from app.api.health import test_connection
        return test_connection()

    @app.route("/api/dashboard", methods=["GET", "OPTIONS"])
    @app.route("/api/v1/dashboard", methods=["GET", "OPTIONS"])
    def legacy_dashboard():
        from flask import request
        user_id = request.args.get("user_id", 1)
        return jsonify({
            "success": True,
            "data": {
                "user_id": user_id,
                "stats": {
                    "total_questions_generated": 12,
                    "total_study_materials": 5,
                    "total_chat_sessions": 8,
                    "exams_completed": 3
                },
                "activities": [
                    {"activity_type": "exam_created", "description": "Created Python Quiz", "timestamp": "2026-11-08T18:00:00Z"},
                    {"activity_type": "study_generated", "description": "Generated study guide for Algorithms", "timestamp": "2026-11-08T17:30:00Z"}
                ]
            }
        })

    @app.route("/")
    def index():
        return jsonify({
            "service": "EduTechAssistance Backend API",
            "version": "1.0.0",
            "status": "operational",
            "docs": "/api/v1/docs",
            "endpoints": "/api/v1"
        })

    # Ensure uploads directory exists
    os.makedirs(app.config.get("UPLOAD_FOLDER", "uploads"), exist_ok=True)

    # Automatically create tables in development and test environments
    if app.config.get("TESTING") or app.config.get("DEBUG"):
        with app.app_context():
            db.create_all()

    return app

