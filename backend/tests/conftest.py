import pytest
from app import create_app
from app.extensions import db
from app.models.user import User, UserStats
from flask_jwt_extended import create_access_token

@pytest.fixture
def app():
    app = create_app("testing")
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def teacher_user(app):
    with app.app_context():
        user = User(
            username="teacher_alice",
            email="alice@school.edu",
            role="teacher",
            is_online=True
        )
        user.set_password("TeacherPass123!")
        db.session.add(user)
        db.session.flush()
        db.session.add(UserStats(user_id=user.id))
        db.session.commit()
        return user.to_dict()

@pytest.fixture
def student_user(app):
    with app.app_context():
        user = User(
            username="student_bob",
            email="bob@school.edu",
            role="student",
            is_online=True
        )
        user.set_password("StudentPass123!")
        db.session.add(user)
        db.session.flush()
        db.session.add(UserStats(user_id=user.id))
        db.session.commit()
        return user.to_dict()

@pytest.fixture
def teacher_headers(app, teacher_user):
    with app.app_context():
        token = create_access_token(
            identity=str(teacher_user["id"]),
            additional_claims={"role": teacher_user["role"], "username": teacher_user["username"]}
        )
        return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def student_headers(app, student_user):
    with app.app_context():
        token = create_access_token(
            identity=str(student_user["id"]),
            additional_claims={"role": student_user["role"], "username": student_user["username"]}
        )
        return {"Authorization": f"Bearer {token}"}

