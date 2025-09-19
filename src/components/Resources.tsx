import React from 'react'

interface Resource {
  id: string
  title: string
  description: string
  url: string
  type: 'video' | 'book' | 'article' | 'website' | 'app'
  category: 'anxiety' | 'depression' | 'stress' | 'general' | 'crisis'
  icon: string
}

interface ResourcesProps {
  onClose: () => void
}

const Resources: React.FC<ResourcesProps> = ({ onClose }) => {
  const resources: Resource[] = [
    {
      id: '1',
      title: 'Anxiety and Depression Management',
      description: 'Comprehensive guide to understanding and managing anxiety and depression symptoms',
      url: 'https://youtu.be/rkZl2gsLUp4?si=wdcDwL4LLrs3be7O',
      type: 'video',
      category: 'general',
      icon: '🎥'
    },
    {
      id: '2',
      title: 'Mindfulness Meditation for Beginners',
      description: 'Learn basic mindfulness techniques to reduce stress and improve mental well-being',
      url: 'https://www.headspace.com/meditation/mindfulness',
      type: 'website',
      category: 'stress',
      icon: '🧘‍♀️'
    },
    {
      id: '3',
      title: 'The Anxiety and Worry Workbook',
      description: 'Practical CBT techniques for managing anxiety and excessive worry',
      url: 'https://www.amazon.com/Anxiety-Worry-Workbook-Cognitive-Behavioral/dp/1572244135',
      type: 'book',
      category: 'anxiety',
      icon: '📚'
    },
    {
      id: '4',
      title: 'Depression Self-Help Guide',
      description: 'Evidence-based strategies for understanding and overcoming depression',
      url: 'https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/depression-self-help-guide/',
      type: 'article',
      category: 'depression',
      icon: '📖'
    },
    {
      id: '5',
      title: 'Calm - Meditation & Sleep App',
      description: 'Popular app for meditation, sleep stories, and relaxation techniques',
      url: 'https://www.calm.com/',
      type: 'app',
      category: 'stress',
      icon: '📱'
    },
    {
      id: '6',
      title: 'Crisis Text Line',
      description: '24/7 crisis support via text message - Text HOME to 741741',
      url: 'https://www.crisistextline.org/',
      type: 'website',
      category: 'crisis',
      icon: '🆘'
    },
    {
      id: '7',
      title: 'Breathing Exercises for Anxiety',
      description: 'Simple breathing techniques to manage anxiety and panic attacks',
      url: 'https://www.youtube.com/watch?v=YRPh_GaiL8s',
      type: 'video',
      category: 'anxiety',
      icon: '🫁'
    },
    {
      id: '8',
      title: 'Mental Health America Resources',
      description: 'Comprehensive mental health information, screening tools, and support',
      url: 'https://www.mhanational.org/',
      type: 'website',
      category: 'general',
      icon: '🏥'
    },
    {
      id: '9',
      title: 'Feeling Good: The New Mood Therapy',
      description: 'Classic book on cognitive behavioral therapy for depression',
      url: 'https://www.amazon.com/Feeling-Good-New-Mood-Therapy/dp/0380810336',
      type: 'book',
      category: 'depression',
      icon: '📘'
    },
    {
      id: '10',
      title: 'Progressive Muscle Relaxation',
      description: 'Guided audio for progressive muscle relaxation to reduce stress and tension',
      url: 'https://www.youtube.com/watch?v=1nZEdqcGVzo',
      type: 'video',
      category: 'stress',
      icon: '💪'
    }
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'anxiety': return '#fbbf24'
      case 'depression': return '#8b5cf6'
      case 'stress': return '#10b981'
      case 'crisis': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥'
      case 'book': return '📚'
      case 'article': return '📖'
      case 'website': return '🌐'
      case 'app': return '📱'
      default: return '📄'
    }
  }

  const openResource = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="resources-overlay">
      <div className="resources-container">
        <div className="resources-header">
          <h2>Mental Health Resources</h2>
          <p>Helpful tools, guides, and support for your mental wellness journey</p>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="resources-content">
          <div className="resources-intro">
            <div className="intro-card">
              <h3>🌟 Self-Help Resources</h3>
              <p>
                Explore these carefully curated resources to support your mental health journey. 
                From guided videos and meditation apps to evidence-based books and crisis support, 
                these tools can complement your assessment results and provide ongoing support.
              </p>
            </div>
          </div>

          <div className="resources-grid">
            {resources.map((resource) => (
              <div 
                key={resource.id} 
                className="resource-card"
                onClick={() => openResource(resource.url)}
              >
                <div className="resource-header">
                  <div className="resource-icon-type">
                    <span className="resource-icon">{resource.icon}</span>
                    <span className="resource-type-icon">{getTypeIcon(resource.type)}</span>
                  </div>
                  <div 
                    className="resource-category-badge"
                    style={{ backgroundColor: getCategoryColor(resource.category) }}
                  >
                    {resource.category}
                  </div>
                </div>
                
                <div className="resource-content">
                  <h4>{resource.title}</h4>
                  <p>{resource.description}</p>
                </div>
                
                <div className="resource-footer">
                  <span className="resource-type">{resource.type.toUpperCase()}</span>
                  <span className="external-link-icon">↗</span>
                </div>
              </div>
            ))}
          </div>

          <div className="emergency-notice">
            <div className="emergency-card">
              <h3>🚨 Emergency Resources</h3>
              <p>
                <strong>If you're having thoughts of self-harm or suicide, please reach out immediately:</strong>
              </p>
              <ul>
                <li><strong>National Suicide Prevention Lifeline:</strong> 988 or 1-800-273-8255</li>
                <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
                <li><strong>Emergency Services:</strong> Call 911</li>
                <li><strong>International Association for Suicide Prevention:</strong> <a href="https://www.iasp.info/resources/Crisis_Centres/" target="_blank" rel="noopener noreferrer">Find local crisis centers</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="resources-footer">
          <button className="nav-button secondary" onClick={onClose}>
            Close Resources
          </button>
        </div>
      </div>
    </div>
  )
}

export default Resources
