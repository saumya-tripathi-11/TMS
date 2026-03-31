import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Plus, Edit, Trash2, LogOut, Search, Moon, Sun, CheckCircle, Download, BarChart2, X } from 'lucide-react';
import { api } from '../../lib/api';
import { TaskAnalytics } from './TaskAnalytics';
import { CountdownTimer } from './CountdownTimer';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  category?: string;
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  createdAt: string;
}

export const TaskDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [darkMode, setDarkMode] = useState(false);
  const [completedId, setCompletedId] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const dm = darkMode;

  useEffect(() => {
    if (!localStorage.getItem('token')) { window.location.href = '/login'; return; }
    api.get('/tasks').then(data => {
      if (data.success) { setTasks(data.tasks); setStats(data.stats); }
      setLoading(false);
    });
  }, []);

  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); }, [darkMode]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    const task = tasks.find(t => t._id === id);
    const data = await api.delete(`/tasks/${id}`);
    if (data.success) {
      setTasks(tasks.filter(t => t._id !== id));
      setStats(prev => ({ total: prev.total - 1, pending: prev.pending - (task?.status === 'pending' ? 1 : 0), completed: prev.completed - (task?.status === 'completed' ? 1 : 0) }));
    }
  };

  const handleMarkComplete = async (id: string) => {
    setCompletedId(id);
    const data = await api.patch(`/tasks/${id}/complete`);
    if (data.success) {
      setTasks(tasks.map(t => t._id === id ? { ...t, status: 'completed' } : t));
      setStats(prev => ({ ...prev, pending: prev.pending - 1, completed: prev.completed + 1 }));
    }
    setTimeout(() => setCompletedId(null), 1500);
  };

  const handleLogout = () => { localStorage.removeItem('token'); window.location.href = '/login'; };

  const exportReport = () => {
    const content = tasks.map(t => `Title: ${t.title}\nStatus: ${t.status}\nPriority: ${t.priority || 'N/A'}\nCategory: ${t.category || 'N/A'}\nDue: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}\n`).join('\n---\n\n');
    const report = `TASK REPORT\n${'='.repeat(40)}\nGenerated: ${new Date().toLocaleString()}\nTotal: ${stats.total} | Pending: ${stats.pending} | Completed: ${stats.completed}\n${'='.repeat(40)}\n\n${content}`;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `tasks-${new Date().toISOString().split('T')[0]}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const isOverdue = (dueDate?: string) => dueDate ? new Date(dueDate) < new Date() : false;
  const progressPercent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const getPriorityConfig = (priority?: string) => {
    if (priority === 'High') return { bg: dm ? '#3f1112' : '#fff1f2', text: dm ? '#fca5a5' : '#be123c', border: dm ? '#7f1d1d' : '#fecdd3', dot: '#ef4444' };
    if (priority === 'Medium') return { bg: dm ? '#3f2e00' : '#fffbeb', text: dm ? '#fcd34d' : '#a16207', border: dm ? '#78350f' : '#fde68a', dot: '#f59e0b' };
    return { bg: dm ? '#0c1f3f' : '#eff6ff', text: dm ? '#93c5fd' : '#1e40af', border: dm ? '#1e3a8a' : '#bfdbfe', dot: '#3b82f6' };
  };

  const getStatusConfig = (status: string) =>
    status === 'completed'
      ? { bg: dm ? '#052e16' : '#f0fdf4', text: dm ? '#86efac' : '#15803d', border: dm ? '#14532d' : '#bbf7d0' }
      : { bg: dm ? '#3f2e00' : '#fffbeb', text: dm ? '#fcd34d' : '#a16207', border: dm ? '#78350f' : '#fde68a' };

  const filteredTasks = tasks
    .filter(task => {
      const matchSearch = task.title.toLowerCase().includes(search.toLowerCase()) || task.description.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchPriority = filterPriority === 'all' || task.priority === filterPriority;
      return matchSearch && matchStatus && matchPriority;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') { const order = { High: 0, Medium: 1, Low: 2 }; return (order[a.priority || 'Low'] ?? 2) - (order[b.priority || 'Low'] ?? 2); }
      if (sortBy === 'dueDate') { if (!a.dueDate) return 1; if (!b.dueDate) return -1; return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(); }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const bg = dm ? '#0f172a' : '#f8fafc';
  const surface = dm ? '#1e293b' : '#ffffff';
  const border = dm ? '#334155' : '#e2e8f0';
  const textPrimary = dm ? '#f1f5f9' : '#0f172a';
  const textSecondary = dm ? '#94a3b8' : '#64748b';
  const inputBg = dm ? '#0f172a' : '#fff';

  if (loading) return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${border}`, borderTopColor: '#3b82f6', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: textSecondary }}>Loading tasks...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: "'DM Sans', sans-serif", transition: 'background 0.3s' }}>
      {/* Header */}
      <div style={{ background: surface, borderBottom: `1px solid ${border}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: textPrimary, letterSpacing: '-0.02em' }}>Task Dashboard</h1>
            <p style={{ margin: 0, fontSize: '12px', color: textSecondary }}>Manage and track your tasks</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setDarkMode(!dm)} style={{ width: 38, height: 38, borderRadius: '10px', border: `1.5px solid ${border}`, background: surface, color: textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {dm ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={exportReport} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Download size={14} /> Export
            </button>
            <Link to="/add-task" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 3px 10px rgba(37,99,235,0.3)' }}>
              <Plus size={15} /> Add New Task
            </Link>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: surface, color: textSecondary, border: `1.5px solid ${border}`, borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 24px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
          {[
            { label: 'Total Tasks', value: stats.total, color: textPrimary, accent: '#3b82f6', icon: '📋' },
            { label: 'Pending', value: stats.pending, color: '#d97706', accent: '#f59e0b', icon: '⏳' },
            { label: 'Completed', value: stats.completed, color: '#16a34a', accent: '#22c55e', icon: '✅' },
          ].map((s, i) => (
            <div key={i} style={{ background: surface, border: `1px solid ${border}`, borderRadius: '14px', padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: s.accent, borderRadius: '14px 14px 0 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                  <p style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                </div>
                <span style={{ fontSize: '22px', opacity: 0.7 }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Progress */}
        {stats.total > 0 && (
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '14px', padding: '22px 24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontWeight: 700, fontSize: '15px', color: textPrimary }}>Overall Progress</span>
              <span style={{ fontSize: '13px', color: textSecondary }}>{stats.completed} of {stats.total} completed</span>
            </div>
            <div style={{ height: '10px', background: dm ? '#334155' : '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg,#3b82f6,#22c55e)', borderRadius: '99px', transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px' }}>
              <span style={{ color: textSecondary }}>0%</span>
              <span style={{ color: '#3b82f6', fontWeight: 700 }}>{progressPercent}% Complete</span>
              <span style={{ color: textSecondary }}>100%</span>
            </div>
            <div style={{ display: 'flex', gap: '20px', marginTop: '14px' }}>
              {[{ dot: '#f59e0b', label: `Pending: ${stats.pending}` }, { dot: '#22c55e', label: `Completed: ${stats.completed}` }, { dot: '#3b82f6', label: `Total: ${stats.total}` }].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.dot }} />
                  <span style={{ fontSize: '12px', color: textSecondary }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Toggle */}
        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => setShowAnalytics(!showAnalytics)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${showAnalytics ? '#3b82f6' : border}`, background: showAnalytics ? (dm ? '#1e3a5f' : '#eff6ff') : surface, color: showAnalytics ? '#3b82f6' : textSecondary, fontFamily: 'inherit' }}>
            <BarChart2 size={15} />{showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
        </div>
        {showAnalytics && <TaskAnalytics tasks={tasks} darkMode={dm} />}

        {/* Filters */}
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: '2 1 200px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: textSecondary }} />
              <input type="text" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px 10px 36px', border: `1.5px solid ${border}`, borderRadius: '10px', fontSize: '13px', color: textPrimary, background: inputBg, outline: 'none', fontFamily: 'inherit' }} />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: textSecondary, padding: 2 }}>
                  <X size={14} />
                </button>
              )}
            </div>
            {[
              { value: filterStatus, onChange: setFilterStatus, options: [['all', 'All Status'], ['pending', 'Pending'], ['completed', 'Completed']] },
              { value: filterPriority, onChange: setFilterPriority, options: [['all', 'All Priority'], ['High', 'High'], ['Medium', 'Medium'], ['Low', 'Low']] },
              { value: sortBy, onChange: setSortBy, options: [['createdAt', 'Sort: Newest'], ['priority', 'Sort: Priority'], ['dueDate', 'Sort: Due Date']] },
            ].map((sel, i) => (
              <select key={i} value={sel.value} onChange={e => sel.onChange(e.target.value)}
                style={{ flex: '1 1 130px', padding: '10px 12px', border: `1.5px solid ${border}`, borderRadius: '10px', fontSize: '13px', color: textPrimary, background: inputBg, outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                {sel.options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            ))}
          </div>
          {(search || filterStatus !== 'all' || filterPriority !== 'all') && (
            <p style={{ marginTop: '10px', fontSize: '12px', color: textSecondary }}>
              Showing <strong style={{ color: textPrimary }}>{filteredTasks.length}</strong> of {tasks.length} tasks
            </p>
          )}
        </div>

        {/* Task Cards */}
        {filteredTasks.length === 0 ? (
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '14px', padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
            <p style={{ color: textSecondary, fontSize: '15px', marginBottom: '20px' }}>No tasks found.</p>
            <Link to="/add-task" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', borderRadius: '10px', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
              <Plus size={15} /> Add New Task
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {filteredTasks.map(task => {
              const overdue = isOverdue(task.dueDate) && task.status !== 'completed';
              const pc = getPriorityConfig(task.priority);
              const sc = getStatusConfig(task.status);
              return (
                <div key={task._id} style={{ background: overdue ? (dm ? '#1c0a0a' : '#fff5f5') : surface, border: `1px solid ${overdue ? (dm ? '#7f1d1d' : '#fecdd3') : border}`, borderRadius: '14px', padding: '20px', transition: 'all 0.2s', position: 'relative', overflow: 'hidden', opacity: completedId === task._id ? 0.6 : 1, transform: completedId === task._id ? 'scale(0.97)' : 'scale(1)' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', background: pc.dot, borderRadius: '14px 0 0 14px' }} />
                  {overdue && (
                    <div style={{ marginBottom: '12px', padding: '5px 10px', background: dm ? '#7f1d1d' : '#fee2e2', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: dm ? '#fca5a5' : '#b91c1c', letterSpacing: '0.04em' }}>⚠ OVERDUE</span>
                    </div>
                  )}
                  <Link to={`/task/${task._id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: overdue ? (dm ? '#fca5a5' : '#b91c1c') : textPrimary, lineHeight: 1.3 }}>{task.title}</h3>
                  </Link>
                  <p style={{ margin: '0 0 14px', fontSize: '13px', color: textSecondary, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{task.description}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>{task.status === 'completed' ? 'Completed' : 'Pending'}</span>
                    {task.priority && <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, background: pc.bg, color: pc.text, border: `1px solid ${pc.border}` }}>{task.priority}</span>}
                    {task.category && <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, background: dm ? '#2e1065' : '#f5f3ff', color: dm ? '#c4b5fd' : '#6d28d9', border: `1px solid ${dm ? '#4c1d95' : '#ddd6fe'}` }}>{task.category}</span>}
                  </div>
                  {task.dueDate && (
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: overdue ? (dm ? '#fca5a5' : '#dc2626') : textSecondary }}>Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                      {task.status !== 'completed' && <CountdownTimer dueDate={task.dueDate} darkMode={dm} />}
                    </div>
                  )}
                  <div style={{ borderTop: `1px solid ${dm ? '#334155' : '#f1f5f9'}`, paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {task.status !== 'completed' && (
                      <button onClick={() => handleMarkComplete(task._id)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', background: dm ? '#052e16' : '#f0fdf4', color: dm ? '#86efac' : '#16a34a', border: `1px solid ${dm ? '#14532d' : '#bbf7d0'}`, borderRadius: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        <CheckCircle size={14} />{completedId === task._id ? 'Marking...' : 'Mark Complete'}
                      </button>
                    )}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link to={`/edit-task/${task._id}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', background: surface, color: textSecondary, border: `1px solid ${border}`, borderRadius: '9px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                        <Edit size={13} /> Edit
                      </Link>
                      <button onClick={() => handleDelete(task._id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', background: dm ? '#1c0a0a' : '#fff5f5', color: dm ? '#fca5a5' : '#dc2626', border: `1px solid ${dm ? '#7f1d1d' : '#fecdd3'}`, borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};