import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createMedicine, getMedicine, updateMedicine } from '../../api/medicines';

export default function MedicineForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({ name: '', manufacturer: '', category: '', price: '', reorder_point: 50 });

  useEffect(() => {
    if (isEdit) {
      getMedicine(id).then(res => setForm(res.data.data)).catch(() => alert('Failed to load'));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateMedicine(id, form);
      } else {
        await createMedicine(form);
      }
      navigate('/medicines');
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving medicine');
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="card" style={{ maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '24px', fontFamily: 'var(--font-display)' }}>{isEdit ? 'Edit Medicine' : 'Add Medicine'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label>Name</label>
          <input required name="name" value={form.name} onChange={handleChange} />
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <label>Manufacturer</label>
            <input required name="manufacturer" value={form.manufacturer} onChange={handleChange} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <label>Category</label>
            <input required name="category" value={form.category} onChange={handleChange} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <label>Price (₹)</label>
            <input required type="number" step="0.01" min="0.01" name="price" value={form.price} onChange={handleChange} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <label>Reorder Point</label>
            <input required type="number" min="1" step="1" name="reorder_point" value={form.reorder_point} onChange={handleChange} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <button type="submit" style={{ backgroundColor: 'var(--teal-500)', color: '#fff', padding: '8px 16px', borderRadius: '6px' }}>Save</button>
          <button type="button" onClick={() => navigate(-1)} style={{ padding: '8px 16px', color: 'var(--text-secondary)' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
