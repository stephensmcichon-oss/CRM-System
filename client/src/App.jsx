import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, Settings as SettingsIcon, ActivitySquare, LogOut } from 'lucide-react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Dashboard from './components/Dashboard';
import ClientDatabase from './components/ClientDatabase';
import HealthcareModule from './components/HealthcareModule';
import Settings from './components/Settings';
import Login from './components/Login';

// Requires user to provide this key in Vercel env vars or config
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '123456789-placeholder.apps.googleusercontent.com';

const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/clients', label: 'Client Database', icon: <Users size={20} /> },
    { path: '/healthcare', label: 'Healthcare Module', icon: <ActivitySquare size={20} /> },
  ];

  return (
    <div className="sidebar">
      <div>
        <div className="sidebar-logo">
          <div className="icon">
            <Activity size={24} />
          </div>
          Dental Management
        </div>
        
        <div className="nav-menu" style={{ marginTop: '2rem' }}>
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      
      <div className="nav-menu">
        <Link to="/settings" className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
          <SettingsIcon size={20} />
          Settings
        </Link>
        <button onClick={onLogout} className="nav-item" style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', color: 'var(--danger)', marginTop: '0.5rem', cursor: 'pointer' }}>
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

function App() {
  // Check local storage for existing session
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('auth_token'));

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('crm-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('auth_token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        {isAuthenticated ? (
          <div className="app-container">
            <Sidebar onLogout={handleLogout} />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clients" element={<ClientDatabase />} />
                <Route path="/healthcare" element={<HealthcareModule />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
