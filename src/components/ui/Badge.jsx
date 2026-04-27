import React from 'react';

const colors = {
  red:      { bg: '#fee2e2', text: '#dc2626' },
  yellow:   { bg: '#fef3c7', text: '#d97706' },
  green:    { bg: '#d1fae5', text: '#059669' },
  pending:  { bg: '#fef3c7', text: '#d97706' },
  approved: { bg: '#dbeafe', text: '#2563eb' },
  received: { bg: '#d1fae5', text: '#059669' },
};

export default function Badge({ status, label }) {
  const c = colors[status?.toLowerCase()] || colors.green;
  return (
    <span style={{ backgroundColor: c.bg, color: c.text, padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500 }}>
      {label || status}
    </span>
  );
}
