import React, { useState, useEffect } from 'react';
import { Activity, Bell, LogOut, Calendar as CalendarIcon, Clock, Users, CheckSquare, Plus, MoreHorizontal, Edit2, Trash2, List, Search, Eye } from 'lucide-react';
import RemindersPanel from './RemindersPanel';
import Modal from './Modal';
import CalendarView from './CalendarView';
import { API_BASE_URL } from '../config';

export default function DentistDashboard({ onLogout }) {
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [reminderCount, setReminderCount] = useState(0);
  
  const [appointments, setAppointments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [patients, setPatients] = useState([]);
  const [logs, setLogs] = useState([]);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState({ title: '', description: '', dueDate: '' });
  const [editTaskData, setEditTaskData] = useState(null);
  const [activeTaskDropdownId, setActiveTaskDropdownId] = useState(null);
  
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [patientSearch, setPatientSearch] = useState('');
  const [viewingPatient, setViewingPatient] = useState(null);

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
        setTasks(taskData);
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

  const handleCreateTask = (e) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskFormData)
    })
    .then(res => res.json())
    .then(newTask => {
      setTasks([...tasks, newTask]);
      setIsTaskModalOpen(false);
      setTaskFormData({ title: '', description: '', dueDate: '' });
    })
    .catch(err => console.error(err));
  };

  const handleEditTaskSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/api/tasks/${editTaskData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTaskData.title, description: editTaskData.description, dueDate: editTaskData.dueDate })
    })
    .then(res => res.json())
    .then(updatedTask => {
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      setEditTaskData(null);
    })
    .catch(err => console.error(err));
  };

  const handleDeleteTask = (id) => {
    fetch(`${API_BASE_URL}/api/tasks/${id}`, { method: 'DELETE' })
      .then(() => {
        setTasks(tasks.filter(t => t.id !== id));
        setActiveTaskDropdownId(null);
      })
      .catch(err => console.error(err));
  };

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

      <RemindersPanel isOpen={isRemindersOpen} onClose={() => setIsRemindersOpen(false)} filterType="Appointment" />

      {/* Main Content Grid */}
      <main style={{ padding: '2rem', flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', alignContent: 'start' }}>
        
        {/* Appointments Widget */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: viewMode === 'calendar' ? 'none' : '500px', gridColumn: viewMode === 'calendar' ? '1 / -1' : 'auto' }}>
          <div className="card-header" style={{ padding: '1.5rem', marginBottom: 0, borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              <Clock size={20} className="text-primary" /> Upcoming Appointments
            </span>
            <div className="view-toggle">
              <button 
                type="button"
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={16} /> List
              </button>
              <button 
                type="button"
                className={`view-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon size={16} /> Calendar
              </button>
            </div>
          </div>
          
          {viewMode === 'list' ? (
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
          ) : (
            <CalendarView 
              appointments={appointments} 
              onEventClick={() => {}} 
            />
          )}
        </div>

        {/* Tasks Widget */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '500px' }}>
          <div className="card-header" style={{ padding: '1.5rem', marginBottom: 0, borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              <CheckSquare size={20} className="text-warning" /> Pending Tasks
            </span>
            <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} onClick={() => setIsTaskModalOpen(true)}>
              <Plus size={16} /> New Task
            </button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
            {tasks.filter(t => !t.completed).length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>All caught up on tasks!</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tasks.filter(t => !t.completed).map(task => (
                  <div key={task.id} style={{ backgroundColor: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--warning)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 500 }}>{task.title}</span>
                      <div style={{ position: 'relative' }}>
                        <button 
                          className="btn" 
                          style={{ padding: '0.25rem', backgroundColor: activeTaskDropdownId === task.id ? 'var(--bg-surface-hover)' : 'transparent', color: 'var(--text-muted)' }}
                          onClick={() => setActiveTaskDropdownId(activeTaskDropdownId === task.id ? null : task.id)}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {activeTaskDropdownId === task.id && (
                          <div className="dropdown-menu" style={{ right: 0 }}>
                            <button className="dropdown-item" onClick={() => { setEditTaskData(task); setActiveTaskDropdownId(null); }}>
                              <Edit2 size={16} /> Edit
                            </button>
                            <button className="dropdown-item danger" onClick={() => handleDeleteTask(task.id)}>
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Due: {task.dueDate}</div>
                    {task.description && (
                      <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '0.75rem', padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 'var(--radius-sm)' }}>
                        {task.description}
                      </div>
                    )}
                    
                    {task.comments && task.comments.length > 0 && (
                      <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                        <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Assistant Comments:</strong>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-primary)' }}>
                          {task.comments.map((comment, i) => (
                            <li key={i} style={{ marginBottom: '0.25rem' }}>{comment}</li>
                          ))}
                        </ul>
                      </div>
                    )}
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
          <div className="card-header" style={{ padding: '1.5rem', marginBottom: 0, borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>
              <Users size={20} className="text-success" /> Patient Directory
            </span>
            <div style={{ position: 'relative', width: '180px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search name..." 
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                style={{ paddingLeft: '1.8rem', paddingRight: '0.5rem', paddingTop: '0.3rem', paddingBottom: '0.3rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}
              />
            </div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, padding: 0 }}>
            {patients.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase())).length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No patients found.</div>
            ) : (
              <table style={{ minWidth: '100%' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-surface)', zIndex: 10 }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Phone</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Last Visit</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase())).map(p => {
                    const lastVisit = p.dentalHistory && p.dentalHistory.length > 0 
                      ? p.dentalHistory[p.dentalHistory.length - 1].date 
                      : 'N/A';
                    return (
                      <tr key={p.id}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{p.name}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{p.phone}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{lastVisit}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <button className="btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }} onClick={() => setViewingPatient(p)}>
                            <Eye size={14} style={{ marginRight: '0.2rem' }} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </main>

      {/* Task Creation Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask}>
          <div className="form-group">
            <label>Task Title</label>
            <input type="text" className="form-control" required value={taskFormData.title} onChange={e => setTaskFormData({...taskFormData, title: e.target.value})} placeholder="e.g. Call John for follow-up" />
          </div>
          <div className="form-group">
            <label>Instructions / Description</label>
            <textarea className="form-control" rows="3" value={taskFormData.description} onChange={e => setTaskFormData({...taskFormData, description: e.target.value})} placeholder="Add details or instructions for the assistant..."></textarea>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" className="form-control" required value={taskFormData.dueDate} onChange={e => setTaskFormData({...taskFormData, dueDate: e.target.value})} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn" onClick={() => setIsTaskModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Task</button>
          </div>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={!!editTaskData} onClose={() => setEditTaskData(null)} title="Edit Task">
        {editTaskData && (
          <form onSubmit={handleEditTaskSubmit}>
            <div className="form-group">
              <label>Task Title</label>
              <input type="text" className="form-control" required value={editTaskData.title} onChange={e => setEditTaskData({...editTaskData, title: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Instructions / Description</label>
              <textarea className="form-control" rows="3" value={editTaskData.description || ''} onChange={e => setEditTaskData({...editTaskData, description: e.target.value})}></textarea>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" className="form-control" required value={editTaskData.dueDate} onChange={e => setEditTaskData({...editTaskData, dueDate: e.target.value})} />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn" onClick={() => setEditTaskData(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Update Task</button>
            </div>
          </form>
        )}
      </Modal>

      {/* View Patient Modal */}
      <Modal isOpen={!!viewingPatient} onClose={() => setViewingPatient(null)} title={viewingPatient ? viewingPatient.name : 'Patient Details'}>
        {viewingPatient && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Demographics & Contact</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>DOB:</span> {viewingPatient.birthDate}</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Gender:</span> {viewingPatient.gender}</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Phone:</span> {viewingPatient.phone}</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Email:</span> {viewingPatient.email}</div>
                <div style={{ gridColumn: 'span 2' }}><span style={{ color: 'var(--text-secondary)' }}>Address:</span> {viewingPatient.address}</div>
                <div style={{ gridColumn: 'span 2' }}><span style={{ color: 'var(--text-secondary)' }}>Emergency:</span> <span className="badge warning">{viewingPatient.emergencyContact}</span></div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Medical History</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>Conditions:</span> <span className="badge primary">{viewingPatient.condition}</span></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Allergies:</span> {viewingPatient.allergies}</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Medications:</span> {viewingPatient.currentMeds}</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Physician:</span> {viewingPatient.physicianContact}</div>
              </div>
            </div>

            <div>
              <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Dental History Log</h4>
              {viewingPatient.dentalHistory && viewingPatient.dentalHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {viewingPatient.dentalHistory.map((visit, index) => (
                    <div key={index} style={{ backgroundColor: 'var(--bg-base)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <strong>{visit.service}</strong>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{visit.date}</span>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{visit.notes}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>No dental history recorded.</div>
              )}
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-primary" onClick={() => setViewingPatient(null)}>Close</button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
