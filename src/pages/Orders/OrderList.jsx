import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, updateOrderStatus } from '../../api/orders';
import { getMedicines } from '../../api/medicines';
import { AuthContext } from '../../context/AuthContext';
import DataTable from '../../components/ui/DataTable';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatDate } from '../../utils/formatDate';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [medicines, setMedicines] = useState({});
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, status: '' });
  const { role } = useContext(AuthContext);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [oRes, mRes] = await Promise.all([getOrders(), getMedicines()]);
      const medMap = {};
      mRes.data.data.forEach(m => medMap[m.id] = m.name);
      setMedicines(medMap);
      setOrders(oRes.data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleStatusUpdate = (id, status) => {
    setConfirmModal({ isOpen: true, id, status });
  };

  const confirmStatusUpdate = async () => {
    try {
      await updateOrderStatus(confirmModal.id, confirmModal.status);
      loadData();
    } catch (err) { alert('Failed to update status'); }
  };

  const cols = [
    { key: 'medicine_id', label: 'Medicine', render: (val) => medicines[val] || val },
    { key: 'quantity', label: 'Qty' },
    { key: 'created_at', label: 'Date', render: (val) => formatDate(val) },
    { key: 'status', label: 'Status', render: (val) => <Badge status={val} label={val.toUpperCase()} /> },
    { key: 'actions', label: 'Actions', render: (_, row) => (
      role === 'admin' && row.status !== 'received' ? (
        <select onChange={(e) => { if(e.target.value) handleStatusUpdate(row.id, e.target.value) }} value="" style={{ padding: '4px', fontSize: '0.8rem' }}>
          <option value="">Update Status...</option>
          {row.status === 'pending' && <option value="approved">Approve</option>}
          {(row.status === 'pending' || row.status === 'approved') && <option value="received">Mark Received</option>}
        </select>
      ) : null
    )}
  ];

  if (loading) return <Loader />;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>Purchase Orders</h2>
        {['admin', 'manager'].includes(role) && (
          <button onClick={() => navigate('/orders/new')} style={{ backgroundColor: 'var(--teal-500)', color: '#fff', padding: '8px 16px', borderRadius: '6px' }}>+ Generate PO</button>
        )}
      </div>
      <DataTable columns={cols} data={orders} />
      
      <ConfirmDialog 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} 
        onConfirm={confirmStatusUpdate} 
        title="Update Status"
        message={`Are you sure you want to transition this Purchase Order to '${confirmModal.status}'?`} 
        confirmText="Yes, Update" 
        danger={false} 
      />
    </div>
  );
}
