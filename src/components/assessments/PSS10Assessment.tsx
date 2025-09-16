import { useState } from 'react'
import type { AssessmentData, UserContext, AssessmentQuestion } from '../../types/assessment'

interface PSS10AssessmentProps {
  userContext: UserContext
  onComplete: (data: AssessmentData) => void
}

const PSS10_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    text: "In the last month, how often have you been upset because of something that happened unexpectedly?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Almost never" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Fairly often" },
      { value: 4, label: "Very often" }
    ]
  },
  {
    id: 2,
    text: "In the last month, how often have you felt that you were unable to control the important things in your life?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Almost never" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Fairly often" },
      { value: 4, label: "Very often" }
    ]
  },
  {
    id: 3,
    text: "In the last month, how often have you felt nervous and stressed?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Almost never" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Fairly often" },
      { value: 4, label: "Very often" }
    ]
  },
  {
    id: 4,
    text: "In the last month, how often have you felt confident about your ability to handle your personal problems?",
    options: [
      { value: 4, label: "Never" },
      { value: 3, label: "Almost never" },
      { value: 2, label: "Sometimes" },
      { value: 1, label: "Fairly often" },
      { value: 0, label: "Very often" }
    ]
  },
  {
    id: 5,
    text: "In the last month, how often have you felt that things were going your way?",
    options: [
      { value: 4, label: "Never" },
      { value: 3, label: "Almost never" },
      { value: 2, label: "Sometimes" },
      { value: 1, label: "Fairly often" },
      { value: 0, label: "Very often" }
    ]
  },
  {
    id: 6,
    text: "In the last month, how often have you found that you could not cope with all the things that you had to do?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Almost never" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Fairly often" },
      { value: 4, label: "Very often" }
    ]
  },
  {
    id: 7,
    text: "In the last month, how often have you been able to control irritations in your life?",
    options: [
      { value: 4, label: "Never" },
      { value: 3, label: "Almost never" },
      { value: 2, label: "Sometimes" },
      { value: 1, label: "Fairly often" },
      { value: 0, label: "Very often" }
    ]
  },
  {
    id: 8,
    text: "In the last month, how often have you felt that you were on top of things?",
    options: [
      { value: 4, label: "Never" },
      { value: 3, label: "Almost never" },
      { value: 2, label: "Sometimes" },
      { value: 1, label: "Fairly often" },
      { value: 0, label: "Very often" }
    ]
  },
  {
    id: 9,
    text: "In the last month, how often have you been angered because of things that were outside of your control?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Almost never" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Fairly often" },
      { value: 4, label: "Very often" }
    ]
  },
  {
    id: 10,
    text: "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Almost never" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Fairly often" },
      { value: 4, label: "Very often" }
    ]
  }
]

const PSS10Assessment = ({ userContext, onComplete }: PSS10AssessmentProps) => {
  const [responses, setResponses] = useState<number[]>(new Array(10).fill(-1))
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

  const handleSubmit = () => {
    const assessmentData: AssessmentData = {
      assessment_type: 'PSS10',
      responses: responses,
      user_context: userContext,
      timestamp: new Date().toISOString()
    }
    onComplete(assessmentData)
  }

  const isComplete = responses.every(response => response !== -1)
  const progress = ((responses.filter(r => r !== -1).length) / PSS10_QUESTIONS.length) * 100

  return (
    <div className="assessment-container">
      <div className="assessment-header">
        <h2>PSS-10 Perceived Stress Scale</h2>
        <p>The questions in this scale ask you about your feelings and thoughts during the last month.</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="progress-text">Question {currentQuestion + 1} of {PSS10_QUESTIONS.length}</span>
      </div>

      <div className="question-container">
        <div className="question-text">
          <h3>{PSS10_QUESTIONS[currentQuestion].text}</h3>
        </div>

        <div className="options-container">
          {PSS10_QUESTIONS[currentQuestion].options.map((option) => (
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

        {currentQuestion === PSS10_QUESTIONS.length - 1 && isComplete ? (
          <button className="nav-button primary" onClick={handleSubmit}>
            Complete Assessment
          </button>
        ) : (
          <button
            className="nav-button primary"
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            disabled={responses[currentQuestion] === -1 || currentQuestion === PSS10_QUESTIONS.length - 1}
          >
            Next
          </button>
        )}
      </div>

      <div className="info-notice">
        <p><strong>Note:</strong> This assessment measures your perceived stress levels. Higher scores indicate higher perceived stress.</p>
      </div>
    </div>
  )
}

export default PSS10Assessment
