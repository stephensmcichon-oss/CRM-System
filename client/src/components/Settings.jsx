import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function Settings() {
  const [theme, setTheme] = useState(localStorage.getItem('crm-theme') || 'dark');

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('crm-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your application preferences.</p>
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
    </div>
  );
}
