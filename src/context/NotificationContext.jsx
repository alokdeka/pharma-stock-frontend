import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Helper to map type to colors/icons
  const getToastDetails = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          color: '#10b981',
          bg: '#ecfdf5',
          border: '#10b981'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: '#ef4444',
          bg: '#fef2f2',
          border: '#ef4444'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: '#f59e0b',
          bg: '#fffbeb',
          border: '#f59e0b'
        };
      case 'info':
      default:
        return {
          icon: Info,
          color: '#3b82f6',
          bg: '#eff6ff',
          border: '#3b82f6'
        };
    }
  };

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Render Container */}
      <div className="toast-container">
        {toasts.map((toast) => {
          const details = getToastDetails(toast.type);
          const IconComponent = details.icon;
          
          return (
            <div 
              key={toast.id} 
              className="toast-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: details.bg,
                borderLeft: `5px solid ${details.border}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                minWidth: '280px',
                maxWidth: '400px',
                position: 'relative',
                pointerEvents: 'auto'
              }}
            >
              <IconComponent size={20} color={details.color} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, color: '#1e293b', fontSize: '0.85rem', fontWeight: 500 }}>
                {toast.message}
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: '#94a3b8',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#475569'}
                onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};
