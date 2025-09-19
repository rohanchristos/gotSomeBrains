import type { AssessmentData, BackendAssessmentResponse, ModelStatus } from '../types/assessment'

const BACKEND_BASE_URL = 'http://localhost:3001'

export class BackendService {
  // Check if backend is available
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/health`)
      return response.ok
    } catch (error) {
      console.error('Backend health check failed:', error)
      return false
    }
  }

  // Get ML model status
  static async getModelStatus(): Promise<ModelStatus | null> {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/model/status`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to get model status:', error)
      return null
    }
  }

  // Submit assessment for ML processing
  static async submitAssessment(assessmentData: AssessmentData): Promise<BackendAssessmentResponse> {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/customML`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData)
      })

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('ML model is still initializing. Please try again in a few moments.')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to submit assessment:', error)
      throw error
    }
  }

  // Get assessment results by user ID
  static async getAssessmentResults(userId: string): Promise<BackendAssessmentResponse | null> {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/assessment/${userId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to get assessment results:', error)
      return null
    }
  }

  // Wait for model to be ready (with timeout)
  static async waitForModelReady(timeoutMs: number = 30000): Promise<boolean> {
    const startTime = Date.now()
    
    while (Date.now() - startTime < timeoutMs) {
      const status = await this.getModelStatus()
      if (status?.status === 'ready') {
        return true
      }
      
      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    return false
  }
}
