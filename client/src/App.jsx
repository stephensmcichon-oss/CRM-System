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

const Sidebar = ({ onLogout, onToggleReminders, reminderCount }) => {
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
        <button onClick={onToggleReminders} className="nav-item" style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', position: 'relative', color: 'var(--text-primary)' }}>
          <Bell size={20} />
          Reminders
          {reminderCount > 0 && (
            <span className="badge danger" style={{ position: 'absolute', right: '1rem', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>
              {reminderCount}
            </span>
          )}
        </button>
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
          <div className="app-container">
            <Sidebar onLogout={handleLogout} onToggleReminders={() => setIsRemindersOpen(true)} reminderCount={reminderCount} />
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
