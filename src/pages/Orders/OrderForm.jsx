import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createOrder } from '../../api/orders';
import { getMedicines } from '../../api/medicines';
import { getSuppliers } from '../../api/suppliers';

export default function OrderForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultMedId = searchParams.get('medicine_id') || '';

  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ medicine_id: defaultMedId, quantity: '', supplier_id: '' });

  useEffect(() => {
    getMedicines().then(res => setMedicines(res.data.data)).catch(() => {});
    getSuppliers().then(res => setSuppliers(res.data.data)).catch(() => {});
  }, []);

  const selectedMed = medicines.find(m => m.id == form.medicine_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createOrder(form);
      navigate('/orders');
    } catch (err) { alert(err.response?.data?.message || 'Error creating order'); }
  };

  return (
    <div className="card" style={{ maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '24px', fontFamily: 'var(--font-display)' }}>Generate Purchase Order</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label>Medicine</label>
          <select required value={form.medicine_id} onChange={e => setForm({ ...form, medicine_id: e.target.value })}>
            <option value="">Select Medicine...</option>
            {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          {selectedMed && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Current Stock: {selectedMed.current_stock} | Reorder Point: {selectedMed.reorder_point}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label>Target Supplier (Optional)</label>
          <select value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })}>
            <option value="">Select Supplier...</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.contact})</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label>Order Quantity</label>
          <input required type="number" min="1" step="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <button type="submit" style={{ backgroundColor: 'var(--teal-500)', color: '#fff', padding: '8px 16px', borderRadius: '6px' }}>Submit Request</button>
          <button type="button" onClick={() => navigate(-1)} style={{ padding: '8px 16px', color: 'var(--text-secondary)' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
