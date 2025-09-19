import { useState, useEffect } from 'react'
import type { AssessmentData, UserContext, AssessmentQuestion, ModelStatus, BackendAssessmentResponse } from '../../types/assessment'
import { BackendService } from '../../services/backendService'

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
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [backendError, setBackendError] = useState<string | null>(null)

  // Check model status on component mount
  useEffect(() => {
    const checkModelStatus = async () => {
      try {
        const status = await BackendService.getModelStatus()
        setModelStatus(status)
      } catch (error) {
        console.error('Failed to check model status:', error)
        setBackendError('Failed to connect to ML backend')
      }
    }

    checkModelStatus()
    
    // Check status every 5 seconds if model is initializing
    const interval = setInterval(async () => {
      if (modelStatus?.status === 'initializing') {
        await checkModelStatus()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [modelStatus?.status])

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
    if (modelStatus?.status !== 'ready') {
      setBackendError('ML model is not ready yet. Please wait for initialization to complete.')
      return
    }

    setIsSubmitting(true)
    setBackendError(null)

    const assessmentData: AssessmentData = {
      assessment_type: 'CustomML',
      responses: responses,
      user_context: userContext,
      timestamp: new Date().toISOString()
    }
    
    try {
      // Send data to TensorFlow.js backend
      const backendResponse: BackendAssessmentResponse = await BackendService.submitAssessment(assessmentData)
      console.log('TensorFlow.js Backend response:', backendResponse)
      
      // Create enhanced assessment data with ML results
      const enhancedData = {
        ...assessmentData,
        userId: backendResponse.userId,
        ml_results: backendResponse.ml_results,
        message: backendResponse.message,
        backend_processed: true
      }
      
      // Pass the enhanced response to the parent component
      onComplete(enhancedData)
      
    } catch (error) {
      console.error('Error sending data to TensorFlow.js backend:', error)
      setBackendError(error instanceof Error ? error.message : 'Failed to process assessment')
      
      // Fallback to original behavior if backend is not available
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
  const progress = ((responses.filter(r => r !== -1).length) / CUSTOM_ML_QUESTIONS.length) * 100

  return (
    <div className="assessment-container">
      <div className="assessment-header">
        <h2>Custom ML Assessment</h2>
        <p>This assessment uses TensorFlow.js neural networks to analyze your responses. Please answer honestly based on how you've been feeling recently.</p>
        
        {/* Model Status Indicator */}
        <div className="model-status">
          {modelStatus?.status === 'ready' && (
            <div className="status-indicator ready">
              ✅ Neural Network Ready ({modelStatus.model_info?.framework})
            </div>
          )}
          {modelStatus?.status === 'initializing' && (
            <div className="status-indicator initializing">
              🔄 Initializing TensorFlow.js Model... Please wait
            </div>
          )}
          {!modelStatus && (
            <div className="status-indicator connecting">
              🔗 Connecting to ML Backend...
            </div>
          )}
        </div>

        {/* Error Display */}
        {backendError && (
          <div className="error-message">
            ⚠️ {backendError}
          </div>
        )}
        
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
          <button 
            className="nav-button primary" 
            onClick={handleSubmit}
            disabled={isSubmitting || modelStatus?.status !== 'ready'}
          >
            {isSubmitting ? '🧠 Processing with Neural Network...' : 
             modelStatus?.status !== 'ready' ? '⏳ Waiting for Model...' : 
             '🚀 Process with TensorFlow.js'}
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
        <p><strong>About this assessment:</strong> This assessment uses a TensorFlow.js neural network with multiple hidden layers to analyze complex patterns in your responses and provide sophisticated mental health insights.</p>
        <p><strong>Technology:</strong> Powered by a {modelStatus?.model_info?.layers}-layer neural network with {modelStatus?.model_info?.parameters} parameters, trained specifically for mental health assessment.</p>
        <p><strong>Privacy:</strong> Your responses are processed securely with the ML model running locally in your browser and backend. Data is stored with unique IDs for analysis.</p>
      </div>
    </div>
  )
}

export default CustomMLAssessment
