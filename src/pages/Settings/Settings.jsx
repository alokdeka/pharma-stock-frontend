import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/users';
import { getSettings, updateSettings, backupDatabase, restoreDatabase } from '../../api/settings';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatDate } from '../../utils/formatDate';
import { DownloadCloud, UploadCloud, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [appSettings, setAppSettings] = useState({ timezone: 'UTC', admin_email: '', email_alerts_enabled: 'true' });
  const [loading, setLoading] = useState(false);

  // Restore State
  const [restoreFile, setRestoreFile] = useState(null);

  // User Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'manager', password: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await getUsers();
        setUsers(res.data.data);
      } else {
        const res = await getSettings();
        setAppSettings(prev => ({ ...prev, ...res.data.data }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [activeTab]);

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateUser(editingId, userForm);
      } else {
        await createUser(userForm);
      }
      setModalOpen(false);
      loadData();
    } catch (err) { alert(err.response?.data?.message || 'Error saving user'); }
  };

  const handleUserDelete = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmUserDelete = async () => {
    try {
      await deleteUser(deleteModal.id);
      loadData();
    } catch (err) { alert(err.response?.data?.message || 'Cannot delete user'); }
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingId(user.id);
      setUserForm({ name: user.name, email: user.email, role: user.role, password: '' });
    } else {
      setEditingId(null);
      setUserForm({ name: '', email: '', role: 'manager', password: '' });
    }
    setModalOpen(true);
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(appSettings);
      alert('Application settings updated!');
    } catch (err) { alert('Error updating settings'); }
  };

  const handleBackup = async () => {
    try {
      const res = await backupDatabase();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pharmastock_backup_${new Date().getTime()}.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch(err) { alert('Database Backup Failed.'); }
  };

  const handleRestore = (e) => {
    e.preventDefault();
    if (!restoreFile) return alert('Please select a SQL file first.');
    setRestoreModalOpen(true);
  };

  const confirmRestore = async () => {
    try {
      const fd = new FormData();
      fd.append('backup_file', restoreFile);
      await restoreDatabase(fd);
      alert('Database Core restored. Please re-login.');
      window.location.reload();
    } catch(err) {
      alert(err.response?.data?.message || 'Restore Failed.');
    }
  };

  const userCols = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (val) => <Badge status={val === 'admin' ? 'red' : val === 'manager' ? 'yellow' : 'green'} label={val.toUpperCase()} /> },
    { key: 'created_at', label: 'Joined', render: val => formatDate(val) },
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => openModal(row)} style={{ color: 'var(--teal-500)', fontSize: '0.8rem' }}>Edit</button>
        <button onClick={() => handleUserDelete(row.id)} style={{ color: 'var(--status-red)', fontSize: '0.8rem' }}>Delete</button>
      </div>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card" style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)' }}>
        {[ { id: 'users', label: 'User Management' }, { id: 'preferences', label: 'Global Preferences' }, { id: 'database', label: 'Database Operations' } ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '8px 16px', fontWeight: 600, color: activeTab === t.id ? 'var(--teal-500)' : 'var(--text-secondary)', borderBottom: activeTab === t.id ? '2px solid var(--teal-500)' : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>System Users</h2>
              <button onClick={() => openModal()} style={{ backgroundColor: 'var(--teal-500)', color: '#fff', padding: '8px 16px', borderRadius: '6px' }}>+ Add User</button>
            </div>
            <DataTable columns={userCols} data={users} />
          </div>
        )}

        {activeTab === 'preferences' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Global Settings</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Update system-wide metrics and triggers.</p>
            
            <form onSubmit={handleSettingsSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '500px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 600 }}>Warehouse Timezone</label>
                <select value={appSettings.timezone || 'UTC'} onChange={e => setAppSettings({ ...appSettings, timezone: e.target.value })} style={{ padding: '10px' }}>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="Asia/Singapore">Asia/Singapore</option>
                </select>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Affects reporting timestamp clusters strictly.</span>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ margin: 0 }}>Email Automations</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="checkbox" checked={appSettings.email_alerts_enabled === 'true'} onChange={e => setAppSettings({ ...appSettings, email_alerts_enabled: e.target.checked ? 'true' : 'false' })} />
                  <label>Enable Low Stock & Spoilage Email Triggers</label>
                </div>
                
                {appSettings.email_alerts_enabled === 'true' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>Admin Alert Receiver Email</label>
                    <input type="email" value={appSettings.admin_email || ''} onChange={e => setAppSettings({ ...appSettings, admin_email: e.target.value })} placeholder="admin@pharmastock.local" style={{ padding: '10px' }} />
                  </div>
                )}
              </div>

              <button type="submit" style={{ backgroundColor: 'var(--teal-500)', color: '#fff', padding: '12px', borderRadius: '6px', marginTop: '8px', fontSize: '1rem', fontWeight: 600 }}>Save Preferences</button>
            </form>
          </div>
        )}

        {activeTab === 'database' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Core Database Serialization</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Execute native dump commands or override the backend forcefully via SQL ingestion.</p>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '300px', padding: '24px', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <DownloadCloud size={24} color="var(--teal-600)" />
                  <h3 style={{ margin: 0 }}>Snapshot Routine</h3>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>Serialize your actual tables safely onto your local disk avoiding terminal ssh commands.</p>
                <button onClick={handleBackup} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff', border: '1px solid var(--teal-500)', color: 'var(--teal-600)', padding: '10px 16px', borderRadius: '6px', fontWeight: 600 }}>
                  Execute SQL Dump
                </button>
              </div>

              <div style={{ flex: 1, minWidth: '300px', padding: '24px', border: '1px solid #fee2e2', borderRadius: '8px', backgroundColor: '#fef2f2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <AlertTriangle size={24} color="#dc2626" />
                  <h3 style={{ margin: 0, color: '#991b1b' }}>Danger: Ingestion Restore</h3>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#991b1b', marginBottom: '24px' }}>Overrides the running database! All un-backed-up data currently existing will be violently wiped to match the uploaded payload.</p>
                
                <form onSubmit={handleRestore} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input type="file" accept=".sql" onChange={e => setRestoreFile(e.target.files[0])} style={{ padding: '8px', border: '1px dashed #f87171', backgroundColor: '#fff' }} />
                  <button type="submit" disabled={!restoreFile} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#dc2626', border: 'none', color: '#fff', padding: '10px 16px', borderRadius: '6px', fontWeight: 600, opacity: !restoreFile ? 0.5 : 1 }}>
                    <UploadCloud size={18} /> Restore Pipeline Override
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      <Modal title={editingId ? 'Edit User' : 'Create User'} isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Name</label>
            <input required value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Email</label>
            <input required type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Role</label>
            <select required value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="distributor">Distributor</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>{editingId ? 'New Password (leave blank to keep current)' : 'Password'}</label>
            <input type="password" required={!editingId} value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} />
          </div>
          <button type="submit" style={{ backgroundColor: 'var(--teal-500)', color: '#fff', padding: '10px', borderRadius: '6px', marginTop: '8px' }}>Save User</button>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, id: null })} 
        onConfirm={confirmUserDelete} 
        title="Delete User"
        message="Are you sure you want to permanently delete this user account? Their native session will be destroyed immediately." 
        confirmText="Delete Account" 
      />

      <ConfirmDialog 
        isOpen={restoreModalOpen} 
        onClose={() => setRestoreModalOpen(false)} 
        onConfirm={confirmRestore} 
        title="DANGER: Database Ingestion"
        message="Restoring a database COMPLETELY DELETES all active records and reinstates the backup. Any sales, records, or orders made since this backup was generated will be violently wiped. Are you absolutely sure you wish to proceed?" 
        confirmText="Yes, Rewrite Database" 
      />
    </div>
  );
}
