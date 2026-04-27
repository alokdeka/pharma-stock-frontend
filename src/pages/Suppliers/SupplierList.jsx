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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Company Name *</label>
            <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Contact Person</label>
            <input value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <label>Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Address</label>
            <textarea rows="3" value={form.address} onChange={e => setForm({...form, address: e.target.value})} style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>Save Profile</button>
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
    </div>
  );
}
