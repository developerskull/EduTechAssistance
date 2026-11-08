import pytest
from app.extensions import db
from app.models.user import User, UserStats
from flask_jwt_extended import create_access_token

@pytest.fixture
def other_student_headers(app):
    with app.app_context():
        user = User(
            username="other_student",
            email="other@school.edu",
            role="student"
        )
        user.set_password("StudentPass123!")
        db.session.add(user)
        db.session.flush()
        db.session.add(UserStats(user_id=user.id))
        db.session.commit()
        token = create_access_token(identity=str(user.id), additional_claims={"role": "student"})
        return {"Authorization": f"Bearer {token}"}


def test_auto_grading_and_teacher_evaluation(client, teacher_headers, student_headers, student_user, other_student_headers):
    # Step 1: Teacher creates exam with MCQ, True/False, and Short Answer
    exam_payload = {
        "title": "Comprehensive Biology Exam",
        "description": "Cellular biology and genetics",
        "time_limit": 45,
        "questions": [
            {
                "question_text": "What is the powerhouse of the cell?",
                "question_type": "multiple_choice",
                "options": ["A) Nucleus", "B) Mitochondria", "C) Ribosome", "D) Endoplasmic Reticulum"],
                "correct_answer": "B) Mitochondria",
                "points": 1
            },
            {
                "question_text": "DNA is double-stranded.",
                "question_type": "true_false",
                "options": ["True", "False"],
                "correct_answer": "True",
                "points": 1
            },
            {
                "question_text": "Describe the function of ribosomes.",
                "question_type": "short_answer",
                "correct_answer": "Ribosomes synthesize proteins from amino acids by translating mRNA.",
                "points": 3
            }
        ]
    }
    create_res = client.post("/api/v1/teacher/create-assignment", headers=teacher_headers, json=exam_payload)
    assert create_res.status_code == 201
    exam = create_res.get_json()["data"]
    exam_id = exam["id"]
    q1_id = exam["questions"][0]["id"]
    q2_id = exam["questions"][1]["id"]
    q3_id = exam["questions"][2]["id"]

    # Step 2: Assign exam to student
    client.post("/api/v1/teacher/assign-to-students", headers=teacher_headers, json={
        "exam_id": exam_id,
        "student_ids": [student_user["id"]]
    })

    # Step 3: Student starts exam
    start_res = client.post("/api/v1/student/start-exam", headers=student_headers, json={"exam_id": exam_id})
    attempt_id = start_res.get_json()["data"]["attempt_id"]

    # Step 4: Student submits:
    # Q1: B (Correct -> 1 pt)
    # Q2: False (Incorrect -> 0 pt)
    # Q3: Ribosomes make proteins by reading messenger RNA (Subjective -> needs teacher grading)
    submit_payload = {
        "attempt_id": attempt_id,
        "answers": [
            {"question_id": q1_id, "student_answer": "B"},
            {"question_id": q2_id, "student_answer": "False"},
            {"question_id": q3_id, "student_answer": "Ribosomes make proteins by reading messenger RNA instructions"}
        ]
    }
    submit_res = client.post("/api/v1/student/submit-exam", headers=student_headers, json=submit_payload)
    assert submit_res.status_code == 200
    sub_data = submit_res.get_json()["data"]

    # Auto-grading initial score: 1 out of 5 (1 from Q1, 0 from Q2, Q3 pending)
    assert sub_data["total_score"] == 1
    assert sub_data["max_score"] == 5
    assert sub_data["needs_manual_grading"] is True
    assert sub_data["status"] == "completed"

    # Step 5: Teacher inspects pending evaluations
    pending_res = client.get("/api/v1/teacher/pending-evaluations", headers=teacher_headers)
    assert pending_res.status_code == 200
    pending_items = pending_res.get_json()["data"]["items"]
    assert any(p["id"] == attempt_id for p in pending_items)

    # Step 6: Teacher views submission detail
    sub_detail_res = client.get(f"/api/v1/teacher/submissions/{attempt_id}", headers=teacher_headers)
    assert sub_detail_res.status_code == 200
    answers = sub_detail_res.get_json()["data"]["answers"]
    q3_answer = next(a for a in answers if a["question_id"] == q3_id)
    assert q3_answer["is_verified"] is False
    assert q3_answer["ai_suggested_score"] is not None  # AI pre-score
    assert len(q3_answer["ai_rationale"]) > 0

    # Step 7: Teacher evaluates Q3 (gives 3 pts with feedback)
    eval_res = client.post("/api/v1/teacher/evaluate-answer", headers=teacher_headers, json={
        "answer_id": q3_answer["id"],
        "score": 3,
        "feedback": "Great explanation of protein synthesis!"
    })
    assert eval_res.status_code == 200
    eval_data = eval_res.get_json()["data"]
    assert eval_data["score"] == 3
    assert eval_data["is_verified"] is True
    assert eval_data["updated_total_score"] == 4  # 1 from Q1 + 3 from Q3 = 4
    assert eval_data["student_exam_status"] == "evaluated"

    # Step 8: Student views their results
    result_res = client.get(f"/api/v1/student/results/{attempt_id}", headers=student_headers)
    assert result_res.status_code == 200
    res_data = result_res.get_json()["data"]
    assert res_data["total_score"] == 4
    assert res_data["percentage"] == 80.0

    # Step 9: OWNERSHIP CHECK - Another student CANNOT view this student's result!
    unauth_res = client.get(f"/api/v1/student/results/{attempt_id}", headers=other_student_headers)
    assert unauth_res.status_code == 403
    assert unauth_res.get_json()["error"]["code"] == "FORBIDDEN"

