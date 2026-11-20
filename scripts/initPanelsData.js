import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storePath = path.join(__dirname, '..', 'server', 'data', 'hospital_store.json');

const data = JSON.parse(fs.readFileSync(storePath, 'utf8'));

// 1. Ensure Super Admin user
let adminUser = data.users.find(u => u.email === 'admin@hospital.com' || u.login_id === 'ADMIN01');
if (adminUser) {
  adminUser.login_id = 'ADMIN01';
  adminUser.role = 'superadmin';
  adminUser.password_hash = bcrypt.hashSync('admin123', 10);
  adminUser.raw_password = 'admin123';
} else {
  data.users.push({
    id: 1,
    name: 'Dr. Marcus Vance',
    email: 'admin@hospital.com',
    login_id: 'ADMIN01',
    password_hash: bcrypt.hashSync('admin123', 10),
    raw_password: 'admin123',
    role: 'superadmin',
    phone: '+1 (555) 019-2834',
    status: 'active',
    avatar: '/images/doctors/doctor-2.jpg'
  });
}

// 2. Ensure Doctor user
let docUser = data.users.find(u => u.email === 'doctor@hospital.com' || u.login_id === 'DOC101');
if (docUser) {
  docUser.login_id = 'DOC101';
  docUser.password_hash = bcrypt.hashSync('doctor123', 10);
  docUser.raw_password = 'doctor123';
  docUser.role = 'doctor';
} else {
  data.users.push({
    id: 2,
    name: 'Dr. Eleanor Hayes',
    email: 'doctor@hospital.com',
    login_id: 'DOC101',
    password_hash: bcrypt.hashSync('doctor123', 10),
    raw_password: 'doctor123',
    role: 'doctor',
    phone: '+1 (555) 019-8821',
    status: 'active',
    avatar: '/images/doctors/doctor-1.jpg'
  });
}

// 3. Ensure Nurse user
let nurseUser = data.users.find(u => u.email === 'nurse@hospital.com' || u.login_id === 'NUR101');
if (nurseUser) {
  nurseUser.login_id = 'NUR101';
  nurseUser.role = 'nurse';
  nurseUser.password_hash = bcrypt.hashSync('nurse123', 10);
  nurseUser.raw_password = 'nurse123';
} else {
  nurseUser = {
    id: (data.users.length || 0) + 1,
    name: 'Sarah Jenkins, RN',
    email: 'nurse@hospital.com',
    login_id: 'NUR101',
    password_hash: bcrypt.hashSync('nurse123', 10),
    raw_password: 'nurse123',
    role: 'nurse',
    phone: '+1 (555) 019-3342',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80'
  };
  data.users.push(nurseUser);
}

// 4. Initialize nurses collection
if (!data.nurses || !data.nurses.length) {
  data.nurses = [
    {
      id: 1,
      nurse_id: 'NUR-2026-1001',
      user_id: nurseUser.id,
      name: 'Sarah Jenkins, RN',
      email: 'nurse@hospital.com',
      login_id: 'NUR101',
      phone: '+1 (555) 019-3342',
      department: 'Emergency & Triage Bay',
      shift: 'Morning (08:00 AM - 04:00 PM)',
      qualification: 'BSc Nursing, Critical Care Specialist (CCRN)',
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      nurse_id: 'NUR-2026-1002',
      user_id: nurseUser.id,
      name: 'Elena Rostova, RN',
      email: 'e.rostova@hospital.com',
      login_id: 'NUR102',
      phone: '+1 (555) 019-5521',
      department: 'Cardiology & Outpatient Care',
      shift: 'Evening (04:00 PM - 12:00 AM)',
      qualification: 'BSc Nursing, Cardiac Care Certified',
      status: 'active',
      created_at: new Date().toISOString()
    }
  ];
}

// 5. Ensure doctors have doctor_id & login_id
data.doctors.forEach((d, idx) => {
  if (!d.doctor_id) d.doctor_id = `DOC-2026-${1001 + idx}`;
  if (!d.login_id) d.login_id = idx === 0 ? 'DOC101' : `DOC${101 + idx}`;
  if (!d.user_id && idx === 0) d.user_id = docUser ? docUser.id : 2;
});

// 6. Initialize patient_registrations collection with realistic QR walk-in registrations
if (!data.patient_registrations || !data.patient_registrations.length) {
  data.patient_registrations = [
    {
      id: 1,
      patient_id: 'PAT-2026-1042',
      name: 'Ananya Deshmukh',
      age: 28,
      dob: '1998-04-12',
      gender: 'Female',
      phone: '+91 98231 45678',
      whatsapp_number: '+919823145678',
      whatsapp_consent: true,
      email: 'ananya.d@example.com',
      address: 'Shivaji Nagar, Pune, Maharashtra',
      blood_group: 'B+',
      symptoms: 'High fever for 3 days, body aches, persistent dry cough',
      medical_history: 'Mild allergic rhinitis; no chronic illness',
      emergency_contact: { name: 'Rahul Deshmukh (Brother)', phone: '+91 98231 45679' },
      status: 'Pending',
      assigned_doctor_id: null,
      assigned_doctor_name: null,
      assigned_nurse_name: null,
      nurse_notes: '',
      registered_at: new Date(Date.now() - 25 * 60000).toISOString()
    },
    {
      id: 2,
      patient_id: 'PAT-2026-1043',
      name: 'Rajesh Patil',
      age: 52,
      dob: '1974-08-20',
      gender: 'Male',
      phone: '+91 98902 34567',
      whatsapp_number: '+919890234567',
      whatsapp_consent: true,
      email: 'rajesh.patil@example.com',
      address: 'Kothrud, Pune, Maharashtra',
      blood_group: 'O+',
      symptoms: 'Chest tightness on exertion, mild shortness of breath',
      medical_history: 'Hypertension for 5 years, on Telmisartan 40mg',
      emergency_contact: { name: 'Sunita Patil (Wife)', phone: '+91 98902 34568' },
      status: 'Assigned',
      assigned_doctor_id: 2,
      assigned_doctor_name: 'Dr. Eleanor Hayes',
      assigned_doctor_specialty: 'Cardiology & Vascular Medicine',
      assigned_nurse_name: 'Sarah Jenkins, RN',
      nurse_notes: 'BP 142/90 mmHg, Pulse 86 bpm. Priority triage. Recommended ECG.',
      registered_at: new Date(Date.now() - 65 * 60000).toISOString(),
      assigned_at: new Date(Date.now() - 40 * 60000).toISOString()
    }
  ];
}

if (!data.consultations) data.consultations = [];
if (!data.whatsapp_logs) data.whatsapp_logs = [];

fs.writeFileSync(storePath, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully initialized collections in hospital_store.json!');
