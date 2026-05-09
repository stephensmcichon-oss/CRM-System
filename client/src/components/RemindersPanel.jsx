import React, { useState, useEffect } from 'react';
import { Bell, Calendar, CheckSquare, Gift, X } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function RemindersPanel({ isOpen, onClose }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`${API_BASE_URL}/api/reminders`)
        .then(res => res.json())
        .then(data => {
          setReminders(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load reminders:', err);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch(type) {
      case 'Task': return <CheckSquare size={18} className="text-warning" />;
      case 'Appointment': return <Calendar size={18} className="text-primary" />;
      case 'Birthday': return <Gift size={18} className="text-success" />;
      default: return <Bell size={18} />;
    }
  };

  return (
    <div className="reminders-overlay" onClick={onClose}>
      <div className="reminders-panel" onClick={e => e.stopPropagation()}>
        <div className="reminders-header">
          <h3>Upcoming Reminders</h3>
          <button className="btn" style={{ padding: '0.4rem' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="reminders-body">
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : reminders.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Bell size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>You're all caught up!</p>
              <p style={{ fontSize: '0.85rem' }}>No upcoming tasks, appointments, or birthdays.</p>
            </div>
          ) : (
            <ul className="reminders-list">
              {reminders.map(rem => (
                <li key={rem.id} className="reminder-item">
                  <div className="reminder-icon">
                    {getIcon(rem.type)}
                  </div>
                  <div className="reminder-content">
                    <div className="reminder-title" style={{ color: rem.isOverdue ? 'var(--danger)' : 'inherit' }}>
                      {rem.title}
                      {rem.isOverdue && <span className="badge danger" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>Overdue</span>}
                    </div>
                    <div className="reminder-meta">
                      {rem.type} • {rem.date}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
