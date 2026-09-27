const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'clinic_db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Database Template with realistic Indian Demo Data
const initialDB = {
  clinic: {
    name: "SIDRA MOTION CLINIC DEMO",
    tagline: "Excellence in Motion & Healthcare",
    phone: "+91 98765 43210",
    email: "info@sidramotionclinic.com",
    address: "Suite 402, Motion Healthcare Center, Gomti Nagar, Lucknow, UP - 226010",
    doctorName: "Dr. A. K. Sharma (MD, MBBS)",
    consultationFee: 500
  },
  tokenSequence: 300,
  users: [
    {
      id: "u_assistant_1",
      name: "Pooja Verma",
      role: "ASSISTANT",
      email: "assistant@sidramotion.com",
      username: "assistant",
      password: "password123",
      pin: "1234"
    },
    {
      id: "u_doctor_1",
      name: "Dr. A. K. Sharma",
      role: "DOCTOR",
      email: "doctor@sidramotion.com",
      username: "doctor",
      password: "password123",
      pin: "9999"
    },
    {
      id: "u_medical_1",
      name: "Ramesh Pharmacy",
      role: "MEDICAL",
      email: "medical@sidramotion.com",
      username: "medical",
      password: "password123",
      pin: "5678"
    }
  ],
  patients: [
    {
      id: "SMC-P301",
      fullName: "Rajesh Kumar Srivastava",
      age: 42,
      gender: "Male",
      whatsapp: "+91 98765 12345",
      address: "Aliganj Sector B, Lucknow",
      bloodGroup: "B+",
      weight: 74,
      createdAt: new Date().toISOString()
    },
    {
      id: "SMC-P302",
      fullName: "Ananya Gupta",
      age: 28,
      gender: "Female",
      whatsapp: "+91 98390 54321",
      address: "Indira Nagar, Block C, Lucknow",
      bloodGroup: "O+",
      weight: 56,
      createdAt: new Date().toISOString()
    },
    {
      id: "SMC-P303",
      fullName: "Mohammad Farhan",
      age: 35,
      gender: "Male",
      whatsapp: "+91 94150 99887",
      address: "Chowk Heritage Zone, Lucknow",
      bloodGroup: "A+",
      weight: 68,
      createdAt: new Date().toISOString()
    },
    {
      id: "SMC-P304",
      fullName: "Sunita Devi",
      age: 55,
      gender: "Female",
      whatsapp: "+91 91234 56780",
      address: "Gomti Nagar Extension, Lucknow",
      bloodGroup: "AB+",
      weight: 62,
      createdAt: new Date().toISOString()
    }
  ],
  visits: [
    {
      id: "v_300",
      tokenNumber: 300,
      parchaCode: "PARCHA NO. 300",
      patientId: "SMC-P301",
      patientName: "Rajesh Kumar Srivastava",
      age: 42,
      gender: "Male",
      whatsapp: "+91 98765 12345",
      address: "Aliganj Sector B, Lucknow",
      bloodGroup: "B+",
      weight: 74,
      chiefComplaint: "Severe fever and body ache since 2 days",
      status: "WAITING",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      calledAt: null,
      acknowledgedAt: null,
      consultationStartedAt: null,
      completedAt: null
    },
    {
      id: "v_301",
      tokenNumber: 301,
      parchaCode: "PARCHA NO. 301",
      patientId: "SMC-P302",
      patientName: "Ananya Gupta",
      age: 28,
      gender: "Female",
      whatsapp: "+91 98390 54321",
      address: "Indira Nagar, Block C, Lucknow",
      bloodGroup: "O+",
      weight: 56,
      chiefComplaint: "Migraine headache and nausea",
      status: "WAITING",
      createdAt: new Date(Date.now() - 2400000).toISOString(),
      calledAt: null,
      acknowledgedAt: null,
      consultationStartedAt: null,
      completedAt: null
    },
    {
      id: "v_302",
      tokenNumber: 302,
      parchaCode: "PARCHA NO. 302",
      patientId: "SMC-P303",
      patientName: "Mohammad Farhan",
      age: 35,
      gender: "Male",
      whatsapp: "+91 94150 99887",
      address: "Chowk Heritage Zone, Lucknow",
      bloodGroup: "A+",
      weight: 68,
      chiefComplaint: "Knee pain during climbing stairs",
      status: "WAITING",
      createdAt: new Date(Date.now() - 1200000).toISOString(),
      calledAt: null,
      acknowledgedAt: null,
      consultationStartedAt: null,
      completedAt: null
    }
  ],
  inventory: [
    {
      id: "med_1",
      name: "Paracetamol 650 mg (Dolo)",
      generic: "Paracetamol",
      brand: "Dolo 650",
      strength: "650 mg",
      form: "Tablet",
      batch: "DL-8821",
      expiry: "2027-11-30",
      purchasePrice: 18.00,
      sellingPrice: 32.50,
      stock: 350,
      minStock: 50,
      supplier: "Micro Labs Ltd"
    },
    {
      id: "med_2",
      name: "Paracetamol 500 mg (Crocin)",
      generic: "Paracetamol",
      brand: "Crocin",
      strength: "500 mg",
      form: "Tablet",
      batch: "CR-4102",
      expiry: "2027-08-15",
      purchasePrice: 12.00,
      sellingPrice: 22.00,
      stock: 220,
      minStock: 40,
      supplier: "GSK Consumer"
    },
    {
      id: "med_3",
      name: "Amoxicillin & Potassium Clavulanate (Augmentin 625 Duo)",
      generic: "Amoxicillin + Clavulanate",
      brand: "Augmentin",
      strength: "625 mg",
      form: "Tablet",
      batch: "AG-9023",
      expiry: "2026-12-31",
      purchasePrice: 110.00,
      sellingPrice: 168.00,
      stock: 95,
      minStock: 25,
      supplier: "GlaxoSmithKline"
    },
    {
      id: "med_4",
      name: "Pantoprazole 40 mg (Pan 40)",
      generic: "Pantoprazole",
      brand: "Pan 40",
      strength: "40 mg",
      form: "Tablet",
      batch: "PN-3310",
      expiry: "2028-02-28",
      purchasePrice: 65.00,
      sellingPrice: 98.00,
      stock: 180,
      minStock: 30,
      supplier: "Alkem Laboratories"
    },
    {
      id: "med_5",
      name: "Cetirizine 10 mg (Cetzine)",
      generic: "Cetirizine Hydrochloride",
      brand: "Cetzine",
      strength: "10 mg",
      form: "Tablet",
      batch: "CT-1944",
      expiry: "2027-05-10",
      purchasePrice: 15.00,
      sellingPrice: 28.00,
      stock: 14,
      minStock: 30, // Low stock demo
      supplier: "Dr. Reddy's Lab"
    },
    {
      id: "med_6",
      name: "Aceclofenac + Paracetamol (Zerodol-P)",
      generic: "Aceclofenac + Paracetamol",
      brand: "Zerodol-P",
      strength: "100mg / 325mg",
      form: "Tablet",
      batch: "ZD-7762",
      expiry: "2026-10-15", // Expiring soon demo
      purchasePrice: 42.00,
      sellingPrice: 68.00,
      stock: 110,
      minStock: 20,
      supplier: "Ipca Laboratories"
    }
  ],
  prescriptions: [],
  bills: [],
  auditLogs: [
    {
      id: "log_1",
      timestamp: new Date().toISOString(),
      user: "System Initializer",
      role: "SYSTEM",
      action: "Clinic Initialized with Parcha token sequence starting at 300",
      recordId: "v_300",
      platform: "Central Backend"
    }
  ],
  notifications: []
};

// Database persistence helper
function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf-8');
      return initialDB;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error loading DB, restoring initial data:', err);
    return initialDB;
  }
}

function saveDB(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

// Global in-memory DB backed by file
let db = loadDB();

// Sync Token sequence to ensure it starts at 300 or current max
const maxToken = db.visits.reduce((max, v) => (v.tokenNumber > max ? v.tokenNumber : max), 299);
db.tokenSequence = Math.max(db.tokenSequence || 300, maxToken + 1);
saveDB(db);

// WebSocket Broadcast Helper
function broadcast(event, payload) {
  const message = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Audit Logger
function logAudit(user, role, action, recordId, platform = "Web") {
  const log = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    user: user || "Anonymous",
    role: role || "UNKNOWN",
    action,
    recordId: recordId || null,
    platform
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 500) db.auditLogs.pop();
  saveDB(db);
  broadcast('AUDIT_LOG_ADDED', log);
}

// Authentication & RBAC Middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const token = authHeader.replace('Bearer ', '');
  const user = db.users.find(u => u.id === token || u.username === token);
  if (!user) {
    return res.status(403).json({ error: "Invalid credentials" });
  }
  req.user = user;
  next();
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    // Doctor can access all modules (Doctor, Assistant, Medical)
    if (req.user.role === 'DOCTOR') {
      return next();
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Permission denied. Role '${req.user.role}' cannot access this resource.`
      });
    }
    next();
  };
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// 1. Auth Login
app.post('/api/auth/login', (req, res) => {
  const { username, password, pin, platform } = req.body;
  const user = db.users.find(u =>
    (u.username === username || u.email === username) &&
    (u.password === password || (pin && u.pin === pin))
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid username/email or password/PIN" });
  }

  logAudit(user.name, user.role, `Logged in via ${platform || 'App'}`, user.id, platform || 'Web');

  res.json({
    token: user.id,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      username: user.username
    },
    clinic: db.clinic
  });
});

// Clinic Info
app.get('/api/clinic/info', (req, res) => {
  res.json({ clinic: db.clinic });
});

// 2. Queue & Visits (Assistant + Doctor + Medical)
app.get('/api/visits', (req, res) => {
  // Returns visits for today
  res.json(db.visits);
});

// Assistant Dashboard Stats
app.get('/api/assistant/stats', (req, res) => {
  const total = db.visits.length;
  const waiting = db.visits.filter(v => v.status === 'WAITING').length;
  const called = db.visits.filter(v => v.status === 'CALLED').length;
  const withDoctor = db.visits.filter(v => v.status === 'WITH DOCTOR').length;
  const completed = db.visits.filter(v => v.status === 'COMPLETED').length;
  const noShow = db.visits.filter(v => v.status === 'NO SHOW').length;

  res.json({
    totalPatients: total,
    waitingPatients: waiting,
    calledPatients: called,
    withDoctorPatients: withDoctor,
    completedPatients: completed,
    noShowPatients: noShow,
    nextParchaNumber: db.tokenSequence
  });
});

// Duplicate Patient Check (Search by Phone or Name)
app.get('/api/patients/check-duplicate', (req, res) => {
  const { phone, name } = req.query;
  if (!phone && !name) {
    return res.json({ duplicates: [] });
  }

  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '').slice(-10) : '';
  const searchName = name ? name.trim().toLowerCase() : '';

  const duplicates = db.patients.filter(p => {
    const pPhone = (p.whatsapp || '').replace(/[^0-9]/g, '').slice(-10);
    const pName = (p.fullName || '').toLowerCase();

    const phoneMatch = cleanPhone && pPhone && (pPhone === cleanPhone || pPhone.includes(cleanPhone));
    const nameMatch = searchName && pName && (pName.includes(searchName) || searchName.includes(pName));

    return phoneMatch || nameMatch;
  });

  res.json({ duplicates });
});

// Search Patients
app.get('/api/patients/search', (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  if (!q) {
    return res.json(db.patients);
  }

  const results = db.patients.filter(p => {
    const pId = (p.id || '').toLowerCase();
    const name = (p.fullName || '').toLowerCase();
    const phone = (p.whatsapp || '').replace(/[^0-9]/g, '');
    const cleanQ = q.replace(/[^0-9]/g, '');

    return pId.includes(q) ||
           name.includes(q) ||
           (cleanQ && phone.includes(cleanQ));
  });

  res.json(results);
});

// 3. Register Patient & Create Visit ("SAVE & SEND TO DOCTOR")
app.post('/api/assistant/register-and-send', authenticate, requireRole(['ASSISTANT', 'DOCTOR']), (req, res) => {
  const {
    isExisting,
    existingPatientId,
    fullName,
    age,
    gender,
    whatsapp,
    address,
    bloodGroup,
    weight,
    chiefComplaint,
    platform
  } = req.body;

  let patient = null;

  if (isExisting && existingPatientId) {
    patient = db.patients.find(p => p.id === existingPatientId);
  }

  if (!patient) {
    if (!fullName || !whatsapp) {
      return res.status(400).json({ error: "Full Name and WhatsApp Phone Number are required." });
    }

    const patientCount = db.patients.length + 1;
    const newPatientId = `SMC-P${300 + patientCount}`;

    patient = {
      id: newPatientId,
      fullName: fullName.trim(),
      age: Number(age) || 0,
      gender: gender || "Other",
      whatsapp: whatsapp.trim(),
      address: address ? address.trim() : "",
      bloodGroup: bloodGroup || "Unknown",
      weight: Number(weight) || 0,
      createdAt: new Date().toISOString()
    };
    db.patients.push(patient);
  } else {
    // Optionally update weight/complaint
    if (weight) patient.weight = Number(weight);
  }

  // Atomic Token / Parcha Number generation starting at 300
  const tokenNumber = db.tokenSequence;
  db.tokenSequence += 1; // Increment for the next one

  const newVisit = {
    id: 'v_' + tokenNumber + '_' + Date.now().toString(36),
    tokenNumber: tokenNumber,
    parchaCode: `PARCHA NO. ${tokenNumber}`,
    patientId: patient.id,
    patientName: patient.fullName,
    age: patient.age,
    gender: patient.gender,
    whatsapp: patient.whatsapp,
    address: patient.address,
    bloodGroup: patient.bloodGroup,
    weight: patient.weight,
    chiefComplaint: chiefComplaint ? chiefComplaint.trim() : "General Consultation",
    status: "WAITING",
    createdAt: new Date().toISOString(),
    calledAt: null,
    acknowledgedAt: null,
    consultationStartedAt: null,
    completedAt: null
  };

  db.visits.unshift(newVisit);
  saveDB(db);

  logAudit(
    req.user.name,
    req.user.role,
    `Registered & Sent to Doctor: ${newVisit.parchaCode} (${patient.fullName})`,
    newVisit.id,
    platform || "Assistant Module"
  );

  // Real-time broadcast to Doctor and Assistant apps
  broadcast('NEW_PATIENT_ARRIVED', {
    visit: newVisit,
    patient: patient,
    message: `New Patient Registered: ${newVisit.parchaCode} - ${patient.fullName}`
  });

  res.json({
    success: true,
    message: "Patient registered and sent to Doctor queue successfully.",
    parchaCode: newVisit.parchaCode,
    tokenNumber: newVisit.tokenNumber,
    visit: newVisit,
    patient: patient
  });
});

// 4. Doctor calls NEXT PATIENT
app.post('/api/doctor/next-patient', authenticate, requireRole(['DOCTOR']), (req, res) => {
  // Find the earliest WAITING patient (chronological order)
  const waitingVisits = db.visits.filter(v => v.status === 'WAITING');
  if (waitingVisits.length === 0) {
    return res.status(404).json({ error: "No waiting patients in queue." });
  }

  // Sort by tokenNumber or createdAt ascending
  waitingVisits.sort((a, b) => a.tokenNumber - b.tokenNumber);
  const nextVisit = waitingVisits[0];

  nextVisit.status = 'CALLED';
  nextVisit.calledAt = new Date().toISOString();
  nextVisit.acknowledgedAt = null;

  saveDB(db);

  logAudit(
    req.user.name,
    req.user.role,
    `Called NEXT PATIENT: ${nextVisit.parchaCode} (${nextVisit.patientName})`,
    nextVisit.id,
    req.body.platform || "Doctor Module"
  );

  // Real-time alert sent to Assistant
  broadcast('NEXT_PATIENT_ALERT', {
    visitId: nextVisit.id,
    parchaNumber: nextVisit.parchaCode,
    tokenNumber: nextVisit.tokenNumber,
    patientName: nextVisit.patientName,
    calledAt: nextVisit.calledAt,
    alertText: `Please send ${nextVisit.patientName} (${nextVisit.parchaCode}) to Doctor.`
  });

  res.json({
    success: true,
    message: `Patient ${nextVisit.parchaCode} (${nextVisit.patientName}) called. Alert sent to Assistant.`,
    visit: nextVisit
  });
});

// 5. Assistant ACKNOWLEDGES "Next Patient" alert
app.post('/api/assistant/acknowledge-alert', authenticate, requireRole(['ASSISTANT', 'DOCTOR']), (req, res) => {
  const { visitId } = req.body;
  const visit = db.visits.find(v => v.id === visitId || v.tokenNumber === Number(visitId));

  if (!visit) {
    return res.status(404).json({ error: "Visit not found" });
  }

  visit.acknowledgedAt = new Date().toISOString();
  saveDB(db);

  logAudit(
    req.user.name,
    req.user.role,
    `Acknowledged Next Patient: ${visit.parchaCode} (${visit.patientName})`,
    visit.id,
    req.body.platform || "Assistant Module"
  );

  // Broadcast acknowledgement back to Doctor
  broadcast('ASSISTANT_ACKNOWLEDGED', {
    visitId: visit.id,
    parchaCode: visit.parchaCode,
    patientName: visit.patientName,
    acknowledgedAt: visit.acknowledgedAt,
    acknowledgedBy: req.user.name,
    message: `Assistant Notified ✓ Acknowledged ✓ (${new Date(visit.acknowledgedAt).toLocaleTimeString()})`
  });

  res.json({
    success: true,
    message: "Alert acknowledged. Doctor has been notified in real time.",
    acknowledgedAt: visit.acknowledgedAt,
    visit
  });
});

// 6. Update Queue Status (Assistant can mark No Show / Waiting / Called)
app.patch('/api/queue/:id/status', authenticate, requireRole(['ASSISTANT', 'DOCTOR']), (req, res) => {
  const { id } = req.params;
  const { status, platform } = req.body;

  const allowedAssistantStatuses = ['WAITING', 'CALLED', 'NO SHOW'];
  if (req.user.role === 'ASSISTANT' && !allowedAssistantStatuses.includes(status)) {
    return res.status(403).json({
      error: `Assistant can only update queue status to WAITING, CALLED, or NO SHOW.`
    });
  }

  const visit = db.visits.find(v => v.id === id || v.tokenNumber === Number(id));
  if (!visit) {
    return res.status(404).json({ error: "Visit not found" });
  }

  const oldStatus = visit.status;
  visit.status = status;
  if (status === 'COMPLETED' && !visit.completedAt) {
    visit.completedAt = new Date().toISOString();
  }
  saveDB(db);

  logAudit(
    req.user.name,
    req.user.role,
    `Changed status of ${visit.parchaCode} from ${oldStatus} to ${status}`,
    visit.id,
    platform || "App"
  );

  broadcast('QUEUE_STATUS_UPDATED', {
    visitId: visit.id,
    tokenNumber: visit.tokenNumber,
    parchaCode: visit.parchaCode,
    oldStatus,
    newStatus: status,
    updatedBy: req.user.name
  });

  res.json({ success: true, visit });
});

// 7. Doctor Master Endpoints (Prompt 2)

// Doctor Dashboard Stats
app.get('/api/doctor/dashboard-stats', authenticate, requireRole(['DOCTOR']), (req, res) => {
  const visits = db.visits || [];
  const waiting = visits.filter(v => v.status === 'WAITING').length;
  const called = visits.filter(v => v.status === 'CALLED').length;
  const withDoctor = visits.filter(v => v.status === 'WITH DOCTOR').length;
  const completed = visits.filter(v => v.status === 'COMPLETED').length;
  const pendingPayments = visits.filter(v => v.status === 'PAYMENT PENDING').length;

  const consultationFees = (db.bills || [])
    .filter(b => b.status === 'PAID')
    .reduce((sum, b) => sum + (b.consultationFee || 0), 0);

  const medicineSales = (db.bills || [])
    .filter(b => b.status === 'PAID')
    .reduce((sum, b) => sum + (b.medicineTotal || 0), 0);

  const totalRevenue = (db.bills || [])
    .filter(b => b.status === 'PAID')
    .reduce((sum, b) => sum + (b.grandTotal || 0), 0);

  const lowStock = (db.inventory || []).filter(m => m.stock <= m.minStock).length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const expiringSoon = (db.inventory || []).filter(m => {
    if (!m.expiry) return false;
    const diffDays = (new Date(m.expiry) - new Date()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 60;
  }).length;

  const todayFollowUps = (db.prescriptions || []).filter(p => p.followUpDate === todayStr).length;

  res.json({
    totalPatients: visits.length,
    waiting,
    called,
    withDoctor,
    completed,
    pendingPayments,
    consultationFees,
    medicineSales,
    totalRevenue,
    lowStock,
    expiringSoon,
    todayFollowUps
  });
});

// Start Consultation
app.post('/api/doctor/start-consultation', authenticate, requireRole(['DOCTOR']), (req, res) => {
  const { visitId, platform } = req.body;
  const visit = db.visits.find(v => v.id === visitId || v.tokenNumber === Number(visitId));
  if (!visit) {
    return res.status(404).json({ error: "Visit not found" });
  }

  visit.status = 'WITH DOCTOR';
  visit.consultationStartedAt = new Date().toISOString();
  saveDB(db);

  logAudit(
    req.user.name,
    req.user.role,
    `Started consultation for ${visit.parchaCode} (${visit.patientName})`,
    visit.id,
    platform || "Doctor Module"
  );

  broadcast('QUEUE_STATUS_UPDATED', {
    visitId: visit.id,
    tokenNumber: visit.tokenNumber,
    parchaCode: visit.parchaCode,
    newStatus: 'WITH DOCTOR',
    consultationStartedAt: visit.consultationStartedAt
  });

  res.json({ success: true, visit });
});

// Medicine Search from Central Inventory
app.get('/api/inventory/search', (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  if (!q) {
    return res.json(db.inventory.slice(0, 20));
  }

  const results = db.inventory.filter(m => {
    return m.name.toLowerCase().includes(q) ||
           (m.generic && m.generic.toLowerCase().includes(q)) ||
           (m.brand && m.brand.toLowerCase().includes(q));
  });

  res.json(results);
});

// Patient Full Medical History
app.get('/api/patients/:id/full-history', authenticate, (req, res) => {
  const patientId = req.params.id;
  const patient = db.patients.find(p => p.id === patientId);
  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }

  const visits = db.visits.filter(v => v.patientId === patientId);
  const prescriptions = (db.prescriptions || []).filter(p => p.patientId === patientId);
  const bills = (db.bills || []).filter(b => b.patientId === patientId);

  res.json({
    patient,
    visits,
    prescriptions,
    bills
  });
});

// Save & Send Prescription
app.post('/api/doctor/save-prescription', authenticate, requireRole(['DOCTOR']), (req, res) => {
  const {
    visitId,
    patientId,
    chiefComplaint,
    symptoms,
    diagnosis,
    clinicalNotes,
    advice,
    followUpDays,
    followUpDate,
    medicines,
    templateId,
    platform
  } = req.body;

  const visit = db.visits.find(v => v.id === visitId || v.tokenNumber === Number(visitId));
  if (!visit) {
    return res.status(404).json({ error: "Visit not found" });
  }

  const prescId = 'rx_' + visit.tokenNumber + '_' + Date.now().toString(36);
  const calculatedMedicineTotal = (medicines || []).reduce((sum, m) => {
    const qty = Number(m.quantity) || 1;
    const price = Number(m.sellingPrice) || 30;
    return sum + (qty * price);
  }, 0);

  const prescription = {
    id: prescId,
    visitId: visit.id,
    tokenNumber: visit.tokenNumber,
    parchaCode: visit.parchaCode,
    patientId: visit.patientId,
    patientName: visit.patientName,
    age: visit.age,
    gender: visit.gender,
    whatsapp: visit.whatsapp,
    address: visit.address,
    bloodGroup: visit.bloodGroup,
    weight: visit.weight,
    doctorName: db.clinic.doctorName,
    chiefComplaint: chiefComplaint || visit.chiefComplaint,
    symptoms: symptoms || "",
    diagnosis: diagnosis || "Clinical evaluation complete",
    clinicalNotes: clinicalNotes || "",
    advice: advice || "Adequate rest and plenty of fluids.",
    followUpDays: followUpDays || null,
    followUpDate: followUpDate || null,
    medicines: medicines || [],
    templateId: templateId || "default_a4",
    status: "PAYMENT PENDING",
    createdAt: new Date().toISOString()
  };

  if (!db.prescriptions) db.prescriptions = [];
  db.prescriptions.unshift(prescription);

  // Update Visit status
  visit.status = 'PAYMENT PENDING';
  visit.diagnosis = prescription.diagnosis;

  // Automatically prepare Pending Bill for Medical/Billing Queue
  if (!db.bills) db.bills = [];
  const billId = 'bill_' + visit.tokenNumber + '_' + Date.now().toString(36);
  const pendingBill = {
    id: billId,
    prescriptionId: prescId,
    visitId: visit.id,
    tokenNumber: visit.tokenNumber,
    parchaCode: visit.parchaCode,
    patientId: visit.patientId,
    patientName: visit.patientName,
    whatsapp: visit.whatsapp,
    doctorFee: db.clinic.consultationFee || 500,
    medicineTotal: calculatedMedicineTotal,
    discount: 0,
    grandTotal: (db.clinic.consultationFee || 500) + calculatedMedicineTotal,
    paidAmount: 0,
    balance: (db.clinic.consultationFee || 500) + calculatedMedicineTotal,
    paymentMethod: null,
    status: 'PAYMENT PENDING',
    medicines: prescription.medicines,
    createdAt: new Date().toISOString()
  };
  db.bills.unshift(pendingBill);

  saveDB(db);

  logAudit(
    req.user.name,
    req.user.role,
    `Created & Sent Prescription for ${visit.parchaCode} (${visit.patientName}) to Medical/Billing`,
    prescId,
    platform || "Doctor Module"
  );

  // Broadcast to Medical / Billing module and Doctor dashboard
  broadcast('NEW_PRESCRIPTION_TO_MEDICAL', {
    prescription,
    bill: pendingBill,
    message: `New Prescription received for ${visit.parchaCode} (${visit.patientName})`
  });

  broadcast('QUEUE_STATUS_UPDATED', {
    visitId: visit.id,
    tokenNumber: visit.tokenNumber,
    parchaCode: visit.parchaCode,
    newStatus: 'PAYMENT PENDING'
  });

  res.json({
    success: true,
    message: "Prescription saved and sent to Medical/Billing successfully.",
    prescription,
    bill: pendingBill
  });
});

// Custom Prescription Template Designer endpoints
const defaultPrescriptionTemplate = {
  id: "default_a4",
  name: "Official SIDRA MOTION Clinic Letterhead",
  pageSize: "A4", // A4, A5, custom
  orientation: "portrait", // portrait, landscape
  bgImage: null, // Custom uploaded background image
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  fields: {
    clinicHeader: { x: 30, y: 25, fontSize: 18, enabled: true, color: "#0d9488" },
    doctorInfo: { x: 30, y: 55, fontSize: 13, enabled: true, color: "#334155" },
    parchaBadge: { x: 500, y: 30, fontSize: 14, enabled: true, color: "#0369a1" },
    date: { x: 500, y: 55, fontSize: 12, enabled: true, color: "#64748b" },
    patientInfoBar: { x: 30, y: 85, fontSize: 12, enabled: true, color: "#0f172a" },
    diagnosisBox: { x: 30, y: 130, fontSize: 12, enabled: true, color: "#0f172a" },
    rxSymbol: { x: 30, y: 175, fontSize: 24, enabled: true, color: "#0d9488" },
    medicineTable: { x: 30, y: 210, fontSize: 11, enabled: true, color: "#0f172a" },
    adviceBox: { x: 30, y: 540, fontSize: 11, enabled: true, color: "#0f172a" },
    followUp: { x: 30, y: 640, fontSize: 12, enabled: true, color: "#0369a1" },
    doctorSignature: { x: 450, y: 660, fontSize: 12, enabled: true, color: "#0f172a" },
    qrCode: { x: 500, y: 720, enabled: true, size: 60 }
  }
};

app.get('/api/templates/prescription', (req, res) => {
  if (!db.prescriptionTemplates) {
    db.prescriptionTemplates = [defaultPrescriptionTemplate];
    saveDB(db);
  }
  res.json({
    templates: db.prescriptionTemplates,
    defaultTemplateId: db.defaultTemplateId || "default_a4"
  });
});

app.post('/api/templates/prescription', authenticate, requireRole(['DOCTOR']), (req, res) => {
  const { template, makeDefault } = req.body;
  if (!db.prescriptionTemplates) db.prescriptionTemplates = [defaultPrescriptionTemplate];

  const existingIdx = db.prescriptionTemplates.findIndex(t => t.id === template.id);
  if (existingIdx >= 0) {
    db.prescriptionTemplates[existingIdx] = template;
  } else {
    template.id = 'tmpl_' + Date.now().toString(36);
    db.prescriptionTemplates.push(template);
  }

  if (makeDefault) {
    db.defaultTemplateId = template.id;
  }

  saveDB(db);
  res.json({ success: true, template });
});

// Daily Report Endpoint
app.get('/api/reports/daily', authenticate, requireRole(['DOCTOR']), (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const visits = db.visits || [];
  const bills = (db.bills || []).filter(b => b.status === 'PAID');

  const totalPatients = visits.length;
  const consultationFees = bills.reduce((s, b) => s + (b.consultationFee || 0), 0);
  const medicineSales = bills.reduce((s, b) => s + (b.medicineTotal || 0), 0);
  const discountTotal = bills.reduce((s, b) => s + (b.discount || 0), 0);
  const totalRevenue = bills.reduce((s, b) => s + (b.grandTotal || 0), 0);

  const paymentBreakdown = {
    Cash: bills.filter(b => b.paymentMethod === 'Cash').reduce((s, b) => s + b.grandTotal, 0),
    UPI: bills.filter(b => b.paymentMethod === 'UPI').reduce((s, b) => s + b.grandTotal, 0),
    Card: bills.filter(b => b.paymentMethod === 'Card').reduce((s, b) => s + b.grandTotal, 0),
    Other: bills.filter(b => b.paymentMethod === 'Other').reduce((s, b) => s + b.grandTotal, 0)
  };

  res.json({
    date,
    clinic: db.clinic,
    totalPatients,
    consultationFees,
    medicineSales,
    discountTotal,
    totalRevenue,
    paymentBreakdown,
    bills
  });
});

// 8. Medical / Pharmacy / Billing Endpoints (Prompt 3)

// Medical Dashboard Stats
app.get('/api/medical/dashboard-stats', authenticate, requireRole(['MEDICAL', 'DOCTOR']), (req, res) => {
  const prescriptions = db.prescriptions || [];
  const bills = db.bills || [];
  const inventory = db.inventory || [];

  const pendingPrescriptions = prescriptions.filter(p => p.status === 'PAYMENT PENDING' || p.status === 'PREPARING').length;
  const todayBills = bills.length;
  const pendingPayments = bills.filter(b => b.status === 'PAYMENT PENDING').length;
  const completedOrders = bills.filter(b => b.status === 'PAID').length;

  const todayMedicineSales = bills
    .filter(b => b.status === 'PAID')
    .reduce((sum, b) => sum + (b.medicineTotal || 0), 0);

  const todayCollection = bills
    .filter(b => b.status === 'PAID')
    .reduce((sum, b) => sum + (b.grandTotal || 0), 0);

  const lowStock = inventory.filter(m => m.stock <= m.minStock).length;
  
  const expiringSoon = inventory.filter(m => {
    if (!m.expiry) return false;
    const diffDays = (new Date(m.expiry) - new Date()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 60;
  }).length;

  res.json({
    pendingPrescriptions,
    todayBills,
    pendingPayments,
    completedOrders,
    todayMedicineSales,
    todayCollection,
    lowStock,
    expiringSoon
  });
});

// Incoming Prescriptions Queue for Pharmacy
app.get('/api/prescriptions/incoming', authenticate, requireRole(['MEDICAL', 'DOCTOR']), (req, res) => {
  res.json(db.prescriptions || []);
});

// Mark Medicine Item Availability in Prescription (Available, Partially Available, Unavailable)
app.patch('/api/prescriptions/:id/item-availability', authenticate, requireRole(['MEDICAL', 'DOCTOR']), (req, res) => {
  const { id } = req.params;
  const { medicineId, availabilityStatus, note } = req.body;

  const presc = (db.prescriptions || []).find(p => p.id === id);
  if (!presc) {
    return res.status(404).json({ error: "Prescription not found" });
  }

  const medItem = (presc.medicines || []).find(m => m.id === medicineId || m.name === medicineId);
  if (medItem) {
    medItem.availabilityStatus = availabilityStatus;
    medItem.pharmacyNote = note || "";
  }

  saveDB(db);

  if (availabilityStatus === 'UNAVAILABLE') {
    broadcast('MEDICINE_UNAVAILABLE_ALERT', {
      prescriptionId: presc.id,
      parchaCode: presc.parchaCode,
      patientName: presc.patientName,
      medicineName: medItem ? medItem.name : medicineId,
      message: `ATTENTION DOCTOR: Medicine ${medItem ? medItem.name : medicineId} prescribed for ${presc.parchaCode} is currently UNAVAILABLE in Pharmacy.`
    });
  }

  res.json({ success: true, prescription: presc });
});

// Complete Payment & Deduct Inventory Stock
app.post('/api/medical/complete-payment', authenticate, requireRole(['MEDICAL', 'DOCTOR']), (req, res) => {
  const {
    billId,
    discount,
    discountAuthorizedBy,
    paymentMethod,
    paidAmount,
    platform
  } = req.body;

  const bill = (db.bills || []).find(b => b.id === billId);
  if (!bill) {
    return res.status(404).json({ error: "Bill not found" });
  }

  // Calculate final amounts
  const numDiscount = Number(discount) || 0;
  bill.discount = numDiscount;
  if (discountAuthorizedBy) bill.discountAuthorizedBy = discountAuthorizedBy;
  bill.grandTotal = (bill.doctorFee || 500) + (bill.medicineTotal || 0) - numDiscount;
  bill.paidAmount = Number(paidAmount) || bill.grandTotal;
  bill.balance = Math.max(0, bill.grandTotal - bill.paidAmount);
  bill.paymentMethod = paymentMethod || "Cash";
  bill.status = "PAID";
  bill.paidAt = new Date().toISOString();

  // Deduct Inventory Stock & Prevent Negative Stock
  if (!db.inventoryTransactions) db.inventoryTransactions = [];
  const stockDeductionErrors = [];

  (bill.medicines || []).forEach(med => {
    const invItem = (db.inventory || []).find(i => i.id === med.id || i.name.toLowerCase() === med.name.toLowerCase());
    const qtyToDeduct = Number(med.quantity) || 1;

    if (invItem) {
      if (invItem.stock < qtyToDeduct) {
        stockDeductionErrors.push(`Insufficient stock for ${invItem.name}. Available: ${invItem.stock}, requested: ${qtyToDeduct}`);
      } else {
        invItem.stock -= qtyToDeduct;
        
        // Log inventory transaction
        db.inventoryTransactions.unshift({
          id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          timestamp: new Date().toISOString(),
          medicineId: invItem.id,
          medicineName: invItem.name,
          batch: invItem.batch || "BATCH-01",
          quantity: -qtyToDeduct,
          action: "SALE",
          parchaCode: bill.parchaCode,
          user: req.user.name
        });
      }
    }
  });

  // Update prescription status
  const presc = (db.prescriptions || []).find(p => p.id === bill.prescriptionId || p.tokenNumber === bill.tokenNumber);
  if (presc) {
    presc.status = 'PAID';
  }

  // Update visit status to COMPLETED
  const visit = (db.visits || []).find(v => v.id === bill.visitId || v.tokenNumber === bill.tokenNumber);
  if (visit) {
    visit.status = 'COMPLETED';
    visit.completedAt = new Date().toISOString();
  }

  saveDB(db);

  logAudit(
    req.user.name,
    req.user.role,
    `Completed payment of ₹${bill.paidAmount} via ${bill.paymentMethod} for ${bill.parchaCode} (${bill.patientName})`,
    bill.id,
    platform || "Medical Portal"
  );

  // Real-time broadcast to Doctor and Assistants: "PAYMENT COMPLETED"
  broadcast('PAYMENT_COMPLETED', {
    billId: bill.id,
    parchaCode: bill.parchaCode,
    patientName: bill.patientName,
    grandTotal: bill.grandTotal,
    paidAmount: bill.paidAmount,
    paymentMethod: bill.paymentMethod,
    completedAt: bill.paidAt,
    message: `PAYMENT COMPLETED: ${bill.parchaCode} (${bill.patientName}) - ₹${bill.paidAmount}`
  });

  broadcast('QUEUE_STATUS_UPDATED', {
    visitId: bill.visitId,
    tokenNumber: bill.tokenNumber,
    parchaCode: bill.parchaCode,
    newStatus: 'COMPLETED'
  });

  res.json({
    success: true,
    message: "Payment recorded, inventory stock deducted, and Doctor notified.",
    bill,
    stockErrors: stockDeductionErrors
  });
});

// Inventory Transactions History
app.get('/api/inventory/transactions', authenticate, (req, res) => {
  res.json(db.inventoryTransactions || []);
});

// Audit Logs endpoint
app.get('/api/audit-logs', authenticate, (req, res) => {
  res.json(db.auditLogs.slice(0, 50));
});

// Notifications endpoint
app.get('/api/notifications', (req, res) => {
  res.json(db.notifications);
});

// Client App Entrypoints
app.get('/assistant', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'assistant.html'));
});

app.get('/doctor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'doctor.html'));
});

app.get('/medical', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'medical.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket Connection Management
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({
    event: 'CONNECTED',
    payload: {
      message: 'Connected to SIDRA MOTION CLINIC Central Real-time Engine',
      clinic: db.clinic.name,
      nextParcha: db.tokenSequence
    }
  }));

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      // Relay ping/heartbeat
      if (msg.event === 'PING') {
        ws.send(JSON.stringify({ event: 'PONG' }));
      }
    } catch (err) {
      console.error('WS Parse Error', err);
    }
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  SIDRA MOTION CLINIC DEMO - Central Backend Running  `);
  console.log(`  Port: ${PORT}`);
  console.log(`  Assistant App: http://localhost:${PORT}/assistant`);
  console.log(`  Doctor App:    http://localhost:${PORT}/doctor`);
  console.log(`  Medical App:   http://localhost:${PORT}/medical`);
  console.log(`=======================================================`);
});
