import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { ArrowLeft, Save } from 'lucide-react';
import { api } from '../../lib/api';

export const AddTaskForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '', description: '', category: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    dueDate: '', status: 'pending' as 'pending' | 'completed',
  });

  useEffect(() => {
    if (!isEditing) return;
    api.get(`/tasks/${id}`).then(data => {
      if (data.success) {
        const t = data.task;
        setFormData({ title: t.title || '', description: t.description || '', category: t.category || '', priority: t.priority || 'Medium', dueDate: t.dueDate ? t.dueDate.split('T')[0] : '', status: t.status || 'pending' });
      }
      setFetching(false);
    });
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = isEditing ? await api.put(`/tasks/${id}`, formData) : await api.post('/tasks', formData);
      if (data.success) navigate('/');
      else setError(data.message || 'Something went wrong');
    } catch { setError('Something went wrong'); }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '11px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: '10px',
    fontSize: '14px', color: '#0f172a', background: '#fff', outline: 'none', fontFamily: 'inherit',
  };

  if (fetching) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <p style={{ color: '#64748b' }}>Loading task...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', textDecoration: 'none' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{isEditing ? 'Edit Task' : 'Add New Task'}</h1>
            <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '13px' }}>{isEditing ? 'Update your task details' : 'Create a new task'}</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '36px', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
          {error && (
            <div style={{ marginBottom: '24px', padding: '12px 16px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', color: '#be123c', fontSize: '14px' }}>⚠ {error}</div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '7px' }}>Task Title <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="Enter task title" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '7px' }}>Description <span style={{ color: '#ef4444' }}>*</span></label>
              <textarea name="description" required value={formData.description} onChange={handleChange} placeholder="Enter description" rows={5}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '7px' }}>Category</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Design, Development" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '7px' }}>Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}>
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '7px' }}>Due Date</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '7px' }}>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}>
                <option value="pending">Pending</option><option value="completed">Completed</option>
              </select>
            </div>
            <div style={{ borderTop: '1px solid #f1f5f9' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" disabled={loading}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px', background: loading ? '#93c5fd' : 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)', fontFamily: 'inherit' }}>
                <Save size={16} />{loading ? 'Saving...' : isEditing ? 'Update Task' : 'Submit Task'}
              </button>
              <Link to="/" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '13px', background: '#f8fafc', color: '#475569', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', fontWeight: 600, textDecoration: 'none' }}>
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};