const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mock Data
let clients = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '555-0100', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '555-0101', status: 'Lead' }
];

let tasks = [
  { id: 1, title: 'Call John for follow-up', dueDate: '2026-05-10', completed: false },
  { id: 2, title: 'Send contract to Jane', dueDate: '2026-05-12', completed: false }
];

let patients = [
  { 
    id: 1, 
    name: 'Alice Walker', 
    birthDate: '1980-04-12',
    address: '123 Main St, Springfield',
    gender: 'Female',
    phone: '555-0199',
    email: 'alice@example.com',
    emergencyContact: 'John Walker (555-0198)',
    allergies: 'Penicillin',
    currentMeds: 'Lisinopril',
    condition: 'Hypertension', 
    physicianContact: 'Dr. Smith (555-0200)',
    dentalHistory: [
      { id: 1, date: '2026-04-20', service: 'Routine cleaning', notes: 'Fillings on #3, #14' }
    ]
  },
  { 
    id: 2, 
    name: 'Bob Harris', 
    birthDate: '1992-11-05',
    address: '456 Oak Ave, Shelbyville',
    gender: 'Male',
    phone: '555-0211',
    email: 'bob@example.com',
    emergencyContact: 'Mary Harris (555-0212)',
    allergies: 'None',
    currentMeds: 'Albuterol',
    condition: 'Asthma', 
    physicianContact: 'Dr. Jones (555-0205)',
    dentalHistory: [
      { id: 1, date: '2026-05-01', service: 'Toothache lower right', notes: 'Root canal #30' }
    ]
  }
];

let appointments = [
  { id: 1, patientId: 1, patientName: 'Alice Walker', date: '2026-05-15', time: '10:00 AM', reason: 'Routine Checkup' },
  { id: 2, patientId: 2, patientName: 'Bob Harris', date: '2026-05-16', time: '02:30 PM', reason: 'Follow-up' }
];

// --- Routes ---

// Dashboard Stats
app.get('/api/stats', (req, res) => {
  res.json({
    totalClients: clients.length,
    activeTasks: tasks.filter(t => !t.completed).length,
    upcomingAppointments: appointments.length
  });
});

// Clients
app.get('/api/clients', (req, res) => res.json(clients));
app.post('/api/clients', (req, res) => {
  const newClient = { id: Date.now(), ...req.body };
  clients.push(newClient);
  res.status(201).json(newClient);
});
app.put('/api/clients/:id', (req, res) => {
  const index = clients.findIndex(c => c.id === parseInt(req.params.id));
  if (index !== -1) {
    clients[index] = { ...clients[index], ...req.body };
    res.json(clients[index]);
  } else {
    res.status(404).json({ message: 'Client not found' });
  }
});
app.delete('/api/clients/:id', (req, res) => {
  clients = clients.filter(c => c.id !== parseInt(req.params.id));
  res.status(204).send();
});

// Tasks
app.get('/api/tasks', (req, res) => res.json(tasks));
app.post('/api/tasks', (req, res) => {
  const newTask = { id: Date.now(), completed: false, ...req.body };
  tasks.push(newTask);
  res.status(201).json(newTask);
});
app.post('/api/tasks/:id/complete', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (task) {
    task.completed = true;
    res.json(task);
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
});

// Healthcare - Patients
app.get('/api/patients', (req, res) => res.json(patients));
app.post('/api/patients', (req, res) => {
  const newPatient = { id: Date.now(), ...req.body };
  patients.push(newPatient);
  res.status(201).json(newPatient);
});
app.put('/api/patients/:id', (req, res) => {
  const index = patients.findIndex(p => p.id === parseInt(req.params.id));
  if (index !== -1) {
    patients[index] = { ...patients[index], ...req.body };
    res.json(patients[index]);
  } else {
    res.status(404).json({ message: 'Patient not found' });
  }
});

// Healthcare - Appointments
app.get('/api/appointments', (req, res) => res.json(appointments));
app.post('/api/appointments', (req, res) => {
  const newAppointment = { id: Date.now(), ...req.body };
  appointments.push(newAppointment);
  res.status(201).json(newAppointment);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
