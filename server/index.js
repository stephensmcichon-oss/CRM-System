require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schema Transform (replaces _id with id for React frontend)
const schemaOptions = {
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
};

// --- Mongoose Models ---

const ActivityLogSchema = new mongoose.Schema({
  action: String,
  entity: String,
  details: String,
  timestamp: { type: Date, default: Date.now }
}, schemaOptions);
const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);

const logActivity = async (action, entity, details) => {
  try {
    await ActivityLog.create({ action, entity, details });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};

const ClientSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  status: String
}, schemaOptions);
const Client = mongoose.model('Client', ClientSchema);

const TaskSchema = new mongoose.Schema({
  title: String,
  dueDate: String,
  completed: { type: Boolean, default: false }
}, schemaOptions);
const Task = mongoose.model('Task', TaskSchema);

const DentalHistorySchema = new mongoose.Schema({
  date: String,
  service: String,
  notes: String
}, schemaOptions);

const PatientSchema = new mongoose.Schema({
  name: String,
  birthDate: String,
  address: String,
  gender: String,
  phone: String,
  email: String,
  emergencyContact: String,
  allergies: String,
  currentMeds: String,
  condition: String,
  physicianContact: String,
  dentalHistory: [DentalHistorySchema]
}, schemaOptions);
const Patient = mongoose.model('Patient', PatientSchema);

const AppointmentSchema = new mongoose.Schema({
  patientId: String,
  patientName: String,
  date: String,
  time: String,
  reason: String
}, schemaOptions);
const Appointment = mongoose.model('Appointment', AppointmentSchema);

// --- Routes ---

// Logs
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard Stats
app.get('/api/stats', async (req, res) => {
  try {
    const totalClients = await Client.countDocuments();
    const activeTasks = await Task.countDocuments({ completed: false });
    const upcomingAppointments = await Appointment.countDocuments();
    
    res.json({ totalClients, activeTasks, upcomingAppointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clients
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/clients', async (req, res) => {
  try {
    const newClient = await Client.create(req.body);
    await logActivity('CREATE', 'Client', `Added new client: ${newClient.name}`);
    res.status(201).json(newClient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put('/api/clients/:id', async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedClient) {
      await logActivity('UPDATE', 'Client', `Updated client details for: ${updatedClient.name}`);
    }
    res.json(updatedClient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (client) {
      await logActivity('DELETE', 'Client', `Deleted client: ${client.name}`);
      await Client.findByIdAndDelete(req.params.id);
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/tasks', async (req, res) => {
  try {
    const newTask = await Task.create({ ...req.body, completed: false });
    await logActivity('CREATE', 'Task', `Added new task: ${newTask.title}`);
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/tasks/:id/complete', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { completed: true }, { new: true });
    if (task) {
      await logActivity('UPDATE', 'Task', `Completed task: ${task.title}`);
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedTask) {
      await logActivity('UPDATE', 'Task', `Edited task details: ${updatedTask.title}`);
    }
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task) {
      await logActivity('DELETE', 'Task', `Deleted task: ${task.title}`);
      await Task.findByIdAndDelete(req.params.id);
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Healthcare - Patients
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/patients', async (req, res) => {
  try {
    const newPatient = await Patient.create(req.body);
    await logActivity('CREATE', 'Patient', `Added new patient record for: ${newPatient.name}`);
    res.status(201).json(newPatient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put('/api/patients/:id', async (req, res) => {
  try {
    const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedPatient) {
      await logActivity('UPDATE', 'Patient', `Updated medical/dental records for: ${updatedPatient.name}`);
    }
    res.json(updatedPatient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Healthcare - Appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/appointments', async (req, res) => {
  try {
    const newAppointment = await Appointment.create(req.body);
    await logActivity('CREATE', 'Appointment', `Scheduled appointment for ${newAppointment.patientName} on ${newAppointment.date}`);
    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
