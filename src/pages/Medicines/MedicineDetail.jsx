import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMedicine } from '../../api/medicines';
import { searchBatch } from '../../api/batches';
import Loader from '../../components/ui/Loader';
import DataTable from '../../components/ui/DataTable';

export default function MedicineDetail() {
  const { id } = useParams();
  const [medicine, setMedicine] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMedicine(id),
      searchBatch('') // This actually searches all batches. A better way is to get all and filter by medicine_id
    ]).then(async ([medRes]) => {
      setMedicine(medRes.data.data);
      // Fallback: If API doesn't support filter, we fetch all batches and map
      import('../../api/batches').then(m => m.getBatches()).then(bRes => {
        setBatches(bRes.data.data.filter(b => b.medicine_id == id));
        setLoading(false);
      });
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!medicine) return <div>Medicine not found</div>;

  const cols = [
    { key: 'batch_number', label: 'Batch No' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'mfg_date', label: 'Mfg Date' },
    { key: 'expiry_date', label: 'Expiry Date' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card">
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>{medicine.name}</h2>
        <div style={{ display: 'flex', gap: '24px', color: 'var(--text-secondary)' }}>
          <div><strong>Manufacturer:</strong> {medicine.manufacturer}</div>
          <div><strong>Category:</strong> {medicine.category}</div>
          <div><strong>Price:</strong> ₹{Number(medicine.price).toFixed(2)}</div>
          <div><strong>Stock:</strong> {medicine.current_stock}</div>
        </div>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Batches</h3>
        <DataTable columns={cols} data={batches} emptyMessage="No batches reported for this medicine." />
      </div>
    </div>
  );
}
