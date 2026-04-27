import React from 'react';

export default function Loader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 40px', flexDirection: 'column', gap: '24px', width: '100%' }}>
      <div className="modern-loader">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
      <span style={{ color: 'var(--teal-700)', fontWeight: 600, letterSpacing: '2px', fontSize: '0.8rem', textTransform: 'uppercase', fontFamily: 'var(--font-display)', animation: 'pulse 2s infinite ease-in-out' }}>
        Synchronizing
      </span>
      <style>{`
        .modern-loader {
          display: flex;
          gap: 12px;
        }
        .dot {
          width: 14px;
          height: 14px;
          background-color: var(--teal-500);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .dot:nth-child(1) { animation-delay: -0.48s; background-color: var(--teal-900); }
        .dot:nth-child(2) { animation-delay: -0.32s; background-color: var(--teal-700); }
        .dot:nth-child(3) { animation-delay: -0.16s; background-color: var(--teal-500); }
        .dot:nth-child(4) { animation-delay: 0s; background-color: var(--teal-300); }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
