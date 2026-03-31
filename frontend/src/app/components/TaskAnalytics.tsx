import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Task {
  _id: string; title: string; status: 'pending' | 'completed';
  priority?: 'Low' | 'Medium' | 'High'; category?: string; dueDate?: string; createdAt: string;
}
interface Props { tasks: Task[]; darkMode: boolean; }

const CustomTooltip = ({ active, payload, label, darkMode }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: darkMode ? '#1e293b' : '#fff', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, borderRadius: '10px', padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>
        <p style={{ margin: '0 0 4px', fontWeight: 700, color: darkMode ? '#f1f5f9' : '#0f172a' }}>{label || payload[0].name}</p>
        <p style={{ margin: 0, color: payload[0].color || '#3b82f6', fontWeight: 600 }}>{payload[0].value} tasks</p>
      </div>
    );
  }
  return null;
};

export const TaskAnalytics: React.FC<Props> = ({ tasks, darkMode: dm }) => {
  const surface = dm ? '#1e293b' : '#ffffff';
  const border = dm ? '#334155' : '#e2e8f0';
  const textPrimary = dm ? '#f1f5f9' : '#0f172a';
  const axisColor = dm ? '#475569' : '#94a3b8';

  const statusData = [
    { name: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: '#f59e0b' },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#22c55e' },
  ].filter(d => d.value > 0);

  const priorityData = [
    { name: 'High', count: tasks.filter(t => t.priority === 'High').length, fill: '#ef4444' },
    { name: 'Medium', count: tasks.filter(t => t.priority === 'Medium').length, fill: '#f59e0b' },
    { name: 'Low', count: tasks.filter(t => t.priority === 'Low').length, fill: '#3b82f6' },
  ];

  const categories = [...new Set(tasks.map(t => t.category).filter(Boolean))];
  const categoryData = categories.map(cat => ({ name: cat, count: tasks.filter(t => t.category === cat).length }));

  const last7Days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().split('T')[0]; });
  const activityData = last7Days.map(day => ({ name: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }), tasks: tasks.filter(t => t.createdAt.split('T')[0] === day).length }));

  if (tasks.length === 0) return null;

  const cardStyle: React.CSSProperties = { background: surface, border: `1px solid ${border}`, borderRadius: '14px', padding: '22px 24px' };
  const chartTitle = (label: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
      <div style={{ width: 3, height: 16, background: '#3b82f6', borderRadius: '99px' }} />
      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: textPrimary }}>{label}</h3>
    </div>
  );

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        <div style={cardStyle}>
          {chartTitle('Status Overview')}
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={82} paddingAngle={4} dataKey="value" strokeWidth={0}>
                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip darkMode={dm} />} />
              <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: '12px', color: textPrimary, fontWeight: 600 }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={cardStyle}>
          {chartTitle('Tasks by Priority')}
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityData} barSize={36}>
              <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<CustomTooltip darkMode={dm} />} cursor={{ fill: dm ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>{priorityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={cardStyle}>
          {chartTitle('Activity — Last 7 Days')}
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activityData} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
              <Tooltip content={<CustomTooltip darkMode={dm} />} cursor={{ fill: dm ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="tasks" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {categoryData.length > 0 && (
          <div style={cardStyle}>
            {chartTitle('Tasks by Category')}
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} barSize={32}>
                <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
                <Tooltip content={<CustomTooltip darkMode={dm} />} cursor={{ fill: dm ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};