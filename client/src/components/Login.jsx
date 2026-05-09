import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Login({ onLogin }) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    .then(res => {
      if (!res.ok) throw new Error('Authentication failed');
      return res.json();
    })
    .then(data => {
      onLogin(data.sessionToken);
    })
    .catch(err => {
      console.error(err);
      setIsLoading(false);
      setError('Invalid username or password.');
    });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
          <Activity size={48} />
        </div>
        <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Dental Management</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center' }}>Please sign in to access your dashboard.</p>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1.5rem', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              className="form-control" 
              required 
              value={credentials.username} 
              onChange={e => setCredentials({...credentials, username: e.target.value})} 
              placeholder="Enter your username"
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="form-control" 
              required 
              value={credentials.password} 
              onChange={e => setCredentials({...credentials, password: e.target.value})} 
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', minHeight: '40px' }}>
            {isLoading ? (
              <div style={{ color: 'var(--accent-primary)', fontWeight: '500', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="spinner"></div> Authenticating...
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(Backend waking up, please wait up to 50s)</span>
              </div>
            ) : (
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Sign In</button>
            )}
          </div>
        </form>
        
        <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Secure access restricted to authorized personnel only.
        </p>
      </div>
    </div>
  );
}
