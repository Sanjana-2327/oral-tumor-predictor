"""
SQLAlchemy models for the tumor predictor database
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class GenderEnum(str, enum.Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"

class SmokingStatusEnum(str, enum.Enum):
    CURRENT_SMOKER = "Current Smoker"
    FORMER_SMOKER = "Former Smoker"
    NEVER_SMOKED = "Never Smoked"
    QUIT_1_5_YEARS = "Quit 1.5 years ago"

class AlcoholUseEnum(str, enum.Enum):
    NONE = "None"
    LIGHT = "Light"
    MODERATE = "Moderate"
    HEAVY_DAILY = "Heavy Daily"

class OralHygieneEnum(str, enum.Enum):
    EXCELLENT = "Excellent"
    GOOD = "Good"
    FAIR = "Fair"
    POOR = "Poor"
    VERY_POOR = "Very Poor"

class HPVStatusEnum(str, enum.Enum):
    POSITIVE = "Positive"
    NEGATIVE = "Negative"
    UNKNOWN = "Unknown"

class TreatmentTypeEnum(str, enum.Enum):
    SURGERY_ONLY = "Surgery Only"
    SURGERY_RT = "Surgery+RT"
    SURGERY_CHEMO_RT = "Surgery+Chemo+RT"
    CHEMO_RT = "Chemo+RT"
    RT_ONLY = "RT Only"

class ResponseEnum(str, enum.Enum):
    EXCELLENT = "Excellent"
    GOOD = "Good"
    FAIR = "Fair"
    POOR = "Poor"

class ActionTypeEnum(str, enum.Enum):
    UPLOAD = "upload"
    PREDICT = "predict"
    EXPLAIN = "explain"
    VIEW = "view"

class UserRoleEnum(str, enum.Enum):
    DOCTOR = "doctor"
    ADMIN = "admin"
    PATIENT = "patient"
    RESEARCHER = "researcher"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), unique=True, nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRoleEnum), nullable=False)
    specialization = Column(String(100))
    license_number = Column(String(50))
    hospital_affiliation = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    sessions = relationship("UserSession", back_populates="user")
    assigned_patients = relationship("PatientAssignment", back_populates="user")

class PatientAssignment(Base):
    __tablename__ = "patient_assignments"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    patient_id = Column(String(50), ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    assignment_type = Column(String(50), nullable=False)  # primary, secondary, consultant
    assigned_at = Column(DateTime, default=func.current_timestamp())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", back_populates="assigned_patients")
    patient = relationship("Patient")

class Patient(Base):
    __tablename__ = "patients"
    
    patient_id = Column(String(50), primary_key=True)
    age = Column(Integer, nullable=False)
    gender = Column(Enum(GenderEnum), nullable=False)
    stage_tnm = Column(String(20), nullable=False)
    initial_tumor_size_cm = Column(Float(5, 2), nullable=False)
    smoking_status = Column(Enum(SmokingStatusEnum), nullable=False)
    alcohol_use = Column(Enum(AlcoholUseEnum), nullable=False)
    oral_hygiene = Column(Enum(OralHygieneEnum), nullable=False)
    hpv_status = Column(Enum(HPVStatusEnum), nullable=False)
    comorbidities = Column(Text)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    followups = relationship("PatientFollowup", back_populates="patient", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="patient", cascade="all, delete-orphan")
    outcomes = relationship("TreatmentOutcome", back_populates="patient", cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="patient")

class PatientFollowup(Base):
    __tablename__ = "patient_followups"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(String(50), ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    follow_up_month = Column(Integer, nullable=False)
    tumor_size_cm = Column(Float(5, 2), nullable=False)
    recurrence = Column(Boolean, default=False, nullable=False)
    treatment_type = Column(Enum(TreatmentTypeEnum), nullable=False)
    response_to_treatment = Column(Enum(ResponseEnum), nullable=False)
    follow_up_date = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.current_timestamp())
    
    # Relationships
    patient = relationship("Patient", back_populates="followups")

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(String(50), ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    prediction_date = Column(DateTime, default=func.current_timestamp())
    treatment_type = Column(String(50), nullable=False)
    predicted_evolution = Column(JSON, nullable=False)
    risk_factors = Column(JSON, nullable=False)
    treatment_impact = Column(Float(5, 2), nullable=False)
    confidence = Column(Float(3, 2), nullable=False)
    model_version = Column(String(20), default="v1.0")
    created_at = Column(DateTime, default=func.current_timestamp())
    
    # Relationships
    patient = relationship("Patient", back_populates="predictions")
    risk_factor_details = relationship("RiskFactor", back_populates="prediction", cascade="all, delete-orphan")
    outcomes = relationship("TreatmentOutcome", back_populates="prediction")

class RiskFactor(Base):
    __tablename__ = "risk_factors"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id", ondelete="CASCADE"), nullable=False)
    factor_name = Column(String(100), nullable=False)
    impact_score = Column(Integer, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=func.current_timestamp())
    
    # Relationships
    prediction = relationship("Prediction", back_populates="risk_factor_details")

class TreatmentOutcome(Base):
    __tablename__ = "treatment_outcomes"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(String(50), ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    prediction_id = Column(Integer, ForeignKey("predictions.id", ondelete="SET NULL"))
    actual_tumor_size_cm = Column(Float(5, 2))
    actual_survival_probability = Column(Float(5, 2))
    actual_response = Column(Enum(ResponseEnum))
    outcome_date = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.current_timestamp())
    
    # Relationships
    patient = relationship("Patient", back_populates="outcomes")
    prediction = relationship("Prediction", back_populates="outcomes")

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(100), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    patient_id = Column(String(50), ForeignKey("patients.patient_id", ondelete="SET NULL"))
    action_type = Column(Enum(ActionTypeEnum), nullable=False)
    action_data = Column(JSON)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    created_at = Column(DateTime, default=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    patient = relationship("Patient", back_populates="sessions")
