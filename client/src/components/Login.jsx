import React from 'react';
import { Activity, UserPlus, Stethoscope } from 'lucide-react';

export default function Login({ onLogin }) {
  const handleLogin = (role) => {
    onLogin({ token: 'bypassed_token', role });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
          <Activity size={48} />
        </div>
        <h2 style={{ marginBottom: '0.5rem' }}>Dental Management</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>Select your portal to continue.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={() => handleLogin('assistant')} 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 'bold' }}
          >
            <UserPlus size={20} />
            Clinic Assistant Login
          </button>

          <button 
            onClick={() => handleLogin('dentist')} 
            className="btn" 
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 'bold', backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }}
          >
            <Stethoscope size={20} />
            Dentist Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
