import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Calendar, MoreHorizontal, MessageSquarePlus } from 'lucide-react';
import Modal from './Modal';
import { API_BASE_URL } from '../config';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalClients: 0, activeTasks: 0, upcomingAppointments: 0 });
  const [tasks, setTasks] = useState([]);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [commentTask, setCommentTask] = useState(null);
  const [newComment, setNewComment] = useState('');
  
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

  const handleAddCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const updatedComments = [...(commentTask.comments || []), newComment];
    
    fetch(`${API_BASE_URL}/api/tasks/${commentTask.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comments: updatedComments })
    })
    .then(res => res.json())
    .then(updatedTask => {
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      setCommentTask(null);
      setNewComment('');
    })
    .catch(err => console.error(err));
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clinic Assistant Dashboard</h1>
          <p className="page-subtitle">Welcome back, here's your overview.</p>
        </div>
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
          <h2>Assigned Tasks</h2>
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
                <td>
                  <div style={{ fontWeight: 500 }}>{task.title}</div>
                  {task.comments && task.comments.length > 0 && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <strong>Comments:</strong>
                      <ul style={{ paddingLeft: '1rem', marginTop: '0.25rem', marginBottom: 0 }}>
                        {task.comments.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                </td>
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
                            <CheckCircle size={16} /> Mark Complete
                          </button>
                        )}
                        <button 
                          className="dropdown-item" 
                          onClick={() => {
                            setCommentTask(task);
                            setActiveDropdownId(null);
                          }}
                        >
                          <MessageSquarePlus size={16} /> Add Comment
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

      <Modal isOpen={!!commentTask} onClose={() => { setCommentTask(null); setNewComment(''); }} title="Add Comment to Task">
        {commentTask && (
          <form onSubmit={handleAddCommentSubmit}>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Adding comment to: <strong>{commentTask.title}</strong></p>
            <div className="form-group">
              <label>Your Comment</label>
              <textarea 
                className="form-control" 
                required 
                rows="4"
                value={newComment} 
                onChange={e => setNewComment(e.target.value)} 
                placeholder="e.g. Left a voicemail..." 
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn" onClick={() => { setCommentTask(null); setNewComment(''); }}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Comment</button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
}
