# 🚀 How to Run Your AI-Powered Question Paper Generator

## ✅ **CURRENT STATUS - APP IS RUNNING!**

Your application is currently running and ready to use:

- **🖥️ Frontend (React)**: http://localhost:3001
- **⚙️ Backend (Python + Gemini AI)**: http://localhost:5000
- **🤖 AI System**: Google Gemini Pro (Active)
- **📊 Status**: All systems operational

---

## 🎯 **QUICK ACCESS**

### **🌐 Open Your App**
Click here to access your application: **http://localhost:3001**

### **🔧 API Health Check**
Check backend status: **http://localhost:5000/api/health**

---

## 📋 **STEP-BY-STEP STARTUP GUIDE**

### **Method 1: Automatic Startup (Easiest)**

1. **Open Terminal/Command Prompt**
2. **Navigate to your project folder**
   ```bash
   cd path/to/your/project
   ```

3. **Start Backend**
   ```bash
   cd python-backend
   python app.py
   ```
   ✅ Wait for: "Starting Gemini AI Study Assistant API on port 5000"

4. **Start Frontend (New Terminal)**
   ```bash
   npm start
   ```
   ✅ Wait for: "Compiled successfully!"

### **Method 2: Manual Commands**

**Terminal 1 - Backend:**
```bash
# Navigate to backend
cd python-backend

# Start Python Flask server
python app.py

# You should see:
# 🤖 Google Gemini initialized successfully
# Starting Gemini AI Study Assistant API on port 5000
```

**Terminal 2 - Frontend:**
```bash
# Navigate to project root
cd your-project-folder

# Start React development server
npm start

# You should see:
# Compiled successfully!
# Local: http://localhost:3000 (or 3001)
```

---

## 🔍 **VERIFICATION CHECKLIST**

### **✅ Backend Running Successfully**
- [ ] Terminal shows "Gemini AI Study Assistant API on port 5000"
- [ ] Visit http://localhost:5000/api/health shows "healthy"
- [ ] No error messages in terminal

### **✅ Frontend Running Successfully**
- [ ] Terminal shows "Compiled successfully!"
- [ ] Browser opens automatically to http://localhost:3000 or 3001
- [ ] Landing page loads with premium design

### **✅ AI Integration Working**
- [ ] Backend shows "🤖 Gemini available: Yes"
- [ ] No API key errors in terminal
- [ ] AI features respond properly

---

## 🎨 **WHAT YOU'LL SEE**

### **1. Premium Landing Page**
- Modern glass morphism design
- Gradient backgrounds and animations
- "Get Started" and "Sign In" buttons
- AI-powered features showcase

### **2. User Registration/Login**
- Choose role: Teacher or Student
- Secure authentication system
- Redirects to role-specific dashboard

### **3. Teacher Dashboard**
- Create and manage exams
- AI question generation
- Student performance analytics
- Study material creation

### **4. Student Dashboard**
- Take assigned exams
- View results and progress
- Access study materials
- Chat with AI assistant

---

## 🛠️ **TROUBLESHOOTING**

### **❌ Common Issues & Solutions**

#### **1. Backend Won't Start**
```bash
# Check Python version
python --version  # Should be 3.8+

# Install dependencies
cd python-backend
pip install -r requirements.txt

# Check environment file
# Make sure .env file exists with GEMINI_API_KEY
```

#### **2. Frontend Won't Start**
```bash
# Install dependencies
npm install

# Clear cache if needed
npm start -- --reset-cache
```

#### **3. Port Already in Use**
```bash
# Frontend automatically asks to use different port
# Or manually specify port:
PORT=3002 npm start
```

#### **4. Gemini AI Not Working**
```bash
# Check API key in python-backend/.env
GEMINI_API_KEY=your_api_key_here

# Test API key
cd python-backend
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('API Key:', os.getenv('GEMINI_API_KEY')[:10] + '...')"
```

#### **5. CORS Errors**
- Backend automatically configured for http://localhost:3000 and 3001
- If using different port, update CORS settings in `python-backend/app.py`

---

## 🔧 **DEVELOPMENT COMMANDS**

### **Backend Commands**
```bash
cd python-backend

# Start development server
python app.py

# Test AI integration
python test_gemini_diagnosis.py

# Check dependencies
pip list
```

### **Frontend Commands**
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Check dependencies
npm list
```

---

## 📱 **ACCESSING YOUR APP**

### **Desktop Browser**
- **Primary URL**: http://localhost:3001
- **Alternative**: http://localhost:3000 (if available)
- **Network Access**: http://your-ip:3001 (for other devices)

### **Mobile Testing**
- Find your computer's IP address
- Access http://your-ip:3001 from mobile browser
- App is fully responsive and mobile-optimized

---

## 🎯 **FEATURES TO TEST**

### **1. AI Question Generation**
1. Register as Teacher
2. Go to Question Generator
3. Enter topic: "Python Programming"
4. Click "Generate Questions"
5. Watch AI create intelligent questions

### **2. Study Material Creation**
1. Use Study Material Generator
2. Enter any educational topic
3. Get comprehensive study content
4. AI-powered explanations and examples

### **3. Interactive Chat**
1. Use the AI Study Chatbot
2. Ask educational questions
3. Get intelligent, contextual responses
4. Powered by Google Gemini AI

### **4. Exam Management**
1. Create exams with custom questions
2. Assign to students
3. Monitor real-time progress
4. View detailed analytics

---

## 🚨 **EMERGENCY RESTART**

If something goes wrong, follow these steps:

### **1. Stop All Processes**
- Press `Ctrl+C` in both terminal windows
- Or close terminal windows

### **2. Clean Restart**
```bash
# Terminal 1 - Backend
cd python-backend
python app.py

# Terminal 2 - Frontend  
npm start
```

### **3. Nuclear Option (Complete Reset)**
```bash
# Stop all Node processes
taskkill /f /im node.exe  # Windows
# killall node  # Mac/Linux

# Restart everything
cd python-backend && python app.py
# New terminal: npm start
```

---

## 📞 **SUPPORT**

### **Check Logs**
- **Backend logs**: Check terminal running `python app.py`
- **Frontend logs**: Check browser developer console (F12)
- **Network issues**: Check browser Network tab

### **Common Success Indicators**
- ✅ Backend: "Gemini AI Study Assistant API on port 5000"
- ✅ Frontend: "Compiled successfully!"
- ✅ Browser: Premium landing page loads
- ✅ AI: Question generation works

---

## 🎉 **YOU'RE READY!**

Your AI-Powered Question Paper Generator is now running with:
- ✅ Premium UI with glass morphism design
- ✅ Google Gemini AI integration
- ✅ Complete exam management system
- ✅ Real-time analytics and reporting
- ✅ Mobile-responsive design
- ✅ Secure authentication system

**🌐 Access your app at: http://loc