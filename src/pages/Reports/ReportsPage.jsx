import React, { useState } from 'react';
import Papa from 'papaparse';
import { getInventoryReport, getBatchSales, getTransactions, getFinancials } from '../../api/reports';
import DataTable from '../../components/ui/DataTable';
import { formatDate } from '../../utils/formatDate';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('inventory');
  
  // States tailored for each report
  const [data, setData] = useState([]);
  const [financials, setFinancials] = useState(null);
  const [loading, setLoading] = useState(false);
  const [batchNum, setBatchNum] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const fetchInventory = async () => {
    setLoading(true);
    try { const res = await getInventoryReport(); setData(res.data.data); } 
    catch (e) { setData([]); } finally { setLoading(false); }
  };

  const fetchBatchSales = async (e) => {
    e?.preventDefault();
    if (!batchNum) return;
    setLoading(true);
    try { const res = await getBatchSales(batchNum); setData(res.data.data); } 
    catch (e) { setData([]); } finally { setLoading(false); }
  };

  const fetchTransactions = async (e) => {
    e?.preventDefault();
    if (!dateRange.from || !dateRange.to) return;
    setLoading(true);
    try { const res = await getTransactions(dateRange.from, dateRange.to); setData(res.data.data); } 
    catch (e) { setData([]); } finally { setLoading(false); }
  };

  const fetchFinancials = async () => {
    setLoading(true);
    try { const res = await getFinancials(); setFinancials(res.data.data); } 
    catch (e) { setFinancials(null); } finally { setLoading(false); }
  };

  // Run initial fetch on tab switch if needed
  React.useEffect(() => {
    setData([]);
    if (activeTab === 'inventory') fetchInventory();
    if (activeTab === 'financials') fetchFinancials();
  }, [activeTab]);

  const handleExport = () => {
    if (!data.length) return;
    const csv = Papa.unparse(data);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = `${activeTab}_report.csv`;
    link.click();
  };

  const getColumns = () => {
    if (activeTab === 'inventory') return [
      { key: 'name', label: 'Medicine' }, { key: 'category', label: 'Category' },
      { key: 'total_stock', label: 'Total Stock' }, { key: 'reorder_point', label: 'Reorder Pt' }
    ];
    if (activeTab === 'batchSales') return [
      { key: 'created_at', label: 'Date', render: val => formatDate(val) },
      { key: 'quantity', label: 'Qty' }, { key: 'reference', label: 'Ref/Invoice' },
      { key: 'created_by_name', label: 'User' }
    ];
    if (activeTab === 'transactions') return [
      { key: 'created_at', label: 'Date', render: val => formatDate(val) },
      { key: 'batch_number', label: 'Batch' }, { key: 'medicine_name', label: 'Medicine' },
      { key: 'type', label: 'Type', render: val => val.toUpperCase() }, { key: 'quantity', label: 'Qty' },
      { key: 'reference', label: 'Ref' }
    ];
    return [];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card" style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)' }}>
        {[
          { id: 'inventory', label: 'Inventory Snapshot' },
          { id: 'batchSales', label: 'Batch Sales Trail' },
          { id: 'transactions', label: 'Transaction History' },
          { id: 'financials', label: 'Financial Analytics' }
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '8px 16px', fontWeight: 600, color: activeTab === t.id ? 'var(--teal-500)' : 'var(--text-secondary)', borderBottom: activeTab === t.id ? '2px solid var(--teal-500)' : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        {activeTab !== 'financials' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div>
              {activeTab === 'batchSales' && (
                <form onSubmit={fetchBatchSales} style={{ display: 'flex', gap: '8px' }}>
                  <input placeholder="Enter Batch No..." value={batchNum} onChange={e => setBatchNum(e.target.value)} required />
                  <button type="submit" style={{ backgroundColor: 'var(--teal-500)', color: '#fff', padding: '0 16px', borderRadius: '6px' }}>Search</button>
                </form>
              )}
              {activeTab === 'transactions' && (
                <form onSubmit={fetchTransactions} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="date" value={dateRange.from} onChange={e => setDateRange({ ...dateRange, from: e.target.value })} required />
                  <span>to</span>
                  <input type="date" value={dateRange.to} onChange={e => setDateRange({ ...dateRange, to: e.target.value })} required />
                  <button type="submit" style={{ backgroundColor: 'var(--teal-500)', color: '#fff', padding: '0 16px', borderRadius: '6px' }}>Filter</button>
                </form>
              )}
            </div>
            <button onClick={handleExport} style={{ backgroundColor: '#f1f5f9', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.9rem' }}>Export CSV</button>
          </div>
        )}
        
        {loading ? <div>Loading Data...</div> : (
          activeTab === 'financials' ? (
            financials && (
              <div>
                <h3 style={{ marginBottom: '8px', fontFamily: 'var(--font-display)' }}>Profit & Loss Pipeline</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Real-time fiscal pipeline generated from native transactions catalog.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                  <div style={{ backgroundColor: '#f0fdf9', padding: '24px', borderRadius: '8px', border: '1px solid #ccfbf1' }}>
                    <h4 style={{ margin: 0, color: 'var(--teal-600)', paddingBottom: '8px' }}>Gross Revenue (Retail)</h4>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--teal-700)' }}>${Number(financials.total_revenue).toFixed(2)}</div>
                  </div>
                  <div style={{ backgroundColor: '#fffbeb', padding: '24px', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                    <h4 style={{ margin: 0, color: '#d97706', paddingBottom: '8px' }}>Cost of Goods Sold (COGS)</h4>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#b45309' }}>${Number(financials.cost_of_goods_sold).toFixed(2)}</div>
                  </div>
                  <div style={{ backgroundColor: '#fef2f2', padding: '24px', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                    <h4 style={{ margin: 0, color: 'var(--status-red)', paddingBottom: '8px' }}>Spoilage Write-offs</h4>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#b91c1c' }}>${Number(financials.spoilage_loss).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <DataTable columns={getColumns()} data={data} emptyMessage={`No data found for ${activeTab}.`} />
          )
        )}
      </div>
    </div>
  );
}
