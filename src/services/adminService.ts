const BACKEND_BASE_URL = 'http://localhost:3001'

export interface AdminAssessment {
  userId: string
  assessmentType: string
  mlScore: number
  riskLevel: 'low' | 'moderate' | 'high' | 'severe'
  timestamp: string
  userContext: {
    age_group: string
    institution_type: string
    gender?: string
    previous_mental_health_treatment?: boolean
  }
  responses: number[]
  recommendations: string[]
}

export interface AdminStats {
  totalAssessments: number
  riskLevelDistribution: Array<{ _id: string; count: number }>
  assessmentTypeDistribution: Array<{ _id: string; count: number }>
}

export class AdminService {
  // Simple admin authentication (username: admin, password: admin)
  static authenticate(username: string, password: string): boolean {
    return username === 'admin' && password === 'admin'
  }

  // Get all patient assessments
  static async getAllAssessments(): Promise<{ total: number; assessments: AdminAssessment[] } | null> {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/admin/assessments`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch assessments:', error)
      return null
    }
  }

  // Get admin statistics
  static async getAdminStats(): Promise<AdminStats | null> {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/admin/stats`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch admin stats:', error)
      return null
    }
  }

  // Format date for display
  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString()
  }

  // Get risk level color
  static getRiskLevelColor(riskLevel: string): string {
    switch (riskLevel) {
      case 'low': return '#22c55e'
      case 'moderate': return '#eab308'
      case 'high': return '#f97316'
      case 'severe': return '#dc2626'
      default: return '#6b7280'
    }
  }

  // Export assessments as JSON
  static exportAssessments(assessments: AdminAssessment[]): void {
    const dataStr = JSON.stringify(assessments, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `mental_health_assessments_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
