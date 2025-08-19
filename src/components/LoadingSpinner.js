import React from 'react';
import { Loader2 } from 'lucide-react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = '处理中...', progress = null }) => {
  return (
    <div className="loading-spinner">
      <div className="spinner-content">
        <Loader2 size={48} className="spinning" />
        <p className="loading-message">{message}</p>
        {progress !== null && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
