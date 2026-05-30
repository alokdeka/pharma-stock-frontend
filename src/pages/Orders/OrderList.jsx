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
import { useNotification } from '../../context/NotificationContext';

export default function OrderList() {
  const { showToast } = useNotification();
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
      setConfirmModal({ isOpen: false, id: null, status: '' });
      showToast(`Purchase Order marked as ${confirmModal.status} successfully`, 'success');
      loadData();
    } catch (err) { 
      showToast('Failed to update Purchase Order status', 'error'); 
    }
  };

  const cols = [
    { key: 'medicine_id', label: 'Medicine', render: (val) => medicines[val] || val },
    { key: 'quantity', label: 'Qty' },
    { key: 'created_at', label: 'Date', render: (val) => formatDate(val) },
    { key: 'status', label: 'Status', render: (val) => <Badge status={val} label={val.toUpperCase()} /> },
    { key: 'actions', label: 'Actions', render: (_, row) => (
      role === 'admin' && row.status !== 'received' ? (
        <select 
          onChange={(e) => { 
            const val = e.target.value;
            if (val === 'ingest') {
              navigate(`/batches/new?po_id=${row.id}&medicine_id=${row.medicine_id}&quantity=${row.quantity}`);
            } else if (val) {
              handleStatusUpdate(row.id, val);
            }
          }} 
          value="" 
          style={{ padding: '4px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
        >
          <option value="">Update Status...</option>
          {row.status === 'pending' && <option value="approved">Approve</option>}
          {row.status === 'approved' && <option value="ingest">Receive & Ingest Batch</option>}
          {(row.status === 'pending' || row.status === 'approved') && <option value="received">Mark Received (Direct)</option>}
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
