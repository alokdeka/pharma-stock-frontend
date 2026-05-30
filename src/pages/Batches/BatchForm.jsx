import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createBatch } from '../../api/batches';
import { getMedicines } from '../../api/medicines';
import { useNotification } from '../../context/NotificationContext';

export default function BatchForm() {
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const poIdParam = searchParams.get('po_id');
  const medicineIdParam = searchParams.get('medicine_id');
  const quantityParam = searchParams.get('quantity');

  const [medicines, setMedicines] = useState([]);
  const [isCustomLoc, setIsCustomLoc] = useState(false);
  const [form, setForm] = useState({ 
    medicine_id: medicineIdParam || '', 
    batch_number: '', 
    mfg_date: '', 
    expiry_date: '', 
    quantity: quantityParam || '', 
    location: 'Aisle A - Shelf 1', 
    unit_cost: '' 
  });

  const standardLocations = [
    'Aisle A - Shelf 1',
    'Aisle A - Shelf 2',
    'Aisle A - Shelf 3',
    'Aisle B - Shelf 1',
    'Aisle B - Shelf 2',
    'Aisle B - Shelf 3',
    'Cold Storage Zone A',
    'Cold Storage Zone B',
    'Secured Vault Zone A',
    'Secured Vault Zone B',
  ];

  useEffect(() => {
    getMedicines().then(res => {
      setMedicines(res.data.data);
      // Pre-fill unit cost as 60% of retail price if medicineIdParam is present
      if (medicineIdParam) {
        const med = res.data.data.find(m => m.id.toString() === medicineIdParam);
        if (med) {
          setForm(prev => ({
            ...prev,
            unit_cost: (parseFloat(med.price) * 0.60).toFixed(2)
          }));
        }
      }
    }).catch(() => {});
  }, [medicineIdParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(form.expiry_date) <= new Date(form.mfg_date)) {
      return showToast('Expiry date must be after manufacturing date', 'warning');
    }
    try {
      const payload = {
        ...form,
        po_id: poIdParam ? parseInt(poIdParam) : null
      };
      await createBatch(payload);
      showToast('Batch intake recorded successfully', 'success');
      navigate('/batches');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving batch', 'error');
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLocationChange = (e) => {
    const val = e.target.value;
    if (val === 'CUSTOM') {
      setIsCustomLoc(true);
      setForm({ ...form, location: '' });
    } else {
      setIsCustomLoc(false);
      setForm({ ...form, location: val });
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '24px', fontFamily: 'var(--font-display)' }}>Add Batch</h2>

      {poIdParam && (
        <div style={{
          backgroundColor: 'rgba(20, 184, 166, 0.1)',
          borderLeft: '4px solid var(--teal-500)',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          <span style={{ fontWeight: '600', color: 'var(--teal-700)', display: 'block' }}>📦 Ingesting Inbound Batch</span>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Pre-populated details from Purchase Order <strong>#{poIdParam}</strong>. Saving this batch will mark the PO as received.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label>Medicine</label>
          <select 
            required 
            name="medicine_id" 
            value={form.medicine_id} 
            onChange={handleChange}
            disabled={!!medicineIdParam}
            style={medicineIdParam ? { backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' } : {}}
          >
            <option value="">Select Medicine...</option>
            {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label>Batch Number</label>
          <input required name="batch_number" value={form.batch_number} onChange={handleChange} placeholder="e.g. BATCH-2026-987" />
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
            <input required type="number" min="1" step="1" name="quantity" value={form.quantity} onChange={handleChange} disabled={!!quantityParam} style={quantityParam ? { backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' } : {}} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <label>Unit Cost (Cost of Goods)</label>
            <input required type="number" step="0.01" min="0" name="unit_cost" value={form.unit_cost} onChange={handleChange} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label>Storage Location / Bin Mapping</label>
          <select value={isCustomLoc ? 'CUSTOM' : form.location} onChange={handleLocationChange}>
            {standardLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            <option value="CUSTOM">Custom Location...</option>
          </select>
          {isCustomLoc && (
            <input 
              required 
              name="location" 
              value={form.location} 
              onChange={handleChange} 
              placeholder="Enter custom location (e.g. Aisle 4, Shelf C)" 
              style={{ marginTop: '8px' }}
            />
          )}
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <button type="submit" style={{ backgroundColor: 'var(--teal-500)', color: '#fff', padding: '8px 16px', borderRadius: '6px' }}>Save Batch</button>
          <button type="button" onClick={() => navigate(-1)} style={{ padding: '8px 16px', color: 'var(--text-secondary)' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
