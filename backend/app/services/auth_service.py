import re
from datetime import datetime
from flask_jwt_extended import create_access_token, create_refresh_token
from app.extensions import db
from app.models.user import User, UserStats, UserActivity
from app.middleware.error_handlers import ValidationError, UnauthorizedError

EMAIL_REGEX = re.compile(r"^[\w\.-]+@[\w\.-]+\.\w+$")

class AuthService:
    @staticmethod
    def register_user(username: str, email: str, password: str, role: str = "student") -> dict:
        username = (username or "").strip()
        email = (email or "").strip().lower()
        password = password or ""
        role = (role or "student").strip().lower()

        if not username or len(username) < 3:
            raise ValidationError("Username must be at least 3 characters long", details={"field": "username"})

        if not re.match(r"^[a-zA-Z0-9_]+$", username):
            raise ValidationError("Username can only contain alphanumeric characters and underscores", details={"field": "username"})

        if not email or not EMAIL_REGEX.match(email):
            raise ValidationError("A valid email address is required", details={"field": "email"})

        if not password or len(password) < 6:
            raise ValidationError("Password must be at least 6 characters long", details={"field": "password"})

        if role not in ("teacher", "student", "admin"):
            raise ValidationError("Role must be 'teacher', 'student', or 'admin'", details={"field": "role"})

        # Check existing user
        if User.query.filter_by(username=username).first():
            raise ValidationError("Username is already taken", details={"field": "username"})

        if User.query.filter_by(email=email).first():
            raise ValidationError("Email is already registered", details={"field": "email"})

        # Create user
        user = User(
            username=username,
            email=email,
            role=role,
            is_online=True,
            last_active=datetime.utcnow()
        )
        user.set_password(password)
        db.session.add(user)
        db.session.flush()

        # Initialize UserStats
        stats = UserStats(user_id=user.id)
        db.session.add(stats)

        # Log registration activity
        activity = UserActivity(
            user_id=user.id,
            activity_type="register",
            description=f"User registered with role: {role}"
        )
        db.session.add(activity)
        db.session.commit()

        # Generate tokens (identity is stringified user.id)
        access_token = create_access_token(identity=str(user.id), additional_claims={"role": user.role, "username": user.username})
        refresh_token = create_refresh_token(identity=str(user.id))

        return {
            "user": user.to_dict(),
            "access_token": access_token,
            "refresh_token": refresh_token
        }

    @staticmethod
    def login_user(username_or_email: str, password: str) -> dict:
        identifier = (username_or_email or "").strip()
        password = password or ""

        if not identifier or not password:
            raise ValidationError("Username/email and password are required")

        user = User.query.filter(
            (User.username == identifier) | (User.email == identifier.lower())
        ).first()

        if not user or not user.check_password(password):
            raise UnauthorizedError("Invalid credentials provided")

        user.is_online = True
        user.last_active = datetime.utcnow()

        activity = UserActivity(
            user_id=user.id,
            activity_type="login",
            description="User logged into the platform"
        )
        db.session.add(activity)
        db.session.commit()

        access_token = create_access_token(identity=str(user.id), additional_claims={"role": user.role, "username": user.username})
        refresh_token = create_refresh_token(identity=str(user.id))

        return {
            "user": user.to_dict(),
            "access_token": access_token,
            "refresh_token": refresh_token
        }

    @staticmethod
    def refresh_access_token(user_id: int) -> dict:
        user = db.session.get(User, user_id)
        if not user:
            raise UnauthorizedError("User does not exist")

        access_token = create_access_token(identity=str(user.id), additional_claims={"role": user.role, "username": user.username})
        return {
            "access_token": access_token
        }
