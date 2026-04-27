import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Layers, AlertTriangle, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import StatCard from '../components/ui/StatCard';
import AlertBanner from '../components/ui/AlertBanner';
import Loader from '../components/ui/Loader';
import { getMedicines } from '../api/medicines';
import { getBatches } from '../api/batches';
import { getCriticalExpiry } from '../api/expiry';
import { getLowStock } from '../api/orders';
import { getExpirySummary, getInventoryReport, getSalesTrend } from '../api/reports';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ medicines: 0, batches: 0, expiring: 0, lowStock: 0 });
  const [lowStockList, setLowStockList] = useState([]);
  const [expiryData, setExpiryData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medRes, batchRes, expRes, stockRes, expSummaryRes, invRes, salesRes] = await Promise.all([
          getMedicines(), getBatches(), getCriticalExpiry(), getLowStock(), getExpirySummary(), getInventoryReport(), getSalesTrend()
        ]);
        
        setStats({
          medicines: medRes.data.data.length,
          batches: batchRes.data.data.length,
          expiring: expRes.data.data.length,
          lowStock: stockRes.data.data.length
        });
        
        setLowStockList(stockRes.data.data.slice(0, 5)); // top 5
        
        const summary = expSummaryRes.data.data;
        setExpiryData([
          { name: 'Critical (≤30)', value: summary.red, color: 'var(--status-red)' },
          { name: 'Warning (≤60)', value: summary.yellow, color: 'var(--status-yellow)' },
          { name: 'Safe (>60)', value: summary.green, color: 'var(--status-green)' },
        ]);

        setInventoryData(invRes.data.data.map(i => ({
          name: i.name.split(' ')[0], // Shorten name for chart XAxis
          Stock: Number(i.total_stock),
          ReorderLimit: Number(i.reorder_point)
        })));

        setSalesData(salesRes.data.data.map(s => ({
          name: new Date(s.name).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          Volume: Number(s.volume)
        })));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <StatCard title="Total Medicines" icon={Pill} value={stats.medicines} />
        <StatCard title="Total Batches" icon={Layers} value={stats.batches} />
        <StatCard title="Expiring Soon" icon={AlertTriangle} value={stats.expiring} highlight={stats.expiring > 0} />
        <StatCard title="Low Stock Items" icon={TrendingDown} value={stats.lowStock} highlight={stats.lowStock > 0} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Sales Velocity Area Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontFamily: 'var(--font-display)' }}>Sales Volume Velocity (7 Days)</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="Volume" stroke="var(--teal-500)" fill="var(--teal-100)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expiry Overview Pie Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontFamily: 'var(--font-display)' }}>Overall Expiry Status</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={expiryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
                  {expiryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Inventory Stock vs Restock Limits Bar Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontFamily: 'var(--font-display)' }}>Inventory Status vs Reorder Limits</h3>
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer>
              <BarChart data={inventoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip cursor={{ fill: 'transparent' }} />
                <Legend />
                <Bar dataKey="Stock" fill="var(--teal-500)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ReorderLimit" fill="var(--status-yellow)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actionable Low Stock Alerts */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px', fontFamily: 'var(--font-display)' }}>Immediate Attention</h3>
          {lowStockList.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '2rem' }}>🎉</span>
              <p style={{ marginTop: '8px' }}>All stock levels healthy.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              {lowStockList.map(item => (
                <AlertBanner
                  key={item.medicine_id}
                  title={item.name}
                  message={`Available: ${item.current_stock} — Limit: ${item.reorder_point}`}
                  action={
                    <button onClick={() => navigate(`/orders/new?medicine_id=${item.medicine_id}`)} style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #f87171', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                      Create PO
                    </button>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
