import React, { useState, useEffect } from 'react';
import { ActivitySquare, Calendar as CalendarIcon, Clock, Users, Plus, Eye, Trash2, MoreHorizontal, Edit2, XCircle, UserX } from 'lucide-react';
import Modal from './Modal';
import { API_BASE_URL } from '../config';

export default function HealthcareModule() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [isEditingPatient, setIsEditingPatient] = useState(false);

  const [patientData, setPatientData] = useState({ 
    name: '', birthDate: '', address: '', gender: 'Female',
    phone: '', email: '', emergencyContact: '',
    allergies: 'None', currentMeds: 'None', condition: '', physicianContact: '',
    dentalHistory: []
  });

  const [newVisitData, setNewVisitData] = useState({ date: new Date().toISOString().split('T')[0], service: '', notes: '' });
  const [initialVisitData, setInitialVisitData] = useState({ date: new Date().toISOString().split('T')[0], service: '', notes: '' });
  
  const [isAptModalOpen, setIsAptModalOpen] = useState(false);
  const [aptData, setAptData] = useState({ patientName: '', date: '', time: '', reason: '', status: 'Scheduled' });

  const [activeAptDropdownId, setActiveAptDropdownId] = useState(null);
  const [editAptData, setEditAptData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/patients`)
      .then(res => res.json())
      .then(data => setPatients(data))
      .catch(err => console.error(err));

    fetch(`${API_BASE_URL}/api/appointments`)
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => console.error(err));
  }, []);

  const handleCreatePatient = (e) => {
    e.preventDefault();
    const history = initialVisitData.service ? [{ id: Date.now(), ...initialVisitData }] : [];
    const payload = { ...patientData, dentalHistory: history };

    fetch(`${API_BASE_URL}/api/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(newPatient => {
      setPatients([...patients, newPatient]);
      setIsPatientModalOpen(false);
      setPatientData({ 
        name: '', birthDate: '', address: '', gender: 'Female',
        phone: '', email: '', emergencyContact: '',
        allergies: 'None', currentMeds: 'None', condition: '', physicianContact: '',
        dentalHistory: []
      });
      setInitialVisitData({ date: new Date().toISOString().split('T')[0], service: '', notes: '' });
    })
    .catch(err => console.error(err));
  };

  const handleUpdatePatient = (e) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/api/patients/${viewingPatient.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(viewingPatient)
    })
    .then(res => res.json())
    .then(updatedPatient => {
      setPatients(patients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
      setIsEditingPatient(false);
    })
    .catch(err => console.error(err));
  };

  const handleAddVisitToEdit = () => {
    if (!newVisitData.service) return;
    setViewingPatient({
      ...viewingPatient,
      dentalHistory: [...(viewingPatient.dentalHistory || []), { id: Date.now(), ...newVisitData }]
    });
    setNewVisitData({ date: new Date().toISOString().split('T')[0], service: '', notes: '' });
  };

  const handleRemoveVisitFromEdit = (visitId) => {
    setViewingPatient({
      ...viewingPatient,
      dentalHistory: viewingPatient.dentalHistory.filter(v => v.id !== visitId)
    });
  };

  const handleScheduleApt = (e) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...aptData, status: 'Scheduled' })
    })
    .then(res => res.json())
    .then(newApt => {
      setAppointments([...appointments, newApt]);
      setIsAptModalOpen(false);
      setAptData({ patientName: '', date: '', time: '', reason: '', status: 'Scheduled' });
    })
    .catch(err => console.error(err));
  };

  const handleUpdateAppointmentStatus = (id, newStatus) => {
    fetch(`${API_BASE_URL}/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    .then(res => res.json())
    .then(updatedApt => {
      setAppointments(appointments.map(a => a.id === id ? updatedApt : a));
      setActiveAptDropdownId(null);
    })
    .catch(err => console.error(err));
  };

  const handleDeleteAppointment = (id) => {
    fetch(`${API_BASE_URL}/api/appointments/${id}`, { method: 'DELETE' })
      .then(() => {
        setAppointments(appointments.filter(a => a.id !== id));
        setActiveAptDropdownId(null);
      })
      .catch(err => console.error(err));
  };

  const handleEditAptSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/api/appointments/${editAptData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editAptData)
    })
    .then(res => res.json())
    .then(updatedApt => {
      setAppointments(appointments.map(a => a.id === updatedApt.id ? updatedApt : a));
      setEditAptData(null);
    })
    .catch(err => console.error(err));
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Healthcare Module</h1>
          <p className="page-subtitle">Patient records and appointments management.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" style={{ backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }} onClick={() => setIsAptModalOpen(true)}>
            <CalendarIcon size={18} /> Schedule
          </button>
          <button className="btn btn-primary" onClick={() => setIsPatientModalOpen(true)}>
            <Plus size={18} /> New Patient
          </button>
        </div>
      </div>

      <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        
        {/* Appointments Section */}
        <div className="table-container">
          <div className="table-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} className="text-primary" /> Upcoming Appointments
            </h2>
          </div>
          <table style={{ minWidth: '500px' }}>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date & Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(apt => (
                <tr key={apt.id}>
                  <td style={{ fontWeight: 500 }}>{apt.patientName}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.9rem' }}>{apt.date}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{apt.time}</span>
                    </div>
                  </td>
                  <td><span className="badge primary">{apt.reason}</span></td>
                  <td>
                    <span className={`badge ${!apt.status || apt.status === 'Scheduled' ? 'success' : apt.status === 'Canceled' ? 'neutral' : 'danger'}`}>
                      {apt.status || 'Scheduled'}
                    </span>
                  </td>
                  <td>
                    <div style={{ position: 'relative' }}>
                      <button 
                        className="btn" 
                        style={{ padding: '0.5rem', backgroundColor: activeAptDropdownId === apt.id ? 'var(--bg-surface-hover)' : 'transparent', color: 'var(--text-muted)' }}
                        onClick={() => setActiveAptDropdownId(activeAptDropdownId === apt.id ? null : apt.id)}
                      >
                        <MoreHorizontal size={20} />
                      </button>
                      {activeAptDropdownId === apt.id && (
                        <div className="dropdown-menu">
                          <button className="dropdown-item" onClick={() => { setEditAptData(apt); setActiveAptDropdownId(null); }}>
                            <Edit2 size={16} /> Edit
                          </button>
                          {apt.status !== 'Canceled' && (
                            <button className="dropdown-item" onClick={() => handleUpdateAppointmentStatus(apt.id, 'Canceled')}>
                              <XCircle size={16} /> Mark Canceled
                            </button>
                          )}
                          {apt.status !== 'No Show' && (
                            <button className="dropdown-item" style={{ color: 'var(--danger)' }} onClick={() => handleUpdateAppointmentStatus(apt.id, 'No Show')}>
                              <UserX size={16} /> Mark No-Show
                            </button>
                          )}
                          {apt.status !== 'Scheduled' && (
                            <button className="dropdown-item" style={{ color: 'var(--success)' }} onClick={() => handleUpdateAppointmentStatus(apt.id, 'Scheduled')}>
                              <Clock size={16} /> Mark Scheduled
                            </button>
                          )}
                          <button className="dropdown-item danger" onClick={() => handleDeleteAppointment(apt.id)}>
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No appointments scheduled.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Patients Section */}
        <div className="table-container">
          <div className="table-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} className="text-success" /> Patient Directory
            </h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Last Visit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(patient => {
                const lastVisit = patient.dentalHistory && patient.dentalHistory.length > 0 
                  ? patient.dentalHistory[patient.dentalHistory.length - 1].date 
                  : 'No visits';
                return (
                  <tr key={patient.id}>
                    <td style={{ fontWeight: 500 }}>{patient.name}</td>
                    <td style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{patient.phone}</td>
                    <td>{lastVisit}</td>
                    <td>
                      <button className="btn" style={{ padding: '0.4rem 0.6rem', backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }} onClick={() => { setViewingPatient(patient); setIsEditingPatient(false); setNewVisitData({ date: new Date().toISOString().split('T')[0], service: '', notes: '' }); }}>
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add New Patient Modal */}
      <Modal isOpen={isPatientModalOpen} onClose={() => setIsPatientModalOpen(false)} title="Add New Patient">
        <form onSubmit={handleCreatePatient}>
          
          <h4 style={{ marginBottom: '1rem', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Demographics</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" className="form-control" required value={patientData.name} onChange={e => setPatientData({...patientData, name: e.target.value})} placeholder="e.g. Alice Walker" />
            </div>
            <div className="form-group">
              <label>Birth Date</label>
              <input type="date" className="form-control" required value={patientData.birthDate} onChange={e => setPatientData({...patientData, birthDate: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select className="form-control" value={patientData.gender} onChange={e => setPatientData({...patientData, gender: e.target.value})}>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Address</label>
              <input type="text" className="form-control" required value={patientData.address} onChange={e => setPatientData({...patientData, address: e.target.value})} placeholder="e.g. 123 Main St" />
            </div>
          </div>

          <h4 style={{ margin: '1.5rem 0 1rem', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Contact Info</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" className="form-control" required value={patientData.phone} onChange={e => setPatientData({...patientData, phone: e.target.value})} placeholder="e.g. 555-0199" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-control" required value={patientData.email} onChange={e => setPatientData({...patientData, email: e.target.value})} placeholder="e.g. alice@example.com" />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Emergency Contact</label>
              <input type="text" className="form-control" required value={patientData.emergencyContact} onChange={e => setPatientData({...patientData, emergencyContact: e.target.value})} placeholder="e.g. John Walker (555-0198)" />
            </div>
          </div>

          <h4 style={{ margin: '1.5rem 0 1rem', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Medical History</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Medical Conditions</label>
              <input type="text" className="form-control" required value={patientData.condition} onChange={e => setPatientData({...patientData, condition: e.target.value})} placeholder="e.g. Hypertension" />
            </div>
            <div className="form-group">
              <label>Allergies</label>
              <input type="text" className="form-control" required value={patientData.allergies} onChange={e => setPatientData({...patientData, allergies: e.target.value})} placeholder="e.g. Penicillin" />
            </div>
            <div className="form-group">
              <label>Current Medications</label>
              <input type="text" className="form-control" required value={patientData.currentMeds} onChange={e => setPatientData({...patientData, currentMeds: e.target.value})} placeholder="e.g. Lisinopril" />
            </div>
            <div className="form-group">
              <label>Physician Contact</label>
              <input type="text" className="form-control" required value={patientData.physicianContact} onChange={e => setPatientData({...patientData, physicianContact: e.target.value})} placeholder="e.g. Dr. Smith (555-0200)" />
            </div>
          </div>

          <h4 style={{ margin: '1.5rem 0 1rem', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Initial Visit (Optional)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Date</label>
              <input type="date" className="form-control" value={initialVisitData.date} onChange={e => setInitialVisitData({...initialVisitData, date: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Service</label>
              <input type="text" className="form-control" value={initialVisitData.service} onChange={e => setInitialVisitData({...initialVisitData, service: e.target.value})} placeholder="e.g. Routine cleaning" />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Notes / Previous Records</label>
              <input type="text" className="form-control" value={initialVisitData.notes} onChange={e => setInitialVisitData({...initialVisitData, notes: e.target.value})} placeholder="e.g. Fillings on #3" />
            </div>
          </div>

          <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn" onClick={() => setIsPatientModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Patient</button>
          </div>
        </form>
      </Modal>

      {/* View/Edit Details Modal */}
      <Modal isOpen={!!viewingPatient} onClose={() => { setViewingPatient(null); setIsEditingPatient(false); }} title={isEditingPatient ? "Edit Patient Details" : "Patient Details"}>
        {/* Read-Only View */}
        {viewingPatient && !isEditingPatient && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '0.95rem' }}>
            
            <div>
              <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Demographics</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>Name:</span> {viewingPatient.name}</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>DOB:</span> {viewingPatient.birthDate}</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Gender:</span> {viewingPatient.gender}</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Address:</span> {viewingPatient.address}</div>
              </div>
            </div>

            <div>
              <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Contact Info</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>Phone:</span> {viewingPatient.phone}</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Email:</span> {viewingPatient.email}</div>
                <div style={{ gridColumn: 'span 2' }}><span style={{ color: 'var(--text-secondary)' }}>Emergency Contact:</span> {viewingPatient.emergencyContact}</div>
              </div>
            </div>

            <div>
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

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <button type="button" className="btn" style={{ backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }} onClick={() => setIsEditingPatient(true)}>Edit & Add History</button>
              <button type="button" className="btn btn-primary" onClick={() => { setViewingPatient(null); setIsEditingPatient(false); }}>Close</button>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {viewingPatient && isEditingPatient && (
          <form onSubmit={handleUpdatePatient}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Demographics</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-control" required value={viewingPatient.name} onChange={e => setViewingPatient({...viewingPatient, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Birth Date</label>
                <input type="date" className="form-control" required value={viewingPatient.birthDate} onChange={e => setViewingPatient({...viewingPatient, birthDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select className="form-control" value={viewingPatient.gender} onChange={e => setViewingPatient({...viewingPatient, gender: e.target.value})}>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" className="form-control" required value={viewingPatient.address} onChange={e => setViewingPatient({...viewingPatient, address: e.target.value})} />
              </div>
            </div>

            <h4 style={{ margin: '1.5rem 0 1rem', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Contact Info</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" className="form-control" required value={viewingPatient.phone} onChange={e => setViewingPatient({...viewingPatient, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" required value={viewingPatient.email} onChange={e => setViewingPatient({...viewingPatient, email: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Emergency Contact</label>
                <input type="text" className="form-control" required value={viewingPatient.emergencyContact} onChange={e => setViewingPatient({...viewingPatient, emergencyContact: e.target.value})} />
              </div>
            </div>

            <h4 style={{ margin: '1.5rem 0 1rem', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Medical History</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Medical Conditions</label>
                <input type="text" className="form-control" required value={viewingPatient.condition} onChange={e => setViewingPatient({...viewingPatient, condition: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Allergies</label>
                <input type="text" className="form-control" required value={viewingPatient.allergies} onChange={e => setViewingPatient({...viewingPatient, allergies: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Current Medications</label>
                <input type="text" className="form-control" required value={viewingPatient.currentMeds} onChange={e => setViewingPatient({...viewingPatient, currentMeds: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Physician Contact</label>
                <input type="text" className="form-control" required value={viewingPatient.physicianContact} onChange={e => setViewingPatient({...viewingPatient, physicianContact: e.target.value})} />
              </div>
            </div>

            <h4 style={{ margin: '1.5rem 0 1rem', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Dental History Log</h4>
            
            {/* Show existing history */}
            {viewingPatient.dentalHistory && viewingPatient.dentalHistory.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {viewingPatient.dentalHistory.map(visit => (
                  <div key={visit.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-base)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <strong>{visit.service}</strong> <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>({visit.date})</span>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{visit.notes}</div>
                    </div>
                    <button type="button" className="btn" style={{ padding: '0.4rem', color: 'var(--danger)', backgroundColor: 'transparent' }} onClick={() => handleRemoveVisitFromEdit(visit.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add New Visit Sub-form */}
            <div style={{ backgroundColor: 'var(--accent-primary-light)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <h5 style={{ marginBottom: '0.75rem', color: 'var(--accent-primary)' }}>+ Log New Visit Record</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" className="form-control" style={{ backgroundColor: 'var(--bg-surface)' }} value={newVisitData.date} onChange={e => setNewVisitData({...newVisitData, date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Service Rendered</label>
                  <input type="text" className="form-control" style={{ backgroundColor: 'var(--bg-surface)' }} value={newVisitData.service} onChange={e => setNewVisitData({...newVisitData, service: e.target.value})} placeholder="e.g. Tooth Extraction" />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Notes</label>
                  <input type="text" className="form-control" style={{ backgroundColor: 'var(--bg-surface)' }} value={newVisitData.notes} onChange={e => setNewVisitData({...newVisitData, notes: e.target.value})} placeholder="e.g. Extracted #14, no complications" />
                </div>
              </div>
              <button type="button" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%' }} onClick={handleAddVisitToEdit}>
                Add to Record
              </button>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn" onClick={() => setIsEditingPatient(false)}>Cancel Edit</button>
              <button type="submit" className="btn btn-primary">Save All Changes</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Schedule Appointment Modal */}
      <Modal isOpen={isAptModalOpen} onClose={() => setIsAptModalOpen(false)} title="Schedule Appointment">
        <form onSubmit={handleScheduleApt}>
          <div className="form-group">
            <label>Patient Name</label>
            <input type="text" className="form-control" required value={aptData.patientName} onChange={e => setAptData({...aptData, patientName: e.target.value})} placeholder="e.g. Bob Harris" />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" className="form-control" required value={aptData.date} onChange={e => setAptData({...aptData, date: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input type="time" className="form-control" required value={aptData.time} onChange={e => setAptData({...aptData, time: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Reason</label>
            <input type="text" className="form-control" required value={aptData.reason} onChange={e => setAptData({...aptData, reason: e.target.value})} placeholder="e.g. Routine Checkup" />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn" onClick={() => setIsAptModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Schedule</button>
          </div>
        </form>
      </Modal>

      {/* Edit Appointment Modal */}
      <Modal isOpen={!!editAptData} onClose={() => setEditAptData(null)} title="Edit Appointment">
        {editAptData && (
          <form onSubmit={handleEditAptSubmit}>
            <div className="form-group">
              <label>Patient Name</label>
              <input type="text" className="form-control" required value={editAptData.patientName} onChange={e => setEditAptData({...editAptData, patientName: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" className="form-control" required value={editAptData.date} onChange={e => setEditAptData({...editAptData, date: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input type="time" className="form-control" required value={editAptData.time} onChange={e => setEditAptData({...editAptData, time: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Reason</label>
              <input type="text" className="form-control" required value={editAptData.reason} onChange={e => setEditAptData({...editAptData, reason: e.target.value})} />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn" onClick={() => setEditAptData(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Update Appointment</button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
}
