#!/usr/bin/env python3
"""
Script to populate the database with sample users and patient assignments
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, create_tables
from models.database_models import User, Patient, PatientAssignment, UserRoleEnum
from datetime import datetime

def populate_users():
    """Create sample users and assign them to patients"""
    db = SessionLocal()
    
    try:
        # Create tables if they don't exist
        create_tables()
        
        # Create sample users
        users_data = [
            {
                "user_id": "demo_doctor_001",
                "username": "dr_sarah_mitchell",
                "email": "sarah.mitchell@hospital.com",
                "full_name": "Dr. Sarah Mitchell",
                "role": UserRoleEnum.DOCTOR,
                "specialization": "Head & Neck Oncology",
                "license_number": "MD-78452",
                "hospital_affiliation": "City General Hospital"
            },
            {
                "user_id": "demo_admin_001",
                "username": "admin_john_doe",
                "email": "john.doe@hospital.com",
                "full_name": "John Doe",
                "role": UserRoleEnum.ADMIN,
                "specialization": "Healthcare Administration",
                "license_number": "ADM-12345",
                "hospital_affiliation": "City General Hospital"
            },
            {
                "user_id": "demo_researcher_001",
                "username": "dr_jane_smith",
                "email": "jane.smith@research.org",
                "full_name": "Dr. Jane Smith",
                "role": UserRoleEnum.RESEARCHER,
                "specialization": "Cancer Research",
                "license_number": "PHD-67890",
                "hospital_affiliation": "Research Institute"
            }
        ]
        
        # Create users
        for user_data in users_data:
            existing_user = db.query(User).filter(User.user_id == user_data["user_id"]).first()
            if not existing_user:
                user = User(**user_data)
                db.add(user)
                print(f"Created user: {user_data['full_name']}")
            else:
                print(f"User already exists: {user_data['full_name']}")
        
        db.commit()
        
        # Get all patients
        patients = db.query(Patient).all()
        print(f"Found {len(patients)} patients in database")
        
        # Assign patients to users
        if patients:
            # Assign first 3 patients to Dr. Sarah Mitchell
            doctor = db.query(User).filter(User.user_id == "demo_doctor_001").first()
            if doctor:
                for i, patient in enumerate(patients[:3]):
                    existing_assignment = db.query(PatientAssignment).filter(
                        PatientAssignment.user_id == doctor.id,
                        PatientAssignment.patient_id == patient.patient_id
                    ).first()
                    
                    if not existing_assignment:
                        assignment = PatientAssignment(
                            user_id=doctor.id,
                            patient_id=patient.patient_id,
                            assignment_type="primary"
                        )
                        db.add(assignment)
                        print(f"Assigned patient {patient.patient_id} to Dr. Sarah Mitchell")
            
            # Assign next 2 patients to Dr. Jane Smith (researcher)
            researcher = db.query(User).filter(User.user_id == "demo_researcher_001").first()
            if researcher and len(patients) > 3:
                for patient in patients[3:5]:
                    existing_assignment = db.query(PatientAssignment).filter(
                        PatientAssignment.user_id == researcher.id,
                        PatientAssignment.patient_id == patient.patient_id
                    ).first()
                    
                    if not existing_assignment:
                        assignment = PatientAssignment(
                            user_id=researcher.id,
                            patient_id=patient.patient_id,
                            assignment_type="research"
                        )
                        db.add(assignment)
                        print(f"Assigned patient {patient.patient_id} to Dr. Jane Smith")
        
        db.commit()
        print("User population completed successfully!")
        
    except Exception as e:
        print(f"Error populating users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_users()
