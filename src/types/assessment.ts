export interface UserContext {
  age_group: '13-17' | '18-25' | '26-35' | '36-50' | '51-65' | '65+'
  institution_type: 'university' | 'high_school' | 'workplace' | 'healthcare' | 'community' | 'other'
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say'
  previous_mental_health_treatment?: boolean
}

export interface AssessmentData {
  assessment_type: 'PHQ9' | 'GAD7' | 'PSS10' | 'CustomML'
  responses: number[]
  user_context: UserContext
  timestamp?: string
}

export interface MLResponse {
  risk_level: 'low' | 'moderate' | 'high' | 'severe'
  confidence: number
  recommendations: string[]
  crisis_flag: boolean
  next_assessment_days: number
  detailed_analysis?: {
    primary_concerns: string[]
    protective_factors: string[]
    risk_factors: string[]
  }
}

// New interface for TensorFlow.js backend response
export interface TensorFlowMLResponse {
  score: number
  risk_level: 'low' | 'moderate' | 'high' | 'severe'
  confidence: number
  recommendations: string[]
  neuralNetworkScore?: number
}

// Enhanced backend response format
export interface BackendAssessmentResponse {
  userId: string
  assessment_type: string
  responses: number[]
  user_context: UserContext
  ml_results: TensorFlowMLResponse
  timestamp: string
  message: string
}

// Model status interface
export interface ModelStatus {
  status: 'ready' | 'initializing' | 'error'
  model_info?: {
    layers: number
    parameters: number
    inputShape: number[]
    outputShape: number[]
    architecture: string
    framework: string
  }
  timestamp: string
}

export interface AssessmentQuestion {
  id: number
  text: string
  options: {
    value: number
    label: string
  }[]
}

export interface AssessmentConfig {
  title: string
  description: string
  instructions: string
  questions: AssessmentQuestion[]
  scoring: {
    ranges: {
      min: number
      max: number
      severity: string
      description: string
    }[]
  }
}
