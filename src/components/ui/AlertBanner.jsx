import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function AlertBanner({ title, message, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fef2f2', borderLeft: '4px solid var(--status-red)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <AlertCircle color="var(--status-red)" />
        <div>
          <strong style={{ color: '#991b1b', display: 'block', fontSize: '0.9rem' }}>{title}</strong>
          <span style={{ color: '#b91c1c', fontSize: '0.8rem' }}>{message}</span>
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
