import json

def test_health_check(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"
    assert data["service"] == "EduTechAssistance REST API"
    assert "version" in data


def test_register_teacher(client):
    payload = {
        "username": "prof_clark",
        "email": "clark@university.edu",
        "password": "Password123!",
        "role": "teacher"
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["user"]["username"] == "prof_clark"
    assert data["data"]["user"]["role"] == "teacher"
    assert "access_token" in data["data"]
    assert "refresh_token" in data["data"]


def test_register_student(client):
    payload = {
        "username": "student_eva",
        "email": "eva@university.edu",
        "password": "Password123!",
        "role": "student"
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["user"]["role"] == "student"


def test_register_duplicate_username(client, teacher_user):
    payload = {
        "username": teacher_user["username"],  # Already registered
        "email": "new_email@school.edu",
        "password": "Password123!",
        "role": "student"
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 400
    data = res.get_json()
    assert "error" in data
    assert data["error"]["code"] == "VALIDATION_ERROR"


def test_register_duplicate_email(client, teacher_user):
    payload = {
        "username": "completely_unique_name",
        "email": teacher_user["email"],  # Already registered
        "password": "Password123!",
        "role": "student"
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 400
    data = res.get_json()
    assert "error" in data
    assert data["error"]["code"] == "VALIDATION_ERROR"


def test_login_success_with_username(client, teacher_user):
    payload = {
        "username_or_email": teacher_user["username"],
        "password": "TeacherPass123!"
    }
    res = client.post("/api/v1/auth/login", json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["user"]["email"] == teacher_user["email"]
    assert "access_token" in data["data"]


def test_login_success_with_email(client, teacher_user):
    payload = {
        "username_or_email": teacher_user["email"],
        "password": "TeacherPass123!"
    }
    res = client.post("/api/v1/auth/login", json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True


def test_login_invalid_password(client, teacher_user):
    payload = {
        "username_or_email": teacher_user["username"],
        "password": "WrongPassword!"
    }
    res = client.post("/api/v1/auth/login", json=payload)
    assert res.status_code == 401
    data = res.get_json()
    assert "error" in data
    assert data["error"]["code"] == "UNAUTHORIZED"


def test_get_me_profile(client, teacher_headers, teacher_user):
    res = client.get("/api/v1/auth/me", headers=teacher_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["user"]["id"] == teacher_user["id"]
    assert data["data"]["user"]["username"] == teacher_user["username"]
    assert "stats" in data["data"]


def test_get_me_unauthorized(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401
    data = res.get_json()
    assert "error" in data
    assert data["error"]["code"] == "UNAUTHORIZED"


def test_refresh_token(client):
    # Register to get refresh token
    payload = {
        "username": "refresh_user",
        "email": "refresh@school.edu",
        "password": "Password123!",
        "role": "student"
    }
    reg_res = client.post("/api/v1/auth/register", json=payload)
    refresh_token = reg_res.get_json()["data"]["refresh_token"]

    res = client.post("/api/v1/auth/refresh", headers={"Authorization": f"Bearer {refresh_token}"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "access_token" in data["data"]

