import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBatches, searchBatch, sellBatch } from '../../api/batches';
import { getMedicines } from '../../api/medicines';
import { AuthContext } from '../../context/AuthContext';
import DataTable from '../../components/ui/DataTable';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Search } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

export default function BatchList() {
  const [batches, setBatches] = useState([]);
  const [medicines, setMedicines] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { role } = useContext(AuthContext);
  const navigate = useNavigate();

  // Sell Modal State
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [sellForm, setSellForm] = useState({ medicine_id: null, quantity: '', reference: '' });

  const loadData = async () => {
    try {
      const [bRes, mRes] = await Promise.all([getBatches(), getMedicines()]);
      const medMap = {};
      mRes.data.data.forEach(m => medMap[m.id] = m.name);
      setMedicines(medMap);
      setBatches(bRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSearch = async (val) => {
    setSearch(val);
    if (!val) return loadData();
    try {
      const res = await searchBatch(val);
      setBatches(res.data.data);
    } catch (e) {}
  };

  const handleSellSubmit = async (e) => {
    e.preventDefault();
    try {
      await sellBatch(sellForm.medicine_id, { quantity: sellForm.quantity, reference: sellForm.reference });
      setSellModalOpen(false);
      loadData();
      alert('Sale recorded successfully. FEFO logic applied.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording sale');
    }
  };

  const openSellModal = (medicine_id) => {
    setSellForm({ medicine_id, quantity: '', reference: '' });
    setSellModalOpen(true);
  };

  const getStatus = (expDate) => {
    const days = (new Date(expDate) - new Date()) / (1000 * 60 * 60 * 24);
    if (days <= 30) return 'red';
    if (days <= 60) return 'yellow';
    return 'green';
  };

  const cols = [
    { key: 'batch_number', label: 'Batch No.' },
    { key: 'medicine_id', label: 'Medicine', render: (val) => medicines[val] || val },
    { key: 'mfg_date', label: 'Mfg Date', render: (val) => formatDate(val) },
    { key: 'expiry_date', label: 'Expiry Date', render: (val) => formatDate(val) },
    { key: 'quantity', label: 'Qty' },
    { key: 'status', label: 'Status', render: (_, row) => {
        const status = getStatus(row.expiry_date);
        return <Badge status={status} label={status === 'red' ? 'Critical' : status === 'yellow' ? 'Warning' : 'Safe'} />;
    }},
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => navigate(`/batches/${row.id}`)} style={{ color: 'var(--teal-500)', fontSize: '0.8rem' }}>View</button>
        {['admin', 'manager'].includes(role) && row.quantity > 0 && (
          <button onClick={() => openSellModal(row.medicine_id)} style={{ color: 'var(--status-yellow)', fontSize: '0.8rem' }}>Sell</button>
        )}
      </div>
    )}
  ];

  if (loading) return <Loader />;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', top: '10px', left: '10px' }} />
          <input placeholder="Search batch number..." value={search} onChange={e => handleSearch(e.target.value)} style={{ paddingLeft: '32px' }} />
        </div>
        {['admin', 'manager'].includes(role) && (
          <button onClick={() => navigate('/batches/new')} style={{ backgroundColor: 'var(--teal-500)', color: '#fff', padding: '8px 16px', borderRadius: '6px' }}>+ Add Batch</button>
        )}
      </div>
      <DataTable columns={cols} data={batches} />

      <Modal title="Record Sale" isOpen={sellModalOpen} onClose={() => setSellModalOpen(false)}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>FEFO logic is applied — the earliest-expiring batch will be consumed first.</p>
        <form onSubmit={handleSellSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Quantity</label>
            <input required type="number" min="1" step="1" value={sellForm.quantity} onChange={e => setSellForm({ ...sellForm, quantity: e.target.value })} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Reference / Invoice No.</label>
            <input required value={sellForm.reference} onChange={e => setSellForm({ ...sellForm, reference: e.target.value })} />
          </div>
          <button type="submit" style={{ backgroundColor: 'var(--teal-500)', color: '#fff', padding: '10px', borderRadius: '6px', marginTop: '8px' }}>Submit Sale</button>
        </form>
      </Modal>
    </div>
  );
}
