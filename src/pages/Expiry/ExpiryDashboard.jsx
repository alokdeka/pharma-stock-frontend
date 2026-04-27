import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { getExpiryDashboard, getCriticalExpiry } from '../../api/expiry';
import DataTable from '../../components/ui/DataTable';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import { formatDate } from '../../utils/formatDate';

export default function ExpiryDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    const fetchFunc = filter === 'all' ? getExpiryDashboard : getCriticalExpiry;
    fetchFunc().then(res => {
      let filtered = res.data.data;
      if (filter === 'critical') filtered = filtered.filter(b => b.status === 'red');
      if (filter === 'warning') filtered = filtered.filter(b => b.status === 'yellow');
      if (filter === 'safe') filtered = filtered.filter(b => b.status === 'green');
      setData(filtered);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [filter]);

  const handleExport = () => {
    const csv = Papa.unparse(data.map(d => ({
      Batch: d.batch_number, Medicine: d.medicine_name, Expiry: d.expiry_date,
      DaysLeft: d.days_to_expiry, Quantity: d.quantity, Status: d.status
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.setAttribute('download', 'expiry_report.csv');
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const cols = [
    { key: 'batch_number', label: 'Batch No.' },
    { key: 'medicine_name', label: 'Medicine' },
    { key: 'expiry_date', label: 'Expiry Date', render: (val) => formatDate(val) },
    { key: 'days_to_expiry', label: 'Days Left', render: (val) => `${val} days` },
    { key: 'quantity', label: 'Qty' },
    { key: 'status', label: 'Status', render: (val) => <Badge status={val} label={val === 'red' ? 'Critical' : val === 'yellow' ? 'Warning' : 'Safe'} /> }
  ];

  if (loading) return <Loader />;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'critical', 'warning', 'safe'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid var(--border)', backgroundColor: filter === f ? 'var(--teal-500)' : 'transparent', color: filter === f ? '#fff' : 'var(--text-secondary)' }}>
              {f}
            </button>
          ))}
        </div>
        <button onClick={handleExport} style={{ backgroundColor: '#f1f5f9', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.9rem' }}>Export CSV</button>
      </div>
      <DataTable columns={cols} data={data} />
    </div>
  );
}
