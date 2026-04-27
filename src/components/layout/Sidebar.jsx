import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Pill, Layers, AlertTriangle, ShoppingCart, BarChart2, Settings, LogOut, Activity, Truck } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { role, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/medicines', icon: Pill, label: 'Medicines' },
    { to: '/batches', icon: Layers, label: 'Batches' },
    { to: '/expiry', icon: AlertTriangle, label: 'Expiry Monitor' },
    { to: '/orders', icon: ShoppingCart, label: 'Purchase Orders' },
    { to: '/suppliers', icon: Truck, label: 'Suppliers' },
    { to: '/reports', icon: BarChart2, label: 'Reports' },
  ];

  return (
    <>
      {sidebarOpen && window.innerWidth <= 768 && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 998, backdropFilter: 'blur(2px)' }}
        />
      )}
      <div className={`app-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Activity color="var(--teal-300)" />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0 }}>PharmaStock</h1>
      </div>
      <nav style={{ flex: 1, padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', textDecoration: 'none',
              color: isActive ? 'var(--teal-100)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
              borderLeft: isActive ? '4px solid var(--teal-500)' : '4px solid transparent',
            })}
          >
            <link.icon size={20} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {role === 'admin' && (
          <button onClick={() => navigate('/settings')} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', padding: '12px 0' }}>
            <Settings size={20} /> Settings
          </button>
        )}
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--status-red)', padding: '12px 0' }}>
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
    </>
  );
}
