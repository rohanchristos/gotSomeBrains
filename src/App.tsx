import './App.css'
import MentalHealthAssessment from './components/MentalHealthAssessment'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Mental Health Assessment Platform</h1>
        <p>Comprehensive mental health screening tools with ML integration</p>
      </header>
      <main>
        <MentalHealthAssessment />
      </main>
    </div>
  )
}

export default App
