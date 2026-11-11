#!/usr/bin/env bash
echo "==================================================="
echo "  Starting EduTechAssistance Full-Stack System"
echo "==================================================="

# Start backend in background
echo "[1/2] Launching Backend Flask REST API..."
source backend/venv/bin/activate 2>/dev/null || source backend/venv/Scripts/activate 2>/dev/null
python backend/wsgi.py &
BACKEND_PID=$!

sleep 2

# Start frontend
echo "[2/2] Launching Frontend Web Client..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "Services active:"
echo "- Web App:  http://localhost:3000"
echo "- API Docs: http://127.0.0.1:5000/api/v1/docs"
echo ""
echo "Press Ctrl+C to stop all services."

trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait

