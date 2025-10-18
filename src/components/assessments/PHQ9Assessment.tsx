import { useState } from 'react'
import type { AssessmentData, UserContext, AssessmentQuestion, BackendAssessmentResponse } from '../../types/assessment'
import { BackendService } from '../../services/backendService'

interface PHQ9AssessmentProps {
  userContext: UserContext
  onComplete: (data: AssessmentData) => void
}

const PHQ9_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    text: "Little interest or pleasure in doing things",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: 2,
    text: "Feeling down, depressed, or hopeless",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: 3,
    text: "Trouble falling or staying asleep, or sleeping too much",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: 4,
    text: "Feeling tired or having little energy",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: 5,
    text: "Poor appetite or overeating",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: 6,
    text: "Feeling bad about yourself or that you are a failure or have let yourself or your family down",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: 7,
    text: "Trouble concentrating on things, such as reading the newspaper or watching television",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: 8,
    text: "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: 9,
    text: "Thoughts that you would be better off dead, or of hurting yourself",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  }
]

const PHQ9Assessment = ({ userContext, onComplete }: PHQ9AssessmentProps) => {
  const [responses, setResponses] = useState<number[]>(new Array(9).fill(-1))
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [backendError, setBackendError] = useState<string | null>(null)

  const handleResponse = (value: number) => {
    const newResponses = [...responses]
    newResponses[currentQuestion] = value
    setResponses(newResponses)
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setBackendError(null)

    const assessmentData: AssessmentData = {
      assessment_type: 'PHQ9',
      responses: responses,
      user_context: userContext,
      timestamp: new Date().toISOString()
    }
    
    try {
      // Send data to backend for ML processing and database storage
      const backendResponse: BackendAssessmentResponse = await BackendService.submitAssessment(assessmentData)
      console.log('Backend response for PHQ9:', backendResponse)
      
      // Create enhanced assessment data with ML results
      const enhancedData = {
        ...assessmentData,
        userId: backendResponse.userId,
        ml_results: backendResponse.ml_results,
        message: backendResponse.message,
        backend_processed: true
      }
      
      onComplete(enhancedData)
      
    } catch (error) {
      console.error('Error sending PHQ9 data to backend:', error)
      setBackendError(error instanceof Error ? error.message : 'Failed to process assessment')
      
      // Fallback to local processing if backend is unavailable
      const fallbackData = {
        ...assessmentData,
        backend_processed: false,
        error: 'Backend unavailable - showing basic results'
      }
      onComplete(fallbackData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isComplete = responses.every(response => response !== -1)
  const progress = ((responses.filter(r => r !== -1).length) / PHQ9_QUESTIONS.length) * 100

  return (
    <div className="assessment-container">
      <div className="assessment-header">
        <h2>PHQ-9 Depression Assessment</h2>
        <p>Over the last 2 weeks, how often have you been bothered by any of the following problems?</p>
        
        {backendError && (
          <div className="error-message">
            ⚠️ {backendError}
          </div>
        )}
        
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="progress-text">Question {currentQuestion + 1} of {PHQ9_QUESTIONS.length}</span>
      </div>

      <div className="question-container">
        <div className="question-text">
          <h3>{PHQ9_QUESTIONS[currentQuestion].text}</h3>
        </div>

        <div className="options-container">
          {PHQ9_QUESTIONS[currentQuestion].options.map((option) => (
            <button
              key={option.value}
              className={`option-button ${responses[currentQuestion] === option.value ? 'selected' : ''}`}
              onClick={() => handleResponse(option.value)}
            >
              <span className="option-value">{option.value}</span>
              <span className="option-label">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="navigation-buttons">
        <button
          className="nav-button secondary"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>

        {currentQuestion === PHQ9_QUESTIONS.length - 1 && isComplete ? (
          <button 
            className="nav-button primary" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '🧠 Processing...' : 'Complete Assessment'}
          </button>
        ) : (
          <button
            className="nav-button primary"
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            disabled={responses[currentQuestion] === -1 || currentQuestion === PHQ9_QUESTIONS.length - 1}
          >
            Next
          </button>
        )}
      </div>

      <div className="crisis-notice">
        <p><strong>Crisis Resources:</strong> If you're having thoughts of self-harm, please contact:</p>
        <ul>
          <li>National Suicide Prevention Lifeline: 988</li>
          <li>Crisis Text Line: Text HOME to 741741</li>
          <li>Emergency Services: 911</li>
        </ul>
      </div>
    </div>
  )
}

export default PHQ9Assessment
