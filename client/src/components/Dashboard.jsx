import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Calendar, Plus } from 'lucide-react';
import Modal from './Modal';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalClients: 0, activeTasks: 0, upcomingAppointments: 0 });
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', dueDate: '' });
  
  useEffect(() => {
    // Fetch stats
    fetch('http://localhost:5000/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));

    // Fetch tasks
    fetch('http://localhost:5000/api/tasks')
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error(err));
  }, []);

  const completeTask = (id) => {
    fetch(`http://localhost:5000/api/tasks/${id}/complete`, { method: 'POST' })
      .then(res => res.json())
      .then(updatedTask => {
        setTasks(tasks.map(t => t.id === id ? updatedTask : t));
        // Update stats optimistically
        setStats(prev => ({ ...prev, activeTasks: prev.activeTasks - 1 }));
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(newTask => {
      setTasks([...tasks, newTask]);
      setStats(prev => ({ ...prev, activeTasks: prev.activeTasks + 1 }));
      setIsModalOpen(false);
      setFormData({ title: '', dueDate: '' });
    })
    .catch(err => console.error(err));
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, here's your overview.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> New Task
        </button>
      </div>

      <div className="card-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Total Clients</span>
            <div className="card-icon"><Users size={24} /></div>
          </div>
          <div className="card-value">{stats.totalClients}</div>
          <span className="badge success">Active Database</span>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Pending Tasks</span>
            <div className="card-icon"><CheckCircle size={24} /></div>
          </div>
          <div className="card-value">{stats.activeTasks}</div>
          <span className="badge warning">Needs Attention</span>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Appointments</span>
            <div className="card-icon"><Calendar size={24} /></div>
          </div>
          <div className="card-value">{stats.upcomingAppointments}</div>
          <span className="badge primary">This Week</span>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Task Reminders</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td style={{ fontWeight: 500 }}>{task.title}</td>
                <td>{task.dueDate}</td>
                <td>
                  <span className={`badge ${task.completed ? 'success' : 'warning'}`}>
                    {task.completed ? 'Completed' : 'Pending'}
                  </span>
                </td>
                <td>
                  {!task.completed && (
                    <button 
                      onClick={() => completeTask(task.id)}
                      className="btn" 
                      style={{ padding: '0.4rem 0.8rem', backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }}>
                      Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No tasks available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Task">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title</label>
            <input type="text" className="form-control" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Call John for follow-up" />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" className="form-control" required value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Task</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
