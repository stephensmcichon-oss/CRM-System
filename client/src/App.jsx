import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, Settings as SettingsIcon, ActivitySquare } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ClientDatabase from './components/ClientDatabase';
import HealthcareModule from './components/HealthcareModule';
import Settings from './components/Settings';

const Sidebar = () => {
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
          NexusCRM
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
      </div>
    </div>
  );
};

function App() {
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('crm-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<ClientDatabase />} />
            <Route path="/healthcare" element={<HealthcareModule />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
