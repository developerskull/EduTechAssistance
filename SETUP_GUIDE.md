# Exam Management System - Setup Guide

This is a comprehensive exam management system with admin/student roles, LLaMA-2 integration for answer verification, and dashboard features.

## Features

✅ **Authentication System**
- Admin and Student registration/login
- JWT-based authentication
- Role-based access control

✅ **Admin Features**
- Create and manage exams
- Assign exams to online students
- View detailed statistics and charts
- Monitor student participation
- Dashboard with performance analytics

✅ **Student Features**
- Take assigned exams
- Real-time answer verification with LLaMA-2
- View results with detailed feedback
- Performance tracking with charts
- Personal dashboard

✅ **AI Integration**
- LLaMA-2 model for answer verification
- Intelligent scoring system
- Fallback to keyword matching if AI unavailable

✅ **Real-time Features**
- Online student tracking
- Live exam assignments
- Real-time notifications

## Quick Start

### 1. Backend Setup

```bash
cd python-backend

# Install Python dependencies (recommended approach)
python install_requirements.py

# OR install manually
pip install -r requirements.txt

# Copy environment file
copy .env.example .env

# Run basic tests
python test_basic.py

# Start the backend server
python app.py
```

### 2. Frontend Setup

```bash
# Install Node.js dependencies
npm install

# Start the React development server
npm start
```

### 3. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**Create Student Account:**
- Go to http://localhost:3000/register
- Select "Student" role
- Fill in your details

## Environment Configuration

### Backend (.env file)

```env
# Flask Configuration
FLASK_ENV=development
PORT=5000
SECRET_KEY=your-secret-key-change-this-in-production
JWT_SECRET_KEY=jwt-secret-change-this-in-production
DATABASE_URL=sqlite:///exam_system.db

# Hugging Face API Token (optional for AI features)
HUGGINGFACE_TOKEN=your_huggingface_token_here
```

### Frontend (.env file - optional)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Troubleshooting

### Common Issues

1. **Import Errors with Transformers/PyTorch**
   - The system will fall back to simple keyword verification
   - AI features are optional and the system works without them

2. **Database Issues**
   - Delete `exam_system.db` and restart the app to reset the database
   - Run `python test_basic.py` to verify database setup

3. **Port Conflicts**
   - Change PORT in `.env` file for backend
   - Change port in `package.json` for frontend

### Installation Issues

If you encounter dependency conflicts:

```bash
# Create a virtual environment (recommended)
python -m venv exam_env
exam_env\Scripts\activate  # Windows
source exam_env/bin/activate  # Linux/Mac

# Install with the custom script
python install_requirements.py
```

## System Architecture

```
Frontend (React)          Backend (Flask)           AI Service
├── Authentication        ├── User Management       ├── LLaMA-2 API
├── Admin Dashboard       ├── Exam Management       ├── Answer Verification
├── Student Dashboard     ├── Answer Processing     └── Scoring System
├── Exam Taking          ├── Real-time Features    
└── Results Display      └── Analytics & Charts    
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/online-students` - Get online students (admin only)

### Exams
- `POST /api/exams/create` - Create exam (admin only)
- `POST /api/exams/assign` - Assign exam to students (admin only)
- `GET /api/exams/my-exams` - Get user's exams
- `GET /api/exams/{id}` - Get exam details
- `POST /api/exams/{id}/start` - Start exam attempt (student only)

### Answers
- `POST /api/answers/submit` - Submit answer
- `POST /api/answers/complete-exam` - Complete exam
- `GET /api/answers/attempt/{id}/results` - Get attempt results

### Dashboard
- `GET /api/dashboard/admin/stats` - Admin dashboard data
- `GET /api/dashboard/admin/exam/{id}/stats` - Exam statistics
- `GET /api/dashboard/student/dashboard` - Student dashboard data

## Usage Workflow

### For Admins:
1. Login with admin credentials
2. Create exams with questions and expected answers
3. Assign exams to online students
4. Monitor student participation in real-time
5. View detailed statistics and performance charts

### For Students:
1. Register and login as a student
2. View assigned exams on dashboard
3. Take exams with real-time answer verification
4. View results with AI-generated feedback
5. Track performance over time

## Advanced Features

### AI Answer Verification
- Uses LLaMA-2 for intelligent answer evaluation
- Provides detailed feedback on student responses
- Supports partial credit scoring
- Falls back to keyword matching if AI unavailable

### Real-time Dashboard
- Live student participation tracking
- Dynamic charts and statistics
- Performance analytics with visualizations
- Completion rate monitoring

### Security Features
- JWT token authentication
- Role-based access control
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization

## Development

### Adding New Features
1. Backend: Add routes in appropriate blueprint files
2. Frontend: Create components in `src/components/`
3. API: Update `src/services/api.js` for new endpoints

### Database Schema
- Users (admin/student roles)
- Exams (created by admins)
- Questions (belong to exams)
- ExamAssignments (exams assigned to students)
- ExamAttempts (student exam sessions)
- Answers (student responses with AI verification)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Run `python test_basic.py` to verify setup
3. Check console logs for error messages
4. Ensure all dependencies are properly installed

## License

This project is open source and available under the MIT License.