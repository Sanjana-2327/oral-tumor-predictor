"""
Database configuration and connection setup for MySQL
"""
import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

# Database configuration
# Use SQLite for development/testing, MySQL for production
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./tumor_predictor.db"  # SQLite fallback for testing
    # "mysql+pymysql://root:password@localhost:3306/tumor_predictor_db"  # MySQL for production
)

# Create engine with connection pooling
if DATABASE_URL.startswith("sqlite"):
    # SQLite configuration
    engine = create_engine(
        DATABASE_URL,
        echo=False,  # Set to True for SQL debugging
        connect_args={"check_same_thread": False}  # SQLite specific
    )
else:
    # MySQL configuration
    engine = create_engine(
        DATABASE_URL,
        poolclass=QueuePool,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        echo=False  # Set to True for SQL debugging
    )

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Metadata for table creation
metadata = MetaData()

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create all tables in the database"""
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """Drop all tables in the database"""
    Base.metadata.drop_all(bind=engine)
