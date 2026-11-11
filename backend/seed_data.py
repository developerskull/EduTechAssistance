"""
Database Seeder for EduTechAssistance
Populates the database with realistic academic data:
- Teachers, Students, Admin
- Cohorts & Members
- Indexed Documents & Chunks
- Exams & Questions
- Student Submissions (both Evaluated & Pending Grading)
- Activity Logs & User Stats
"""

import os
import sys
from datetime import datetime, timedelta

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.dirname(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app
from app.extensions import db
from app.models.user import User, UserStats, UserActivity
from app.models.cohort import Cohort, CohortMember
from app.models.document import Document, DocumentChunk
from app.models.exam import Exam, Question, StudentExam, Answer
from app.models.chat import Conversation, Message


def seed_database():
    app = create_app(os.getenv("FLASK_ENV", "development"))
    with app.app_context():
        print("🌱 Seeding EduTechAssistance database...")
        db.create_all()

        # 1. Users
        def get_or_create_user(username, email, role, password):
            u = User.query.filter((User.username == username) | (User.email == email)).first()
            if not u:
                u = User(username=username, email=email, role=role)
                u.set_password(password)
                db.session.add(u)
                db.session.flush()
                # Initialize stats
                stats = UserStats(
                    user_id=u.id,
                    total_questions_generated=15 if role == 'teacher' else 0,
                    total_study_materials=5 if role == 'student' else 0,
                    total_chat_sessions=8 if role == 'student' else 0,
                    exams_completed=3 if role == 'student' else 0
                )
                db.session.add(stats)
            return u

        admin = get_or_create_user("admin", "admin@edutech.internal", "admin", "AdminPass123!")
        teacher1 = get_or_create_user("teacher_alice", "alice@university.edu", "teacher", "TeacherPass123!")
        teacher2 = get_or_create_user("prof_davis", "davis@university.edu", "teacher", "TeacherPass123!")
        # Dedicated Quick Testing Accounts
        demo_teacher = get_or_create_user("demo_teacher", "teacher@googleexam.test", "teacher", "Teacher123!")
        demo_student = get_or_create_user("demo_student", "student@googleexam.test", "student", "Student123!")
        student1 = get_or_create_user("student_bob", "bob@student.edu", "student", "StudentPass123!")
        student2 = get_or_create_user("student_charlie", "charlie@student.edu", "student", "StudentPass123!")
        student3 = get_or_create_user("student_diana", "diana@student.edu", "student", "StudentPass123!")
        student4 = get_or_create_user("student_eva", "eva@student.edu", "student", "StudentPass123!")

        # 2. Cohort
        cohort = Cohort.query.filter_by(name="Computer Science 2026 - Section A").first()
        if not cohort:
            cohort = Cohort(
                name="Computer Science 2026 - Section A",
                description="Undergraduate Core Curriculum in Systems & Databases",
                teacher_id=teacher1.id
            )
            db.session.add(cohort)
            db.session.flush()

            for st in [demo_student, student1, student2, student3, student4]:
                if not CohortMember.query.filter_by(cohort_id=cohort.id, student_id=st.id).first():
                    db.session.add(CohortMember(cohort_id=cohort.id, student_id=st.id))

        # 3. Sample Documents & Chunks
        doc = Document.query.filter_by(title="Operating Systems Principles.pdf").first()
        if not doc:
            doc = Document(
                title="Operating Systems Principles.pdf",
                filename="os_principles_2026.pdf",
                file_path="uploads/os_principles_2026.pdf",
                file_size=3240000,
                page_count=24,
                uploaded_by=teacher1.id
            )
            db.session.add(doc)
            db.session.flush()

            chunks_data = [
                ("Process scheduling algorithms include FCFS, Shortest Job First (SJF), Round Robin, and Priority Scheduling. Starvation can occur in strict priority scheduling.", 1),
                ("Virtual memory allows the execution of processes that are not completely in memory. Paging maps virtual addresses to physical page frames using the page table and TLB.", 2),
                ("Deadlock conditions (Coffman conditions): Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. All four must hold simultaneously for deadlock to occur.", 3)
            ]
            for text, c_idx in chunks_data:
                db.session.add(DocumentChunk(
                    document_id=doc.id,
                    chunk_index=c_idx,
                    chunk_text=text,
                    token_count=len(text.split())
                ))

        # 4. Sample Exam 1: Operating Systems Midterm
        exam1 = Exam.query.filter_by(title="Operating Systems Midterm 2026").first()
        if not exam1:
            exam1 = Exam(
                title="Operating Systems Midterm 2026",
                description="Comprehensive midterm covering scheduling, virtual memory, and concurrency.",
                created_by=teacher1.id,
                time_limit=45,
                total_points=25
            )
            db.session.add(exam1)
            db.session.flush()

            questions_data = [
                {
                    "text": "Which disk scheduling algorithm services requests closest to the current head position first?",
                    "type": "multiple_choice",
                    "options": ["FCFS", "SSTF (Shortest Seek Time First)", "SCAN", "LOOK"],
                    "answer": "SSTF (Shortest Seek Time First)",
                    "points": 3
                },
                {
                    "text": "A page fault occurs when a referenced page is not present in physical RAM.",
                    "type": "true_false",
                    "options": ["True", "False"],
                    "answer": "True",
                    "points": 2
                },
                {
                    "text": "Explain the difference between preemptive and non-preemptive process scheduling.",
                    "type": "short_answer",
                    "options": [],
                    "answer": "In preemptive scheduling, the OS can interrupt and suspend a currently executing process to grant CPU time to a higher-priority task. In non-preemptive scheduling, once a process is allocated the CPU, it retains it until it terminates or transitions to waiting.",
                    "points": 10
                },
                {
                    "text": "Analyze the four Coffman conditions required for deadlocks to occur and explain how modern OS architectures prevent circular wait.",
                    "type": "essay",
                    "options": [],
                    "answer": "The four conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Circular wait can be prevented by imposing a strict total ordering on all resource allocations.",
                    "points": 10
                }
            ]

            q_objects = []
            for qd in questions_data:
                q = Question(
                    exam_id=exam1.id,
                    question_text=qd["text"],
                    question_type=qd["type"],
                    options=qd["options"] if qd["options"] else None,
                    correct_answer=qd["answer"],
                    points=qd["points"]
                )
                db.session.add(q)
                db.session.flush()
                q_objects.append(q)

            # Assign exam to student1 and student2
            # Attempt 1: Bob (Completed & Evaluated)
            attempt1 = StudentExam(
                exam_id=exam1.id,
                student_id=student1.id,
                started_at=datetime.utcnow() - timedelta(hours=3),
                submitted_at=datetime.utcnow() - timedelta(hours=2, minutes=20),
                status="evaluated",
                total_score=23,
                max_score=25,
                percentage=92.0
            )
            db.session.add(attempt1)
            db.session.flush()

            # Answers for Bob
            db.session.add(Answer(
                student_exam_id=attempt1.id,
                question_id=q_objects[0].id,
                student_answer="SSTF (Shortest Seek Time First)",
                score=3,
                is_verified=True,
                feedback="Correct! SSTF optimizes seek time.",
                evaluated_at=datetime.utcnow()
            ))
            db.session.add(Answer(
                student_exam_id=attempt1.id,
                question_id=q_objects[1].id,
                student_answer="True",
                score=2,
                is_verified=True,
                feedback="Correct definition of page fault.",
                evaluated_at=datetime.utcnow()
            ))
            db.session.add(Answer(
                student_exam_id=attempt1.id,
                question_id=q_objects[2].id,
                student_answer="Preemptive allows the kernel to pause running tasks for higher priority jobs, while non-preemptive waits until the task voluntarily yields.",
                score=9,
                is_verified=True,
                feedback="Excellent distinction and accurate terminology.",
                evaluated_at=datetime.utcnow()
            ))
            db.session.add(Answer(
                student_exam_id=attempt1.id,
                question_id=q_objects[3].id,
                student_answer="Deadlock requires mutual exclusion, hold-and-wait, no preemption, and circular wait. To prevent circular wait, resources can be requested in an increasing numbered order.",
                score=9,
                is_verified=True,
                feedback="Well argued analysis of total ordering prevention.",
                evaluated_at=datetime.utcnow()
            ))

            # Attempt 2: Charlie (Completed, AWAITING TEACHER GRADING)
            attempt2 = StudentExam(
                exam_id=exam1.id,
                student_id=student2.id,
                started_at=datetime.utcnow() - timedelta(minutes=40),
                submitted_at=datetime.utcnow() - timedelta(minutes=5),
                status="completed",
                total_score=5,  # Auto-graded objective points so far
                max_score=25,
                percentage=20.0
            )
            db.session.add(attempt2)
            db.session.flush()

            # Objective answers auto-graded
            db.session.add(Answer(
                student_exam_id=attempt2.id,
                question_id=q_objects[0].id,
                student_answer="SSTF (Shortest Seek Time First)",
                score=3,
                is_verified=True
            ))
            db.session.add(Answer(
                student_exam_id=attempt2.id,
                question_id=q_objects[1].id,
                student_answer="True",
                score=2,
                is_verified=True
            ))
            # Subjective answers unverified (waiting in Teacher Evaluation Workspace!)
            db.session.add(Answer(
                student_exam_id=attempt2.id,
                question_id=q_objects[2].id,
                student_answer="Preemptive scheduling means a process can be interrupted by the operating system scheduler. Non-preemptive means it runs until finished.",
                score=0,
                is_verified=False,
                ai_suggested_score=8,
                ai_rationale="Clear summary of interruption vs voluntary run-to-completion."
            ))
            db.session.add(Answer(
                student_exam_id=attempt2.id,
                question_id=q_objects[3].id,
                student_answer="The conditions are mutual exclusion, hold and wait, no preemption, and circular wait. Circular wait is broken by numbering resources.",
                score=0,
                is_verified=False,
                ai_suggested_score=7,
                ai_rationale="Names all 4 conditions accurately and mentions resource numbering."
            ))

            # Attempt 3: Diana (Pending / Not yet started)
            attempt3 = StudentExam(
                exam_id=exam1.id,
                student_id=student3.id,
                status="pending",
                max_score=25
            )
            db.session.add(attempt3)

            # Attempt 4: Demo Student (Pending / Ready for testing)
            if not StudentExam.query.filter_by(exam_id=exam1.id, student_id=demo_student.id).first():
                attempt_demo = StudentExam(
                    exam_id=exam1.id,
                    student_id=demo_student.id,
                    status="pending",
                    max_score=25
                )
                db.session.add(attempt_demo)

        # 5. Activity logs
        db.session.add(UserActivity(
            user_id=teacher1.id,
            activity_type="exam_created",
            description="Created 'Operating Systems Midterm 2026' with 4 questions"
        ))
        db.session.add(UserActivity(
            user_id=student1.id,
            activity_type="exam_submitted",
            description="Submitted 'Operating Systems Midterm 2026' (Scored 92%)"
        ))

        db.session.commit()
        print("✅ Database seeding complete!")
        print("   - Demo Teacher: demo_teacher / Teacher123!")
        print("   - Demo Student: demo_student / Student123! (Exam ready in portal)")
        print("   - Teacher: teacher_alice / TeacherPass123!")
        print("   - Student: student_bob / StudentPass123!")
        print("   - Student: student_charlie / StudentPass123! (Has pending submission ready for grading)")
        print("   - Student: student_diana / StudentPass123! (Has pending exam ready to take)")


if __name__ == "__main__":
    seed_database()
