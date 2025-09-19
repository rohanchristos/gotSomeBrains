import { useState, useEffect } from 'react'
import { AdminService, type AdminAssessment, type AdminStats } from '../services/adminService'

interface AdminDashboardProps {
  onClose: () => void
}

const AdminDashboard = ({ onClose }: AdminDashboardProps) => {
  const [assessments, setAssessments] = useState<AdminAssessment[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAssessment, setSelectedAssessment] = useState<AdminAssessment | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [assessmentsData, statsData] = await Promise.all([
        AdminService.getAllAssessments(),
        AdminService.getAdminStats()
      ])
      
      if (assessmentsData) {
        setAssessments(assessmentsData.assessments)
      }
      if (statsData) {
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    AdminService.exportAssessments(assessments)
  }

  if (loading) {
    return (
      <div className="admin-dashboard-overlay">
        <div className="admin-dashboard">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading patient data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard-overlay">
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>🏥 Admin Dashboard</h1>
          <div className="admin-actions">
            <button onClick={handleExport} className="export-button">
              📊 Export Data
            </button>
            <button onClick={loadData} className="refresh-button">
              🔄 Refresh
            </button>
            <button onClick={onClose} className="close-button">
              ✕ Close
            </button>
          </div>
        </div>

        {/* Statistics Overview */}
        {stats && (
          <div className="stats-overview">
            <div className="stat-card">
              <h3>Total Assessments</h3>
              <div className="stat-number">{stats.totalAssessments}</div>
            </div>
            
            <div className="stat-card">
              <h3>Risk Level Distribution</h3>
              <div className="risk-distribution">
                {stats.riskLevelDistribution.map(item => (
                  <div key={item._id} className="risk-item">
                    <span 
                      className="risk-indicator" 
                      style={{ backgroundColor: AdminService.getRiskLevelColor(item._id) }}
                    ></span>
                    <span className="risk-label">{item._id}: {item.count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="stat-card">
              <h3>Assessment Types</h3>
              <div className="assessment-types">
                {stats.assessmentTypeDistribution.map(item => (
                  <div key={item._id} className="type-item">
                    <strong>{item._id}</strong>: {item.count}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Assessments Table */}
        <div className="assessments-section">
          <h2>Patient Assessments ({assessments.length})</h2>
          <div className="assessments-table-container">
            <table className="assessments-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Assessment Type</th>
                  <th>ML Score</th>
                  <th>Risk Level</th>
                  <th>Date</th>
                  <th>Demographics</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((assessment) => (
                  <tr key={assessment.userId}>
                    <td>
                      <code className="patient-id">{assessment.userId.slice(0, 8)}...</code>
                    </td>
                    <td>
                      <span className="assessment-type">{assessment.assessmentType}</span>
                    </td>
                    <td>
                      <span className="ml-score">{assessment.mlScore.toFixed(2)}</span>
                    </td>
                    <td>
                      <span 
                        className={`risk-badge risk-${assessment.riskLevel}`}
                        style={{ backgroundColor: AdminService.getRiskLevelColor(assessment.riskLevel) }}
                      >
                        {assessment.riskLevel.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="timestamp">
                        {AdminService.formatDate(assessment.timestamp)}
                      </span>
                    </td>
                    <td>
                      <div className="demographics">
                        <div>{assessment.userContext.age_group}</div>
                        <div>{assessment.userContext.gender || 'N/A'}</div>
                        <div>{assessment.userContext.institution_type}</div>
                      </div>
                    </td>
                    <td>
                      <button 
                        onClick={() => setSelectedAssessment(assessment)}
                        className="view-details-button"
                      >
                        👁️ View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assessment Details Modal */}
        {selectedAssessment && (
          <div className="assessment-details-overlay">
            <div className="assessment-details-modal">
              <div className="modal-header">
                <h3>Assessment Details</h3>
                <button onClick={() => setSelectedAssessment(null)}>×</button>
              </div>
              
              <div className="modal-content">
                <div className="detail-section">
                  <h4>Patient Information</h4>
                  <p><strong>ID:</strong> {selectedAssessment.userId}</p>
                  <p><strong>Assessment:</strong> {selectedAssessment.assessmentType}</p>
                  <p><strong>Date:</strong> {AdminService.formatDate(selectedAssessment.timestamp)}</p>
                </div>
                
                <div className="detail-section">
                  <h4>ML Analysis Results</h4>
                  <p><strong>Score:</strong> {selectedAssessment.mlScore.toFixed(2)}/100</p>
                  <p><strong>Risk Level:</strong> 
                    <span 
                      className={`risk-badge risk-${selectedAssessment.riskLevel}`}
                      style={{ backgroundColor: AdminService.getRiskLevelColor(selectedAssessment.riskLevel) }}
                    >
                      {selectedAssessment.riskLevel.toUpperCase()}
                    </span>
                  </p>
                </div>
                
                <div className="detail-section">
                  <h4>User Context</h4>
                  <p><strong>Age Group:</strong> {selectedAssessment.userContext.age_group}</p>
                  <p><strong>Institution:</strong> {selectedAssessment.userContext.institution_type}</p>
                  <p><strong>Gender:</strong> {selectedAssessment.userContext.gender || 'Not specified'}</p>
                  <p><strong>Previous Treatment:</strong> {selectedAssessment.userContext.previous_mental_health_treatment ? 'Yes' : 'No'}</p>
                </div>
                
                <div className="detail-section">
                  <h4>Assessment Responses</h4>
                  <div className="responses-grid">
                    {selectedAssessment.responses.map((response, index) => (
                      <div key={index} className="response-item">
                        <span>Q{index + 1}: {response}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>AI Recommendations</h4>
                  <ul className="recommendations-list">
                    {selectedAssessment.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
