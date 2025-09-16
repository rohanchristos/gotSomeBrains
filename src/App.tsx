import { useState } from 'react'
import './App.css'
import Landing from './components/Landing'
import MentalHealthAssessment from './components/MentalHealthAssessment'

function App() {
  const [showLanding, setShowLanding] = useState(true)

  const handleEnterApp = () => {
    setShowLanding(false)
  }

  const handleBackToLanding = () => {
    setShowLanding(true)
  }

  if (showLanding) {
    return <Landing onEnterApp={handleEnterApp} />
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mental Health Assessment Platform</h1>
        <p>Comprehensive mental health screening tools with ML integration</p>
        <button 
          className="back-to-landing-btn"
          onClick={handleBackToLanding}
          title="Back to Landing"
        >
          🏠
        </button>
      </header>
      <main>
        <MentalHealthAssessment />
      </main>
    </div>
  )
}

export default App
