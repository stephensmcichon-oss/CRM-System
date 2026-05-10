import React, { useState, useEffect } from 'react';
import { Mail, Phone, MoreHorizontal, Plus, Search, Download, Edit2, Trash2 } from 'lucide-react';
import Modal from './Modal';
import { API_BASE_URL } from '../config';

export default function ClientDatabase() {
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', status: 'Active' });
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/clients`)
      .then(res => res.json())
      .then(data => setClients(data))
      .catch(err => console.error(err));
  }, []);

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/api/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(newClient => {
      setClients([...clients, newClient]);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', status: 'Active' });
    })
    .catch(err => console.error(err));
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Status'];
    const rows = filteredClients.map(client => [
      `"${client.name}"`,
      `"${client.email}"`,
      `"${client.phone}"`,
      `"${client.status}"`
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'clients_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id) => {
    fetch(`${API_BASE_URL}/api/clients/${id}`, { method: 'DELETE' })
      .then(() => {
        setClients(clients.filter(c => c.id !== id));
        setActiveDropdownId(null);
      })
      .catch(err => console.error(err));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/api/clients/${editFormData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editFormData)
    })
    .then(res => res.json())
    .then(updatedClient => {
      setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
      setEditFormData(null);
    })
    .catch(err => console.error(err));
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Client Database</h1>
          <p className="page-subtitle">Manage all your contacts and leads.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" style={{ backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }} onClick={handleExportCSV}>
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <h2>All Contacts</h2>
          <div style={{ position: 'relative', flex: '1', maxWidth: '300px', marginLeft: 'auto' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 1rem 0.6rem 2.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-base)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact Info</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map(client => (
              <tr key={client.id}>
                <td style={{ fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', 
                      backgroundColor: 'var(--accent-primary-light)', color: 'var(--accent-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                    }}>
                      {client.name.charAt(0)}
                    </div>
                    {client.name}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <Mail size={14} style={{ color: 'var(--text-muted)' }} /> {client.email}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <Phone size={14} style={{ color: 'var(--text-muted)' }} /> {client.phone}
                    </span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${client.status === 'Active' ? 'success' : 'primary'}`}>
                    {client.status}
                  </span>
                </td>
                <td>
                  <div style={{ position: 'relative' }}>
                    <button 
                      className="btn" 
                      style={{ padding: '0.5rem', backgroundColor: activeDropdownId === client.id ? 'var(--bg-surface-hover)' : 'transparent', color: 'var(--text-muted)' }}
                      onClick={() => setActiveDropdownId(activeDropdownId === client.id ? null : client.id)}
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    {activeDropdownId === client.id && (
                      <div className="dropdown-menu">
                        <button 
                          className="dropdown-item" 
                          onClick={() => {
                            setEditFormData(client);
                            setActiveDropdownId(null);
                          }}
                        >
                          <Edit2 size={16} /> Edit
                        </button>
                        <button 
                          className="dropdown-item danger" 
                          onClick={() => handleDelete(client.id)}
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No clients found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Client">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-control" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="e.g. john@example.com" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="text" className="form-control" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="e.g. 555-0100" />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="Active">Active</option>
              <option value="Lead">Lead</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Client</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editFormData} onClose={() => setEditFormData(null)} title="Edit Client">
        {editFormData && (
          <form onSubmit={handleEditSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" className="form-control" required value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-control" required value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" className="form-control" required value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" value={editFormData.status} onChange={e => setEditFormData({...editFormData, status: e.target.value})}>
                <option value="Active">Active</option>
                <option value="Lead">Lead</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn" onClick={() => setEditFormData(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Update Client</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Floating Action Button for Add Client */}
      <button 
        className="fab-add" 
        onClick={() => setIsModalOpen(true)}
        title="Add New Client"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
