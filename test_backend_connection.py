#!/usr/bin/env python3
"""
Backend Connection Test Script
Tests if the Python backend is running and accessible
"""

import requests
import json
import sys
from datetime import datetime

def test_backend_connection():
    """Test backend connection and endpoints"""
    
    base_url = "http://localhost:5000/api"
    
    print("🔍 Testing Backend Connection...")
    print(f"Base URL: {base_url}")
    print("-" * 50)
    
    # Test 1: Health Check
    try:
        print("1. Testing health endpoint...")
        response = requests.get(f"{base_url}/health", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Health check passed")
            print(f"   📊 Status: {data.get('status')}")
            print(f"   🤖 Service: {data.get('service')}")
            print(f"   📦 Version: {data.get('version')}")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("   ❌ Connection failed - Backend server is not running")
        print("   💡 Start the backend with: cd python-backend && python app.py")
        return False
    except requests.exceptions.Timeout:
        print("   ❌ Request timed out")
        return False
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return False
    
    # Test 2: Test Connection Endpoint
    try:
        print("\n2. Testing connection endpoint...")
        response = requests.get(f"{base_url}/test-connection", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Connection test passed")
            print(f"   📝 Message: {data.get('message')}")
        else:
            print(f"   ❌ Connection test failed: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
    
    # Test 3: Dashboard Endpoint
    try:
        print("\n3. Testing dashboard endpoint...")
        response = requests.get(f"{base_url}/dashboard?user_id=1", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Dashboard endpoint working")
            if data.get('success'):
                stats = data.get('data', {}).get('stats', {})
                print(f"   📊 Questions: {stats.get('total_questions_generated', 0)}")
                print(f"   📚 Study Materials: {stats.get('total_study_materials', 0)}")
                print(f"   💬 Chat Sessions: {stats.get('total_chat_sessions', 0)}")
            else:
                print(f"   ⚠️  Dashboard returned error: {data.get('error')}")
        else:
            print(f"   ❌ Dashboard test failed: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
    
    # Test 4: CORS Headers
    try:
        print("\n4. Testing CORS headers...")
        response = requests.options(f"{base_url}/health", timeout=5)
        
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        }
        
        if any(cors_headers.values()):
            print("   ✅ CORS headers present")
            for header, value in cors_headers.items():
                if value:
                    print(f"   📋 {header}: {value}")
        else:
            print("   ⚠️  No CORS headers found")
            
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🎉 Backend Connection Test Complete!")
    print("\n💡 Next Steps:")
    print("1. If tests passed, your backend is ready")
    print("2. Start your mobile app: cd QuestionGenMobileApp && npx expo start")
    print("3. If using Android emulator, it will connect to 10.0.2.2:5000")
    print("4. If using physical device, update IP in api-service.ts")
    
    return True

def get_network_info():
    """Get network information for mobile device connection"""
    import socket
    
    print("\n🌐 Network Information:")
    print("-" * 30)
    
    try:
        # Get local IP address
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        
        print(f"🖥️  Computer IP: {local_ip}")
        print(f"📱 For physical device, use: http://{local_ip}:5000/api")
        print(f"🤖 For Android emulator, use: http://10.0.2.2:5000/api")
        print(f"📲 For iOS simulator, use: http://localhost:5000/api")
        
    except Exception as e:
        print(f"❌ Could not determine IP address: {str(e)}")

if __name__ == "__main__":
    print("🚀 QuestionGen Backend Connection Tester")
    print(f"⏰ Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)
    
    # Test backend connection
    success = test_backend_connection()
    
    # Show network info
    get_network_info()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)