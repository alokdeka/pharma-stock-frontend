import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Pill, Layers, AlertTriangle, ShoppingCart, BarChart2, Settings, LogOut, Activity, Truck, Users, Warehouse, Calendar, Grid } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { role, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const groups = [
    {
      title: 'Overview',
      links: [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/calendar', icon: Calendar, label: 'Operations Calendar' }
      ]
    },
    {
      title: 'Inventory Control',
      links: [
        { to: '/medicines', icon: Pill, label: 'Medicines SKU' },
        { to: '/batches', icon: Layers, label: 'Lot Batches' },
        { to: '/expiry', icon: AlertTriangle, label: 'Expiry Monitor' }
      ]
    },
    {
      title: 'Logistics',
      links: [
        { to: '/warehouse-map', icon: Warehouse, label: 'Warehouse Map' },
        { to: '/locations', icon: Grid, label: 'Location Bins' }
      ]
    },
    {
      title: 'Procurement',
      links: [
        { to: '/orders', icon: ShoppingCart, label: 'Purchase Orders' },
        { to: '/suppliers', icon: Truck, label: 'Suppliers Catalog' }
      ]
    },
    {
      title: 'Analytics',
      links: [
        { to: '/reports', icon: BarChart2, label: 'Financial Ledger' }
      ]
    }
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
        {/* Scrollbar Custom Style */}
        <style dangerouslySetInnerHTML={{__html: `
          .sidebar-scroll::-webkit-scrollbar {
            width: 4px;
          }
          .sidebar-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.25);
          }
        `}} />

        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Activity color="var(--teal-300)" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0 }}>PharmaStock</h1>
        </div>

        <nav className="sidebar-scroll" style={{ flex: 1, padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          {groups.map((group) => (
            <div key={group.title} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: '700', 
                textTransform: 'uppercase', 
                letterSpacing: '0.08em', 
                color: 'rgba(255, 255, 255, 0.3)', 
                padding: '0 24px', 
                marginBottom: '6px'
              }}>
                {group.title}
              </span>
              {group.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 24px', textDecoration: 'none',
                    color: isActive ? 'var(--teal-100)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
                    borderLeft: isActive ? '4px solid var(--teal-500)' : '4px solid transparent',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? '600' : '400',
                    transition: 'all 0.15s ease'
                  })}
                >
                  <link.icon size={18} />
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {role === 'admin' && (
            <>
              <button onClick={() => navigate('/users')} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', padding: '12px 0' }}>
                <Users size={20} /> Users
              </button>
              <button onClick={() => navigate('/settings')} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', padding: '12px 0' }}>
                <Settings size={20} /> Settings
              </button>
            </>
          )}
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--status-red)', padding: '12px 0' }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>
    </>
  );
}
