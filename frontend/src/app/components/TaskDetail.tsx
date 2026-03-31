import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, Edit, Trash2, Calendar, Tag, Flag, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';

export const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [subtasks, setSubtasks] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    api.get(`/tasks/${id}`).then(data => {
      if (data.success) { setTask(data.task); setSubtasks(data.task.subtasks || []); }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleMarkComplete = async () => {
    setMarking(true);
    const data = await api.patch(`/tasks/${id}/complete`);
    if (data.success) setTask((prev: any) => ({ ...prev, status: 'completed' }));
    setMarking(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    setDeleting(true);
    const data = await api.delete(`/tasks/${id}`);
    if (data.success) navigate('/');
    setDeleting(false);
  };

  const surface = '#ffffff', bg = '#f8fafc', border = '#e2e8f0';
  const textPrimary = '#0f172a', textSecondary = '#64748b', textMuted = '#94a3b8';

  const getPriorityConfig = (priority?: string) => {
    if (priority === 'High') return { bg: '#fff1f2', text: '#be123c', border: '#fecdd3', dot: '#ef4444' };
    if (priority === 'Medium') return { bg: '#fffbeb', text: '#a16207', border: '#fde68a', dot: '#f59e0b' };
    return { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', dot: '#3b82f6' };
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <p style={{ color: textSecondary }}>Loading task...</p>
    </div>
  );

  if (!task) return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: textSecondary, marginBottom: '16px' }}>Task not found.</p>
        <Link to="/" style={{ color: '#2563eb', fontWeight: 700 }}>← Back to Dashboard</Link>
      </div>
    </div>
  );

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const p = getPriorityConfig(task.priority);
  const subtasksDone = subtasks.filter((s: any) => s.isCompleted).length;
  const subtasksTotal = subtasks.length;
  const subtaskProgress = subtasksTotal > 0 ? Math.round((subtasksDone / subtasksTotal) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: surface, borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: '10px', border: `1.5px solid ${border}`, background: surface, color: textSecondary, textDecoration: 'none' }}>
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: textPrimary, letterSpacing: '-0.02em' }}>Task Details</h1>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: textMuted }}>ID: #{String(id).slice(-8)}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to={`/edit-task/${id}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: surface, color: textSecondary, border: `1.5px solid ${border}`, borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
              <Edit size={14} /> Edit
            </Link>
            <button onClick={handleDelete} disabled={deleting} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#fff5f5', color: '#dc2626', border: '1.5px solid #fecdd3', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: deleting ? 0.6 : 1 }}>
              <Trash2 size={14} /> {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Main card */}
          <div style={{ background: surface, border: `1px solid ${isOverdue ? '#fecdd3' : border}`, borderRadius: '16px', padding: '28px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: p.dot, borderRadius: '16px 16px 0 0' }} />
            {isOverdue && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', marginBottom: '16px' }}>
                <AlertTriangle size={13} color="#dc2626" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626', letterSpacing: '0.04em' }}>OVERDUE</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: textPrimary, letterSpacing: '-0.02em', lineHeight: 1.25 }}>{task.title}</h2>
              <span style={{ flexShrink: 0, padding: '5px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 700, background: task.status === 'completed' ? '#f0fdf4' : '#fffbeb', color: task.status === 'completed' ? '#15803d' : '#a16207', border: `1px solid ${task.status === 'completed' ? '#bbf7d0' : '#fde68a'}` }}>
                {task.status === 'completed' ? 'Completed' : 'Pending'}
              </span>
            </div>
            <p style={{ margin: '0 0 24px', fontSize: '15px', color: textSecondary, lineHeight: 1.7 }}>{task.description}</p>
            {task.status !== 'completed' ? (
              <div style={{ borderTop: `1px solid ${border}`, paddingTop: '20px' }}>
                <button onClick={handleMarkComplete} disabled={marking} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: marking ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(22,163,74,0.3)', fontFamily: 'inherit', opacity: marking ? 0.7 : 1 }}>
                  <CheckCircle size={18} />{marking ? 'Marking complete...' : 'Mark as Completed'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', background: '#f0fdf4', borderRadius: '10px', marginTop: '8px' }}>
                <CheckCircle size={20} color="#16a34a" />
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#15803d' }}>This task has been completed!</span>
              </div>
            )}
          </div>

          {/* Subtasks */}
          {subtasks.length > 0 && (
            <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 3, height: 16, background: '#3b82f6', borderRadius: '99px' }} />
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: textPrimary }}>Subtasks</h3>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: textMuted }}>{subtasksDone}/{subtasksTotal} done</span>
              </div>
              <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ height: '100%', width: `${subtaskProgress}%`, background: 'linear-gradient(90deg,#3b82f6,#22c55e)', borderRadius: '99px', transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {subtasks.map((s: any) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: s.isCompleted ? '#f0fdf4' : '#f8fafc', border: `1px solid ${s.isCompleted ? '#bbf7d0' : border}`, borderRadius: '10px' }}>
                    <input type="checkbox" checked={s.isCompleted} onChange={() => setSubtasks((prev: any[]) => prev.map(st => st.id === s.id ? { ...st, isCompleted: !st.isCompleted } : st))} style={{ width: 16, height: 16, accentColor: '#3b82f6', cursor: 'pointer' }} />
                    <span style={{ fontSize: '14px', fontWeight: 500, color: s.isCompleted ? '#64748b' : textPrimary, textDecoration: s.isCompleted ? 'line-through' : 'none' }}>{s.title}</span>
                    {s.isCompleted && <CheckCircle size={14} color="#16a34a" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '16px', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <div style={{ width: 3, height: 16, background: '#3b82f6', borderRadius: '99px' }} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: textPrimary }}>Details</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { icon: <Flag size={14} color={p.dot} />, label: 'Priority', content: <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 700, background: p.bg, color: p.text, border: `1px solid ${p.border}` }}>{task.priority || 'Not set'}</span> },
                task.category && { icon: <Tag size={14} color="#8b5cf6" />, label: 'Category', content: <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 700, background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe' }}>{task.category}</span> },
                task.dueDate && { icon: <Calendar size={14} color={isOverdue ? '#dc2626' : '#3b82f6'} />, label: 'Due Date', content: <div style={{ fontSize: '13px', fontWeight: 600, color: isOverdue ? '#dc2626' : textPrimary }}>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}{isOverdue && <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>Overdue</div>}</div> },
                { icon: <Clock size={14} color={textMuted} />, label: 'Created', content: <div style={{ fontSize: '13px', fontWeight: 600, color: textPrimary }}>{new Date(task.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div> },
              ].filter(Boolean).map((item: any, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#f8fafc', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>{item.label}</div>
                    {item.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '16px', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{ width: 3, height: 16, background: '#8b5cf6', borderRadius: '99px' }} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: textPrimary }}>Quick Actions</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to={`/edit-task/${id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#f8fafc', color: textSecondary, border: `1px solid ${border}`, borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                <Edit size={14} /> Edit Task
              </Link>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#f8fafc', color: textSecondary, border: `1px solid ${border}`, borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                <ArrowLeft size={14} /> Back to Dashboard
              </Link>
              <button onClick={handleDelete} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#fff5f5', color: '#dc2626', border: '1px solid #fecdd3', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left' }}>
                <Trash2 size={14} /> Delete Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};