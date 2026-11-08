import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from app.extensions import db, limiter
from app.models.document import Document, DocumentChunk
from app.models.chat import Conversation, Message
from app.models.user import UserActivity
from app.middleware.auth_guards import get_current_user, role_required
from app.middleware.error_handlers import ValidationError, NotFoundError, ForbiddenError
from app.utils.validators import validate_pdf_file
from app.utils.pagination import paginate_query
from app.services.rag_service import RAGService
from app.services.ai_service import AIService

ai_bp = Blueprint("ai", __name__, url_prefix="/ai")

@ai_bp.route("/upload-pdf", methods=["POST"])
@role_required("teacher", "admin")
def upload_pdf():
    """
    Upload and index a PDF document using RAG pipeline
    ---
    tags:
      - AI & RAG
    security:
      - Bearer: []
    consumes:
      - multipart/form-data
    parameters:
      - in: formData
        name: file
        type: file
        required: true
        description: PDF file up to 10 MB
      - in: formData
        name: title
        type: string
        required: false
        description: Optional title for the document
    responses:
      201:
        description: PDF parsed, indexed and stored successfully
      400:
        description: Validation error or scanned document
    """
    user = get_current_user()
    if "file" not in request.files:
        raise ValidationError("No file field provided in form data", details={"field": "file"})

    file = request.files["file"]
    validate_pdf_file(file)

    title = request.form.get("title") or os.path.splitext(file.filename)[0]
    safe_filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4().hex}_{safe_filename}"
    upload_dir = current_app.config.get("UPLOAD_FOLDER", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, unique_filename)

    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    file.save(file_path)

    # Extract text and handle empty / scanned PDFs
    full_text, total_pages = RAGService.extract_text_from_pdf(file_path)

    # Create Document record
    document = Document(
        title=title,
        filename=safe_filename,
        file_path=file_path,
        file_size=file_size,
        mime_type="application/pdf",
        text_content=full_text,
        page_count=total_pages,
        uploaded_by=user.id
    )
    db.session.add(document)
    db.session.flush()

    # Index text chunks with vector embeddings
    api_key = current_app.config.get("GEMINI_API_KEY")
    chunks_count = RAGService.index_document(document, full_text, api_key=api_key)

    # Log activity
    db.session.add(UserActivity(
        user_id=user.id,
        activity_type="upload_document",
        description=f"Uploaded and indexed PDF: '{title}' ({total_pages} pages, {chunks_count} chunks)"
    ))
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "PDF document parsed and indexed successfully",
        "data": {
            "document": document.to_dict(),
            "chunks_indexed": chunks_count,
            "page_count": total_pages
        }
    }), 201


@ai_bp.route("/documents", methods=["GET"])
@role_required("teacher", "student", "admin")
def list_documents():
    """
    List accessible uploaded documents (paginated)
    ---
    tags:
      - AI & RAG
    security:
      - Bearer: []
    """
    user = get_current_user()
    if user.role == "admin":
        query = Document.query.order_by(Document.created_at.desc())
    else:
        query = Document.query.filter_by(uploaded_by=user.id).order_by(Document.created_at.desc())

    result = paginate_query(query, serialize_fn=lambda d: d.to_dict())
    return jsonify({"success": True, "data": result}), 200


@ai_bp.route("/documents/<int:document_id>", methods=["GET"])
@role_required("teacher", "student", "admin")
def get_document(document_id):
    """
    Get document metadata and chunks preview
    ---
    tags:
      - AI & RAG
    security:
      - Bearer: []
    """
    user = get_current_user()
    document = db.session.get(Document, document_id)
    if not document:
        raise NotFoundError("Document not found")

    if user.role != "admin" and document.uploaded_by != user.id:
        raise ForbiddenError("You can only access documents you uploaded")

    chunks_preview = [c.to_dict() for c in document.chunks.limit(10).all()]
    return jsonify({
        "success": True,
        "data": {
            "document": document.to_dict(include_text=True),
            "chunks_sample": chunks_preview
        }
    }), 200


@ai_bp.route("/generate-questions", methods=["POST"])
@role_required("teacher", "admin")
@limiter.limit("30 per minute")
def generate_questions():
    """
    Generate questions using Google Gemini with RAG and Pydantic validation
    ---
    tags:
      - AI & RAG
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        schema:
          type: object
          properties:
            document_id:
              type: integer
            topic:
              type: string
              example: Operating Systems & Memory Management
            num_questions:
              type: integer
              default: 5
            difficulty:
              type: string
              enum: [easy, medium, hard]
              default: medium
            question_types:
              type: array
              items:
                type: string
                enum: [multiple_choice, true_false, short_answer, essay]
    responses:
      200:
        description: Structured generated questions
    """
    user = get_current_user()
    data = request.get_json(silent=True) or {}
    document_id = data.get("document_id")
    topic = data.get("topic", "General Assessment")
    num_questions = max(1, min(20, int(data.get("num_questions", 5))))
    difficulty = data.get("difficulty", "medium").lower()
    question_types = data.get("question_types") or ["multiple_choice", "true_false", "short_answer"]

    context_chunks = []
    if document_id:
        document = db.session.get(Document, document_id)
        if not document:
            raise NotFoundError("Specified document not found")
        if user.role != "admin" and document.uploaded_by != user.id:
            raise ForbiddenError("You can only generate questions from documents you uploaded")
        
        top_chunks = RAGService.search_top_k(document_id, topic, k=4)
        context_chunks = [c.chunk_text for c in top_chunks]

    paper = AIService.generate_questions(
        context_chunks=context_chunks,
        topic=topic,
        num_questions=num_questions,
        difficulty=difficulty,
        question_types=question_types
    )

    # Update user statistics
    if user.stats:
        user.stats.total_questions_generated += len(paper.questions)
    
    db.session.add(UserActivity(
        user_id=user.id,
        activity_type="generate_questions",
        description=f"Generated {len(paper.questions)} questions on topic '{topic}'"
    ))
    db.session.commit()

    return jsonify({
        "success": True,
        "data": paper.model_dump()
    }), 200


@ai_bp.route("/generate-study-content", methods=["POST"])
@role_required("teacher", "student", "admin")
@limiter.limit("30 per minute")
def generate_study_content():
    """
    Generate study guide, key concepts, formulas, and practice questions
    ---
    tags:
      - AI & RAG
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - topic
          properties:
            topic:
              type: string
              example: Binary Search Trees
            document_id:
              type: integer
    """
    user = get_current_user()
    data = request.get_json(silent=True) or {}
    topic = (data.get("topic") or "").strip()
    document_id = data.get("document_id")

    if not topic:
        raise ValidationError("Topic is required", details={"field": "topic"})

    context_chunks = []
    if document_id:
        document = db.session.get(Document, document_id)
        if document:
            top_chunks = RAGService.search_top_k(document_id, topic, k=4)
            context_chunks = [c.chunk_text for c in top_chunks]

    content = AIService.generate_study_content(topic, context_chunks=context_chunks)

    if user.stats:
        user.stats.total_study_materials += 1

    db.session.add(UserActivity(
        user_id=user.id,
        activity_type="generate_study_content",
        description=f"Generated study guide for '{topic}'"
    ))
    db.session.commit()

    return jsonify({
        "success": True,
        "data": content.model_dump()
    }), 200


@ai_bp.route("/chat", methods=["POST"])
@role_required("teacher", "student", "admin")
@limiter.limit("60 per minute")
def chat_with_ai():
    """
    Interactive educational chatbot with stored multi-turn conversation
    ---
    tags:
      - AI & RAG
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - message
          properties:
            conversation_id:
              type: integer
            message:
              type: string
            document_id:
              type: integer
    """
    user = get_current_user()
    data = request.get_json(silent=True) or {}
    message_text = (data.get("message") or "").strip()
    conversation_id = data.get("conversation_id")
    document_id = data.get("document_id")

    if not message_text:
        raise ValidationError("Message cannot be empty", details={"field": "message"})

    # Fetch or create conversation
    is_new_conversation = False
    if conversation_id:
        conversation = db.session.get(Conversation, conversation_id)
        if not conversation:
            raise NotFoundError("Conversation not found")
        if conversation.user_id != user.id and user.role != "admin":
            raise ForbiddenError("Access denied: You can only chat in your own conversations")
    else:
        is_new_conversation = True
        conversation = Conversation(
            user_id=user.id,
            title=message_text[:40] + ("..." if len(message_text) > 40 else "")
        )
        db.session.add(conversation)
        db.session.flush()

    # Save user message
    user_msg = Message(
        conversation_id=conversation.id,
        sender_role="user",
        content=message_text
    )
    db.session.add(user_msg)

    # Optional RAG context from document
    doc_context = ""
    if document_id:
        chunks = RAGService.search_top_k(document_id, message_text, k=3)
        if chunks:
            doc_context = "\n\nRelevant Document Excerpts:\n" + "\n---\n".join(c.chunk_text for c in chunks)

    # Compose response
    api_key = current_app.config.get("GEMINI_API_KEY")
    assistant_reply = ""
    if api_key and api_key != "your_gemini_api_key_here":
        try:
            # Build conversation history
            recent_msgs = conversation.messages[-5:]
            history_text = "\n".join(f"{m.sender_role.upper()}: {m.content}" for m in recent_msgs)
            prompt = f"You are EduTech AI, an encouraging and expert academic tutor.\n{doc_context}\n\nRecent Conversation:\n{history_text}\nUSER: {message_text}\nASSISTANT:"
            assistant_reply = AIService._call_gemini_raw("gemini-2.5-flash", prompt, api_key)
        except Exception:
            assistant_reply = ""

    if not assistant_reply:
        assistant_reply = (
            f"Regarding your query on '{message_text}': In educational practice, this concept represents "
            "a key learning objective. Focus on the core definitions, review illustrative examples, and practice solving "
            "related problems step by step. Let me know if you would like me to generate a practice quiz on this topic!"
        )

    # Save assistant message
    asst_msg = Message(
        conversation_id=conversation.id,
        sender_role="assistant",
        content=assistant_reply
    )
    db.session.add(asst_msg)

    if is_new_conversation and user.stats:
        user.stats.total_chat_sessions += 1

    db.session.add(UserActivity(
        user_id=user.id,
        activity_type="chat_with_ai",
        description=f"AI chat in conversation '{conversation.title}'"
    ))
    db.session.commit()

    return jsonify({
        "success": True,
        "data": {
            "conversation_id": conversation.id,
            "user_message": user_msg.to_dict(),
            "assistant_message": asst_msg.to_dict()
        }
    }), 200


@ai_bp.route("/conversations", methods=["GET"])
@role_required("teacher", "student", "admin")
def list_conversations():
    """
    List user's conversations
    ---
    tags:
      - AI & RAG
    security:
      - Bearer: []
    """
    user = get_current_user()
    query = Conversation.query.filter_by(user_id=user.id).order_by(Conversation.updated_at.desc())
    result = paginate_query(query, serialize_fn=lambda c: c.to_dict())
    return jsonify({"success": True, "data": result}), 200


@ai_bp.route("/conversations/<int:conversation_id>", methods=["GET"])
@role_required("teacher", "student", "admin")
def get_conversation(conversation_id):
    """
    Get full message history for a conversation
    ---
    tags:
      - AI & RAG
    security:
      - Bearer: []
    """
    user = get_current_user()
    conversation = db.session.get(Conversation, conversation_id)
    if not conversation:
        raise NotFoundError("Conversation not found")
    if conversation.user_id != user.id and user.role != "admin":
        raise ForbiddenError("Access denied: You can only view your own conversations")

    return jsonify({
        "success": True,
        "data": conversation.to_dict(include_messages=True)
    }), 200


@ai_bp.route("/conversations/<int:conversation_id>", methods=["DELETE"])
@role_required("teacher", "student", "admin")
def delete_conversation(conversation_id):
    """
    Delete a conversation and all its messages
    ---
    tags:
      - AI & RAG
    security:
      - Bearer: []
    """
    user = get_current_user()
    conversation = db.session.get(Conversation, conversation_id)
    if not conversation:
        raise NotFoundError("Conversation not found")
    if conversation.user_id != user.id and user.role != "admin":
        raise ForbiddenError("Access denied: You can only delete your own conversations")

    db.session.delete(conversation)
    db.session.commit()
    return jsonify({
        "success": True,
        "message": "Conversation deleted successfully"
    }), 200

