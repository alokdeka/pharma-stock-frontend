import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMedicines, deleteMedicine } from '../../api/medicines';
import { AuthContext } from '../../context/AuthContext';
import DataTable from '../../components/ui/DataTable';
import Loader from '../../components/ui/Loader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Search } from 'lucide-react';

export default function MedicineList() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
  const { role } = useContext(AuthContext);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const res = await getMedicines();
      setMedicines(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = (id) => {
    setConfirmModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    try {
      await deleteMedicine(confirmModal.id);
      loadData();
    } catch (e) { alert('Failed to delete medicine'); }
  };

  const categories = [...new Set(medicines.map(m => m.category).filter(Boolean))];

  const filtered = medicines.filter(m => {
    const matchesSearch = m.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category ? m.category === category : true;
    return matchesSearch && matchesCat;
  });

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'manufacturer', label: 'Manufacturer' },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price', render: (val) => `₹${Number(val).toFixed(2)}` },
    { key: 'current_stock', label: 'Stock', render: (val, row) => (
      <span style={{ color: Number(val) < Number(row.reorder_point) ? 'var(--status-red)' : 'inherit', fontWeight: Number(val) < Number(row.reorder_point) ? 'bold' : 'normal' }}>
        {val}
      </span>
    )},
    { key: 'reorder_point', label: 'Reorder Pt' },
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => navigate(`/medicines/${row.id}`)} style={{ color: 'var(--teal-500)', fontSize: '0.8rem' }}>View</button>
        {['admin', 'manager'].includes(role) && <button onClick={() => navigate(`/medicines/${row.id}/edit`)} style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Edit</button>}
        {role === 'admin' && <button onClick={() => handleDelete(row.id)} style={{ color: 'var(--status-red)', fontSize: '0.8rem' }}>Delete</button>}
      </div>
    )}
  ];

  if (loading) return <Loader />;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', top: '10px', left: '10px' }} />
            <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '32px' }} />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {role === 'admin' && (
          <button onClick={() => navigate('/medicines/new')} style={{ backgroundColor: 'var(--teal-500)', color: '#fff', padding: '8px 16px', borderRadius: '6px' }}>+ Add Medicine</button>
        )}
      </div>
      <DataTable columns={columns} data={filtered} />
      
      <ConfirmDialog 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal({ isOpen: false, id: null })} 
        onConfirm={confirmDelete} 
        title="Delete Medicine"
        message="Are you absolutely sure you want to permanently delete this medicine and all its sub-records?" 
        confirmText="Delete Medicine" 
      />
    </div>
  );
}
