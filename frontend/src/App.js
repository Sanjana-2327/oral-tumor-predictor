// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// NOTE: Ensure you have installed recharts: npm install recharts

const BASE_URL = 'http://127.0.0.1:5000/api/v1';

function App() {
  const [patientData, setPatientData] = useState(null);
  const [simulationResults, setSimulationResults] = useState(null);
  const [explanation, setExplanation] = useState(null); 
  const [doseTweak, setDoseTweak] = useState(0); // ADDED: State for the input value (0 to 3)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. Fetch Patient Data (Onboarding) ---
  useEffect(() => {
    fetch(`${BASE_URL}/patient/P001`)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        setPatientData(data);
        setLoading(false);
      })
      .catch(e => {
        setError("Failed to load patient data. Check the Flask server on port 5000.");
        setLoading(false);
      });
  }, []);

  // --- 2. Launch Simulation Handler (The Digital Twin) ---
  const runSimulation = () => {
    // This calls the backend to run the 'what-if' scenarios
    setSimulationResults(null); 
    setExplanation(null); // Clear explanation on new simulation
    
    fetch(`${BASE_URL}/simulate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // UPDATED BODY: Pass the doseTweak state value to the backend
        body: JSON.stringify({ 
            patient_id: 'P001', 
            request_time: new Date().toISOString(),
            dose_tweak: doseTweak 
        })
    })
    .then(res => res.json())
    .then(data => {
        // Data transformation: combine two timelines for the chart
        const recommendedLabel = data.outcomes.Surgery_Chemo.timeline_label;
        const suboptimalLabel = data.outcomes.Chemo_Only.timeline_label;

        const combinedData = data.timeline_data.Surgery_Chemo.map((surgery, index) => ({
            month: surgery.month,
            [recommendedLabel]: surgery.volume,
            [suboptimalLabel]: data.timeline_data.Chemo_Only[index].volume
        }));
        
        setSimulationResults({ 
            data: combinedData, 
            outcomes: data.outcomes,
            recommendedLabel,
            suboptimalLabel
        });
    })
    .catch(e => console.error("Error running simulation:", e));
  };

  // --- 3. Fetch Explanation Handler (Step 7: Explainability) ---
    const runExplanation = () => {
        setExplanation(null);
        fetch(`${BASE_URL}/explain`)
        .then(res => res.json())
        .then(data => {
            setExplanation(data.key_drivers);
        })
        .catch(e => console.error("Error fetching explanation:", e));
    };

  // --- Render Logic ---
  if (loading) return <div style={styles.container}>Loading Patient Profile...</div>;
  if (error) return <div style={{ ...styles.container, color: 'red' }}>Error: {error}</div>;

  const { patient_id, stage, initial_tumor_volume_cm3 } = patientData;
  const showSimulationButton = patientData && !simulationResults;

  return (
    <div style={styles.container}>
      <h1>AI Oral Tumor Evolution Predictor</h1>
      <p style={{ color: '#007bff' }}>**Digital Twin Simulation for Oral Cancer**</p>
      <hr style={styles.hr}/>

      {/* 1. Patient Data Ingestion */}
      <h2 style={styles.h2}>1. Patient Profile Snapshot</h2>
      <div style={styles.profileBox}>
        <p><strong>Patient ID:</strong> {patient_id} | <strong>Stage:</strong> {stage}</p>
        <p><strong>Initial Volume:</strong> {initial_tumor_volume_cm3} cm³</p>
        <p>Data Aggregated (Clinical, Genomic, Imaging).</p>
      </div>
      
      {/* 2. Launch Simulation Button (Only shown before simulation starts) */}
      {showSimulationButton && (
        <button 
          onClick={runSimulation}
          style={styles.simulationButton}
        >
          🚀 Launch Simulation (Digital Twin)
        </button>
      )}

      {/* Simulation Results and Visualization */}
      {simulationResults && (
        <div style={styles.resultsContainer}>
          <h2 style={styles.h2}>2. Tumor Evolution Forecast (12 Months)</h2>
          <p>Running fast "what-if" simulations comparing two therapy trajectories.</p>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={simulationResults.data}
              margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" label={{ value: 'Time (Months)', position: 'bottom' }} />
              <YAxis label={{ value: 'Tumor Volume (cm³)', angle: -90, position: 'left' }} />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              
              {/* Line 1: Optimized Plan */}
              <Line 
                type="monotone" 
                dataKey={simulationResults.recommendedLabel} 
                stroke="#28a745" 
                strokeWidth={3}
              />
              {/* Line 2: Suboptimal Plan (Dynamically Tweakable) */}
              <Line 
                type="monotone" 
                dataKey={simulationResults.suboptimalLabel} 
                stroke="#dc3545" 
                strokeDasharray="5 5"
                strokeWidth={3} 
              />
            </LineChart>
          </ResponsiveContainer>
          
          <div style={styles.outcomeBoxes}>
            <div style={{ ...styles.outcomeBox, borderColor: '#28a745' }}>
              <h3 style={styles.h3}>{simulationResults.outcomes.Surgery_Chemo.timeline_label} (Recommended)</h3>
              <p>Predicted Survival Probability: **{simulationResults.outcomes.Surgery_Chemo.survival_prob}**</p>
              <p>Side Effects: {simulationResults.outcomes.Surgery_Chemo.side_effects}</p>
            </div>
            <div style={{ ...styles.outcomeBox, borderColor: '#dc3545' }}>
              <h3 style={styles.h3}>{simulationResults.outcomes.Chemo_Only.timeline_label}</h3>
              <p>Predicted Survival Probability: **{simulationResults.outcomes.Chemo_Only.survival_prob}**</p>
              <p>Side Effects: {simulationResults.outcomes.Chemo_Only.side_effects}</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Explainability & Feedback (Demo Steps 3 & 4) */}
      {simulationResults && (
        <div style={styles.nextSteps}>
            <h2 style={styles.h2}>3. Explainability & Clinician Feedback Loop</h2>
            <p>These features are the final steps in the prototype demonstration:</p>
            
            <button 
              onClick={runExplanation} 
              style={{ ...styles.placeholderButton, backgroundColor: '#007bff', marginRight: '20px' }}
            >
              [DEMO STEP 3] Click "Explain" (Show Key Risk Drivers)
            </button>
            
            {/* Explanation Display Block */}
            {explanation && (
              <div style={styles.explanationBox}>
                <h4>Risk Driver Analysis:</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  {explanation.map((item, index) => (
                    <li key={index} style={{ marginBottom: '5px' }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Feedback Loop Controls (Step 8) */}
            <div style={styles.feedbackContainer}>
                <div style={styles.sliderGroup}>
                    <label style={styles.sliderLabel}>
                        Simulate Clinician Tweak (e.g., Increase Drug Dose): 
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="3"
                        value={doseTweak}
                        onChange={(e) => setDoseTweak(parseInt(e.target.value))}
                        style={styles.slider}
                    />
                    <span style={styles.tweakValue}>{doseTweak}x Tweak</span>
                </div>
                
                <button 
                    onClick={runSimulation} // Re-runs simulation with the new 'doseTweak' state
                    disabled={doseTweak === 0} // Disable if tweak is 0
                    style={{ ...styles.placeholderButton, backgroundColor: doseTweak > 0 ? '#ffc107' : '#ccc', color: doseTweak > 0 ? '#333' : '#666', marginTop: '10px' }}
                >
                    [DEMO STEP 4] Tweak Therapy & Re-Run
                </button>
                {doseTweak > 0 && <p style={styles.warningText}>Re-running simulation with clinician's suggested tweak...</p>}
            </div>
        </div>
      )}
    </div>
  );
}

// Basic Inline Styles for quick visualization (replace with proper CSS/Tailwind later)
const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' },
    hr: { margin: '15px 0' },
    h2: { marginTop: '25px', borderBottom: '2px solid #eee', paddingBottom: '5px' },
    h3: { color: '#333', marginTop: '5px' },
    profileBox: { border: '1px solid #ddd', padding: '15px', borderRadius: '5px', marginBottom: '20px', backgroundColor: '#f9f9f9' },
    simulationButton: { padding: '12px 25px', fontSize: '18px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', transition: 'background-color 0.3s' },
    resultsContainer: { marginTop: '30px' },
    outcomeBoxes: { display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '20px' },
    outcomeBox: { flex: 1, padding: '15px', borderRadius: '5px', borderWidth: '2px', borderStyle: 'solid', backgroundColor: '#fff' },
    nextSteps: { marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' },
    placeholderButton: { padding: '10px 15px', fontSize: '14px', cursor: 'pointer', color: 'white', border: 'none', borderRadius: '5px', marginRight: '10px' },
    explanationBox: { borderLeft: '3px solid #007bff', padding: '10px 15px', marginTop: '20px', backgroundColor: '#e9f7ff' },
    // ADDED STYLES FOR FEEDBACK LOOP
    feedbackContainer: { border: '1px dashed #ccc', padding: '15px', borderRadius: '5px', marginTop: '30px' },
    sliderGroup: { display: 'flex', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' },
    sliderLabel: { marginRight: '15px', fontWeight: 'bold', fontSize: '14px', minWidth: '250px' },
    slider: { flexGrow: 1, marginRight: '10px', minWidth: '150px' },
    tweakValue: { minWidth: '80px', textAlign: 'right', fontWeight: 'bold' },
    warningText: { color: '#dc3545', fontSize: '12px', marginTop: '5px' }
};

export default App;
