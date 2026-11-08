from flask import jsonify
from app.extensions import jwt

class APIError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400, details=None):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details

    def to_dict(self):
        err = {"code": self.code, "message": self.message}
        if self.details is not None:
            err["details"] = self.details
        return {"error": err}


class UnauthorizedError(APIError):
    def __init__(self, message="Authentication required", code="UNAUTHORIZED"):
        super().__init__(code=code, message=message, status_code=401)


class ForbiddenError(APIError):
    def __init__(self, message="You do not have permission to access this resource", code="FORBIDDEN"):
        super().__init__(code=code, message=message, status_code=403)


class NotFoundError(APIError):
    def __init__(self, message="Requested resource not found", code="NOT_FOUND"):
        super().__init__(code=code, message=message, status_code=404)


class ValidationError(APIError):
    def __init__(self, message="Invalid request parameters", details=None):
        super().__init__(code="VALIDATION_ERROR", message=message, status_code=400, details=details)


def make_error_response(code: str, message: str, status_code: int = 400, details=None):
    payload = {"error": {"code": code, "message": message}}
    if details is not None:
        payload["error"]["details"] = details
    return jsonify(payload), status_code


def register_error_handlers(app):
    @app.errorhandler(APIError)
    def handle_api_error(error):
        return jsonify(error.to_dict()), error.status_code

    @app.errorhandler(400)
    def handle_bad_request(error):
        return make_error_response("BAD_REQUEST", str(error.description) if hasattr(error, 'description') else "Bad request", 400)

    @app.errorhandler(401)
    def handle_unauthorized(error):
        return make_error_response("UNAUTHORIZED", "Authentication required", 401)

    @app.errorhandler(403)
    def handle_forbidden(error):
        return make_error_response("FORBIDDEN", "You do not have permission to access this resource", 403)

    @app.errorhandler(404)
    def handle_not_found(error):
        return make_error_response("NOT_FOUND", "The requested resource was not found", 404)

    @app.errorhandler(405)
    def handle_method_not_allowed(error):
        return make_error_response("METHOD_NOT_ALLOWED", "HTTP method is not allowed for this endpoint", 405)

    @app.errorhandler(413)
    def handle_file_too_large(error):
        return make_error_response("FILE_TOO_LARGE", "File exceeds the maximum allowed size (10 MB)", 413)

    @app.errorhandler(429)
    def handle_rate_limit_exceeded(error):
        return make_error_response("RATE_LIMIT_EXCEEDED", "Too many requests. Please slow down.", 429)

    @app.errorhandler(500)
    def handle_internal_server_error(error):
        return make_error_response("INTERNAL_ERROR", "An unexpected internal server error occurred", 500)

    # JWT Specific Callbacks for uniform error formatting
    @jwt.unauthorized_loader
    def custom_unauthorized_response(callback):
        return make_error_response("UNAUTHORIZED", f"Missing or invalid authentication token: {callback}", 401)

    @jwt.invalid_token_loader
    def custom_invalid_token_response(callback):
        return make_error_response("INVALID_TOKEN", f"Token verification failed: {callback}", 401)

    @jwt.expired_token_loader
    def custom_expired_token_response(jwt_header, jwt_payload):
        return make_error_response("TOKEN_EXPIRED", "The provided authentication token has expired. Please refresh your session.", 401)

    @jwt.revoked_token_loader
    def custom_revoked_token_response(jwt_header, jwt_payload):
        return make_error_response("TOKEN_REVOKED", "The token has been revoked", 401)
