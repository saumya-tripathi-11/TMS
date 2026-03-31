import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { api } from '../../lib/api';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const data = await api.post('/auth/register', formData);
    if (data.success) {
      localStorage.setItem('token', data.token);
      navigate('/');
    } else {
      setError(data.message || 'Registration failed');
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', boxSizing: 'border-box',
    border: '1.5px solid #e2e8f0', borderRadius: '10px',
    fontSize: '14px', color: '#0f172a', background: '#fff', outline: 'none', fontFamily: 'inherit',
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', sans-serif", background: '#f8fafc' }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12"
        style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', border: '1px solid rgba(99,179,237,0.15)' }} />
        <div style={{ position: 'absolute', bottom: '100px', left: '-60px', width: '250px', height: '250px', borderRadius: '50%', border: '1px solid rgba(99,179,237,0.12)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 14px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#63b3ed' }} />
            <span style={{ color: '#93c5fd', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em' }}>TASK MANAGER</span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px' }}>
            Start your journey<br />to <span style={{ color: '#63b3ed' }}>peak</span> productivity.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: 1.7 }}>
            Create your free account and take full control of your tasks, priorities, and deadlines.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#63b3ed,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>✓</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>Free forever</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>No credit card required</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ marginBottom: '36px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px', letterSpacing: '-0.02em' }}>Create Account</h1>
            <p style={{ color: '#64748b', fontSize: '15px' }}>Register for Task Manager</p>
          </div>

          {error && (
            <div style={{ marginBottom: '20px', padding: '12px 16px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', color: '#be123c', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Full Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="John Doe" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Email address</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="john@example.com" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Password</label>
              <input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="minimum 6 characters" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              <p style={{ marginTop: '6px', fontSize: '12px', color: '#94a3b8' }}>Must be at least 6 characters</p>
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px', background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.35)', marginTop: '4px', fontFamily: 'inherit' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ marginTop: '28px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};