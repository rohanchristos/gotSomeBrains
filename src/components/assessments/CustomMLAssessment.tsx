import { useState } from 'react'
import type { AssessmentData, UserContext, AssessmentQuestion } from '../../types/assessment'

interface CustomMLAssessmentProps {
  userContext: UserContext
  onComplete: (data: AssessmentData) => void
}

const CUSTOM_ML_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    text: "How would you rate your overall emotional well-being today?",
    options: [
      { value: 0, label: "Excellent" },
      { value: 1, label: "Good" },
      { value: 2, label: "Fair" },
      { value: 3, label: "Poor" },
      { value: 4, label: "Very Poor" }
    ]
  },
  {
    id: 2,
    text: "How often do you feel overwhelmed by daily responsibilities?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Rarely" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Often" },
      { value: 4, label: "Always" }
    ]
  },
  {
    id: 3,
    text: "How satisfied are you with your current support system (family, friends, colleagues)?",
    options: [
      { value: 0, label: "Very Satisfied" },
      { value: 1, label: "Satisfied" },
      { value: 2, label: "Neutral" },
      { value: 3, label: "Dissatisfied" },
      { value: 4, label: "Very Dissatisfied" }
    ]
  }
]

const CustomMLAssessment = ({ userContext, onComplete }: CustomMLAssessmentProps) => {
  const [responses, setResponses] = useState<number[]>(new Array(3).fill(-1))
  const [currentQuestion, setCurrentQuestion] = useState(0)

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
    const assessmentData: AssessmentData = {
      assessment_type: 'CustomML',
      responses: responses,
      user_context: userContext,
      timestamp: new Date().toISOString()
    }
    
    try {
      // Send data to backend
      const response = await fetch('http://localhost:3001/customML', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const backendResponse = await response.json()
      console.log('Backend response:', backendResponse)
      
      // Pass the backend response to the parent component
      onComplete(backendResponse)
      
    } catch (error) {
      console.error('Error sending data to backend:', error)
      // Fallback to original behavior if backend is not available
      onComplete(assessmentData)
    }
  }

  const isComplete = responses.every(response => response !== -1)
  const progress = ((responses.filter(r => r !== -1).length) / CUSTOM_ML_QUESTIONS.length) * 100

  return (
    <div className="assessment-container">
      <div className="assessment-header">
        <h2>Custom ML Assessment</h2>
        <p>This assessment uses custom machine learning algorithms to analyze your responses. Please answer honestly based on how you've been feeling recently.</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="progress-text">Question {currentQuestion + 1} of {CUSTOM_ML_QUESTIONS.length}</span>
      </div>

      <div className="question-container">
        <div className="question-text">
          <h3>{CUSTOM_ML_QUESTIONS[currentQuestion].text}</h3>
        </div>

        <div className="options-container">
          {CUSTOM_ML_QUESTIONS[currentQuestion].options.map((option) => (
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

        {currentQuestion === CUSTOM_ML_QUESTIONS.length - 1 && isComplete ? (
          <button className="nav-button primary" onClick={handleSubmit}>
            Send to Backend
          </button>
        ) : (
          <button
            className="nav-button primary"
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            disabled={responses[currentQuestion] === -1 || currentQuestion === CUSTOM_ML_QUESTIONS.length - 1}
          >
            Next
          </button>
        )}
      </div>

      <div className="assessment-info">
        <p><strong>About this assessment:</strong> This custom ML assessment analyzes patterns in your responses using advanced machine learning algorithms to provide personalized insights and recommendations.</p>
        <p><strong>Privacy:</strong> Your responses are processed securely and used only to generate your personalized results.</p>
      </div>
    </div>
  )
}

export default CustomMLAssessment
