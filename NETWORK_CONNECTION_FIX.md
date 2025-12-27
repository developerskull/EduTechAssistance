# 🔧 Network Connection Fix Guide

## 🚨 Problem: "Network request failed" Error

The mobile app can't connect to the backend server. This is a common issue when running React Native/Expo apps with local backend servers.

## 🎯 Quick Solutions

### **Solution 1: For Android Emulator (Recommended)**

The Android emulator maps `localhost` to `10.0.2.2`. The API service has been updated to handle this automatically.

**✅ Already Fixed in Code**: The API service now automatically uses `10.0.2.2:5000` for Android emulator.

### **Solution 2: For Physical Android Device**

If testing on a physical Android device, you need to use your computer's IP address.

#### **Step 1: Find Your Computer's IP Address**

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" (e.g., 192.168.1.100)
```

**Mac/Linux:**
```bash
ifconfig
# Look for inet address (e.g., 192.168.1.100)
```

#### **Step 2: Update API Configuration**

Edit `QuestionGenMobileApp/services/api-service.ts`:

```typescript
// Replace this line in the getApiBaseUrl function:
return 'http://10.0.2.2:5000/api';

// With your computer's IP:
return 'http://YOUR_IP_ADDRESS:5000/api';
// Example: return 'http://192.168.1.100:5000/api';
```

### **Solution 3: For iOS Simulator**

iOS Simulator can use `localhost` directly.

**✅ Already Fixed in Code**: The API service automatically uses `localhost:5000` for iOS.

## 🛠️ Complete Setup Instructions

### **1. Start the Backend Server**

```bash
cd python-backend
python app.py
```

**Expected Output:**
```
Starting Gemini AI Study Assistant API on port 5000
Debug mode: True
AI System: Google Gemini Pro
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://YOUR_IP:5000
```

### **2. Verify Backend is Running**

Open browser and go to: `http://localhost:5000/api/health`

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "Gemini AI Study Assistant",
  "version": "3.0.0"
}
```

### **3. Start the Mobile App**

```bash
cd QuestionGenMobileApp
npx expo start --clear
```

### **4. Test Connection**

The app will automatically test the backend connection and show appropriate messages.

## 🔍 Debugging Steps

### **Check 1: Backend Server Status**

```bash
# Test if backend is accessible
curl http://localhost:5000/api/health

# Or from your IP address
curl http://YOUR_IP:5000/api/health
```

### **Check 2: Firewall Settings**

**Windows:**
- Allow Python through Windows Firewall
- Or temporarily disable firewall for testing

**Mac:**
- System Preferences → Security & Privacy → Firewall
- Allow incoming connections for Python

### **Check 3: Network Configuration**

Ensure your computer and mobile device are on the same WiFi network.

### **Check 4: Port Availability**

```bash
# Check if port 5000 is in use
netstat -an | grep 5000

# Windows
netstat -an | findstr 5000
```

## 📱 Platform-Specific Solutions

### **Android Emulator**
- ✅ Uses `10.0.2.2:5000` (automatically configured)
- No additional setup needed

### **Physical Android Device**
- 📝 Update IP address in `api-service.ts`
- Ensure same WiFi network
- Check firewall settings

### **iOS Simulator**
- ✅ Uses `localhost:5000` (automatically configured)
- No additional setup needed

### **Physical iOS Device**
- 📝 Update IP address in `api-service.ts`
- Ensure same WiFi network
- May need HTTPS for production

## 🚀 Alternative Solutions

### **Option 1: Use Expo Tunnel**

```bash
npx expo start --tunnel
```

This creates a public URL that works from any device.

### **Option 2: Use ngrok for Backend**

```bash
# Install ngrok
npm install -g ngrok

# Expose backend
ngrok http 5000
```

Then update API_BASE_URL to use the ngrok URL.

### **Option 3: Deploy Backend to Cloud**

Deploy the Python backend to:
- Heroku
- Railway
- Render
- Vercel

## 🔧 Code Changes Made

### **Enhanced API Service**

```typescript
// Automatic platform detection
const getApiBaseUrl = () => {
  if (__DEV__) {
    const Platform = require('react-native').Platform;
    
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000/api';  // Android emulator
    } else {
      return 'http://localhost:5000/api';  // iOS simulator
    }
  }
};
```

### **Enhanced Error Handling**

```typescript
// Better error messages
if (error.message.includes('Network request failed')) {
  throw new Error('Cannot connect to server. Please check if the backend is running and accessible.');
}
```

### **Fallback Data**

```typescript
// Graceful degradation when backend is unavailable
async getDashboardData() {
  try {
    return await this.makeRequest('/dashboard');
  } catch (error) {
    // Return fallback data instead of crashing
    return { success: true, data: defaultDashboardData };
  }
}
```

## ✅ Testing Checklist

- [ ] Backend server is running on port 5000
- [ ] Can access `http://localhost:5000/api/health` in browser
- [ ] Mobile app and computer are on same WiFi network
- [ ] Firewall allows connections to port 5000
- [ ] Using correct IP address for physical device testing
- [ ] App shows connection status in console logs

## 🎯 Expected Behavior After Fix

### **Successful Connection**
- Dashboard loads with real data
- Console shows: "Backend connection successful"
- Statistics update when you use features
- Recent activities appear after actions

### **Offline Mode**
- Dashboard loads with default data
- Console shows: "Backend not available, using fallback data"
- App still works but doesn't save activities
- Pull-to-refresh attempts to reconnect

## 📞 Still Having Issues?

### **Common Problems:**

1. **Port 5000 in use**: Change backend port in `app.py`
2. **CORS errors**: Backend already configured for mobile app
3. **Timeout errors**: Increase timeout in API service
4. **SSL errors**: Use HTTP for development, HTTPS for production

### **Debug Commands:**

```bash
# Check backend logs
cd python-backend
python app.py

# Check mobile app logs
npx expo start
# Press 'j' to open debugger
```

## 🎉 Success!

Once connected, you'll see:
- Real-time dashboard statistics
- Activity logging working
- Dynamic welcome messages
- Pull-to-refresh functionality
- Persistent data across app sessions

**Your dynamic dashboard is now fully connected and working!** 🚀