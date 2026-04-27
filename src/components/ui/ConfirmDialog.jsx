import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = "Confirm Action", message, confirmText = "Confirm", danger = true }) {
  if (!isOpen) return null;

  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', backgroundColor: danger ? '#fef2f2' : '#f0fdf4', padding: '16px', borderRadius: '8px', border: `1px solid ${danger ? '#fecaca' : '#bbf7d0'}` }}>
          {danger && <AlertTriangle size={32} color="#dc2626" style={{ flexShrink: 0 }} />}
          <p style={{ margin: 0, color: danger ? '#991b1b' : '#166534', fontSize: '1rem', lineHeight: '1.4' }}>{message}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 16px', backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} style={{ padding: '10px 16px', border: 'none', backgroundColor: danger ? 'var(--status-red)' : 'var(--teal-500)', color: '#fff', borderRadius: '6px', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', cursor: 'pointer' }}>{confirmText}</button>
        </div>
      </div>
    </Modal>
  );
}
