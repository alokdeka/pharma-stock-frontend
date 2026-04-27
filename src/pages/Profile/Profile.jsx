import React, { useState, useEffect } from 'react';
import { getMyProfile, updateMyProfile, updateMyPassword } from '../../api/users';
import Loader from '../../components/ui/Loader';

export default function Profile() {
  const [profile, setProfile] = useState({ name: '', email: '', role: '' });
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProfile().then(res => {
      if (res.data.data) setProfile(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMyProfile({ name: profile.name, email: profile.email });
      alert('Profile updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm) return alert('Passwords do not match');
    try {
      await updateMyPassword({ old_password: passwords.old_password, new_password: passwords.new_password });
      setPasswords({ old_password: '', new_password: '', confirm: '' });
      alert('Password updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Incorrect old password');
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '24px' }}>
      <div className="card">
        <h3 style={{ marginBottom: '24px', fontFamily: 'var(--font-display)' }}>Personal Information</h3>
        <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Name</label>
            <input required value={profile?.name || ''} onChange={e => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Email Address</label>
            <input required type="email" value={profile?.email || ''} onChange={e => setProfile({ ...profile, email: e.target.value })} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Role</label>
            <input readOnly value={(profile?.role || '').toUpperCase()} style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }} />
          </div>
          <button type="submit" style={{ backgroundColor: 'var(--teal-500)', color: '#fff', padding: '10px', borderRadius: '6px', alignSelf: 'flex-start', marginTop: '8px' }}>Save Changes</button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '24px', fontFamily: 'var(--font-display)' }}>Security & Password</h3>
        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Current Password</label>
            <input required type="password" value={passwords.old_password} onChange={e => setPasswords({ ...passwords, old_password: e.target.value })} />
          </div>
          <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '8px 0' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>New Password</label>
            <input required type="password" value={passwords.new_password} onChange={e => setPasswords({ ...passwords, new_password: e.target.value })} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Confirm New Password</label>
            <input required type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} />
          </div>
          <button type="submit" style={{ backgroundColor: 'var(--teal-900)', color: '#fff', padding: '10px', borderRadius: '6px', alignSelf: 'flex-start', marginTop: '8px' }}>Update Password</button>
        </form>
      </div>
    </div>
  );
}
