# 🎓 AI-Powered Question Paper Generator

<div align="center">

![Landing Page](output/landing_page_01.png)

*An intelligent web application that generates comprehensive question papers from PDF documents using RAG (Retrieval-Augmented Generation) technology and LLaMA-2 language model.*

[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-green.svg)](https://python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-brightgreen.svg)](https://nodejs.org/)
[![Hugging Face](https://img.shields.io/badge/🤗-Hugging%20Face-yellow.svg)](https://huggingface.co/)

</div>

## 🌟 Overview

Transform your educational content into comprehensive question papers with the power of AI! This application leverages advanced language models to automatically generate diverse, contextually relevant questions from your PDF documents.

## ✨ Features

### 🎨 User Interface
- **Modern Landing Page**: Sleek, responsive design with intuitive navigation
- **User Authentication**: Secure login and registration system
- **Role-Based Dashboards**: Separate interfaces for teachers and students
- **Interactive Forms**: Drag-and-drop PDF upload with real-time validation

![Landing Page Features](output/landing_page_02.png)

### 🤖 AI-Powered Generation
- **Multiple Generation Methods**: 
  - AI-powered automatic generation from PDFs
  - Manual question creation tools
  - Topic-wise study material generation
- **Advanced RAG Implementation**: Better document understanding through retrieval-augmented generation
- **LLaMA-2 Integration**: Uses state-of-the-art language model via Hugging Face API
- **Question Variety**: Generates diverse question types and difficulty levels

![AI Question Generator](output/ai%20question%20generator.png)

### 📚 Educational Tools
- **Test Assignment System**: Create and assign tests to students
- **Student Dashboard**: Track progress and access assigned materials
- **Teacher Dashboard**: Manage students, create content, and monitor performance
- **Study Material Generation**: AI-powered topic-wise content creation

![Teacher Dashboard](output/teacher%20dashboard.png)
![Student Dashboard](output/student%20dashboard.png)

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- Lucide React (icons)
- React Dropzone
- Axios

### Backend
- Node.js
- Express.js
- Multer (file uploads)
- PDF-Parse (PDF text extraction)
- Hugging Face Inference API
- CORS support

## 🚀 Step-by-Step Development Approach

This project was built following a systematic approach to overcome technical challenges and deliver a robust solution:

### 📋 Development Journey

1. **Initial React Setup** 🎯
   - Created a React project with modern tooling
   - Integrated multiple pages using React Router
   - Designed responsive UI components with Tailwind CSS

2. **Backend Architecture Challenge** ⚡
   - Initially attempted Node.js backend implementation
   - Encountered dependency conflicts with Hugging Face integration
   - **Solution**: Pivoted to Python backend for better AI model compatibility

3. **AI Integration Success** 🤖
   - Implemented Python Flask backend
   - Successfully integrated Hugging Face LLaMA-2 model
   - Built robust RAG (Retrieval-Augmented Generation) system

4. **Feature Enhancement** 🔧
   - Added user authentication system
   - Implemented role-based access control
   - Created comprehensive dashboard interfaces

![Manual Question Generator](output/manual%20question%20generator%2001.png)

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher) for frontend
- Python 3.8+ for Python backend (recommended)
- npm or yarn
- Hugging Face account and API token

### Backend Options

You can choose between two backend implementations:

#### Option 1: Python Backend (Recommended)
Better AI model integration and more reliable RAG implementation.

```bash
# Install frontend dependencies
npm install

# Setup Python backend
cd python-backend
python setup.py
cd ..
```

#### Option 2: Node.js Backend
Simpler setup but with dependency conflicts for some packages.

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install --legacy-peer-deps
cd ..
```

### 2. Environment Configuration

#### Frontend (.env)
```bash
cp .env.example .env
```
Edit `.env` and add:
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_HUGGINGFACE_TOKEN=your_huggingface_token_here
```

#### Backend (backend/.env)
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env` and add:
```
HUGGINGFACE_TOKEN=your_huggingface_token_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Get Hugging Face API Token

1. Visit [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Create a new token with "Read" permissions
3. Copy the token to your environment files

### 4. Run the Application

#### Quick Start (Windows)
```bash
# For Python backend (recommended)
start-python.bat

# For Node.js backend
start.bat
```

#### Manual Start

**Python Backend:**
```bash
# Terminal 1 - Python Backend
cd python-backend
python app.py

# Terminal 2 - Frontend
npm start
```

**Node.js Backend:**
```bash
# Terminal 1 - Node.js Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm start
```

Both backends run on http://localhost:5000
Frontend runs on http://localhost:3000

## 📖 Usage Guide

### 🏠 Getting Started

1. **Welcome Page**: Visit http://localhost:3000 to access the landing page
   
   ![Landing Page](output/landing_page_03.png)

2. **User Registration**: Create your account as a teacher or student
   
   ![Registration](output/registration.png)

3. **Login**: Access your personalized dashboard
   
   ![Login](output/login.png)

### 👨‍🏫 For Teachers

4. **Teacher Dashboard**: Access comprehensive tools for content creation
   - Create question papers
   - Manage students
   - Assign tests
   - Generate study materials

5. **AI Question Generation**: 
   - Enter a title for your question paper
   - Provide detailed description (difficulty level, topics, etc.)
   - Upload PDF document using drag-and-drop
   - Click "Generate Questions" and wait for AI processing

   ![Manual Question Generator](output/manual%20question%20generator%2002.png)

6. **Test Assignment**: Create and assign tests to students
   
   ![Test Assignment](output/test_assign.png)

7. **Study Material Generation**: Create topic-wise educational content
   
   ![Topic-wise Study Material](output/topic%20wise%20study%20material%20generation.png)

### 👨‍🎓 For Students

8. **Student Experience**: 
   - Access assigned tests
   - Take examinations
   - View study materials
   - Track progress

   ![Test Page](output/test_page.png)

### 💬 Interactive Features

9. **AI Chatbot**: Get instant help and guidance
   
   ![Chatbot Discussion](output/chatbot%20discussion.png)

## API Endpoints

### POST /api/generate-questions
Generates questions from uploaded PDF and form data.

**Request:**
- `title` (string): Question paper title
- `description` (string): Description and requirements
- `pdf` (file): PDF document to process

**Response:**
```json
{
  "success": true,
  "questions": ["Question 1...", "Question 2..."],
  "metadata": {
    "title": "Sample Title",
    "description": "Sample Description",
    "pdfSize": 1024000,
    "textLength": 5000
  }
}
```

### GET /api/health
Health check endpoint.

## Architecture

### RAG Implementation
1. **PDF Processing**: Extract text using pdf-parse
2. **Text Chunking**: Split document into manageable chunks
3. **Context Processing**: Clean and structure text for better understanding
4. **Question Generation**: Use processed context with LLaMA-2

### LLaMA-2 Integration
- Uses Hugging Face Inference API
- Model: `meta-llama/Llama-2-7b-chat-hf`
- Structured prompts for consistent question generation
- Fallback mechanism for API failures

## Customization

### Question Types
Modify the prompt in `backend/server.js` to generate specific question types:
- Multiple choice questions
- Short answer questions
- Essay questions
- Application-based questions

### Styling
Update Tailwind classes in React components for custom styling.

### RAG Enhancement
For production use, consider:
- Vector databases (FAISS, Pinecone)
- Embedding models (sentence-transformers)
- Advanced chunking strategies
- Semantic search capabilities

## Deployment

### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy the build folder
```

### Backend (Railway/Heroku)
```bash
# Set environment variables in your hosting platform
# Deploy the backend folder
```

## 🎯 Key Achievements

- ✅ **Responsive Design**: Modern, mobile-friendly interface
- ✅ **AI Integration**: Successfully implemented LLaMA-2 model
- ✅ **RAG Technology**: Advanced document understanding
- ✅ **User Management**: Complete authentication system
- ✅ **Multi-Role Support**: Teacher and student interfaces
- ✅ **Real-time Processing**: Efficient PDF parsing and question generation
- ✅ **Interactive Features**: Chatbot assistance and drag-drop uploads

## 🔧 Troubleshooting

### Common Issues

1. **Node.js Dependency Conflicts** ⚠️
   - Use `npm install --legacy-peer-deps` for Node.js backend
   - **Recommended**: Switch to Python backend for better stability
   - The conflict occurs between langchain and @huggingface/inference versions

2. **Hugging Face API Errors** 🤖
   - Verify your API token is correct and active
   - Check if the LLaMA-2 model is available
   - Monitor rate limits and usage quotas

3. **PDF Processing Fails** 📄
   - Ensure PDF is not password protected
   - Check file size limits (10MB maximum)
   - Verify PDF is not corrupted or contains readable text

4. **Python Backend Issues** 🐍
   - Install Python 3.8 or higher
   - Run `python setup.py` in python-backend directory
   - Check if all dependencies installed correctly using `pip list`

5. **CORS Issues** 🌐
   - Verify backend CORS configuration allows frontend origin
   - Check frontend API URL configuration in .env files

### 🛡️ Fallback Mechanisms
The application includes robust fallback systems:
- Mock questions generation if AI API fails
- Comprehensive error handling for file uploads
- Graceful degradation for network connectivity issues
- User-friendly error messages and recovery suggestions

## 🤝 Contributing

We welcome contributions to improve this project! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes with proper testing
4. **Commit** your changes (`git commit -m 'Add amazing feature'`)
5. **Push** to the branch (`git push origin feature/amazing-feature`)
6. **Submit** a pull request

### 🎯 Areas for Contribution
- UI/UX improvements
- Additional AI model integrations
- Performance optimizations
- Test coverage expansion
- Documentation enhancements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hugging Face** 🤗 for providing access to LLaMA-2 model and inference API
- **React Community** ⚛️ for excellent development tools and ecosystem
- **Tailwind CSS** 🎨 for the utility-first CSS framework
- **Python Community** 🐍 for robust AI/ML libraries and tools
- **Open Source Contributors** 👥 for inspiration and code examples

## 📊 Project Statistics

- **Frontend**: React 18 with modern hooks and components
- **Backend**: Python Flask with AI model integration
- **AI Model**: Meta's LLaMA-2-7b-chat-hf via Hugging Face
- **Styling**: Tailwind CSS with responsive design
- **File Processing**: Advanced PDF parsing and text extraction
- **Authentication**: Secure user management system

---

<div align="center">

**Built with ❤️ for the education community**

*Transforming learning through AI-powered question generation*

</div>


<!-- Hey There -->