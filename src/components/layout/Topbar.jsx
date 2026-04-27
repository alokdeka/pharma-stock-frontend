import React, { useContext, useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, User, Menu, AlertCircle, Info, CheckCircle, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { getSmartNotifications, markNotificationRead } from '../../api/notifications';

const routeNames = {
  '/': 'Dashboard',
  '/medicines': 'Medicines',
  '/batches': 'Batches',
  '/expiry': 'Expiry Monitor',
  '/orders': 'Purchase Orders',
  '/reports': 'Reports',
  '/suppliers': 'Suppliers'
};

export default function Topbar({ toggleMenu }) {
  const { role, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [alerts, setAlerts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);

  const path = '/' + location.pathname.split('/')[1];
  const title = routeNames[path] || 'PharmaStock';

  const fetchNotifs = () => {
    getSmartNotifications().then(res => {
      if (res.data?.data) setAlerts(res.data.data);
    }).catch(() => {});
  };

  useEffect(() => {
    fetchNotifs();
    // Poll every 30s to keep smart alerts fresh
    const interval = setInterval(fetchNotifs, 30000); 
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markNotificationRead(id);
      fetchNotifs();
    } catch(err) {}
  };

  const getIcon = (type) => {
    if (type === 'error') return <AlertCircle size={16} color="var(--status-red)" />;
    if (type === 'warning') return <AlertCircle size={16} color="#d97706" />;
    if (type === 'success') return <CheckCircle size={16} color="var(--status-green)" />;
    return <Info size={16} color="var(--teal-500)" />;
  };

  return (
    <div style={{ height: '60px', backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="mobile-menu-btn" onClick={toggleMenu}><Menu size={24} color="var(--text-primary)" /></button>
        <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>{title}</h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button onClick={() => setShowDropdown(!showDropdown)} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Bell size={20} color="var(--text-secondary)" />
            {alerts.length > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: 'var(--status-red)', color: '#fff', fontSize: '10px', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>{alerts.length}</span>}
          </button>

          {showDropdown && (
            <div style={{ position: 'absolute', top: '40px', right: '-12px', width: '350px', backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontFamily: 'var(--font-display)' }}>Notifications</div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {alerts.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>All caught up!</div>
                ) : (
                  alerts.map(a => (
                    <div key={a.id} style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '12px', alignItems: 'flex-start', backgroundColor: a.is_smart ? '#fef2f2' : '#fff' }}>
                      <div style={{ paddingTop: '2px' }}>{getIcon(a.type)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                          {a.title}
                          {a.is_smart && <span style={{ fontSize: '0.7rem', color: '#b91c1c', backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: '12px' }}>Urgent</span>}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{a.message}</div>
                      </div>
                      {!a.is_smart && (
                        <button onClick={(e) => handleMarkRead(a.id, e)} style={{ padding: '4px', color: 'var(--text-secondary)' }}>
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }} ref={profileDropdownRef}>
          <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--teal-100)', color: 'var(--teal-700)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={16} />
            </div>
            <span style={{ textTransform: 'capitalize' }}>{role} ▾</span>
          </button>
          
          {showProfileDropdown && (
            <div style={{ position: 'absolute', top: '48px', right: '0', width: '200px', backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 100, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <button 
                onClick={() => { setShowProfileDropdown(false); navigate('/profile'); }}
                style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 500, color: 'var(--text-primary)', width: '100%', transition: 'background-color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-base)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                My Profile
              </button>
              <button 
                onClick={handleLogout}
                style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--status-red)', width: '100%', transition: 'background-color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
