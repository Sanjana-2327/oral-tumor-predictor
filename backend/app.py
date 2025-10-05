from flask import Flask, jsonify, request # IMPORT 'request'
from flask_cors import CORS
import copy # IMPORT 'copy' to safely modify mock data

app = Flask(__name__)
# Enable CORS to allow the frontend (running on a different port) to access the API.
CORS(app) 

# --- 1. MOCK PATIENT DATA (The input for the Digital Twin) ---
MOCK_PATIENT_DATA = {
    "P001": {
        "patient_id": "P001",
        "age": 62,
        "tumor_location": "Tongue Base",
        "stage": "III",
        "mutation_status": "Positive (p53)",
        "grade": "Moderate",
        "initial_tumor_volume_cm3": 15.5,
        "current_treatment": "None (Pre-Decision)"
    }
}

# --- 2. MOCK SIMULATION RESULTS (The core predictive output) ---
# Defines projected tumor volume over 12 months for two 'what-if' treatments
MOCK_SIMULATION_RESULTS = {
    "timeline_data": {
        "Surgery_Chemo": [ # Optimized Plan (Projected success)
            {"month": 0, "volume": 15.5},
            {"month": 3, "volume": 5.2},
            {"month": 6, "volume": 1.1},
            {"month": 9, "volume": 0.5},
            {"month": 12, "volume": 0.2}
        ],
        "Chemo_Only": [ # Suboptimal Plan (Projected failure/relapse)
            {"month": 0, "volume": 15.5},
            {"month": 3, "volume": 12.0},
            {"month": 6, "volume": 10.5},
            {"month": 9, "volume": 14.8},
            {"month": 12, "volume": 18.1}
        ]
    },
    "outcomes": {
        "Surgery_Chemo": {"survival_prob": "85%", "side_effects": "Moderate", "timeline_label": "Recommended Combined Regimen"},
        "Chemo_Only": {"survival_prob": "45%", "side_effects": "Mild", "timeline_label": "Suboptimal Chemotherapy Only"}
    }
}

# --- 3. MOCK DATA for Explainability Layer (Step 7) ---
MOCK_EXPLANATION = {
    "key_drivers": [
        "Patient P001's positive p53 mutation status is the dominant factor driving predicted relapse in the Chemotherapy Only scenario.",
        "Initial tumor volume (15.5 cm³) places the case at high risk, requiring surgical debulking for optimal outcome.",
        "The model shows a high confidence (92%) that tumor volume will exceed 18 cm³ by month 12 without combined therapy."
    ]
}


# --- 4. API ENDPOINT: Get Patient Data (Initial Ingestion) ---
@app.route('/api/v1/patient/<patient_id>', methods=['GET'])
def get_patient_data(patient_id):
    """Mocks fetching a patient's standardized profile."""
    if patient_id in MOCK_PATIENT_DATA:
        return jsonify(MOCK_PATIENT_DATA[patient_id])
    return jsonify({"error": "Patient not found"}), 404

# --- 5. API ENDPOINT: Run Simulation (Digital Twin) ---
@app.route('/api/v1/simulate', methods=['POST'])
def run_simulation():
    """Mocks running the 'what-if' scenarios and returning predictions, handling clinician tweaks."""
    data = request.get_json()
    dose_tweak = data.get('dose_tweak')

    # Deep copy the standard results to avoid modifying the original global dictionary
    results = copy.deepcopy(MOCK_SIMULATION_RESULTS) 

    if dose_tweak and dose_tweak > 0:
        # If a tweak is applied, adjust the *suboptimal* Chemo_Only plan to look slightly better.
        # This demonstrates the model re-running with new parameters.
        print(f"Applying clinician dose tweak: {dose_tweak}")
        
        # Tweak the timeline data for Chemo_Only (reduce final tumor volume)
        for i in range(len(results["timeline_data"]["Chemo_Only"])):
            # Reduce tumor volume by 10% for the later months (0.1 = 10% reduction)
            reduction_factor = 1 - (dose_tweak * 0.1) 
            results["timeline_data"]["Chemo_Only"][i]["volume"] *= reduction_factor
            
        # Update the outcome survival probability
        results["outcomes"]["Chemo_Only"]["survival_prob"] = "55%" 
        results["outcomes"]["Chemo_Only"]["timeline_label"] = "Chemotherapy Only (TWEAKED Dose)" 
    
    return jsonify(results)

# --- 6. API ENDPOINT: Get Explanation (Explainability Layer - Step 7) ---
@app.route('/api/v1/explain', methods=['GET'])
def get_explanation():
    """Mocks returning the risk drivers and model explainability."""
    # In a real app, this would query a SHAP/LIME layer
    return jsonify(MOCK_EXPLANATION)


if __name__ == '__main__':
    # Run on port 5000
    app.run(debug=True, port=5000)
