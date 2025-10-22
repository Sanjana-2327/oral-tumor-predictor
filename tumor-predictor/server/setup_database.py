"""
Database setup script for MySQL
Run this to set up the database and install dependencies
"""
import subprocess
import sys
import os

def install_dependencies():
    """Install Python dependencies"""
    print("Installing Python dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        return False
    return True

def setup_mysql():
    """Setup MySQL database"""
    print("\n📋 MySQL Database Setup Instructions:")
    print("=" * 50)
    print("1. Install MySQL Server if not already installed")
    print("2. Start MySQL service")
    print("3. Create database and user:")
    print("   mysql -u root -p")
    print("   CREATE DATABASE tumor_predictor_db;")
    print("   CREATE USER 'tumor_user'@'localhost' IDENTIFIED BY 'tumor_password';")
    print("   GRANT ALL PRIVILEGES ON tumor_predictor_db.* TO 'tumor_user'@'localhost';")
    print("   FLUSH PRIVILEGES;")
    print("   EXIT;")
    print("\n4. Update database connection in database.py if needed")
    print("   Default: mysql+pymysql://root:password@localhost:3306/tumor_predictor_db")
    print("=" * 50)

def init_database():
    """Initialize database with tables and sample data"""
    print("\nInitializing database...")
    try:
        from init_database import init_database
        init_database()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        print("Make sure MySQL is running and database exists")
        return False
    return True

def main():
    """Main setup function"""
    print("🏥 Tumor Predictor Database Setup")
    print("=" * 40)
    
    # Install dependencies
    if not install_dependencies():
        return
    
    # Show MySQL setup instructions
    setup_mysql()
    
    # Ask user if they want to proceed with database initialization
    response = input("\nHave you set up MySQL database? (y/n): ").lower().strip()
    if response == 'y':
        if init_database():
            print("\n🎉 Database setup complete!")
            print("You can now run the application with: python app.py")
        else:
            print("\n❌ Database setup failed. Please check MySQL connection.")
    else:
        print("\nPlease set up MySQL first, then run this script again.")

if __name__ == "__main__":
    main()
