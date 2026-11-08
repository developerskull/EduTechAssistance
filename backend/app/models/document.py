import json
from datetime import datetime
from app.extensions import db

class Document(db.Model):
    __tablename__ = "documents"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)
    mime_type = db.Column(db.String(100), default="application/pdf")
    text_content = db.Column(db.Text, nullable=True)
    page_count = db.Column(db.Integer, default=1)
    uploaded_by = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    uploader = db.relationship("User", back_populates="documents")
    chunks = db.relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan", lazy="dynamic")
    questions = db.relationship("Question", back_populates="document")

    def to_dict(self, include_text=False):
        data = {
            "id": self.id,
            "title": self.title,
            "filename": self.filename,
            "file_size": self.file_size,
            "mime_type": self.mime_type,
            "page_count": self.page_count,
            "uploaded_by": self.uploaded_by,
            "chunks_count": self.chunks.count(),
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
        if include_text:
            data["text_content"] = self.text_content
        return data


class DocumentChunk(db.Model):
    __tablename__ = "document_chunks"

    id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(db.Integer, db.ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = db.Column(db.Integer, nullable=False)
    chunk_text = db.Column(db.Text, nullable=False)
    embedding_json = db.Column(db.Text, nullable=True)  # JSON-encoded float list for SQLite/fallback
    token_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    document = db.relationship("Document", back_populates="chunks")

    @property
    def embedding(self):
        if self.embedding_json:
            try:
                return json.loads(self.embedding_json)
            except Exception:
                return None
        return None

    @embedding.setter
    def embedding(self, vector):
        if vector is not None:
            self.embedding_json = json.dumps(vector)
        else:
            self.embedding_json = None

    def to_dict(self):
        return {
            "id": self.id,
            "document_id": self.document_id,
            "chunk_index": self.chunk_index,
            "chunk_text": self.chunk_text,
            "token_count": self.token_count,
            "has_embedding": self.embedding_json is not None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

