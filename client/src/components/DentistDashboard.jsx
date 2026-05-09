import React, { useState, useEffect } from 'react';
import { Activity, Bell, LogOut, Calendar as CalendarIcon, Clock, Users, CheckSquare } from 'lucide-react';
import RemindersPanel from './RemindersPanel';
import { API_BASE_URL } from '../config';

export default function DentistDashboard({ onLogout }) {
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [reminderCount, setReminderCount] = useState(0);
  
  const [appointments, setAppointments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [patients, setPatients] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aptRes, taskRes, patRes, logRes, remRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/appointments`),
          fetch(`${API_BASE_URL}/api/tasks`),
          fetch(`${API_BASE_URL}/api/patients`),
          fetch(`${API_BASE_URL}/api/logs`),
          fetch(`${API_BASE_URL}/api/reminders`)
        ]);

        const aptData = await aptRes.json();
        const taskData = await taskRes.json();
        const patData = await patRes.json();
        const logData = await logRes.json();
        const remData = await remRes.json();

        setAppointments(aptData.filter(a => a.status === 'Scheduled' || !a.status).slice(0, 10)); // Only show upcoming
        setTasks(taskData.filter(t => !t.completed).slice(0, 10));
        setPatients(patData);
        setLogs(logData.slice(0, 15));
        setReminderCount(remData.length);
      } catch (err) {
        console.error('Failed to load dentist dashboard data:', err);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 60000); // Auto refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '1.25rem' }}>
          <div className="icon" style={{ color: 'var(--accent-primary)', background: 'var(--accent-primary-light)', padding: '0.5rem', borderRadius: 'var(--radius-md)', display: 'flex' }}>
            <Activity size={24} />
          </div>
          Dentist Dashboard
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="btn" 
            style={{ position: 'relative', padding: '0.5rem' }} 
            onClick={() => setIsRemindersOpen(true)}
          >
            <Bell size={20} />
            {reminderCount > 0 && (
              <span className="badge danger" style={{ position: 'absolute', top: '-5px', right: '-5px', padding: '0.15rem 0.4rem', fontSize: '0.7rem' }}>
                {reminderCount}
              </span>
            )}
          </button>
          <button className="btn" style={{ padding: '0.5rem', color: 'var(--danger)' }} onClick={onLogout}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <RemindersPanel isOpen={isRemindersOpen} onClose={() => setIsRemindersOpen(false)} />

      {/* Main Content Grid */}
      <main style={{ padding: '2rem', flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', alignContent: 'start' }}>
        
        {/* Appointments Widget */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '500px' }}>
          <div className="card-header" style={{ padding: '1.5rem', marginBottom: 0, borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              <Clock size={20} className="text-primary" /> Upcoming Appointments
            </span>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
            {appointments.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No upcoming appointments.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {appointments.map(apt => (
                  <div key={apt.id} style={{ backgroundColor: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '1.05rem' }}>{apt.patientName}</strong>
                      <span className="badge primary">{apt.time}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{apt.date} • {apt.reason}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tasks Widget */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '500px' }}>
          <div className="card-header" style={{ padding: '1.5rem', marginBottom: 0, borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              <CheckSquare size={20} className="text-warning" /> Pending Tasks
            </span>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
            {tasks.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>All caught up on tasks!</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tasks.map(task => (
                  <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontWeight: 500 }}>{task.title}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Due: {task.dueDate}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Real-time Logs Widget */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '500px' }}>
          <div className="card-header" style={{ padding: '1.5rem', marginBottom: 0, borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              <Activity size={20} className="text-danger" /> Live Clinic Activity
            </span>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
            {logs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No recent activity.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {logs.map(log => (
                  <div key={log.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', minWidth: '70px', paddingTop: '0.2rem' }}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{log.details}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>Module: {log.entity}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Patient Directory Widget */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '500px' }}>
          <div className="card-header" style={{ padding: '1.5rem', marginBottom: 0, borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              <Users size={20} className="text-success" /> Patient Directory
            </span>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, padding: 0 }}>
            {patients.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No patients found.</div>
            ) : (
              <table style={{ minWidth: '100%' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-surface)', zIndex: 10 }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Last Visit</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => {
                    const lastVisit = p.dentalHistory && p.dentalHistory.length > 0 
                      ? p.dentalHistory[p.dentalHistory.length - 1].date 
                      : 'N/A';
                    return (
                      <tr key={p.id}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{p.name}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{lastVisit}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
