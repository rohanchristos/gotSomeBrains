import { useState } from 'react'
import type { UserContext } from '../types/assessment'

interface UserContextFormProps {
  onComplete: (context: UserContext) => void
  onBack: () => void
}

const UserContextForm = ({ onComplete, onBack }: UserContextFormProps) => {
  const [formData, setFormData] = useState<Partial<UserContext>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.age_group && formData.institution_type) {
      onComplete(formData as UserContext)
    }
  }

  const handleChange = (field: keyof UserContext, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="context-form-container">
      <div className="form-header">
        <h2>Background Information</h2>
        <p>This information helps provide more personalized assessment results and recommendations.</p>
      </div>

      <form onSubmit={handleSubmit} className="context-form">
        <div className="form-group">
          <label htmlFor="age_group">Age Group *</label>
          <select
            id="age_group"
            value={formData.age_group || ''}
            onChange={(e) => handleChange('age_group', e.target.value)}
            required
          >
            <option value="">Select age group</option>
            <option value="13-17">13-17 years</option>
            <option value="18-25">18-25 years</option>
            <option value="26-35">26-35 years</option>
            <option value="36-50">36-50 years</option>
            <option value="51-65">51-65 years</option>
            <option value="65+">65+ years</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="institution_type">Primary Environment *</label>
          <select
            id="institution_type"
            value={formData.institution_type || ''}
            onChange={(e) => handleChange('institution_type', e.target.value)}
            required
          >
            <option value="">Select environment</option>
            <option value="university">University/College</option>
            <option value="high_school">High School</option>
            <option value="workplace">Workplace</option>
            <option value="healthcare">Healthcare Setting</option>
            <option value="community">Community Center</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gender (Optional)</label>
          <select
            id="gender"
            value={formData.gender || ''}
            onChange={(e) => handleChange('gender', e.target.value)}
          >
            <option value="">Prefer not to specify</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.previous_mental_health_treatment || false}
              onChange={(e) => handleChange('previous_mental_health_treatment', e.target.checked)}
            />
            I have previously received mental health treatment or counseling
          </label>
        </div>

        <div className="privacy-notice">
          <h4>Privacy & Confidentiality</h4>
          <p>
            Your responses are confidential and will only be used for assessment purposes. 
            Data is formatted according to standardized protocols for potential ML analysis 
            to provide personalized recommendations.
          </p>
        </div>

        <div className="form-buttons">
          <button type="button" className="nav-button secondary" onClick={onBack}>
            Back
          </button>
          <button 
            type="submit" 
            className="nav-button primary"
            disabled={!formData.age_group || !formData.institution_type}
          >
            Continue to Assessment
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserContextForm
