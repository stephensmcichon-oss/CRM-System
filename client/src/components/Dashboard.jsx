import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Calendar, Plus, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import Modal from './Modal';
import { API_BASE_URL } from '../config';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalClients: 0, activeTasks: 0, upcomingAppointments: 0 });
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', dueDate: '' });
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  
  useEffect(() => {
    // Fetch stats
    fetch(`${API_BASE_URL}/api/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));

    // Fetch tasks
    fetch(`${API_BASE_URL}/api/tasks`)
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error(err));
  }, []);

  const completeTask = (id) => {
    fetch(`${API_BASE_URL}/api/tasks/${id}/complete`, { method: 'POST' })
      .then(res => res.json())
      .then(updatedTask => {
        setTasks(tasks.map(t => t.id === id ? updatedTask : t));
        // Update stats optimistically
        setStats(prev => ({ ...prev, activeTasks: prev.activeTasks - 1 }));
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/api/tasks`, {
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

  const handleDelete = (id) => {
    fetch(`${API_BASE_URL}/api/tasks/${id}`, { method: 'DELETE' })
      .then(() => {
        const taskToDelete = tasks.find(t => t.id === id);
        setTasks(tasks.filter(t => t.id !== id));
        if (taskToDelete && !taskToDelete.completed) {
          setStats(prev => ({ ...prev, activeTasks: prev.activeTasks - 1 }));
        }
        setActiveDropdownId(null);
      })
      .catch(err => console.error(err));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/api/tasks/${editFormData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editFormData.title, dueDate: editFormData.dueDate })
    })
    .then(res => res.json())
    .then(updatedTask => {
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      setEditFormData(null);
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
                  <div style={{ position: 'relative' }}>
                    <button 
                      className="btn" 
                      style={{ padding: '0.5rem', backgroundColor: activeDropdownId === task.id ? 'var(--bg-surface-hover)' : 'transparent', color: 'var(--text-muted)' }}
                      onClick={() => setActiveDropdownId(activeDropdownId === task.id ? null : task.id)}
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    {activeDropdownId === task.id && (
                      <div className="dropdown-menu">
                        {!task.completed && (
                          <button 
                            className="dropdown-item" 
                            onClick={() => {
                              completeTask(task.id);
                              setActiveDropdownId(null);
                            }}
                          >
                            <CheckCircle size={16} /> Complete
                          </button>
                        )}
                        <button 
                          className="dropdown-item" 
                          onClick={() => {
                            setEditFormData(task);
                            setActiveDropdownId(null);
                          }}
                        >
                          <Edit2 size={16} /> Edit
                        </button>
                        <button 
                          className="dropdown-item danger" 
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
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

      {/* Edit Modal */}
      <Modal isOpen={!!editFormData} onClose={() => setEditFormData(null)} title="Edit Task">
        {editFormData && (
          <form onSubmit={handleEditSubmit}>
            <div className="form-group">
              <label>Task Title</label>
              <input type="text" className="form-control" required value={editFormData.title} onChange={e => setEditFormData({...editFormData, title: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" className="form-control" required value={editFormData.dueDate} onChange={e => setEditFormData({...editFormData, dueDate: e.target.value})} />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn" onClick={() => setEditFormData(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Update Task</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
