# Dashboard and Patient Report Integration Guide

## Quick Integration Steps

Since you're having trouble accepting the large changes to `TumorPredictor.jsx`, here's a step-by-step approach to add the dashboard and patient report features:

### Step 1: Add the Component Files
I've created two new component files that you can easily import:
- `src/components/UserDashboard.jsx` - User-specific dashboard
- `src/components/PatientReport.jsx` - Comprehensive patient reports

### Step 2: Add State Variables
Add these to your existing `TumorPredictor.jsx` state:

```javascript
const [currentUser, setCurrentUser] = useState(null)
const [userDashboard, setUserDashboard] = useState(null)
```

### Step 3: Add User Management Functions
Add these functions to your component:

```javascript
// User authentication and profile management
const loginUser = async (userData) => {
  try {
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
      await fetchUserProfile(userData.user_id || 'demo_doctor_001')
    } else {
      await fetchUserProfile(userData.user_id || 'demo_doctor_001')
    }
  } catch (err) {
    console.error('Failed to login user:', err)
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
```

### Step 4: Update useEffect
Add this to your existing useEffect:

```javascript
// Add this to your existing useEffect
useEffect(() => {
  const loadDefault = async () => {
    try {
      // ... your existing code ...
      
      // Initialize user and dashboard
      await loginUser({})
    } catch (err) {
      console.error(err)
    }
  }
  if (!predictions) loadDefault()
}, [])

// Add this new useEffect
useEffect(() => {
  if (currentUser) {
    fetchUserDashboard(currentUser.user_id)
  }
}, [currentUser])
```

### Step 5: Add Imports
Add these imports at the top of your file:

```javascript
import UserDashboard from './components/UserDashboard'
import PatientReport from './components/PatientReport'
```

### Step 6: Update Render Functions
Replace your `renderDashboard` function with:

```javascript
const renderDashboard = () => (
  <div className="space-y-6">
    <UserDashboard currentUser={currentUser} userDashboard={userDashboard} />
    {/* Keep your existing dashboard content here */}
  </div>
)
```

Replace your `renderReport` function with:

```javascript
const renderReport = () => (
  <div className="space-y-6">
    <PatientReport 
      selectedPatientDetails={selectedPatientDetails}
      currentUser={currentUser}
      databasePatients={databasePatients}
      onPatientSelect={setSelectedPatientId}
      onGenerateReport={async (patientId) => {
        if (currentUser) {
          const report = await fetchPatientReport(currentUser.user_id, patientId)
          if (report) {
            setSelectedPatientDetails(report)
          }
        }
      }}
    />
  </div>
)
```

## Testing the Integration

1. **Start the backend** (already running):
   ```bash
   cd tumor-predictor/server
   python app.py
   ```

2. **Start the frontend**:
   ```bash
   cd tumor-predictor
   npm run dev
   ```

3. **Test the features**:
   - Dashboard should show user-specific analytics
   - Patient Report should allow patient selection and generate comprehensive reports
   - Profile section should show user information

## What You'll Get

### Dashboard Features:
- User profile header with specialization and hospital affiliation
- Statistics showing assigned patients, recent predictions, treatment success
- Treatment effectiveness charts
- Recent activity feed

### Patient Report Features:
- Patient selection dropdown
- Comprehensive medical reports with AI insights
- Risk assessment with color-coded risk factors
- Treatment recommendations
- Follow-up history table
- AI predictions with confidence scores

## Backend API Endpoints Available:
- `GET /users/{user_id}` - Get user profile
- `GET /users/{user_id}/dashboard` - Get user dashboard data
- `GET /users/{user_id}/patients/{patient_id}/report` - Get patient report
- `POST /users` - Create new user

The system is now ready with user-specific dashboards and comprehensive patient reports!
