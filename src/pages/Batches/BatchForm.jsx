import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBatch } from '../../api/batches';
import { getMedicines } from '../../api/medicines';

export default function BatchForm() {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState({ medicine_id: '', batch_number: '', mfg_date: '', expiry_date: '', quantity: '', location: 'Main Warehouse', unit_cost: '' });

  useEffect(() => {
    getMedicines().then(res => setMedicines(res.data.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(form.expiry_date) <= new Date(form.mfg_date)) {
      return alert('Expiry date must be after manufacturing date');
    }
    try {
      await createBatch(form);
      navigate('/batches');
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving batch');
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="card" style={{ maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '24px', fontFamily: 'var(--font-display)' }}>Add Batch</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label>Medicine</label>
          <select required name="medicine_id" value={form.medicine_id} onChange={handleChange}>
            <option value="">Select Medicine...</option>
            {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label>Batch Number</label>
          <input required name="batch_number" value={form.batch_number} onChange={handleChange} />
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <label>Mfg Date</label>
            <input required type="date" name="mfg_date" value={form.mfg_date} onChange={handleChange} max={new Date().toISOString().split('T')[0]} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <label>Expiry Date</label>
            <input required type="date" name="expiry_date" value={form.expiry_date} onChange={handleChange} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <label>Intake Quantity</label>
            <input required type="number" min="1" step="1" name="quantity" value={form.quantity} onChange={handleChange} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <label>Unit Cost (Cost of Goods)</label>
            <input required type="number" step="0.01" min="0" name="unit_cost" value={form.unit_cost} onChange={handleChange} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label>Storage Location / Bin Mapping</label>
          <input required name="location" value={form.location} onChange={handleChange} placeholder="e.g. Aisle 4, Rack B, Bin 12" />
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <button type="submit" style={{ backgroundColor: 'var(--teal-500)', color: '#fff', padding: '8px 16px', borderRadius: '6px' }}>Save Batch</button>
          <button type="button" onClick={() => navigate(-1)} style={{ padding: '8px 16px', color: 'var(--text-secondary)' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
