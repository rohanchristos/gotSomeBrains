import { useState } from 'react'
import PHQ9Assessment from './assessments/PHQ9Assessment'
import GAD7Assessment from './assessments/GAD7Assessment'
import PSS10Assessment from './assessments/PSS10Assessment'
import CustomMLAssessment from './assessments/CustomMLAssessment'
import UserContextForm from './UserContextForm'
import ResultsDisplay from './ResultsDisplay'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'
import SimpleChat from './chat/SimpleChat'
import type { AssessmentData, MLResponse, UserContext } from '../types/assessment'

type AssessmentType = 'PHQ9' | 'GAD7' | 'PSS10' | 'CustomML' | 'ChatDoctor' | null

const MentalHealthAssessment = () => {
  const [currentAssessment, setCurrentAssessment] = useState<AssessmentType>(null)
  const [userContext, setUserContext] = useState<UserContext | null>(null)
  const [assessmentResults, setAssessmentResults] = useState<AssessmentData | null>(null)
  const [mlResponse, setMLResponse] = useState<MLResponse | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [showAdminDashboard, setShowAdminDashboard] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showDoctorDashboard, setShowDoctorDashboard] = useState(false)

  const handleAssessmentComplete = (data: AssessmentData | any) => {
    // Check if this is a backend response (has ml_response property)
    if (data.ml_response) {
      // This is a backend response with ML analysis
      setAssessmentResults(data)
      setMLResponse(data.ml_response)
      setShowResults(true)
    } else {
      // This is a regular assessment data, generate mock ML response
      setAssessmentResults(data)
      const mockMLResponse: MLResponse = {
        risk_level: data.responses.reduce((sum: number, val: number) => sum + val, 0) > 10 ? 'moderate' : 'low',
        confidence: 0.85,
        recommendations: ['sleep_hygiene', 'stress_management', 'professional_consultation'],
        crisis_flag: data.responses.some((val: number) => val >= 3),
        next_assessment_days: 7
      }
      setMLResponse(mockMLResponse)
      setShowResults(true)
    }
  }

  const handleStartOver = () => {
    setCurrentAssessment(null)
    setUserContext(null)
    setAssessmentResults(null)
    setMLResponse(null)
    setShowResults(false)
    setShowAdminLogin(false)
    setShowAdminDashboard(false)
    setShowChat(false)
    setShowDoctorDashboard(false)
  }

  const handleAdminLogin = () => {
    setShowAdminLogin(true)
  }

  const handleAdminLoginSuccess = () => {
    setShowAdminLogin(false)
    setShowAdminDashboard(true)
  }

  const handleCloseAdminLogin = () => {
    setShowAdminLogin(false)
  }

  const handleCloseAdminDashboard = () => {
    setShowAdminDashboard(false)
  }

  const handleChatWithDoctor = () => {
    console.log('Chat with Doctor clicked');
    setShowChat(true)
  }

  const handleCloseChat = () => {
    setShowChat(false)
  }

  const handleDoctorPortal = () => {
    setShowDoctorDashboard(true)
  }

  const handleCloseDoctorDashboard = () => {
    setShowDoctorDashboard(false)
  }

  const exportData = () => {
    if (assessmentResults && userContext) {
      const exportData = {
        ...assessmentResults,
        user_context: userContext,
        ml_response: mlResponse,
        timestamp: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mental_health_assessment_${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  if (showResults && assessmentResults && mlResponse) {
    return (
      <ResultsDisplay
        assessmentData={assessmentResults}
        mlResponse={mlResponse}
        userContext={userContext}
        onStartOver={handleStartOver}
        onExportData={exportData}
      />
    )
  }

  if (currentAssessment && userContext) {
    switch (currentAssessment) {
      case 'PHQ9':
        return <PHQ9Assessment userContext={userContext} onComplete={handleAssessmentComplete} />
      case 'GAD7':
        return <GAD7Assessment userContext={userContext} onComplete={handleAssessmentComplete} />
      case 'PSS10':
        return <PSS10Assessment userContext={userContext} onComplete={handleAssessmentComplete} />
      case 'CustomML':
        return <CustomMLAssessment userContext={userContext} onComplete={handleAssessmentComplete} />
      default:
        return null
    }
  }

  if (currentAssessment && !userContext) {
    return (
      <UserContextForm
        onComplete={(context) => setUserContext(context)}
        onBack={() => setCurrentAssessment(null)}
      />
    )
  }

  return (
    <div className="assessment-selector">
      <div className="assessment-cards">
        <div className="assessment-card" onClick={() => setCurrentAssessment('PHQ9')}>
          <h3>PHQ-9</h3>
          <p>Patient Health Questionnaire</p>
          <span className="assessment-description">
            9-item depression screening tool widely used in clinical settings
          </span>
        </div>
        
        <div className="assessment-card" onClick={() => setCurrentAssessment('CustomML')}>
          <h3>Custom ML</h3>
          <p>Machine Learning Assessment</p>
          <span className="assessment-description">
            Custom assessment using advanced ML algorithms for personalized insights
          </span>
        </div>
        
        <div className="assessment-card" onClick={() => setCurrentAssessment('GAD7')}>
          <h3>GAD-7</h3>
          <p>Generalized Anxiety Disorder Scale</p>
          <span className="assessment-description">
            7-item anxiety screening questionnaire for identifying anxiety disorders
          </span>
        </div>
        
        <div className="assessment-card" onClick={() => setCurrentAssessment('PSS10')}>
          <h3>PSS-10</h3>
          <p>Perceived Stress Scale</p>
          <span className="assessment-description">
            10-item scale measuring perceived stress levels over the past month
          </span>
        </div>
        
        {/* Chat with Doctor Card */}
        <div className="assessment-card chat-card" onClick={handleChatWithDoctor}>
          <h3>🩺 Chat with Doctor</h3>
          <p>Real-time Medical Consultation</p>
          <span className="assessment-description">
            Connect with a qualified doctor for immediate support and guidance
          </span>
        </div>


        {/* Admin Portal Card */}
        <div className="assessment-card admin-card" onClick={handleAdminLogin}>
          <h3>🔐 Admin Portal</h3>
          <p>Database Management</p>
          <span className="assessment-description">
            View all patient assessments, ML scores, and analytics dashboard
          </span>
        </div>
      </div>
      
      <div className="info-section">
        <h3>About Mental Health Assessments</h3>
        <p>
          These standardized assessments help identify potential mental health concerns and provide 
          valuable insights for healthcare professionals. All data is formatted for ML analysis 
          to provide personalized recommendations.
        </p>
        <div className="privacy-notice">
          <strong>Privacy Notice:</strong> Your responses are confidential and used only for assessment purposes.
        </div>
      </div>
      
      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLogin 
          onLoginSuccess={handleAdminLoginSuccess}
          onClose={handleCloseAdminLogin}
        />
      )}
      
      {/* Admin Dashboard Modal */}
      {showAdminDashboard && (
        <AdminDashboard 
          onClose={handleCloseAdminDashboard}
        />
      )}

      {/* Simple Chat Modal */}
      {showChat && (
        <SimpleChat 
          onClose={handleCloseChat}
        />
      )}
    </div>
  )
}

export default MentalHealthAssessment
