import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { forgotPassword, resetPassword } from '../api/auth';
import { Activity, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [view, setView] = useState('login'); // 'login', 'forgot', 'reset'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  
  // Visibility States
  const [showP1, setShowP1] = useState(false);
  const [showP2, setShowP2] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
      setView('reset');
    }
  }, [location]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setSuccess(res.data.message || 'Reset link dispatched.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    clearMessages();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    
    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      setSuccess(res.data.message || 'Password successfully reset! You can now log in.');
      setTimeout(() => {
        navigate('/login');
        setView('login');
        setPassword('');
        setConfirmPassword('');
        setToken('');
        setShowP1(false);
        setShowP2(false);
        clearMessages();
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ flex: 1, backgroundColor: 'var(--teal-900)', color: '#fff', display: 'flex', flexDirection: 'column', padding: '40px', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        
        {/* Aesthetic background blobs */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', backgroundColor: 'var(--teal-700)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.5, zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '300px', height: '300px', backgroundColor: 'var(--teal-500)', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.3, zIndex: 0 }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <Activity size={48} color="var(--teal-300)" />
            <h1 style={{ margin: 0, fontSize: '3.5rem', fontFamily: 'var(--font-display)', letterSpacing: '-1px' }}>PharmaStock</h1>
          </div>
          <p style={{ color: 'var(--teal-100)', fontSize: '1.2rem', maxWidth: '450px', lineHeight: '1.6' }}>
            Clinical Warehouse Management System. Data-forward pharmaceutical dashboard with intelligent analytics.
          </p>
        </div>
      </div>

      <div style={{ flex: 1, backgroundColor: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px 32px' }}>
          
          {/* LOGIN VIEW */}
          {view === 'login' && (
            <>
              <h2 style={{ marginBottom: '8px', fontSize: '1.75rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Welcome Back</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>Sign in to continue to PharmaStock.</p>
              
              {error && <div style={{ color: 'var(--status-red)', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
              {success && <div style={{ color: 'var(--status-green)', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>{success}</div>}
              
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="manager@pharma.com" style={{ padding: '12px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Password</label>
                    <button type="button" onClick={() => { setView('forgot'); clearMessages(); }} style={{ fontSize: '0.85rem', color: 'var(--teal-600)', fontWeight: 500, padding: 0 }}>Forgot password?</button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input type={showP1 ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ padding: '12px', width: '100%' }} />
                    <button type="button" onClick={() => setShowP1(!showP1)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                      {showP1 ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} style={{ backgroundColor: 'var(--teal-500)', color: '#fff', padding: '14px', borderRadius: '6px', fontWeight: 600, marginTop: '8px', opacity: loading ? 0.7 : 1, transition: 'background-color 0.2s' }}>
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>
            </>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {view === 'forgot' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '24px', cursor: 'pointer' }} onClick={() => { setView('login'); clearMessages(); }}>
                <ArrowLeft size={16} />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Back to login</span>
              </div>
              <h2 style={{ marginBottom: '8px', fontSize: '1.75rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Reset Password</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>Enter your email address and we'll send you a recovery link.</p>
              
              {error && <div style={{ color: 'var(--status-red)', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
              {success && <div style={{ color: 'var(--status-green)', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>{success}</div>}
              
              <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="manager@pharma.com" style={{ padding: '12px' }} />
                </div>
                <button type="submit" disabled={loading} style={{ backgroundColor: 'var(--text-primary)', color: '#fff', padding: '14px', borderRadius: '6px', fontWeight: 600, marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Sending...' : 'Send Recovery Link'}
                </button>
              </form>
            </>
          )}

          {/* SET NEW PASSWORD VIEW */}
          {view === 'reset' && (
            <>
              <h2 style={{ marginBottom: '8px', fontSize: '1.75rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Set New Password</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>Please enter your new security credentials below.</p>
              
              {error && <div style={{ color: 'var(--status-red)', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
              {success && <div style={{ color: 'var(--status-green)', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>{success}</div>}
              
              <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showP1 ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ padding: '12px', width: '100%' }} minLength={6} />
                    <button type="button" onClick={() => setShowP1(!showP1)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                      {showP1 ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showP2 ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="••••••••" style={{ padding: '12px', width: '100%' }} minLength={6} />
                    <button type="button" onClick={() => setShowP2(!showP2)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                      {showP2 ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading || !!success} style={{ backgroundColor: 'var(--teal-500)', color: '#fff', padding: '14px', borderRadius: '6px', fontWeight: 600, marginTop: '8px', opacity: (loading || !!success) ? 0.7 : 1 }}>
                  {loading ? 'Updating...' : 'Secure My Account'}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
