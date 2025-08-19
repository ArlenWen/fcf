import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import './Notification.css';

const Notification = ({ 
  type = 'info', 
  message, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}) => {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      case 'warning':
        return <AlertCircle size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        <div className="notification-icon">
          {getIcon()}
        </div>
        <div className="notification-message">
          {message}
        </div>
        {onClose && (
          <button className="notification-close" onClick={onClose}>
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification;
