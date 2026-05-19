import React, { useState, useEffect, useContext } from 'react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../api/suppliers';
import { AuthContext } from '../../context/AuthContext';
import DataTable from '../../components/ui/DataTable';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function SupplierList() {
  const { role } = useContext(AuthContext);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', contact: '', address: '' });

  const loadData = () => {
    setLoading(true);
    getSuppliers().then(res => setSuppliers(res.data.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const openModal = (sup = null) => {
    if (sup) {
      setEditingId(sup.id);
      setForm(sup);
    } else {
      setEditingId(null);
      setForm({ name: '', email: '', phone: '', contact: '', address: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await updateSupplier(editingId, form);
      else await createSupplier(form);
      setModalOpen(false);
      loadData();
      setSuccessModal({ isOpen: true, message: editingId ? 'Supplier successfully updated.' : 'New supplier registered successfully.' });
    } catch (err) { alert(err.response?.data?.message || 'Error saving supplier'); }
  };

  const handleDelete = (id) => {
    setConfirmModal({ isOpen: true, id });
  }

  const confirmDelete = async () => {
    try {
      await deleteSupplier(confirmModal.id);
      loadData();
    } catch(err) { alert(err.response?.data?.message || 'Cannot delete supplier.'); }
  }

  const cols = [
    { key: 'name', label: 'Company Name' },
    { key: 'contact', label: 'Contact Person' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'actions', label: 'Actions', render: (_, row) => role !== 'distributor' && (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => openModal(row)} style={{ color: 'var(--teal-500)', fontSize: '0.8rem' }}>Edit</button>
        <button onClick={() => handleDelete(row.id)} style={{ color: 'var(--status-red)', fontSize: '0.8rem' }}>Delete</button>
      </div>
    )}
  ];

  if (loading) return <Loader />;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>Registered Suppliers</h2>
        {role !== 'distributor' && <button onClick={() => openModal()} className="btn btn-primary">+ Add Supplier</button>}
      </div>

      <DataTable columns={cols} data={suppliers} />

      <Modal title={editingId ? 'Edit Supplier' : 'New Supplier'} isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>COMPANY DETAILS</label>
            <input placeholder="e.g. Pfizer Pharmaceuticals Inc." required value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} style={{ backgroundColor: '#f8fafc', padding: '12px' }} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>CONTACT PERSON</label>
              <input placeholder="John Doe" value={form.contact || ''} onChange={e => setForm({...form, contact: e.target.value})} style={{ backgroundColor: '#f8fafc', padding: '12px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>PHONE NUMBER</label>
              <input placeholder="+1 (555) 000-0000" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} style={{ backgroundColor: '#f8fafc', padding: '12px' }} />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>EMAIL ADDRESS</label>
            <input type="email" placeholder="contact@company.com" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} style={{ backgroundColor: '#f8fafc', padding: '12px' }} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>BILLING ADDRESS</label>
            <textarea placeholder="123 Corporate Blvd, Suite 100..." rows="3" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} style={{ padding: '12px', backgroundColor: '#f8fafc', border: '1px solid var(--border)', borderRadius: '6px', resize: 'none' }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '8px 16px', color: 'var(--text-secondary)', fontWeight: 500, borderRadius: '6px', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='#f1f5f9'} onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)', padding: '10px 24px' }}>Save Profile</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal({ isOpen: false, id: null })} 
        onConfirm={confirmDelete} 
        title="Delete Supplier"
        message="Are you sure you want to completely remove this supplier connection? This action is permanent." 
        confirmText="Delete Supplier" 
      />

      <Modal title="Success" isOpen={successModal.isOpen} onClose={() => setSuccessModal({ isOpen: false, message: '' })}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <p style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '24px' }}>{successModal.message}</p>
          <button 
            onClick={() => setSuccessModal({ isOpen: false, message: '' })} 
            style={{ backgroundColor: 'var(--teal-500)', color: '#fff', padding: '8px 24px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
          >
            Acknowledge
          </button>
        </div>
      </Modal>
    </div>
  );
}
