# 🔧 Backend Installation Fix - dlib Error

## Problem

Getting error: `Failed building wheel for dlib`

## Why This Happens

- `dlib` requires C++ compiler and CMake
- It's a heavy dependency used for face recognition
- **NOT needed for the Teacher Evaluation System**

## Solution: Install Minimal Requirements

### Option 1: Use Minimal Requirements (Recommended)

Install only what's actually needed:

```bash
cd python-backend
pip install -r requirements-minimal.txt
```

This installs only:
- Flask and essential extensions
- Database support (SQLAlchemy)
- Authentication (JWT, Bcrypt)
- CORS support
- Google Gemini (optional)

### Option 2: Install Without Heavy Dependencies

Skip the problematic packages:

```bash
cd python-backend
pip install Flask Flask-CORS Flask-SQLAlchemy Flask-JWT-Extended Flask-Bcrypt python-dotenv requests google-genai
```

### Option 3: Install One by One

If you're still having issues:

```bash
pip install Flask==2.3.3
pip install Flask-CORS==4.0.0
pip install Flask-SQLAlchemy==3.0.5
pip install Flask-JWT-Extended==4.5.2
pip install Flask-Bcrypt==1.0.1
pip install python-dotenv==1.0.0
pip install requests==2.31.0
pip install google-genai==0.5.4
```

## Start the Backend

After installation:

```bash
cd python-backend
python app.py
```

You should see:
```
Starting Gemini AI Study Assistant API on port 5000
 * Running on http://0.0.0.0:5000
```

## What's NOT Needed

These packages are NOT required for the Teacher Evaluation System:

❌ **dlib** - Face recognition (not used)
❌ **torch** - PyTorch (not used in current system)
❌ **transformers** - Hugging Face models (not used)
❌ **matplotlib, seaborn, pandas** - Data visualization (not used)
❌ **PyPDF2, reportlab** - PDF processing (optional)
❌ **Pillow** - Image processing (optional)
❌ **Flask-SocketIO** - WebSockets (optional)

## What IS Needed

✅ **Flask** - Web framework
✅ **Flask-CORS** - Cross-origin requests
✅ **Flask-SQLAlchemy** - Database
✅ **Flask-JWT-Extended** - Authentication
✅ **Flask-Bcrypt** - Password hashing
✅ **python-dotenv** - Environment variables
✅ **requests** - HTTP requests
✅ **google-genai** - Gemini AI (optional)

## Verify Installation

Test if the backend works:

```bash
cd python-backend
python -c "import flask; print('Flask:', flask.__version__)"
python -c "import flask_sqlalchemy; print('SQLAlchemy: OK')"
python -c "import flask_cors; print('CORS: OK')"
```

All should print without errors.

## Alternative: Use Virtual Environment

Create a clean environment:

```bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install minimal requirements
pip install -r requirements-minimal.txt

# Start backend
python app.py
```

## If Still Having Issues

### Issue: pip not found
```bash
python -m pip install -r requirements-minimal.txt
```

### Issue: Permission denied
```bash
pip install --user -r requirements-minimal.txt
```

### Issue: Old pip version
```bash
python -m pip install --upgrade pip
pip install -r requirements-minimal.txt
```

## Quick Start (No Installation Issues)

If you just want to get started quickly:

```bash
# Install only the absolute essentials
pip install Flask Flask-CORS Flask-SQLAlchemy python-dotenv

# Start the backend
cd python-backend
python app.py
```

This will work for basic functionality. You can add more packages later if needed.

## Summary

The Teacher Evaluation System works with just these core packages:
- Flask (web server)
- Flask-CORS (API access)
- Flask-SQLAlchemy (database)
- python-dotenv (configuration)

Everything else is optional! Start with the minimal setup and add features as needed.

## Test Backend is Working

Once started, open browser to:
```
http://localhost:5000/api/health
```

Should see:
```json
{
  "status": "healthy",
  "service": "Gemini AI Study Assistant",
  "version": "3.0.0"
}
```

✅ Backend is ready!
