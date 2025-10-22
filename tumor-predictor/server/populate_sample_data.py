"""
Populate database with sample data for testing
"""
import requests
import json

def populate_sample_data():
    """Add sample patients and data to the database"""
    base_url = "http://localhost:8000"
    
    # Sample patients
    patients = [
        {
            "patient_id": "A001",
            "age": 65,
            "gender": "Male",
            "stage_tnm": "T4aN2bM0",
            "initial_tumor_size_cm": 4.8,
            "smoking_status": "Current Smoker",
            "alcohol_use": "Heavy Daily",
            "oral_hygiene": "Poor",
            "hpv_status": "Negative",
            "comorbidities": "Diabetes, Hypertension"
        },
        {
            "patient_id": "B001",
            "age": 54,
            "gender": "Female",
            "stage_tnm": "T2N1M0",
            "initial_tumor_size_cm": 2.5,
            "smoking_status": "Quit 1.5 years ago",
            "alcohol_use": "Moderate",
            "oral_hygiene": "Fair",
            "hpv_status": "Positive",
            "comorbidities": "None"
        },
        {
            "patient_id": "C001",
            "age": 45,
            "gender": "Male",
            "stage_tnm": "T1N0M0",
            "initial_tumor_size_cm": 1.2,
            "smoking_status": "Current Smoker",
            "alcohol_use": "Heavy Daily",
            "oral_hygiene": "Very Poor",
            "hpv_status": "Negative",
            "comorbidities": "None"
        }
    ]
    
    print("Adding sample patients...")
    for patient in patients:
        try:
            response = requests.post(f"{base_url}/patients", json=patient)
            if response.status_code == 200:
                print(f"✅ Added patient {patient['patient_id']}")
            else:
                print(f"❌ Failed to add patient {patient['patient_id']}: {response.text}")
        except Exception as e:
            print(f"❌ Error adding patient {patient['patient_id']}: {e}")
    
    print("\nSample data population complete!")
    print("You can now test the database endpoints:")
    print("- GET /patients")
    print("- GET /patients/{patient_id}")
    print("- GET /analytics/summary")
    print("- GET /analytics/patient-trends")

if __name__ == "__main__":
    populate_sample_data()
