import React from 'react';

export default function StatCard({ title, icon: Icon, value, subtitle, highlight, onClick }) {
  return (
    <div 
      className="card" 
      onClick={onClick}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        borderLeft: highlight ? '4px solid var(--status-red)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px -4px rgba(0, 0, 0, 0.08)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <div style={{ backgroundColor: 'var(--teal-100)', color: 'var(--teal-700)', padding: '12px', borderRadius: '10px' }}>
        {Icon && <Icon size={24} />}
      </div>
      <div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{value}</div>
        {subtitle && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{subtitle}</div>}
      </div>
    </div>
  );
}
