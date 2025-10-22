import React, { useState } from 'react'
import { AlertCircle, Pill, MapPin, Heart, FileText } from 'lucide-react'

const PatientReport = ({ selectedPatientDetails, currentUser, databasePatients, onPatientSelect, onGenerateReport }) => {
  const [selectedPatientId, setSelectedPatientId] = useState('')

  const handlePatientSelect = (patientId) => {
    setSelectedPatientId(patientId)
    if (onPatientSelect) {
      onPatientSelect(patientId)
    }
  }

  const handleGenerateReport = () => {
    if (selectedPatientId && onGenerateReport) {
      onGenerateReport(selectedPatientId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Patient Selection */}
      {currentUser && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Patient for Comprehensive Report</h3>
          <div className="flex space-x-4">
            <select 
              value={selectedPatientId} 
              onChange={(e) => handlePatientSelect(e.target.value)}
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
              onClick={handleGenerateReport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Generate Report
            </button>
          </div>
        </div>
      )}

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
        </div>
      ) : (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Summary in Plain Language</h3>
          <p className="text-gray-700 leading-relaxed">
            Select a patient from the dropdown above to generate a comprehensive medical report with AI-powered insights, risk assessment, and treatment recommendations.
          </p>
        </div>
      )}
    </div>
  )
}

export default PatientReport
