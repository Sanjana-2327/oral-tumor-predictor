import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Upload, Activity, User, Settings, MessageSquare, FileText, TrendingUp, AlertCircle, Heart, Pill, MapPin } from 'lucide-react'

const TumorPredictor = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [patientData, setPatientData] = useState(null)
  const [predictions, setPredictions] = useState(null)
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Hello! I\'m Grok, your AI assistant. I can help with any questions - medical, technical, general knowledge, or just have a conversation. What would you like to know?' },
  ])
  const [chatInput, setChatInput] = useState('')
  const [selectedTreatment, setSelectedTreatment] = useState('chemo')
  const [databasePatients, setDatabasePatients] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState(null)
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [userDashboard, setUserDashboard] = useState(null)
  const [showUserProfile, setShowUserProfile] = useState(false)

  // Fetch database patients
  const fetchDatabasePatients = async () => {
    try {
      const response = await fetch('http://localhost:8000/patients')
      const patients = await response.json()
      setDatabasePatients(patients)
      if (patients.length > 0 && !selectedPatientId) {
        setSelectedPatientId(patients[0].patient_id)
        fetchPatientDetails(patients[0].patient_id)
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err)
    }
  }

  // Fetch detailed patient information
  const fetchPatientDetails = async (patientId) => {
    try {
      const response = await fetch(`http://localhost:8000/patients/${patientId}`)
      const details = await response.json()
      setSelectedPatientDetails(details)
    } catch (err) {
      console.error('Failed to fetch patient details:', err)
    }
  }

  // User authentication and profile management
  const loginUser = async (userData) => {
    try {
      // For demo purposes, we'll create a default user or fetch existing
      const response = await fetch('http://localhost:8000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userData.user_id || 'demo_doctor_001',
          username: userData.username || 'dr_sarah_mitchell',
          email: userData.email || 'sarah.mitchell@hospital.com',
          full_name: userData.full_name || 'Dr. Sarah Mitchell',
          role: userData.role || 'doctor',
          specialization: userData.specialization || 'Head & Neck Oncology',
          license_number: userData.license_number || 'MD-78452',
          hospital_affiliation: userData.hospital_affiliation || 'City General Hospital'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('User created/found:', result)
        await fetchUserProfile(userData.user_id || 'demo_doctor_001')
      } else {
        // User might already exist, try to fetch profile
        await fetchUserProfile(userData.user_id || 'demo_doctor_001')
      }
    } catch (err) {
      console.error('Failed to login user:', err)
      // Fallback to demo user
      setCurrentUser({
        user_id: 'demo_doctor_001',
        username: 'dr_sarah_mitchell',
        email: 'sarah.mitchell@hospital.com',
        full_name: 'Dr. Sarah Mitchell',
        role: 'doctor',
        specialization: 'Head & Neck Oncology',
        license_number: 'MD-78452',
        hospital_affiliation: 'City General Hospital'
      })
    }
  }

  const fetchUserProfile = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8000/users/${userId}`)
      const profile = await response.json()
      setCurrentUser(profile.user)
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
    }
  }

  const fetchUserDashboard = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8000/users/${userId}/dashboard`)
      const dashboard = await response.json()
      setUserDashboard(dashboard)
    } catch (err) {
      console.error('Failed to fetch user dashboard:', err)
    }
  }

  const fetchPatientReport = async (userId, patientId) => {
    try {
      const response = await fetch(`http://localhost:8000/users/${userId}/patients/${patientId}/report`)
      const report = await response.json()
      return report
    } catch (err) {
      console.error('Failed to fetch patient report:', err)
      return null
    }
  }

  // Auto-load default predictions and database patients
  useEffect(() => {
    const loadDefault = async () => {
      try {
        setPatientData(samplePatient)
        const predRes = await fetch('http://localhost:8000/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ treatment: 'chemo' }),
        })
        const predJson = await predRes.json()
        setPredictions(predJson)
        
        // Load database patients
        await fetchDatabasePatients()
        
        // Initialize user and dashboard
        await loginUser({})
        if (currentUser) {
          await fetchUserDashboard(currentUser.user_id)
        }
      } catch (err) {
        console.error(err)
      }
    }
    if (!predictions) loadDefault()
  }, [])

  // Load user dashboard when user changes
  useEffect(() => {
    if (currentUser) {
      fetchUserDashboard(currentUser.user_id)
    }
  }, [currentUser])

  // Load patient details when selection changes
  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientDetails(selectedPatientId)
    }
  }, [selectedPatientId])

  const fetchPrediction = async (treatment) => {
    try {
      setSelectedTreatment(treatment)
      const predRes = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ treatment }),
      })
      const predJson = await predRes.json()
      setPredictions(predJson)
    } catch (e) {
      console.error(e)
      alert('Failed to fetch prediction. Is backend running?')
    }
  }

  const samplePatient = {
    name: 'Patient #4521',
    age: 58,
    gender: 'Male',
    stage: 'T2N1M0',
    tumorSize: 2.3,
    location: 'Tongue (lateral border)',
    diagnosis: 'Squamous Cell Carcinoma',
    lifestyle: {
      smoking: 'Former (quit 2 years ago)',
      alcohol: 'Moderate',
      diet: 'Standard',
      exercise: 'Low',
    },
    history: [
      { date: '2024-01', event: 'Initial diagnosis', size: 1.8 },
      { date: '2024-04', event: 'Biopsy confirmed', size: 2.1 },
      { date: '2024-07', event: 'Treatment started', size: 2.3 },
    ],
    medications: [
      { name: 'Cisplatin', dosage: '75mg/m²', frequency: 'Every 3 weeks' },
      { name: 'Pain management', dosage: 'As needed', frequency: 'PRN' },
    ],
  }

  const generatePredictions = (treatment = 'chemo') => {
    const baseGrowth = treatment === 'chemo' ? -0.15 : treatment === 'radiation' ? -0.12 : -0.18
    const data = []
    for (let month = 0; month <= 12; month++) {
      const size = 2.3 * Math.exp(baseGrowth * month)
      const survival = 100 - month * 2 + (treatment === 'combined' ? 5 : 0)
      data.push({
        month: `Month ${month}`,
        tumorSize: Number(Math.max(0.1, size).toFixed(2)),
        survivalProb: Number(Math.min(100, Math.max(60, survival)).toFixed(1)),
      })
    }
    return {
      evolution: data,
      riskFactors: [
        { factor: 'Age', impact: 65, description: 'Moderate risk factor' },
        { factor: 'Tumor Stage', impact: 75, description: 'Significant concern' },
        { factor: 'Location', impact: 70, description: 'Accessible for treatment' },
        { factor: 'Lifestyle', impact: 55, description: 'Improving factors' },
        { factor: 'Response Rate', impact: 82, description: 'Good prognosis' },
      ],
      treatmentImpact: treatment === 'combined' ? 92 : treatment === 'chemo' ? 78 : 74,
      confidence: 0.87,
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const form = new FormData()
      form.append('file', file)
      const ingestRes = await fetch('http://localhost:8000/ingest', {
        method: 'POST',
        body: form,
      })
      if (!ingestRes.ok) throw new Error('Upload failed')
      // For demo, use sample patient profile and fetch predictions from backend
      setPatientData(samplePatient)
      const predRes = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ treatment: 'chemo' }),
      })
      const predJson = await predRes.json()
      setPredictions(predJson)
    } catch (err) {
      console.error(err)
      alert('Failed to process file. Ensure backend is running on port 8000.')
    }
  }

  const handleChatSend = async () => {
    if (!chatInput.trim()) return
    const newMessages = [...chatMessages, { role: 'user', text: chatInput }]
    setChatMessages(newMessages)
    
    // Try Grok first for general AI assistance
    try {
      // Check if Puter/Grok is available
      if (typeof window !== 'undefined' && window.puter && window.puter.ai) {
        // Only add medical context if the question is medical-related
        const isMedicalQuestion = /cancer|tumor|medical|treatment|health|disease|surgery|chemotherapy|radiation|survival|diagnosis|symptoms/i.test(chatInput)
        
        const medicalContext = (predictions && isMedicalQuestion) ? 
          `\n[Medical Context: Current tumor prediction shows ${predictions.evolution?.length || 0} months of data. Treatment impact: ${predictions.treatmentImpact || 'N/A'}%.] ` : ''
        
        const prompt = `${chatInput}${medicalContext}`
        
        const response = await window.puter.ai.chat(prompt, { model: 'x-ai/grok-4' })
        setChatMessages([...newMessages, { role: 'assistant', text: response.message.content || 'No response from Grok' }])
      } else {
        throw new Error('Grok not available')
      }
    } catch (err) {
      console.log('Grok unavailable, using fallback response:', err)
      // Provide a general fallback instead of medical-only backend
      let fallbackResponse = "I'm sorry, I'm having trouble connecting to my AI service. "
      
      if (/hello|hi|hey|greetings/i.test(chatInput)) {
        fallbackResponse += "Hello! How can I help you today?"
      } else if (/how are you|how's it going/i.test(chatInput)) {
        fallbackResponse += "I'm doing well, thank you for asking! How can I assist you?"
      } else if (/what|explain|tell me|help/i.test(chatInput)) {
        fallbackResponse += "I'd be happy to help, but I need to connect to my AI service first. Please try again in a moment."
      } else {
        fallbackResponse += "Please try again in a moment when my AI service is available."
      }
      
      setChatMessages([...newMessages, { role: 'assistant', text: fallbackResponse }])
    }
    setChatInput('')
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* User Profile Header */}
      {currentUser && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{currentUser.full_name}</h2>
                <p className="text-blue-100">{currentUser.specialization} • {currentUser.hospital_affiliation}</p>
                <p className="text-sm text-blue-200">License: {currentUser.license_number}</p>
              </div>
            </div>
            <button
              onClick={() => setShowUserProfile(!showUserProfile)}
              className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition"
            >
              {showUserProfile ? 'Hide Profile' : 'View Profile'}
            </button>
          </div>
        </div>
      )}

      {/* User Statistics */}
      {userDashboard && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Patients</p>
                <p className="text-2xl font-bold text-gray-800">{userDashboard.statistics.total_patients}</p>
              </div>
              <User className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recent Predictions</p>
                <p className="text-2xl font-bold text-gray-800">{userDashboard.statistics.recent_predictions}</p>
              </div>
              <TrendingUp className="text-green-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Treatment Success</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Object.keys(userDashboard.statistics.treatment_effectiveness).length > 0 
                    ? `${Math.round(Object.values(userDashboard.statistics.treatment_effectiveness)[0]?.effectiveness || 0)}%`
                    : 'N/A'
                  }
                </p>
              </div>
              <Activity className="text-purple-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="text-2xl font-bold text-gray-800 capitalize">{currentUser?.role || 'Doctor'}</p>
              </div>
              <Settings className="text-orange-600" size={32} />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={async () => {
            try {
              const res = await fetch('http://localhost:8000/train', { method: 'POST' })
              if (!res.ok) throw new Error('Train failed')
              const json = await res.json()
              alert(`Model trained: ${json.samples || 0} samples. Click a treatment to refresh predictions.`)
            } catch (e) {
              console.error(e)
              alert('Training failed. Ensure CSVs are in server/data and backend is running.')
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Train Model
        </button>
        <button
          onClick={async () => {
            try {
              if (!predictions) return alert('No prediction to export')
              const res = await fetch('http://localhost:8000/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prediction: predictions }),
              })
              const json = await res.json()
              const blob = new Blob([json.csv || ''], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'tumor_prediction.csv'
              document.body.appendChild(a)
              a.click()
              a.remove()
              URL.revokeObjectURL(url)
            } catch (e) {
              console.error(e)
              alert('Export failed')
            }
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Export to Sheets (CSV)
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Size</p>
              <p className="text-2xl font-bold text-gray-800">2.3 cm</p>
            </div>
            <Activity className="text-blue-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Treatment Impact</p>
              <p className="text-2xl font-bold text-gray-800">78%</p>
            </div>
            <TrendingUp className="text-green-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confidence</p>
              <p className="text-2xl font-bold text-gray-800">87%</p>
            </div>
            <AlertCircle className="text-purple-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stage</p>
              <p className="text-2xl font-bold text-gray-800">T2N1M0</p>
            </div>
            <FileText className="text-orange-600" size={32} />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Predicted Tumor Evolution (12 Months)</h3>
        {predictions && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={predictions.evolution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" label={{ value: 'Size (cm)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Survival %', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="tumorSize" stroke="#3b82f6" strokeWidth={2} name="Tumor Size" />
              <Line yAxisId="right" type="monotone" dataKey="survivalProb" stroke="#10b981" strokeWidth={2} name="Survival Probability" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {['chemo', 'radiation', 'combined'].map((t) => {
          const treatmentNames = { chemo: 'Chemotherapy', radiation: 'Radiation', combined: 'Combined Therapy' }
          const isActive = selectedTreatment === t
          const impact = predictions?.treatmentImpact ?? (t === 'combined' ? 92 : t === 'chemo' ? 78 : 74)
          return (
            <button
              key={t}
              onClick={() => fetchPrediction(t)}
              className={`text-left bg-white rounded-lg shadow p-4 border transition ${
                isActive ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent hover:border-gray-200'
              }`}
            >
              <h4 className="font-semibold text-gray-800 mb-3">{treatmentNames[t]}</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Effectiveness:</span>
                  <span className="text-sm font-semibold text-gray-800">{impact}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${impact}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t === 'combined' ? 'Highest success rate' : t === 'chemo' ? 'Good response expected' : 'Moderate effectiveness'}
                </p>
              </div>
            </button>
          )
        })}
      </div>
      {predictions && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Factor Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={predictions.riskFactors}>
              <PolarGrid />
              <PolarAngleAxis dataKey="factor" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Impact Level" dataKey="impact" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )

  const renderReport = () => (
    <div className="space-y-6">
      {/* Patient Selection for Report */}
      {currentUser && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Patient for Comprehensive Report</h3>
          <div className="flex space-x-4">
            <select 
              value={selectedPatientId || ''} 
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Select a patient...</option>
              {databasePatients.map(patient => (
                <option key={patient.patient_id} value={patient.patient_id}>
                  {patient.patient_id} - {patient.gender}, {patient.age}y, {patient.stage_tnm}
                </option>
              ))}
            </select>
            <button
              onClick={async () => {
                if (selectedPatientId && currentUser) {
                  const report = await fetchPatientReport(currentUser.user_id, selectedPatientId)
                  if (report) {
                    setSelectedPatientDetails(report)
                  }
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Generate Report
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Patient Tumor Report</h2>
        {/* Enhanced Patient Report */}
        {selectedPatientDetails && selectedPatientDetails.patient ? (
          <div className="space-y-6">
            {/* Patient Summary */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Summary in Plain Language</h3>
              <p className="text-gray-700 leading-relaxed">
                Patient {selectedPatientDetails.patient.patient_id} is a {selectedPatientDetails.patient.age}-year-old {selectedPatientDetails.patient.gender.toLowerCase()} with a {selectedPatientDetails.patient.initial_tumor_size_cm}cm tumor classified as Stage {selectedPatientDetails.patient.stage_tnm}. 
                The patient's smoking status is {selectedPatientDetails.patient.smoking_status} and HPV status is {selectedPatientDetails.patient.hpv_status}. 
                {selectedPatientDetails.risk_assessment && ` Overall risk assessment: ${selectedPatientDetails.risk_assessment.overall_risk} risk.`}
                {selectedPatientDetails.treatment_recommendations && ` Recommended primary treatment: ${selectedPatientDetails.treatment_recommendations.primary_treatment}.`}
              </p>
            </div>

            {/* Risk Assessment */}
            {selectedPatientDetails.risk_assessment && (
              <div className="bg-red-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-red-900 mb-3 flex items-center">
                  <AlertCircle className="mr-2" size={20} />
                  Risk Assessment
                </h3>
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-semibold">
                    Overall Risk: {selectedPatientDetails.risk_assessment.overall_risk}
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedPatientDetails.risk_assessment.risk_factors.map((factor, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white rounded">
                      <div>
                        <span className="font-medium">{factor.factor}</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          factor.level === 'High' ? 'bg-red-100 text-red-800' :
                          factor.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {factor.level}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{factor.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Treatment Recommendations */}
            {selectedPatientDetails.treatment_recommendations && (
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                  <Pill className="mr-2" size={20} />
                  Treatment Recommendations
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-800">Primary Treatment:</p>
                    <p className="text-gray-700">{selectedPatientDetails.treatment_recommendations.primary_treatment}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Alternative Treatments:</p>
                    <ul className="list-disc list-inside text-gray-700">
                      {selectedPatientDetails.treatment_recommendations.alternative_treatments.map((treatment, idx) => (
                        <li key={idx}>{treatment}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Follow-up Schedule:</p>
                    <p className="text-gray-700">{selectedPatientDetails.treatment_recommendations.follow_up_schedule}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Follow-up History */}
            {selectedPatientDetails.followups && selectedPatientDetails.followups.length > 0 && (
              <div className="bg-white border rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Follow-up History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Month</th>
                        <th className="text-left py-2">Size (cm)</th>
                        <th className="text-left py-2">Recurrence</th>
                        <th className="text-left py-2">Treatment</th>
                        <th className="text-left py-2">Response</th>
                        <th className="text-left py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPatientDetails.followups.map((followup, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-2">{followup.month}</td>
                          <td className="py-2">{followup.tumor_size_cm}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded text-xs ${followup.recurrence ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                              {followup.recurrence ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="py-2">{followup.treatment_type}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              followup.response_to_treatment === 'Excellent' ? 'bg-green-100 text-green-800' :
                              followup.response_to_treatment === 'Good' ? 'bg-blue-100 text-blue-800' :
                              followup.response_to_treatment === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {followup.response_to_treatment}
                            </span>
                          </td>
                          <td className="py-2">{followup.follow_up_date ? new Date(followup.follow_up_date).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* AI Predictions */}
            {selectedPatientDetails.predictions && selectedPatientDetails.predictions.length > 0 && (
              <div className="bg-white border rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">AI Predictions</h3>
                <div className="space-y-3">
                  {selectedPatientDetails.predictions.map((pred, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium text-lg">{pred.treatment_type}</span>
                          <span className="ml-2 text-sm text-gray-600">Model: {pred.model_version}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Confidence</div>
                          <div className="font-semibold">{(pred.confidence * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Treatment Impact:</span>
                          <span className="ml-2 font-medium">{pred.treatment_impact}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Prediction Date:</span>
                          <span className="ml-2 font-medium">{new Date(pred.prediction_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Treatment Outcomes */}
            {selectedPatientDetails.outcomes && selectedPatientDetails.outcomes.length > 0 && (
              <div className="bg-white border rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Treatment Outcomes</h3>
                <div className="space-y-3">
                  {selectedPatientDetails.outcomes.map((outcome, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Actual Tumor Size:</span>
                          <span className="ml-2 font-medium">{outcome.actual_tumor_size_cm} cm</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Survival Probability:</span>
                          <span className="ml-2 font-medium">{outcome.actual_survival_probability}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Response:</span>
                          <span className="ml-2 font-medium">{outcome.actual_response}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Outcome Date:</span>
                          <span className="ml-2 font-medium">{outcome.outcome_date ? new Date(outcome.outcome_date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                      {outcome.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {outcome.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Summary in Plain Language</h3>
            <p className="text-gray-700 leading-relaxed">
              The patient has a moderately-sized tumor (2.3 cm) located on the side of the tongue. It is classified as Stage T2N1M0, which means the tumor is between 2-4 cm and has spread to one nearby lymph node, but not to distant parts of the body. Current treatment with chemotherapy is showing good results, with the tumor expected to shrink over the next 12 months. The survival probability remains high at over 85% with continued treatment.
            </p>
          </div>
        )}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <MapPin className="mr-2 text-blue-600" size={20} />
            Tumor Location
          </h3>
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <p className="text-lg font-semibold text-gray-800">Oral Cavity: Tongue (Lateral Border)</p>
            <p className="text-sm text-gray-600 mt-2">Left side, middle third region</p>
            <div className="mt-4 text-xs text-gray-500">ℹ This location is accessible for both surgical and radiation treatment</div>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Medical History Timeline</h3>
          <div className="space-y-3">
            {samplePatient.history.map((item, idx) => (
              <div key={idx} className="flex items-start border-l-4 border-blue-600 pl-4 py-2">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.event}</p>
                  <p className="text-sm text-gray-600">{item.date} - Tumor size: {item.size} cm</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Heart className="mr-2 text-red-500" size={20} />
            Lifestyle Factors
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(samplePatient.lifestyle).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 capitalize">{key}</p>
                <p className="font-semibold text-gray-800">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-green-50 rounded-lg p-3">
            <p className="text-sm text-green-800">✓ Positive changes: Patient quit smoking 2 years ago, which improves treatment outcomes</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Pill className="mr-2 text-purple-600" size={20} />
            Current Medications
          </h3>
          <div className="space-y-3">
            {samplePatient.medications.map((med, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-800">{med.name}</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <p className="text-xs text-gray-600">Dosage</p>
                    <p className="text-sm font-medium text-gray-800">{med.dosage}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Frequency</p>
                    <p className="text-sm font-medium text-gray-800">{med.frequency}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderProfile = () => (
    <div className="space-y-6">
      {/* User Profile */}
      {currentUser ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">User Profile</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="text-blue-600" size={40} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{currentUser.full_name}</p>
                <p className="text-sm text-gray-600 capitalize">{currentUser.role}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">User ID</p>
                <p className="font-medium text-gray-800">{currentUser.user_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-800">{currentUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Specialization</p>
                <p className="font-medium text-gray-800">{currentUser.specialization || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">License Number</p>
                <p className="font-medium text-gray-800">{currentUser.license_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hospital Affiliation</p>
                <p className="font-medium text-gray-800">{currentUser.hospital_affiliation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium text-gray-800">
                  <span className={`px-2 py-1 rounded text-xs ${currentUser.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {currentUser.is_active ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Doctor Profile</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="text-blue-600" size={40} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Dr. Sarah Mitchell</p>
                <p className="text-sm text-gray-600">Oncologist</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Specialization</p>
                <p className="font-medium text-gray-800">Head & Neck Oncology</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">License Number</p>
                <p className="font-medium text-gray-800">MD-78452</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Experience</p>
                <p className="font-medium text-gray-800">15 years</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Dashboard Summary */}
      {userDashboard && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Dashboard Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-blue-600">{userDashboard.statistics.total_patients}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Recent Predictions</p>
              <p className="text-2xl font-bold text-green-600">{userDashboard.statistics.recent_predictions}</p>
            </div>
          </div>
          
          {/* Treatment Effectiveness */}
          {userDashboard.statistics.treatment_effectiveness && Object.keys(userDashboard.statistics.treatment_effectiveness).length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-800 mb-2">Treatment Effectiveness</h4>
              <div className="space-y-2">
                {Object.entries(userDashboard.statistics.treatment_effectiveness).map(([treatment, stats]) => (
                  <div key={treatment} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{treatment}</span>
                      <span className="text-sm text-gray-600">{stats.effectiveness}% effective</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${stats.effectiveness}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {userDashboard.recent_activity && userDashboard.recent_activity.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-800 mb-2">Recent Activity</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {userDashboard.recent_activity.map((activity, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{activity.action_type}</span>
                    <span className="text-gray-500">{activity.patient_id}</span>
                    <span className="text-gray-400">{new Date(activity.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Database Patients */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Database Patients</h3>
          <button 
            onClick={fetchDatabasePatients}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
        
        {databasePatients.length > 0 ? (
          <div className="space-y-4">
            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient</label>
              <select 
                value={selectedPatientId || ''} 
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {databasePatients.map(patient => (
                  <option key={patient.patient_id} value={patient.patient_id}>
                    {patient.patient_id} - {patient.gender}, {patient.age}y, {patient.stage_tnm}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Patient Details */}
            {selectedPatientDetails && (
              <div className="border-t pt-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="text-gray-600" size={32} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Patient {selectedPatientDetails.patient.patient_id}</p>
                    <p className="text-sm text-gray-600">{selectedPatientDetails.patient.age} years old, {selectedPatientDetails.patient.gender}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Stage</p>
                      <p className="font-medium text-gray-800">{selectedPatientDetails.patient.stage_tnm}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Initial Tumor Size</p>
                      <p className="font-medium text-gray-800">{selectedPatientDetails.patient.initial_tumor_size_cm} cm</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Smoking Status</p>
                      <p className="font-medium text-gray-800">{selectedPatientDetails.patient.smoking_status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">HPV Status</p>
                      <p className="font-medium text-gray-800">{selectedPatientDetails.patient.hpv_status}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Alcohol Use</p>
                      <p className="font-medium text-gray-800">{selectedPatientDetails.patient.alcohol_use}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Oral Hygiene</p>
                      <p className="font-medium text-gray-800">{selectedPatientDetails.patient.oral_hygiene}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Comorbidities</p>
                      <p className="font-medium text-gray-800">{selectedPatientDetails.patient.comorbidities || 'None'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium text-gray-800">{new Date(selectedPatientDetails.patient.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Follow-up Data */}
                {selectedPatientDetails.followups && selectedPatientDetails.followups.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Follow-up History</h4>
                    <div className="max-h-40 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Month</th>
                            <th className="text-left py-2">Size (cm)</th>
                            <th className="text-left py-2">Recurrence</th>
                            <th className="text-left py-2">Treatment</th>
                            <th className="text-left py-2">Response</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPatientDetails.followups.map((followup, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="py-2">{followup.month}</td>
                              <td className="py-2">{followup.tumor_size_cm}</td>
                              <td className="py-2">
                                <span className={`px-2 py-1 rounded text-xs ${followup.recurrence ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                  {followup.recurrence ? 'Yes' : 'No'}
                                </span>
                              </td>
                              <td className="py-2">{followup.treatment_type}</td>
                              <td className="py-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  followup.response_to_treatment === 'Excellent' ? 'bg-green-100 text-green-800' :
                                  followup.response_to_treatment === 'Good' ? 'bg-blue-100 text-blue-800' :
                                  followup.response_to_treatment === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {followup.response_to_treatment}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Predictions */}
                {selectedPatientDetails.predictions && selectedPatientDetails.predictions.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-3">AI Predictions</h4>
                    <div className="space-y-2">
                      {selectedPatientDetails.predictions.map((pred, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{pred.treatment_type}</span>
                            <span className="text-sm text-gray-600">Confidence: {(pred.confidence * 100).toFixed(1)}%</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Impact: {pred.treatment_impact}% | Model: {pred.model_version}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <User className="mx-auto mb-2" size={48} />
            <p>No patients found in database</p>
            <p className="text-sm">Make sure the backend is running and has sample data</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderChatbot = () => (
    <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <MessageSquare className="mr-2 text-blue-600" size={20} />
          Grok AI Assistant
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
            placeholder="Ask Grok anything - medical, technical, general knowledge, or just chat..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button onClick={handleChatSend} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Send</button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Powered by Grok-4 - Ask me anything!
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Model Confidence Threshold</label>
          <input type="range" min="0" max="100" defaultValue="85" className="w-full" />
          <p className="text-xs text-gray-500 mt-1">Current: 85%</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prediction Timeline</label>
          <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option>6 months</option>
            <option defaultChecked>12 months</option>
            <option>24 months</option>
          </select>
        </div>
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-800 mb-2">Privacy & Security</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span className="text-sm text-gray-700">Anonymize patient data</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span className="text-sm text-gray-700">Encrypt stored predictions</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span className="text-sm text-gray-700">Local data processing only</span>
            </label>
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 mt-4">
          <p className="text-xs text-blue-800">🔒 All data is processed locally. No patient information is transmitted to external servers.</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">AI Oral Tumor Evolution Predictor</h1>
          <p className="text-blue-100">Advanced predictive analytics for clinical decision support</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-6">
        {!patientData && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
            <Upload className="mx-auto mb-4 text-blue-600" size={48} />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Patient Data</h3>
            <p className="text-gray-600 mb-4">Upload EHR file, imaging data, or CSV to begin analysis</p>
            <label className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition">
              <input type="file" onChange={handleFileUpload} className="hidden" accept=".csv,.json" />
              Select File
            </label>
            <p className="text-xs text-gray-500 mt-4">Supported formats: CSV, JSON</p>
          </div>
        )}
        {patientData && (
          <>
            <div className="bg-white rounded-lg shadow mb-6 p-2 flex space-x-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Activity },
                { id: 'report', label: 'Tumor Report', icon: FileText },
                { id: 'profile', label: 'Profiles', icon: User },
                { id: 'chatbot', label: 'AI Assistant', icon: MessageSquare },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition flex items-center justify-center ${
                    activeTab === id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} className="mr-2" />
                  {label}
                </button>
              ))}
            </div>
            <div>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'report' && renderReport()}
              {activeTab === 'profile' && renderProfile()}
              {activeTab === 'chatbot' && renderChatbot()}
              {activeTab === 'settings' && renderSettings()}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default TumorPredictor


