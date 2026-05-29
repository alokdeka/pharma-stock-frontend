import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getUsers, createUser, updateUser, deleteUser, getUserActivity } from '../../api/users';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatDate } from '../../utils/formatDate';
import { useNotification } from '../../context/NotificationContext';
import { 
  Users, 
  Activity, 
  UserPlus, 
  ShieldAlert, 
  CheckCircle, 
  Ban, 
  Search, 
  Database, 
  Key, 
  AlertTriangle, 
  ShoppingCart, 
  Pill, 
  Edit2, 
  Trash2 
} from 'lucide-react';

export default function UserManagement() {
  const { showToast } = useNotification();
  const { role, user: loggedInUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Role Gate: strictly redirect if not admin
  useEffect(() => {
    if (role && role !== 'admin') {
      navigate('/');
    }
  }, [role, navigate]);

  const [activeTab, setActiveTab] = useState('directory');
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search state for logs
  const [searchLogQuery, setSearchLogQuery] = useState('');

  // User Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'manager', password: '', status: 'active' });

  // Dialog States
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, email: '' });
  const [suspendModal, setSuspendModal] = useState({ isOpen: false, id: null, name: '', currentStatus: 'active' });

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'directory') {
        const res = await getUsers();
        setUsers(res.data.data || []);
      } else {
        const res = await getUserActivity();
        setActivities(res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin') {
      loadData();
    }
  }, [activeTab, role]);

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateUser(editingId, userForm);
        showToast('Operator profile updated successfully', 'success');
      } else {
        await createUser(userForm);
        showToast('New operator registered successfully', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving user', 'error');
    }
  };

  const handleOpenEdit = (user) => {
    setEditingId(user.id);
    setUserForm({ name: user.name, email: user.email, role: user.role, password: '', status: user.status || 'active' });
    setModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setUserForm({ name: '', email: '', role: 'manager', password: '', status: 'active' });
    setModalOpen(true);
  };

  const handleOpenDelete = (user) => {
    setDeleteModal({ isOpen: true, id: user.id, email: user.email });
  };

  const confirmUserDelete = async () => {
    try {
      await deleteUser(deleteModal.id);
      setDeleteModal({ isOpen: false, id: null, email: '' });
      showToast('Operator account deleted successfully', 'success');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Cannot delete user', 'error');
    }
  };

  const handleOpenSuspendToggle = (user) => {
    setSuspendModal({ 
      isOpen: true, 
      id: user.id, 
      name: user.name, 
      currentStatus: user.status || 'active' 
    });
  };

  const confirmSuspendToggle = async () => {
    try {
      const nextStatus = suspendModal.currentStatus === 'active' ? 'suspended' : 'active';
      // We pass the updated status state
      await updateUser(suspendModal.id, { status: nextStatus });
      setSuspendModal({ isOpen: false, id: null, name: '', currentStatus: 'active' });
      showToast(`Operator account ${nextStatus === 'suspended' ? 'suspended' : 'activated'} successfully`, 'success');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to toggle account status', 'error');
    }
  };

  // Helper function to return visual representation for different log types
  const getLogIcon = (action) => {
    const act = action.toLowerCase();
    if (act.includes('login') || act.includes('logout') || act.includes('password')) {
      return { icon: Key, color: '#3b82f6', bg: '#eff6ff' }; // Blue
    }
    if (act.includes('spoilage')) {
      return { icon: AlertTriangle, color: '#ef4444', bg: '#fef2f2' }; // Red
    }
    if (act.includes('sale') || act.includes('sell')) {
      return { icon: ShoppingCart, color: '#14b8a6', bg: '#f0fdfa' }; // Teal
    }
    if (act.includes('batch')) {
      return { icon: Pill, color: '#f59e0b', bg: '#fffbeb' }; // Yellow
    }
    if (act.includes('purchase order') || act.includes('po ')) {
      return { icon: Database, color: '#a855f7', bg: '#faf5ff' }; // Purple
    }
    return { icon: Activity, color: '#6b7280', bg: '#f3f4f6' }; // Gray
  };

  // Filter logs based on search query
  const filteredActivities = activities.filter(act => {
    const query = searchLogQuery.toLowerCase();
    return (
      act.action?.toLowerCase().includes(query) ||
      act.user_name?.toLowerCase().includes(query) ||
      act.user_email?.toLowerCase().includes(query) ||
      act.ip_address?.toLowerCase().includes(query) ||
      (act.details && act.details.toLowerCase().includes(query))
    );
  });

  const userCols = [
    { key: 'name', label: 'Name', render: (val, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--teal-100)', 
          color: 'var(--teal-700)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '0.9rem'
        }}>
          {val.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          {loggedInUser && loggedInUser.id === row.id && (
            <span style={{ fontSize: '0.7rem', color: 'var(--teal-700)', backgroundColor: 'var(--teal-100)', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>You</span>
          )}
        </div>
      </div>
    )},
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'System Role', render: (val) => (
      <Badge 
        status={val === 'admin' ? 'red' : val === 'manager' ? 'yellow' : 'green'} 
        label={val.toUpperCase()} 
      />
    )},
    { key: 'status', label: 'Account Status', render: (val) => {
      const isSuspended = val === 'suspended';
      return (
        <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '4px',
          padding: '4px 10px', 
          borderRadius: '20px', 
          fontSize: '0.75rem', 
          fontWeight: 600,
          backgroundColor: isSuspended ? '#fee2e2' : '#dcfce7',
          color: isSuspended ? '#ef4444' : '#15803d'
        }}>
          {isSuspended ? <Ban size={12} /> : <CheckCircle size={12} />}
          {isSuspended ? 'Suspended' : 'Active'}
        </span>
      );
    }},
    { key: 'created_at', label: 'Creation Date', render: val => formatDate(val) },
    { key: 'actions', label: 'Controls', render: (_, row) => (
      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          onClick={() => handleOpenEdit(row)} 
          style={{ 
            color: 'var(--teal-700)', 
            backgroundColor: 'transparent', 
            border: 'none', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.8rem',
            padding: 0
          }}
        >
          <Edit2 size={14} /> Edit
        </button>

        {loggedInUser && loggedInUser.id !== row.id && (
          <>
            <button 
              onClick={() => handleOpenSuspendToggle(row)} 
              style={{ 
                color: row.status === 'suspended' ? '#15803d' : '#ef4444', 
                backgroundColor: 'transparent', 
                border: 'none', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem',
                padding: 0
              }}
            >
              {row.status === 'suspended' ? (
                <><CheckCircle size={14} /> Activate</>
              ) : (
                <><Ban size={14} /> Suspend</>
              )}
            </button>

            <button 
              onClick={() => handleOpenDelete(row)} 
              style={{ 
                color: 'var(--status-red)', 
                backgroundColor: 'transparent', 
                border: 'none', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem',
                padding: 0
              }}
            >
              <Trash2 size={14} /> Delete
            </button>
          </>
        )}
      </div>
    )}
  ];

  if (role !== 'admin') return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={28} color="var(--teal-700)" /> Administration Center
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Oversee corporate access directory controls and active warehouse transaction logs.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', padding: '16px 24px' }}>
        {[ 
          { id: 'directory', label: '👥 User Directory', desc: 'Manage access records' }, 
          { id: 'logs', label: '📊 WMS Activity Monitor', desc: 'Real-time audit timelines' } 
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveTab(t.id)} 
            style={{ 
              padding: '8px 16px', 
              fontWeight: 600, 
              color: activeTab === t.id ? 'var(--teal-700)' : 'var(--text-secondary)', 
              borderBottom: activeTab === t.id ? '2px solid var(--teal-700)' : 'none',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '2px'
            }}
          >
            <span>{t.label}</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>{t.desc}</span>
          </button>
        ))}
      </div>

      {/* Main Section */}
      <div className="card" style={{ padding: '24px' }}>
        
        {/* User Directory Tab */}
        {activeTab === 'directory' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '1.3rem' }}>Registered Operators</h2>
              <button 
                onClick={handleOpenAdd} 
                style={{ 
                  backgroundColor: 'var(--teal-500)', 
                  color: '#fff', 
                  padding: '10px 18px', 
                  borderRadius: '6px', 
                  border: 'none', 
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(20,184,166,0.2)'
                }}
              >
                <UserPlus size={16} /> Add WMS Operator
              </button>
            </div>
            
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Syncing operators list...</div>
            ) : (
              <DataTable columns={userCols} data={users} />
            )}
          </div>
        )}

        {/* Activity logs Tab */}
        {activeTab === 'logs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '1.3rem' }}>WMS Activity Monitor</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>Security logging trails of active operational parameters.</p>
              </div>
              
              {/* Search Bar */}
              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  value={searchLogQuery}
                  onChange={e => setSearchLogQuery(e.target.value)}
                  placeholder="Filter logs by action, email, user..." 
                  style={{ 
                    padding: '10px 12px 10px 36px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border)',
                    width: '100%',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Re-indexing log matrices...</div>
            ) : filteredActivities.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                <Activity size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <div>No activity logs found matching filter constraints.</div>
              </div>
            ) : (
              // Chronological timeline view
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative', paddingLeft: '16px' }}>
                {/* Timeline line */}
                <div style={{ 
                  position: 'absolute', 
                  left: '28px', 
                  top: '16px', 
                  bottom: '16px', 
                  width: '2px', 
                  backgroundColor: 'var(--border)' 
                }}/>
                
                {filteredActivities.map((act) => {
                  const styleProps = getLogIcon(act.action);
                  return (
                    <div key={act.id} style={{ 
                      display: 'flex', 
                      gap: '16px', 
                      paddingBottom: '20px', 
                      position: 'relative',
                      alignItems: 'flex-start'
                    }}>
                      {/* Timeline dot/icon */}
                      <div style={{ 
                        width: '26px', 
                        height: '26px', 
                        borderRadius: '50%', 
                        backgroundColor: styleProps.bg, 
                        border: `1.5px solid ${styleProps.color}`, 
                        color: styleProps.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        flexShrink: 0
                      }}>
                        <styleProps.icon size={13} />
                      </div>
                      
                      {/* Timeline content */}
                      <div style={{ 
                        flex: 1, 
                        backgroundColor: '#fff', 
                        border: '1px solid var(--border)', 
                        borderRadius: '8px', 
                        padding: '12px 16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>
                            {act.action}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {formatDate(act.created_at)}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <span>
                            Operator: <strong style={{ color: '#475569' }}>{act.user_name || 'System / Guest'}</strong> {act.user_email && `(${act.user_email})`}
                          </span>
                          <span>•</span>
                          <span>
                            IP Address: <code style={{ backgroundColor: '#f1f5f9', padding: '2px 4px', borderRadius: '4px', fontSize: '0.75rem' }}>{act.ip_address}</code>
                          </span>
                        </div>

                        {act.details && (
                          <div style={{ 
                            marginTop: '8px', 
                            padding: '8px 12px', 
                            backgroundColor: '#f8fafc', 
                            borderLeft: `3px solid ${styleProps.color}`, 
                            borderRadius: '0 4px 4px 0',
                            fontSize: '0.8rem',
                            color: '#475569',
                            fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all'
                          }}>
                            {act.details}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Operator Add / Edit Modal */}
      <Modal 
        title={editingId ? 'Edit Operator Credentials' : 'Create WMS Operator Account'} 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Full Name</label>
            <input 
              required 
              type="text"
              value={userForm.name} 
              onChange={e => setUserForm({ ...userForm, name: e.target.value })} 
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Email Address</label>
            <input 
              required 
              type="email" 
              value={userForm.email} 
              onChange={e => setUserForm({ ...userForm, email: e.target.value })} 
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>System Authorization Role</label>
            <select 
              required 
              value={userForm.role} 
              onChange={e => setUserForm({ ...userForm, role: e.target.value })}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
            >
              <option value="admin">Admin (Global master rights)</option>
              <option value="manager">Manager (Standard operations)</option>
              <option value="distributor">Distributor (Read-only auditor)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>{editingId ? 'Overriding Password (leave blank to keep current)' : 'Account Password'}</label>
            <input 
              type="password" 
              required={!editingId} 
              value={userForm.password} 
              onChange={e => setUserForm({ ...userForm, password: e.target.value })} 
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
            />
          </div>

          <button 
            type="submit" 
            style={{ 
              backgroundColor: 'var(--teal-500)', 
              color: '#fff', 
              padding: '12px', 
              borderRadius: '6px', 
              marginTop: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem'
            }}
          >
            {editingId ? 'Update Operator' : 'Register Operator'}
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, id: null, email: '' })} 
        onConfirm={confirmUserDelete} 
        title="Permanently Delete Operator Account"
        message={`Are you absolutely sure you want to permanently delete the account of ${deleteModal.email}? All active login credentials and web-tokens for this user will evaporate immediately. This action is irreversible.`} 
        confirmText="Confirm Delete Operator" 
      />

      {/* Suspend Confirmation */}
      <ConfirmDialog 
        isOpen={suspendModal.isOpen} 
        onClose={() => setSuspendModal({ isOpen: false, id: null, name: '', currentStatus: 'active' })} 
        onConfirm={confirmSuspendToggle} 
        title={suspendModal.currentStatus === 'suspended' ? 'Re-Activate Operator Account' : 'Suspend Operator Account'}
        message={
          suspendModal.currentStatus === 'suspended' 
            ? `Are you sure you want to re-activate the account of ${suspendModal.name}? This will instantly restore full access rights matching their assigned role.` 
            : `Are you sure you want to suspend the account of ${suspendModal.name}? They will be completely blocked from logging into the PharmaStock WMS portal immediately.`
        } 
        confirmText={suspendModal.currentStatus === 'suspended' ? 'Yes, Reactivate Access' : 'Yes, Suspend Account'} 
      />

    </div>
  );
}
