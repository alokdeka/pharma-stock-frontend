import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getBatch, spoilBatch } from '../../api/batches';
import Loader from '../../components/ui/Loader';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { formatDate } from '../../utils/formatDate';

export default function BatchDetail() {
  const { id } = useParams();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [spoilModalOpen, setSpoilModalOpen] = useState(false);
  const [spoilQty, setSpoilQty] = useState('');
  const [spoilReason, setSpoilReason] = useState('Spoilage/Damage');

  useEffect(() => {
    getBatch(id).then(res => {
      setBatch(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleSpoil = async (e) => {
    e.preventDefault();
    if (!spoilQty || spoilQty <= 0) return alert('Enter valid quantity');
    try {
      await spoilBatch(id, { quantity: parseInt(spoilQty), reason: spoilReason });
      setSpoilModalOpen(false);
      setSpoilQty('');
      getBatch(id).then(res => setBatch(res.data.data)); // Reload
    } catch(err) { alert(err.response?.data?.message || 'Error marking spoilage'); }
  }

  if (loading) return <Loader />;
  if (!batch) return <div>Batch not found</div>;

  const cols = [
    { key: 'created_at', label: 'Date', render: (val) => formatDate(val) },
    { key: 'type', label: 'Type', render: (val) => <Badge status={val === 'in' ? 'teal' : val === 'spoilage' ? 'red' : 'yellow'} label={val.toUpperCase()} /> },
    { key: 'quantity', label: 'Qty' },
    { key: 'reference', label: 'Reference' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card">
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px' }}>Batch: {batch.batch_number}</h2>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', color: 'var(--text-secondary)' }}>
          <div><strong>Quantity:</strong> {batch.quantity}</div>
          <div><strong>Location:</strong> {batch.location}</div>
          <div><strong>Unit Cost:</strong> ${Number(batch.unit_cost).toFixed(2)}</div>
          <div><strong>Mfg Date:</strong> {formatDate(batch.mfg_date)}</div>
          <div><strong>Expiry Date:</strong> {formatDate(batch.expiry_date)}</div>
          <button onClick={() => setSpoilModalOpen(true)} style={{ marginLeft: 'auto', backgroundColor: '#fee2e2', color: '#dc2626', padding: '6px 12px', border: '1px solid #f87171', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>Mark Spoilage</button>
        </div>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Transaction History</h3>
        <DataTable columns={cols} data={batch.transactions || []} emptyMessage="No transactions available" />
      </div>

      <Modal title="Mark Stock as Spoiled" isOpen={spoilModalOpen} onClose={() => setSpoilModalOpen(false)}>
        <form onSubmit={handleSpoil} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Deduct physical stock from this batch without counting it as sales revenue.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Spoiled Quantity</label>
            <input required type="number" min="1" step="1" max={batch.quantity} value={spoilQty} onChange={e => setSpoilQty(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Reason / Note</label>
            <input required value={spoilReason} onChange={e => setSpoilReason(e.target.value)} />
          </div>
          <button type="submit" style={{ backgroundColor: 'var(--status-red)', color: '#fff', padding: '8px 16px', borderRadius: '6px', alignSelf: 'flex-start', marginTop: '8px' }}>Confirm Write-off</button>
        </form>
      </Modal>
    </div>
  );
}
