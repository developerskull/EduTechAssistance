# 🚀 Quick Start Guide - Dynamic Dashboard

## 🎯 Fix Network Connection & Start Dynamic Dashboard

Follow these steps to get your dynamic dashboard working with backend connection.

## 📋 Prerequisites

- Python 3.8+ installed
- Node.js 16+ installed
- Expo CLI installed (`npm install -g @expo/cli`)
- Android Studio (for Android emulator) or Xcode (for iOS simulator)

## 🛠️ Step-by-Step Setup

### **Step 1: Start the Backend Server**

```bash
# Navigate to backend directory
cd python-backend

# Install dependencies (if not already done)
pip install -r requirements.txt

# Start the server
python app.py
```

**Expected Output:**
```
Starting Gemini AI Study Assistant API on port 5000
Debug mode: True
AI System: Google Gemini Pro
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
```

### **Step 2: Test Backend Connection**

```bash
# Run the connection test script
python test_backend_connection.py
```

**Expected Output:**
```
🔍 Testing Backend Connection...
1. Testing health endpoint...
   ✅ Health check passed
   📊 Status: healthy
   🤖 Service: Gemini AI Study Assistant
```

### **Step 3: Configure Mobile App for Your Device**

#### **For Android Emulator (Recommended)**
✅ **No configuration needed** - automatically uses `10.0.2.2:5000`

#### **For Physical Android/iOS Device**
1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux  
   ifconfig
   ```

2. Update `QuestionGenMobileApp/services/api-service.ts`:
   ```typescript
   // Find this line (around line 15):
   return 'http://10.0.2.2:5000/api';
   
   // Replace with your IP:
   return 'http://YOUR_IP_ADDRESS:5000/api';
   // Example: return 'http://192.168.1.100:5000/api';
   ```

### **Step 4: Start the Mobile App**

```bash
# Navigate to mobile app directory
cd QuestionGenMobileApp

# Install dependencies (if not already done)
npm install

# Start Expo development server
npx expo start --clear
```

### **Step 5: Open App on Device**

#### **Android Emulator**
- Press `a` in the Expo CLI to open Android emulator
- Or scan QR code with Expo Go app

#### **iOS Simulator**
- Press `i` in the Expo CLI to open iOS simulator
- Or scan QR code with Expo Go app

#### **Physical Device**
- Install Expo Go app from App Store/Play Store
- Scan QR code from Expo CLI

## 🔍 Troubleshooting

### **Problem: "Network request failed"**

**Solution 1: Check Backend**
```bash
# Test if backend is running
curl http://localhost:5000/api/health

# Should return: {"status": "healthy", ...}
```

**Solution 2: Check IP Configuration**
- For Android emulator: Use `10.0.2.2:5000`
- For physical device: Use your computer's IP address
- Ensure both devices are on same WiFi network

**Solution 3: Check Firewall**
- Allow Python through Windows Firewall
- Or temporarily disable firewall for testing

### **Problem: Backend won't start**

**Solution:**
```bash
# Check if port 5000 is in use
netstat -an | grep 5000

# Kill process using port 5000 (if needed)
# Windows: netstat -ano | findstr 5000, then taskkill /PID <PID>
# Mac/Linux: lsof -ti:5000 | xargs kill
```

### **Problem: App crashes on startup**

**Solution:**
```bash
# Clear Expo cache
npx expo start --clear

# Reset Metro bundler
npx expo start --reset-cache
```

## ✅ Success Indicators

### **Backend Running Successfully:**
- Console shows "Running on http://127.0.0.1:5000"
- `http://localhost:5000/api/health` returns JSON response
- No error messages in terminal

### **Mobile App Connected:**
- Dashboard loads with statistics
- Console shows "Backend connection successful"
- Pull-to-refresh works
- Activities appear after using features

### **Dynamic Features Working:**
- Generate questions → Stats increment
- Create study materials → Stats update
- Chat with AI → Activity logged
- Welcome message changes based on usage

## 🎯 Testing the Dynamic Dashboard

### **Test 1: Generate Questions**
1. Go to Questions tab
2. Fill in topic (e.g., "Python Programming")
3. Generate questions
4. Return to Home tab
5. ✅ Questions count should increase
6. ✅ New activity should appear in recent activities

### **Test 2: Create Study Material**
1. Go to Study tab
2. Enter topic (e.g., "Machine Learning")
3. Generate study content
4. Return to Home tab
5. ✅ Study materials count should increase
6. ✅ New activity should appear

### **Test 3: Chat with AI**
1. Go to Chat tab
2. Send a message
3. Return to Home tab
4. ✅ Chat sessions count should increase
5. ✅ New activity should appear

### **Test 4: Pull to Refresh**
1. On Home tab, pull down to refresh
2. ✅ Data should reload from backend
3. ✅ Welcome message may change

## 🎉 You're All Set!

Your dynamic dashboard is now:
- 📊 **Connected to backend** - Real-time data
- 🔄 **Activity tracking** - Every action is logged
- 📱 **Responsive** - Works on all devices
- 🎯 **Personalized** - Adapts to your usage
- 🚀 **Production ready** - Scalable architecture

## 📞 Need Help?

### **Common Issues:**
1. **Port conflicts**: Change port in `app.py` if 5000 is in use
2. **CORS errors**: Backend is pre-configured for mobile apps
3. **Timeout errors**: Check network connection
4. **SSL errors**: Use HTTP for development

### **Debug Commands:**
```bash
# Check backend logs
cd python-backend && python app.py

# Check mobile logs  
npx expo start
# Press 'j' to open Chrome debugger
```

### **Reset Everything:**
```bash
# Reset mobile app
cd QuestionGenMobileApp
rm -rf node_modules
npm install
npx expo start --clear

# Reset backend database
cd python-backend
rm -f questiongen.db  # This will recreate the database
python app.py
```

**Happy coding! Your AI-powered learning platform is ready to go!** 🎊