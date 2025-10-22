#!/usr/bin/env python3
"""
Demo startup script for the tumor predictor application
"""

import subprocess
import sys
import os
import time
import requests
from pathlib import Path

def check_backend_health():
    """Check if the backend is running"""
    try:
        response = requests.get("http://localhost:8000/patients", timeout=5)
        return response.status_code == 200
    except:
        return False

def start_backend():
    """Start the backend server"""
    print("Starting backend server...")
    backend_dir = Path(__file__).parent / "server"
    
    # Change to server directory and start the server
    os.chdir(backend_dir)
    
    # Start the server in the background
    process = subprocess.Popen([
        sys.executable, "app.py"
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    # Wait for server to start
    print("Waiting for backend to start...")
    for i in range(30):  # Wait up to 30 seconds
        if check_backend_health():
            print("✅ Backend is running!")
            return process
        time.sleep(1)
        print(f"Waiting... ({i+1}/30)")
    
    print("❌ Backend failed to start")
    return None

def populate_sample_data():
    """Populate the database with sample data"""
    print("Populating database with sample data...")
    
    # Run the populate script
    backend_dir = Path(__file__).parent / "server"
    os.chdir(backend_dir)
    
    try:
        result = subprocess.run([sys.executable, "populate_sample_data.py"], 
                              capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            print("✅ Sample data populated successfully!")
        else:
            print(f"⚠️ Sample data population had issues: {result.stderr}")
    except Exception as e:
        print(f"⚠️ Error populating sample data: {e}")
    
    # Populate users
    try:
        result = subprocess.run([sys.executable, "populate_users.py"], 
                              capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            print("✅ User data populated successfully!")
        else:
            print(f"⚠️ User data population had issues: {result.stderr}")
    except Exception as e:
        print(f"⚠️ Error populating user data: {e}")

def start_frontend():
    """Start the frontend development server"""
    print("Starting frontend development server...")
    frontend_dir = Path(__file__).parent
    
    # Change to frontend directory
    os.chdir(frontend_dir)
    
    # Start the frontend server
    try:
        subprocess.run(["npm", "run", "dev"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Frontend failed to start: {e}")
        print("Make sure you have Node.js and npm installed, and run 'npm install' first")

def main():
    """Main function to start the demo"""
    print("🚀 Starting Tumor Predictor Demo")
    print("=" * 50)
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        print("❌ Failed to start backend. Please check the server logs.")
        return
    
    # Populate sample data
    populate_sample_data()
    
    print("\n" + "=" * 50)
    print("✅ Backend is ready!")
    print("📊 Dashboard and patient reports are now available")
    print("🔗 Backend API: http://localhost:8000")
    print("🌐 Frontend: http://localhost:5173 (run 'npm run dev' in another terminal)")
    print("\n📋 Available features:")
    print("  • User-specific dashboard with analytics")
    print("  • Comprehensive patient reports")
    print("  • Role-based access control")
    print("  • AI-powered tumor predictions")
    print("  • Treatment effectiveness tracking")
    print("\n👤 Demo user: Dr. Sarah Mitchell (demo_doctor_001)")
    print("=" * 50)
    
    try:
        # Keep the backend running
        backend_process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down...")
        backend_process.terminate()

if __name__ == "__main__":
    main()
