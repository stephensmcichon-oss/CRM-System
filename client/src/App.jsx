import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, Settings as SettingsIcon, ActivitySquare, LogOut, Bell } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ClientDatabase from './components/ClientDatabase';
import HealthcareModule from './components/HealthcareModule';
import Settings from './components/Settings';
import Login from './components/Login';
import RemindersPanel from './components/RemindersPanel';
import DentistDashboard from './components/DentistDashboard';

const TopNavbar = ({ onLogout, onToggleReminders, reminderCount }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/clients', label: 'Client Database', icon: <Users size={20} /> },
    { path: '/healthcare', label: 'Healthcare Module', icon: <ActivitySquare size={20} /> },
  ];

  return (
    <header style={{ 
      backgroundColor: 'var(--bg-surface)', 
      borderBottom: '1px solid var(--border-color)', 
      padding: '1rem 2rem', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '1.25rem' }}>
          <div className="icon" style={{ color: 'var(--accent-primary)', background: 'var(--accent-primary-light)', padding: '0.5rem', borderRadius: 'var(--radius-md)', display: 'flex' }}>
            <Activity size={24} />
          </div>
          Clinic Assistant
        </div>
        
        <nav style={{ display: 'flex', gap: '0.5rem' }}>
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              style={{ padding: '0.6rem 1rem' }}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={onToggleReminders} className="btn" style={{ position: 'relative', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}>
          <Bell size={20} />
          {reminderCount > 0 && (
            <span style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: 'var(--danger)', color: 'white', fontSize: '0.7rem', fontWeight: 700, width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px var(--bg-surface)' }}>
              {reminderCount}
            </span>
          )}
        </button>
        <Link to="/settings" className="btn" style={{ padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}>
          <SettingsIcon size={20} />
        </Link>
        <button onClick={onLogout} className="btn" style={{ padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', color: 'var(--danger)' }}>
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

function App() {
  const [auth, setAuth] = React.useState(() => {
    const saved = localStorage.getItem('auth_data');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [isRemindersOpen, setIsRemindersOpen] = React.useState(false);
  const [reminderCount, setReminderCount] = React.useState(0);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('crm-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  React.useEffect(() => {
    if (auth) {
      const fetchReminders = () => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reminders`)
          .then(res => res.json())
          .then(data => setReminderCount(data.length))
          .catch(console.error);
      };
      fetchReminders();
      const interval = setInterval(fetchReminders, 300000);
      return () => clearInterval(interval);
    }
  }, [auth]);

  const handleLogin = (data) => {
    localStorage.setItem('auth_data', JSON.stringify(data));
    setAuth(data);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_data');
    setAuth(null);
  };

  return (
    <BrowserRouter>
      {auth ? (
        auth.role === 'dentist' ? (
          <DentistDashboard onLogout={handleLogout} />
        ) : (
          <div className="app-container" style={{ flexDirection: 'column' }}>
            <TopNavbar onLogout={handleLogout} onToggleReminders={() => setIsRemindersOpen(true)} reminderCount={reminderCount} />
            <RemindersPanel isOpen={isRemindersOpen} onClose={() => setIsRemindersOpen(false)} />
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
        )
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
