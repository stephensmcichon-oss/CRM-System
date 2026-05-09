import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Activity } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Login({ onLogin }) {
  const [error, setError] = useState('');

  const handleSuccess = (credentialResponse) => {
    fetch(`${API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: credentialResponse.credential })
    })
    .then(res => {
      if (!res.ok) throw new Error('Authentication failed on server');
      return res.json();
    })
    .then(data => {
      onLogin(data.sessionToken);
    })
    .catch(err => {
      console.error(err);
      setError('Login failed. Please verify your credentials.');
    });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
          <Activity size={48} />
        </div>
        <h2 style={{ marginBottom: '0.5rem' }}>Dental Management</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Please sign in to access your dashboard.</p>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)' }}>{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError('Google Login was unsuccessful.')}
            useOneTap
          />
        </div>
        
        <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Secure access restricted to authorized personnel only.
        </p>
      </div>
    </div>
  );
}
