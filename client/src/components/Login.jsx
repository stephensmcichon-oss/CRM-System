import React from 'react';
import { Activity } from 'lucide-react';

export default function Login({ onLogin }) {
  const handleBypass = () => {
    // Immediately log the user in without checking the backend
    onLogin('bypassed_token');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
          <Activity size={48} />
        </div>
        <h2 style={{ marginBottom: '0.5rem' }}>Dental Management</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>Welcome to the NexusCRM Healthcare Module.</p>
        
        <button 
          onClick={handleBypass} 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', fontWeight: 'bold' }}
        >
          Use App
        </button>
      </div>
    </div>
  );
}
