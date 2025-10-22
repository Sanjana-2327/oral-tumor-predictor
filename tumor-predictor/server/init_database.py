"""
Database initialization script
Creates tables and inserts sample data
"""
import os
import sys
from sqlalchemy import text
from database import engine, create_tables
from models.database_models import *

def init_database():
    """Initialize the database with tables and sample data"""
    print("Creating database tables...")
    create_tables()
    print("✅ Tables created successfully")
    
    # Insert sample data
    print("Inserting sample data...")
    
    with engine.connect() as conn:
        # Insert sample patients
        sample_patients = [
            {
                'patient_id': 'A001',
                'age': 65,
                'gender': 'Male',
                'stage_tnm': 'T4aN2bM0',
                'initial_tumor_size_cm': 4.8,
                'smoking_status': 'Current Smoker',
                'alcohol_use': 'Heavy Daily',
                'oral_hygiene': 'Poor',
                'hpv_status': 'Negative',
                'comorbidities': 'Diabetes, Hypertension'
            },
            {
                'patient_id': 'B001',
                'age': 54,
                'gender': 'Female',
                'stage_tnm': 'T2N1M0',
                'initial_tumor_size_cm': 2.5,
                'smoking_status': 'Quit 1.5 years ago',
                'alcohol_use': 'Moderate',
                'oral_hygiene': 'Fair',
                'hpv_status': 'Positive',
                'comorbidities': 'None'
            },
            {
                'patient_id': 'C001',
                'age': 45,
                'gender': 'Male',
                'stage_tnm': 'T1N0M0',
                'initial_tumor_size_cm': 1.2,
                'smoking_status': 'Current Smoker',
                'alcohol_use': 'Heavy Daily',
                'oral_hygiene': 'Very Poor',
                'hpv_status': 'Negative',
                'comorbidities': 'None'
            }
        ]
        
        for patient in sample_patients:
            conn.execute(text("""
                INSERT IGNORE INTO patients 
                (patient_id, age, gender, stage_tnm, initial_tumor_size_cm, 
                 smoking_status, alcohol_use, oral_hygiene, hpv_status, comorbidities)
                VALUES (:patient_id, :age, :gender, :stage_tnm, :initial_tumor_size_cm,
                        :smoking_status, :alcohol_use, :oral_hygiene, :hpv_status, :comorbidities)
            """), patient)
        
        # Insert follow-up data for Patient A001 (Aggressive case)
        followup_data_a001 = [
            (1, 4.8, True, 'Surgery+Chemo+RT', 'Poor', '2024-01-15'),
            (2, 5.0, True, 'Surgery+Chemo+RT', 'Poor', '2024-02-15'),
            (3, 5.1, True, 'Surgery+Chemo+RT', 'Poor', '2024-03-15'),
            (4, 5.4, True, 'Surgery+Chemo+RT', 'Poor', '2024-04-15'),
            (5, 5.5, True, 'Surgery+Chemo+RT', 'Poor', '2024-05-15'),
            (6, 5.8, True, 'Surgery+Chemo+RT', 'Poor', '2024-06-15'),
            (7, 6.0, True, 'Surgery+Chemo+RT', 'Poor', '2024-07-15'),
            (8, 6.1, True, 'Surgery+Chemo+RT', 'Poor', '2024-08-15'),
            (9, 6.4, True, 'Surgery+Chemo+RT', 'Poor', '2024-09-15'),
            (10, 6.7, True, 'Surgery+Chemo+RT', 'Poor', '2024-10-15'),
            (11, 7.0, True, 'Surgery+Chemo+RT', 'Poor', '2024-11-15'),
            (12, 7.2, True, 'Surgery+Chemo+RT', 'Poor', '2024-12-15')
        ]
        
        for month, size, recurrence, treatment, response, date in followup_data_a001:
            conn.execute(text("""
                INSERT IGNORE INTO patient_followups 
                (patient_id, follow_up_month, tumor_size_cm, recurrence, 
                 treatment_type, response_to_treatment, follow_up_date)
                VALUES ('A001', :month, :size, :recurrence, :treatment, :response, :date)
            """), {
                'month': month, 'size': size, 'recurrence': recurrence,
                'treatment': treatment, 'response': response, 'date': date
            })
        
        # Insert follow-up data for Patient B001 (Moderate case)
        followup_data_b001 = [
            (1, 2.5, False, 'Surgery+RT', 'Good', '2024-01-20'),
            (2, 2.5, False, 'Surgery+RT', 'Good', '2024-02-20'),
            (3, 2.4, False, 'Surgery+RT', 'Good', '2024-03-20'),
            (4, 2.3, False, 'Surgery+RT', 'Good', '2024-04-20'),
            (5, 2.2, False, 'Surgery+RT', 'Good', '2024-05-20'),
            (6, 2.1, False, 'Surgery+RT', 'Good', '2024-06-20'),
            (7, 2.0, False, 'Surgery+RT', 'Good', '2024-07-20'),
            (8, 1.9, False, 'Surgery+RT', 'Good', '2024-08-20'),
            (9, 1.8, False, 'Surgery+RT', 'Good', '2024-09-20'),
            (10, 1.7, False, 'Surgery+RT', 'Good', '2024-10-20'),
            (11, 1.6, False, 'Surgery+RT', 'Good', '2024-11-20'),
            (12, 1.5, False, 'Surgery+RT', 'Good', '2024-12-20')
        ]
        
        for month, size, recurrence, treatment, response, date in followup_data_b001:
            conn.execute(text("""
                INSERT IGNORE INTO patient_followups 
                (patient_id, follow_up_month, tumor_size_cm, recurrence, 
                 treatment_type, response_to_treatment, follow_up_date)
                VALUES ('B001', :month, :size, :recurrence, :treatment, :response, :date)
            """), {
                'month': month, 'size': size, 'recurrence': recurrence,
                'treatment': treatment, 'response': response, 'date': date
            })
        
        # Insert follow-up data for Patient C001 (High risk case)
        followup_data_c001 = [
            (1, 1.2, False, 'Surgery Only', 'Excellent', '2024-01-25'),
            (2, 1.0, False, 'Surgery Only', 'Excellent', '2024-02-25'),
            (3, 0.9, False, 'Surgery Only', 'Excellent', '2024-03-25'),
            (4, 0.8, False, 'Surgery Only', 'Excellent', '2024-04-25'),
            (5, 0.8, False, 'Surgery Only', 'Excellent', '2024-05-25'),
            (6, 0.7, False, 'Surgery Only', 'Excellent', '2024-06-25'),
            (7, 0.7, False, 'Surgery Only', 'Excellent', '2024-07-25'),
            (8, 0.7, False, 'Surgery Only', 'Excellent', '2024-08-25'),
            (9, 0.6, False, 'Surgery Only', 'Excellent', '2024-09-25'),
            (10, 0.6, False, 'Surgery Only', 'Excellent', '2024-10-25'),
            (11, 0.5, False, 'Surgery Only', 'Excellent', '2024-11-25'),
            (12, 0.5, False, 'Surgery Only', 'Excellent', '2024-12-25')
        ]
        
        for month, size, recurrence, treatment, response, date in followup_data_c001:
            conn.execute(text("""
                INSERT IGNORE INTO patient_followups 
                (patient_id, follow_up_month, tumor_size_cm, recurrence, 
                 treatment_type, response_to_treatment, follow_up_date)
                VALUES ('C001', :month, :size, :recurrence, :treatment, :response, :date)
            """), {
                'month': month, 'size': size, 'recurrence': recurrence,
                'treatment': treatment, 'response': response, 'date': date
            })
        
        conn.commit()
    
    print("✅ Sample data inserted successfully")
    print("Database initialization complete!")

if __name__ == "__main__":
    init_database()
