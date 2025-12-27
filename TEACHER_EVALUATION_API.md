# 👨‍🏫 Teacher Assignment & Evaluation API

## Overview

This API allows teachers to create assignments, assign them to students, and evaluate student submissions. Students can view their assignments, take exams, and see their results.

## Features

✅ **Teacher Features:**
- Create assignments with multiple questions
- Assign exams to specific students
- View pending evaluations
- Grade student submissions
- Provide feedback on answers
- Auto-grading for multiple choice and true/false

✅ **Student Features:**
- View assigned exams
- Start and complete exams
- Submit answers
- View results and feedback
- Track completion status

## API Endpoints

### 1. Create Assignment (Teacher)

**POST** `/api/teacher/create-assignment`

Create a new exam/assignment with questions.

**Request Body:**
```json
{
  "teacher_id": 1,
  "title": "Python Basics Quiz",
  "description": "Test your knowledge of Python fundamentals",
  "time_limit": 60,
  "questions": [
    {
      "question": "What is a variable in Python?",
      "type": "multiple_choice",
      "options": ["A storage location", "A function", "A loop", "A class"],
      "correct_answer": "A",
      "points": 1
    },
    {
      "question": "Python is case-sensitive",
      "type": "true_false",
      "correct_answer": "True",
      "points": 1
    },
    {
      "question": "Explain the difference between lists and tuples",
      "type": "short_answer",
      "correct_answer": "Lists are mutable while tuples are immutable",
      "points": 2
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "exam": {
    "id": 1,
    "title": "Python Basics Quiz",
    "description": "Test your knowledge of Python fundamentals",
    "created_by": 1,
    "time_limit": 60,
    "questions_count": 3
  },
  "message": "Assignment created successfully"
}
```

---

### 2. Assign to Students (Teacher)

**POST** `/api/teacher/assign-to-students`

Assign an exam to specific students.

**Request Body:**
```json
{
  "teacher_id": 1,
  "exam_id": 1,
  "student_ids": [2, 3, 4, 5]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Exam assigned to 4 student(s)",
  "assignments_created": 4
}
```

---

### 3. Get Student Assignments (Student)

**GET** `/api/student/my-assignments?student_id=2`

Get all assignments for a student.

**Response:**
```json
{
  "success": true,
  "assignments": [
    {
      "assignment_id": 1,
      "exam": {
        "id": 1,
        "title": "Python Basics Quiz",
        "description": "Test your knowledge of Python fundamentals",
        "time_limit": 60,
        "questions_count": 3
      },
      "assigned_at": "2025-12-26T10:00:00",
      "is_completed": false,
      "status": "pending"
    }
  ],
  "total": 1
}
```

---

### 4. Start Exam (Student)

**POST** `/api/student/start-exam`

Student starts an exam attempt.

**Request Body:**
```json
{
  "student_id": 2,
  "exam_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "attempt_id": 1,
  "exam": {
    "id": 1,
    "title": "Python Basics Quiz",
    "time_limit": 60
  },
  "questions": [
    {
      "id": 1,
      "question_text": "What is a variable in Python?",
      "question_type": "multiple_choice",
      "options": ["A storage location", "A function", "A loop", "A class"],
      "points": 1
    }
  ],
  "time_limit": 60
}
```

---

### 5. Submit Exam (Student)

**POST** `/api/student/submit-exam`

Student submits exam answers.

**Request Body:**
```json
{
  "attempt_id": 1,
  "answers": [
    {
      "question_id": 1,
      "answer_text": "A"
    },
    {
      "question_id": 2,
      "answer_text": "True"
    },
    {
      "question_id": 3,
      "answer_text": "Lists are mutable and can be changed after creation, while tuples are immutable and cannot be modified."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "attempt": {
    "id": 1,
    "total_score": 2,
    "max_score": 4,
    "percentage": 50,
    "is_completed": true
  },
  "message": "Exam submitted successfully",
  "needs_manual_grading": true
}
```

**Note:** Multiple choice and true/false questions are auto-graded. Short answer questions need teacher evaluation.

---

### 6. Get Pending Evaluations (Teacher)

**GET** `/api/teacher/pending-evaluations?teacher_id=1`

Get all student submissions that need evaluation.

**Response:**
```json
{
  "success": true,
  "pending_evaluations": [
    {
      "attempt_id": 1,
      "exam_title": "Python Basics Quiz",
      "student_name": "john_doe",
      "student_id": 2,
      "submitted_at": "2025-12-26T11:30:00",
      "total_questions": 3,
      "unverified_count": 1,
      "current_score": 2,
      "max_score": 4
    }
  ],
  "total": 1
}
```

---

### 7. Get Submission Details (Teacher)

**GET** `/api/teacher/get-submission/1?teacher_id=1`

Get detailed submission for evaluation.

**Response:**
```json
{
  "success": true,
  "submission": {
    "attempt_id": 1,
    "exam_title": "Python Basics Quiz",
    "student": {
      "id": 2,
      "name": "john_doe",
      "email": "john@example.com"
    },
    "submitted_at": "2025-12-26T11:30:00",
    "total_score": 2,
    "max_score": 4,
    "percentage": 50,
    "answers": [
      {
        "answer_id": 1,
        "question": {
          "id": 1,
          "text": "What is a variable in Python?",
          "type": "multiple_choice",
          "correct_answer": "A",
          "points": 1
        },
        "student_answer": "A",
        "score": 1,
        "is_verified": true,
        "feedback": null
      },
      {
        "answer_id": 3,
        "question": {
          "id": 3,
          "text": "Explain the difference between lists and tuples",
          "type": "short_answer",
          "correct_answer": "Lists are mutable while tuples are immutable",
          "points": 2
        },
        "student_answer": "Lists are mutable and can be changed...",
        "score": 0,
        "is_verified": false,
        "feedback": null
      }
    ]
  }
}
```

---

### 8. Evaluate Answer (Teacher)

**POST** `/api/teacher/evaluate-answer`

Teacher evaluates a student's answer.

**Request Body:**
```json
{
  "teacher_id": 1,
  "answer_id": 3,
  "score": 2,
  "feedback": "Excellent explanation! You clearly understand the difference between mutable and immutable data structures."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Answer evaluated successfully",
  "answer": {
    "id": 3,
    "score": 2,
    "is_verified": true,
    "feedback": "Excellent explanation! You clearly understand..."
  },
  "updated_total_score": 4
}
```

---

### 9. Get Student Results (Student)

**GET** `/api/student/my-results?student_id=2`

Get student's exam results.

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "exam_title": "Python Basics Quiz",
      "submitted_at": "2025-12-26T11:30:00",
      "score": 4,
      "max_score": 4,
      "percentage": 100,
      "all_graded": true
    }
  ],
  "total": 1
}
```

---

## Question Types

### 1. Multiple Choice
- Auto-graded
- Options: A, B, C, D
- Correct answer: Single letter (A, B, C, or D)

### 2. True/False
- Auto-graded
- Correct answer: "True" or "False"

### 3. Short Answer
- Requires manual grading by teacher
- Teacher provides score and feedback

---

## Workflow

### Teacher Workflow:
1. Create assignment with questions → `/api/teacher/create-assignment`
2. Assign to students → `/api/teacher/assign-to-students`
3. Wait for submissions
4. Check pending evaluations → `/api/teacher/pending-evaluations`
5. View submission details → `/api/teacher/get-submission/{attempt_id}`
6. Evaluate answers → `/api/teacher/evaluate-answer`

### Student Workflow:
1. View assignments → `/api/student/my-assignments`
2. Start exam → `/api/student/start-exam`
3. Answer questions
4. Submit exam → `/api/student/submit-exam`
5. View results → `/api/student/my-results`

---

## Auto-Grading

The system automatically grades:
- ✅ Multiple choice questions (exact match with correct answer)
- ✅ True/false questions (exact match)

Short answer questions require teacher evaluation.

---

## Database Models

The system uses these models:
- **User**: Teachers and students
- **Exam**: Assignment/test created by teacher
- **Question**: Individual questions in an exam
- **ExamAssignment**: Links exams to students
- **ExamAttempt**: Student's attempt at an exam
- **Answer**: Student's answer to a question

---

## Testing

### Create a Teacher User:
```python
from models import db, User
from app import app

with app.app_context():
    teacher = User(
        username='teacher1',
        email='teacher@example.com',
        role='teacher'
    )
    teacher.set_password('teacher123')
    db.session.add(teacher)
    db.session.commit()
```

### Create a Student User:
```python
student = User(
    username='student1',
    email='student@example.com',
    role='student'
)
student.set_password('student123')
db.session.add(student)
db.session.commit()
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad request (validation error)
- `403`: Forbidden (authorization error)
- `404`: Not found
- `500`: Internal server error

Error response format:
```json
{
  "error": "Error message description"
}
```

---

## Next Steps

1. **Restart your backend** to load the new endpoints
2. **Test the API** using the examples above
3. **Integrate with your mobile app** or web frontend
4. **Add authentication** for production use

The system is ready to use! Teachers can now create assignments and evaluate student work.
