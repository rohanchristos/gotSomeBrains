import React, { useState } from 'react';
import Spline from '@splinetool/react-spline';

interface LandingProps {
  onEnterApp: () => void;
}

const Landing: React.FC<LandingProps> = ({ onEnterApp }) => {
  const [showDialog, setShowDialog] = useState(false);

  const handleClick = () => {
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  const handleEnterApp = () => {
    setShowDialog(false);
    onEnterApp();
  };

  return (
    <div className="landing-container" onClick={handleClick}>
      <Spline
        scene="https://prod.spline.design/VkoqZa1YlHLRnuLZ/scene.splinecode"
        onLoad={() => console.log('Spline scene loaded')}
      />

      {showDialog && (
        <div className="dialog-overlay" onClick={handleCloseDialog}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>Mental Health Assessment</h3>
              <button className="dialog-close" onClick={handleCloseDialog}>×</button>
            </div>
            <div className="dialog-content">
              <p>Welcome to our comprehensive mental health screening platform.</p>
              <div className="dialog-actions">
                <button className="dialog-btn primary" onClick={handleEnterApp}>
                  Start Assessment
                </button>
                <button className="dialog-btn secondary" onClick={() => window.open('https://github.com/rohanchristos/gotSomeBrains', '_blank')}>
                  GitHub Repository
                </button>
                <button className="dialog-btn secondary" onClick={handleCloseDialog}>
                  About
                </button>
                <button className="dialog-btn secondary" onClick={handleCloseDialog}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
