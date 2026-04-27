import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, isOpen, onClose, children }) {
  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
          <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>{title}</h2>
          <button onClick={onClose} style={{ padding: '4px' }}><X size={20} color="var(--text-secondary)" /></button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
