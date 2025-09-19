import { useState } from 'react'
import { AdminService } from '../services/adminService'

interface AdminLoginProps {
  onLoginSuccess: () => void
  onClose: () => void
}

const AdminLogin = ({ onLoginSuccess, onClose }: AdminLoginProps) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (AdminService.authenticate(username, password)) {
      onLoginSuccess()
    } else {
      setError('Invalid credentials. Use username: admin, password: admin')
    }
  }

  return (
    <div className="admin-login-overlay">
      <div className="admin-login-dialog">
        <div className="admin-login-header">
          <h2>🔐 Admin Portal Access</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="login-buttons">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="login-button">
              Login
            </button>
          </div>
        </form>
        
        <div className="admin-hint">
          <small>💡 Demo credentials: admin / admin</small>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
