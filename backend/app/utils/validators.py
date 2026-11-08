import os
from werkzeug.datastructures import FileStorage
from app.middleware.error_handlers import ValidationError

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

def validate_pdf_file(file: FileStorage) -> None:
    """
    Validates that the uploaded file is a valid PDF within size limits.
    Raises ValidationError if invalid.
    """
    if not file or not file.filename:
        raise ValidationError("No file was uploaded or filename is missing", details={"field": "file"})

    # Check extension
    filename = file.filename.lower()
    if not filename.endswith(".pdf"):
        raise ValidationError("Invalid file extension. Only .pdf files are permitted.", details={"field": "file"})

    # Check MIME type
    if file.content_type and file.content_type != "application/pdf":
        raise ValidationError(f"Invalid MIME type '{file.content_type}'. Must be 'application/pdf'.", details={"field": "file"})

    # Check file size without reading entirely into memory
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)

    if size > MAX_FILE_SIZE:
        raise ValidationError(f"File size ({size / (1024 * 1024):.2f} MB) exceeds maximum allowed limit of 10 MB.", details={"field": "file"})

    if size == 0:
        raise ValidationError("The uploaded PDF file is empty (0 bytes).", details={"field": "file"})

    # Verify PDF magic header
    header = file.read(5)
    file.seek(0)
    if header != b"%PDF-":
        raise ValidationError("File content is not a valid PDF format (missing %PDF- header).", details={"field": "file"})

