import type { AssessmentData, MLResponse, UserContext } from '../types/assessment'

interface ResultsDisplayProps {
  assessmentData: AssessmentData
  mlResponse: MLResponse
  userContext: UserContext | null
  onStartOver: () => void
  onExportData: () => void
}

const ResultsDisplay = ({ 
  assessmentData, 
  mlResponse, 
  userContext, 
  onStartOver, 
  onExportData 
}: ResultsDisplayProps) => {
  const totalScore = assessmentData.responses.reduce((sum, val) => sum + val, 0)
  
  const getSeverityInfo = (assessmentType: string, score: number) => {
    switch (assessmentType) {
      case 'PHQ9':
        if (score <= 4) return { level: 'Minimal', color: '#22c55e', description: 'Minimal depression symptoms' }
        if (score <= 9) return { level: 'Mild', color: '#eab308', description: 'Mild depression symptoms' }
        if (score <= 14) return { level: 'Moderate', color: '#f97316', description: 'Moderate depression symptoms' }
        if (score <= 19) return { level: 'Moderately Severe', color: '#ef4444', description: 'Moderately severe depression symptoms' }
        return { level: 'Severe', color: '#dc2626', description: 'Severe depression symptoms' }
      
      case 'GAD7':
        if (score <= 4) return { level: 'Minimal', color: '#22c55e', description: 'Minimal anxiety symptoms' }
        if (score <= 9) return { level: 'Mild', color: '#eab308', description: 'Mild anxiety symptoms' }
        if (score <= 14) return { level: 'Moderate', color: '#f97316', description: 'Moderate anxiety symptoms' }
        return { level: 'Severe', color: '#dc2626', description: 'Severe anxiety symptoms' }
      
      case 'PSS10':
        if (score <= 13) return { level: 'Low', color: '#22c55e', description: 'Low perceived stress' }
        if (score <= 26) return { level: 'Moderate', color: '#eab308', description: 'Moderate perceived stress' }
        return { level: 'High', color: '#ef4444', description: 'High perceived stress' }
      
      default:
        return { level: 'Unknown', color: '#6b7280', description: 'Assessment results' }
    }
  }

  const severityInfo = getSeverityInfo(assessmentData.assessment_type, totalScore)
  
  // Get risk class based on score (0-10 scale)
  const getRiskClass = (score: number) => {
    if (score <= 3) return 'low-risk';
    if (score <= 6) return 'moderate-risk';
    return 'high-risk';
  };
  
  // Calculate normalized score for 0-10 scale
  const maxScore = assessmentData.responses.length * (assessmentData.assessment_type === 'PSS10' ? 4 : 3);
  const normalizedScore = Math.round((totalScore / maxScore) * 10);
  const riskClass = getRiskClass(normalizedScore);

  const getRecommendationText = (rec: string) => {
    const recommendations: { [key: string]: string } = {
      'sleep_hygiene': 'Improve sleep habits and maintain regular sleep schedule',
      'stress_management': 'Practice stress reduction techniques like meditation or deep breathing',
      'professional_consultation': 'Consider speaking with a mental health professional',
      'exercise': 'Incorporate regular physical activity into your routine',
      'social_support': 'Connect with friends, family, or support groups',
      'mindfulness': 'Practice mindfulness and present-moment awareness',
      'cognitive_behavioral_techniques': 'Learn and practice CBT techniques',
      'lifestyle_changes': 'Make positive lifestyle modifications'
    }
    return recommendations[rec] || rec
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Assessment Results</h2>
        <div className="assessment-info">
          <span className="assessment-type">{assessmentData.assessment_type}</span>
          <span className="assessment-date">
            {new Date(assessmentData.timestamp || '').toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="score-section">
        <div className="score-display">
          <div className={`score-circle ${riskClass}`}>
            <span className="score-number">{totalScore}</span>
            <span className="score-max">/{maxScore}</span>
          </div>
          <div className="score-info">
            <h3 style={{ color: severityInfo.color }}>{severityInfo.level}</h3>
            <p>{severityInfo.description}</p>
          </div>
        </div>
      </div>

      <div className="ml-analysis">
        <h3>AI Analysis</h3>
        <div className="analysis-grid">
          <div className="analysis-item">
            <label>Risk Level</label>
            <span className={`risk-badge risk-${mlResponse.risk_level}`}>
              {mlResponse.risk_level.toUpperCase()}
            </span>
          </div>
          <div className="analysis-item">
            <label>Confidence</label>
            <span className="confidence-score">{(mlResponse.confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="analysis-item">
            <label>Next Assessment</label>
            <span className="next-assessment">{mlResponse.next_assessment_days} days</span>
          </div>
        </div>

        {mlResponse.crisis_flag && (
          <div className="crisis-alert">
            <h4>⚠️ Crisis Flag Detected</h4>
            <p>Your responses indicate you may be experiencing severe distress. Please consider reaching out for immediate support.</p>
            <div className="crisis-resources">
              <strong>Immediate Resources:</strong>
              <ul>
                <li>National Suicide Prevention Lifeline: 988</li>
                <li>Crisis Text Line: Text HOME to 741741</li>
                <li>Emergency Services: 911</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="recommendations-section">
        <h3>Personalized Recommendations</h3>
        <div className="recommendations-list">
          {mlResponse.recommendations.map((rec, index) => (
            <div key={index} className="recommendation-item">
              <div className="recommendation-icon">💡</div>
              <div className="recommendation-text">
                {getRecommendationText(rec)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {userContext && (
        <div className="context-summary">
          <h3>Assessment Context</h3>
          <div className="context-grid">
            <div className="context-item">
              <label>Age Group</label>
              <span>{userContext.age_group}</span>
            </div>
            <div className="context-item">
              <label>Environment</label>
              <span>{userContext.institution_type.replace('_', ' ')}</span>
            </div>
            {userContext.gender && (
              <div className="context-item">
                <label>Gender</label>
                <span>{userContext.gender.replace('-', ' ')}</span>
              </div>
            )}
            <div className="context-item">
              <label>Previous Treatment</label>
              <span>{userContext.previous_mental_health_treatment ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="data-export">
        <h3>Standardized Data Format</h3>
        <p>Assessment data is formatted for ML integration and analysis:</p>
        <pre className="json-preview">
{JSON.stringify({
  assessment_type: assessmentData.assessment_type,
  responses: assessmentData.responses,
  user_context: userContext
}, null, 2)}
        </pre>
      </div>

      <div className="action-buttons">
        <button className="nav-button secondary" onClick={onExportData}>
          Export Data (JSON)
        </button>
        <button className="nav-button primary" onClick={onStartOver}>
          Take Another Assessment
        </button>
      </div>

      <div className="disclaimer">
        <p><strong>Disclaimer:</strong> This assessment is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. If you're experiencing mental health concerns, please consult with a qualified healthcare provider.</p>
      </div>
    </div>
  )
}

export default ResultsDisplay
