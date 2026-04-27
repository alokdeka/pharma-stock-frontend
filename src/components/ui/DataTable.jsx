import React from 'react';

export default function DataTable({ columns, data, emptyMessage }) {
  return (
    <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-card)', borderRadius: '10px', boxShadow: 'var(--shadow)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {columns.map((c, i) => (
              <th key={i} style={{ padding: '16px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.length > 0 ? data.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.9rem', backgroundColor: row.rowColor || 'transparent' }}>
              {columns.map((c, j) => (
                <td key={j} style={{ padding: '16px' }}>
                  {c.render ? c.render(row[c.key], row) : row[c.key]}
                </td>
              ))}
            </tr>
          )) : (
            <tr>
              <td colSpan={columns.length} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                {emptyMessage || 'No data available'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
