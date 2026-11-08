from datetime import datetime
from flask import Blueprint, jsonify
from app.extensions import db

health_bp = Blueprint("health", __name__)

@health_bp.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint
    ---
    tags:
      - System
    responses:
      200:
        description: System health status
        schema:
          type: object
          properties:
            status:
              type: string
              example: healthy
            service:
              type: string
              example: EduTechAssistance REST API
            version:
              type: string
              example: 1.0.0
            database:
              type: string
              example: connected
            timestamp:
              type: string
    """
    db_status = "connected"
    try:
        db.session.execute(db.text("SELECT 1"))
    except Exception as e:
        db_status = f"unreachable: {str(e)}"

    return jsonify({
        "status": "healthy" if db_status == "connected" else "degraded",
        "service": "EduTechAssistance REST API",
        "version": "1.0.0",
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat()
    }), 200


@health_bp.route("/test-connection", methods=["GET"])
def test_connection():
    """
    Connectivity test endpoint
    ---
    tags:
      - System
    responses:
      200:
        description: Connection verified
    """
    return jsonify({
        "success": True,
        "message": "Connection to EduTechAssistance API successful",
        "timestamp": datetime.utcnow().isoformat()
    }), 200

