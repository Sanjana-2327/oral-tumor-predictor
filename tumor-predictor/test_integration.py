#!/usr/bin/env python3
"""
Test script to verify the dashboard and patient report integration
"""

import requests
import json
import time

def test_backend_health():
    """Test if backend is running"""
    try:
        response = requests.get("http://localhost:8000/patients", timeout=5)
        return response.status_code == 200
    except:
        return False

def test_user_endpoints():
    """Test user management endpoints"""
    base_url = "http://localhost:8000"
    
    print("Testing user management endpoints...")
    
    # Test get user profile
    try:
        response = requests.get(f"{base_url}/users/demo_doctor_001")
        if response.status_code == 200:
            user_data = response.json()
            print(f"✅ User profile loaded: {user_data['user']['full_name']}")
            print(f"   - Role: {user_data['user']['role']}")
            print(f"   - Specialization: {user_data['user']['specialization']}")
            print(f"   - Assigned patients: {len(user_data['assigned_patients'])}")
        else:
            print(f"❌ Failed to load user profile: {response.status_code}")
    except Exception as e:
        print(f"❌ Error loading user profile: {e}")
    
    # Test user dashboard
    try:
        response = requests.get(f"{base_url}/users/demo_doctor_001/dashboard")
        if response.status_code == 200:
            dashboard_data = response.json()
            print(f"✅ User dashboard loaded")
            print(f"   - Total patients: {dashboard_data['statistics']['total_patients']}")
            print(f"   - Recent predictions: {dashboard_data['statistics']['recent_predictions']}")
            print(f"   - Recent activity: {len(dashboard_data['recent_activity'])} items")
        else:
            print(f"❌ Failed to load user dashboard: {response.status_code}")
    except Exception as e:
        print(f"❌ Error loading user dashboard: {e}")
    
    # Test patient report
    try:
        response = requests.get(f"{base_url}/users/demo_doctor_001/patients/A001/report")
        if response.status_code == 200:
            report_data = response.json()
            print(f"✅ Patient report loaded for {report_data['patient']['patient_id']}")
            print(f"   - Risk assessment: {report_data['risk_assessment']['overall_risk']}")
            print(f"   - Follow-ups: {len(report_data['followups'])}")
            print(f"   - Predictions: {len(report_data['predictions'])}")
        else:
            print(f"❌ Failed to load patient report: {response.status_code}")
    except Exception as e:
        print(f"❌ Error loading patient report: {e}")

def main():
    print("🧪 Testing Dashboard and Patient Report Integration")
    print("=" * 60)
    
    # Wait for backend to start
    print("Waiting for backend to start...")
    for i in range(10):
        if test_backend_health():
            print("✅ Backend is running!")
            break
        time.sleep(1)
        print(f"Waiting... ({i+1}/10)")
    else:
        print("❌ Backend is not running. Please start it first:")
        print("   cd tumor-predictor/server")
        print("   python app.py")
        return
    
    print("\n" + "=" * 60)
    test_user_endpoints()
    
    print("\n" + "=" * 60)
    print("🎉 Integration test completed!")
    print("\nNext steps:")
    print("1. Start the frontend: npm run dev")
    print("2. Open http://localhost:5173")
    print("3. Check the Dashboard and Patient Report tabs")
    print("4. Follow the integration guide to add the components")

if __name__ == "__main__":
    main()
