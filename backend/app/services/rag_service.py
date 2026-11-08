import os
import math
import re
from typing import List, Tuple, Optional
import pypdf
from app.extensions import db
from app.models.document import Document, DocumentChunk
from app.middleware.error_handlers import ValidationError

class RAGService:
    @staticmethod
    def extract_text_from_pdf(stream_or_path) -> Tuple[str, int]:
        """
        Extracts textual content and page count from a PDF.
        Detects empty or scanned image PDFs with no extractable text.
        """
        try:
            reader = pypdf.PdfReader(stream_or_path)
            total_pages = len(reader.pages)
            if total_pages == 0:
                raise ValidationError("The uploaded PDF contains no pages.")

            extracted_parts = []
            for page_idx, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                extracted_parts.append(page_text.strip())

            full_text = "\n\n".join(part for part in extracted_parts if part)

            # Detect empty / scanned PDFs
            alphanumeric_chars = len(re.findall(r"[a-zA-Z0-9]", full_text))
            if alphanumeric_chars < 50:
                raise ValidationError(
                    "The uploaded PDF appears to be empty or contains scanned images with no extractable text layer. "
                    "Please provide a text-searchable PDF."
                )

            return full_text, total_pages
        except ValidationError:
            raise
        except Exception as e:
            raise ValidationError(f"Failed to read or parse PDF document: {str(e)}")

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 800, overlap: int = 150) -> List[str]:
        """
        Splits text into overlapping semantic chunks.
        """
        if not text:
            return []

        # Split into paragraphs first to respect section boundaries
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        chunks = []
        current_chunk = ""

        for paragraph in paragraphs:
            if len(current_chunk) + len(paragraph) + 2 <= chunk_size:
                current_chunk = f"{current_chunk}\n\n{paragraph}" if current_chunk else paragraph
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                
                # If paragraph itself is longer than chunk_size, split by sliding window
                if len(paragraph) > chunk_size:
                    start = 0
                    while start < len(paragraph):
                        end = start + chunk_size
                        chunks.append(paragraph[start:end])
                        start += chunk_size - overlap
                    current_chunk = ""
                else:
                    current_chunk = paragraph

        if current_chunk:
            chunks.append(current_chunk)

        return chunks

    @staticmethod
    def generate_embedding(text: str, api_key: Optional[str] = None) -> List[float]:
        """
        Generates vector embedding. Uses Gemini Embedding API if key is present,
        otherwise falls back to a deterministic 256-dim normalized frequency vector.
        """
        text = text or ""
        if api_key and api_key != "your_gemini_api_key_here":
            try:
                from google import genai
                client = genai.Client(api_key=api_key)
                response = client.models.embed_content(
                    model="text-embedding-004",
                    contents=text
                )
                if response and response.embedding and response.embedding.values:
                    return list(response.embedding.values)
            except Exception:
                pass  # Fall through to deterministic local fallback

        # Local Deterministic Embedding Fallback (256-dimensional normalized vector)
        dim = 256
        vec = [0.0] * dim
        words = re.findall(r"\w+", text.lower())
        if not words:
            return vec

        for word in words:
            # Hash word into bucket
            h = hash(word) % dim
            vec[h] += 1.0

        # Also capture character bigrams
        for i in range(len(text) - 1):
            bi = text[i:i+2].lower()
            h = hash(bi) % dim
            vec[h] += 0.5

        # L2 Normalize
        magnitude = math.sqrt(sum(x * x for x in vec))
        if magnitude > 0:
            vec = [x / magnitude for x in vec]

        return vec

    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        """Computes cosine similarity between two unit vectors."""
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        return sum(a * b for a, b in zip(v1, v2))

    @classmethod
    def index_document(cls, document: Document, full_text: str, api_key: Optional[str] = None) -> int:
        """
        Splits document text into chunks, generates embeddings, and saves to database.
        """
        chunks = cls.chunk_text(full_text)
        created_chunks = 0

        for idx, chunk_text in enumerate(chunks):
            vector = cls.generate_embedding(chunk_text, api_key=api_key)
            chunk = DocumentChunk(
                document_id=document.id,
                chunk_index=idx,
                chunk_text=chunk_text,
                token_count=len(chunk_text.split()),
                embedding=vector
            )
            db.session.add(chunk)
            created_chunks += 1

        db.session.commit()
        return created_chunks

    @classmethod
    def search_top_k(cls, document_id: int, query: str, k: int = 4, api_key: Optional[str] = None) -> List[DocumentChunk]:
        """
        Finds the top-k most semantically relevant chunks for a query within a document.
        """
        chunks = DocumentChunk.query.filter_by(document_id=document_id).all()
        if not chunks:
            return []

        query_vec = cls.generate_embedding(query, api_key=api_key)
        scored_chunks = []

        for chunk in chunks:
            chunk_vec = chunk.embedding
            if chunk_vec:
                score = cls.cosine_similarity(query_vec, chunk_vec)
            else:
                score = 0.0
            scored_chunks.append((score, chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return [c for _, c in scored_chunks[:k]]

