import React, { useState, useEffect } from 'react';
import { Moon, Sun, Activity, PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Settings() {
  const [theme, setTheme] = useState(localStorage.getItem('crm-theme') || 'dark');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/logs`)
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err => console.error('Failed to load logs:', err));
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('crm-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const getActionIcon = (action) => {
    if (action === 'CREATE') return <PlusCircle size={14} />;
    if (action === 'UPDATE') return <Edit2 size={14} />;
    if (action === 'DELETE') return <Trash2 size={14} />;
    return null;
  };

  const getActionClass = (action) => {
    if (action === 'CREATE') return 'success';
    if (action === 'UPDATE') return 'primary';
    if (action === 'DELETE') return 'danger';
    return 'neutral';
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings & Activity</h1>
          <p className="page-subtitle">Manage preferences and monitor system activity.</p>
        </div>
      </div>

      <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Appearance</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Choose between light and dark mode for your interface.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => handleThemeChange('light')}
              className={`btn ${theme === 'light' ? 'btn-primary' : ''}`}
              style={{ flex: 1, backgroundColor: theme !== 'light' ? 'var(--bg-surface-hover)' : '', color: theme !== 'light' ? 'var(--text-primary)' : '' }}
            >
              <Sun size={18} /> Light
            </button>
            <button 
              onClick={() => handleThemeChange('dark')}
              className={`btn ${theme === 'dark' ? 'btn-primary' : ''}`}
              style={{ flex: 1, backgroundColor: theme !== 'dark' ? 'var(--bg-surface-hover)' : '', color: theme !== 'dark' ? 'var(--text-primary)' : '' }}
            >
              <Moon size={18} /> Dark
            </button>
          </div>
        </div>
      </div>

      <div className="card-grid" style={{ gridTemplateColumns: '1fr', marginTop: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Activity Audit Log</span>
            <div className="card-icon"><Activity size={24} /></div>
          </div>
          
          <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${getActionClass(log.action)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        {getActionIcon(log.action)} {log.action}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{log.entity}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{log.details}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No recent activity recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
