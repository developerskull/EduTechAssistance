from datetime import datetime, timedelta
from app.extensions import db
from app.models.exam import Exam, Question, StudentExam

def test_exam_start_and_timer_calculation(client, teacher_headers, student_headers, student_user):
    # Step 1: Teacher creates an exam with 30 min time limit
    payload = {
        "title": "Algorithms 101 Quiz",
        "description": "Short quiz on complexity",
        "time_limit": 30,
        "questions": [
            {
                "question_text": "What is the time complexity of binary search?",
                "question_type": "multiple_choice",
                "options": ["A) O(n)", "B) O(log n)", "C) O(n^2)", "D) O(1)"],
                "correct_answer": "B) O(log n)",
                "points": 2
            }
        ]
    }
    create_res = client.post("/api/v1/teacher/create-assignment", headers=teacher_headers, json=payload)
    assert create_res.status_code == 201
    exam_id = create_res.get_json()["data"]["id"]

    # Step 2: Teacher assigns to student
    assign_res = client.post("/api/v1/teacher/assign-to-students", headers=teacher_headers, json={
        "exam_id": exam_id,
        "student_ids": [student_user["id"]]
    })
    assert assign_res.status_code == 200

    # Step 3: Student starts exam
    start_res = client.post("/api/v1/student/start-exam", headers=student_headers, json={"exam_id": exam_id})
    assert start_res.status_code == 200
    start_data = start_res.get_json()["data"]
    attempt_id = start_data["attempt_id"]
    assert start_data["status"] == "in_progress"
    assert start_data["time_limit_minutes"] == 30
    assert 1700 <= start_data["remaining_seconds"] <= 1800  # ~30 minutes left

    # Questions returned must NOT leak the correct answer to student!
    assert "correct_answer" not in start_data["questions"][0]

    # Step 4: Student autosaves progress
    save_res = client.post("/api/v1/student/save-progress", headers=student_headers, json={
        "attempt_id": attempt_id,
        "answers": [{"question_id": start_data["questions"][0]["id"], "answer_text": "B"}]
    })
    assert save_res.status_code == 200
    assert save_res.get_json()["data"]["saved_count"] == 1


def test_server_side_timer_rejects_late_submission(app, client, teacher_headers, student_headers, student_user):
    # Teacher creates 15-minute exam
    payload = {
        "title": "Speed Coding Exam",
        "time_limit": 15,
        "questions": [
            {
                "question_text": "Quick question?",
                "question_type": "true_false",
                "options": ["True", "False"],
                "correct_answer": "True",
                "points": 1
            }
        ]
    }
    create_res = client.post("/api/v1/teacher/create-assignment", headers=teacher_headers, json=payload)
    exam_id = create_res.get_json()["data"]["id"]

    # Assign and start
    client.post("/api/v1/teacher/assign-to-students", headers=teacher_headers, json={
        "exam_id": exam_id,
        "student_ids": [student_user["id"]]
    })
    start_res = client.post("/api/v1/student/start-exam", headers=student_headers, json={"exam_id": exam_id})
    attempt_id = start_res.get_json()["data"]["attempt_id"]

    # SIMULATE TIME PASSING ON SERVER:
    # Set started_at to 2 hours ago (way past 15-minute limit)
    with app.app_context():
        se = db.session.get(StudentExam, attempt_id)
        se.started_at = datetime.utcnow() - timedelta(hours=2)
        db.session.commit()

    # Student attempts to submit late
    submit_res = client.post("/api/v1/student/submit-exam", headers=student_headers, json={
        "attempt_id": attempt_id,
        "answers": [{"question_id": start_res.get_json()["data"]["questions"][0]["id"], "answer_text": "True"}]
    })

    # Server MUST strictly reject late submission!
    assert submit_res.status_code == 400
    err_data = submit_res.get_json()
    assert err_data["error"]["code"] == "VALIDATION_ERROR"
    assert "expired" in err_data["error"]["message"].lower()

