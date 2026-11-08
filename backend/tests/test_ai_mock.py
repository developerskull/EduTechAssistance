import io
import pytest
from app.services.rag_service import RAGService
from app.services.ai_service import AIService, GeneratedQuestionPaper

def create_dummy_pdf(text_content="This is a test document about Python programming and algorithms. Functions, classes, and loops are fundamental components of computer science."):
    """Creates an in-memory valid PDF for testing."""
    import pypdf
    from pypdf import PdfWriter
    writer = PdfWriter()
    writer.add_blank_page(width=200, height=200)
    # pypdf blank page doesn't have text stream, so we create a standard PDF with text stream:
    pdf_bytes = (
        b"%PDF-1.4\n"
        b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        b"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
        b"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"
        b"4 0 obj << /Length " + str(len(text_content) + 50).encode() + b" >>\nstream\nBT /F1 12 Tf 50 250 Td (" + text_content.encode() + b") Tj ET\nendstream\nendobj\n"
        b"5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"
        b"xref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000240 00000 n \n0000000350 00000 n \n"
        b"trailer << /Size 6 /Root 1 0 R >>\nstartxref\n430\n%%EOF"
    )
    return io.BytesIO(pdf_bytes)


def test_rag_chunking():
    sample_text = (
        "Introduction to Database Systems.\n\n"
        "Relational databases store data in tables consisting of rows and columns. "
        "SQL is the standard language used to query and manipulate relational databases.\n\n"
        "ACID properties ensure reliable processing of database transactions: "
        "Atomicity, Consistency, Isolation, and Durability."
    )
    chunks = RAGService.chunk_text(sample_text, chunk_size=120, overlap=20)
    assert len(chunks) >= 2
    assert any("Relational databases" in c for c in chunks)


def test_rag_embedding_and_similarity():
    v1 = RAGService.generate_embedding("Python programming language and data structures")
    v2 = RAGService.generate_embedding("Python code and algorithms")
    v3 = RAGService.generate_embedding("Ancient Roman history and architecture")

    sim12 = RAGService.cosine_similarity(v1, v2)
    sim13 = RAGService.cosine_similarity(v1, v3)

    assert len(v1) == 256
    assert sim12 > sim13  # Related topics should have higher similarity


def test_ai_question_generation_schema_validation():
    paper = AIService.generate_questions(
        topic="Operating Systems",
        num_questions=3,
        difficulty="medium",
        question_types=["multiple_choice", "true_false", "short_answer"]
    )
    assert isinstance(paper, GeneratedQuestionPaper)
    assert len(paper.questions) == 3
    assert paper.questions[0].question_type == "multiple_choice"
    assert len(paper.questions[0].options) == 4
    assert paper.questions[1].question_type == "true_false"
    assert paper.questions[2].question_type == "short_answer"


def test_ai_study_content_generation():
    study = AIService.generate_study_content(topic="Data Structures")
    assert study.topic == "Data Structures"
    assert len(study.key_concepts) >= 2
    assert len(study.cheat_sheet) >= 2
    assert len(study.practice_questions) >= 1


def test_ai_subjective_evaluation():
    eval_res = AIService.evaluate_subjective_answer(
        question_text="What is virtual memory?",
        correct_answer="Virtual memory is an operating system mechanism that provides an illusion of a large memory space by swapping pages between RAM and disk storage.",
        student_answer="Virtual memory allows OS to use secondary disk storage as extra RAM memory using paging.",
        max_points=4
    )
    assert eval_res.suggested_score > 0
    assert eval_res.max_score == 4
    assert len(eval_res.rationale) > 5


def test_upload_pdf_endpoint(client, teacher_headers):
    pdf_stream = create_dummy_pdf()
    data = {
        "title": "Intro to Python PDF",
        "file": (pdf_stream, "test_document.pdf", "application/pdf")
    }
    res = client.post("/api/v1/ai/upload-pdf", headers=teacher_headers, data=data, content_type="multipart/form-data")
    assert res.status_code == 201
    res_data = res.get_json()
    assert res_data["success"] is True
    assert res_data["data"]["chunks_indexed"] >= 1


def test_upload_non_pdf_rejected(client, teacher_headers):
    data = {
        "title": "Text File",
        "file": (io.BytesIO(b"Hello world"), "test.txt", "text/plain")
    }
    res = client.post("/api/v1/ai/upload-pdf", headers=teacher_headers, data=data, content_type="multipart/form-data")
    assert res.status_code == 400
    res_data = res.get_json()
    assert res_data["error"]["code"] == "VALIDATION_ERROR"


def test_generate_questions_endpoint(client, teacher_headers):
    payload = {
        "topic": "Computer Networks",
        "num_questions": 3,
        "difficulty": "medium",
        "question_types": ["multiple_choice", "true_false", "short_answer"]
    }
    res = client.post("/api/v1/ai/generate-questions", headers=teacher_headers, json=payload)
    assert res.status_code == 200
    res_data = res.get_json()
    assert res_data["success"] is True
    assert len(res_data["data"]["questions"]) == 3


def test_chat_endpoint_stores_conversation(client, student_headers):
    # Step 1: Send first message (creates conversation)
    payload = {"message": "Can you explain Dijkstra's algorithm?"}
    res = client.post("/api/v1/ai/chat", headers=student_headers, json=payload)
    assert res.status_code == 200
    res_data = res.get_json()
    assert res_data["success"] is True
    conv_id = res_data["data"]["conversation_id"]
    assert conv_id is not None
    assert "assistant_message" in res_data["data"]

    # Step 2: Send second message in same conversation
    payload2 = {"conversation_id": conv_id, "message": "What is its time complexity with a min-heap?"}
    res2 = client.post("/api/v1/ai/chat", headers=student_headers, json=payload2)
    assert res2.status_code == 200

    # Step 3: Retrieve full conversation history
    res3 = client.get(f"/api/v1/ai/conversations/{conv_id}", headers=student_headers)
    assert res3.status_code == 200
    history = res3.get_json()["data"]["messages"]
    assert len(history) == 4  # 2 user messages + 2 assistant messages

