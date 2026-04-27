import React from 'react';

export default function StatCard({ title, icon: Icon, value, subtitle, highlight }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: highlight ? '4px solid var(--status-red)' : 'none' }}>
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
