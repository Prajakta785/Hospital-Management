import express from 'express';
import { db } from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/patients (Staff/Doctor/Admin gets full directory, Patient gets their own record)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { search, status, bloodGroup } = req.query;
    let patients = await db.getCollection('patients');

    if (req.user.role === 'patient') {
      const myPatients = patients.filter(p =>
        p.user_id === req.user.id ||
        (p.email && p.email.toLowerCase() === req.user.email?.toLowerCase())
      );
      return res.json({ success: true, count: myPatients.length, data: myPatients });
    }

    if (!['admin', 'doctor', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (status) {
      patients = patients.filter(p => p.admission_status === status);
    }

    if (bloodGroup) {
      patients = patients.filter(p => p.blood_group === bloodGroup);
    }

    if (search) {
      const q = search.toLowerCase();
      patients = patients.filter(p =>
        p.first_name.toLowerCase().includes(q) ||
        p.last_name.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        (p.email && p.email.toLowerCase().includes(q))
      );
    }

    // Ensure patients are always sorted by ID in natural ascending serial order
    patients.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));

    return res.json({ success: true, count: patients.length, data: patients });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve patients.' });
  }
});

// GET /api/patients/:id (Patient themselves or Clinical staff)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const patientId = parseInt(req.params.id, 10);
    const patient = await db.findById('patients', patientId);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    // Role security check: if patient, can only access own record
    if (req.user.role === 'patient' && patient.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied to this patient file.' });
    }

    // Gather clinical dossier
    const appointments = await db.getCollection('appointments');
    const prescriptions = await db.getCollection('prescriptions');
    const labTests = await db.getCollection('lab_tests');
    const invoices = await db.getCollection('invoices');
    const beds = await db.getCollection('beds');
    const wards = await db.getCollection('wards');

    const patientAppointments = appointments.filter(a => a.patient_id === patientId);
    const patientPrescriptions = prescriptions.filter(p => p.patient_id === patientId);
    const patientLabTests = labTests.filter(l => l.patient_id === patientId);
    const patientInvoices = invoices.filter(i => i.patient_id === patientId);
    
    // Check bed allocation
    const allocatedBed = beds.find(b => b.current_patient_id === patientId);
    let bedInfo = null;
    if (allocatedBed) {
      const ward = wards.find(w => w.id === allocatedBed.ward_id);
      bedInfo = {
        ...allocatedBed,
        wardName: ward?.name || 'General Ward',
        wardType: ward?.type || 'General'
      };
    }

    return res.json({
      success: true,
      data: {
        ...patient,
        bed: bedInfo,
        appointments: patientAppointments,
        prescriptions: patientPrescriptions,
        labTests: patientLabTests,
        invoices: patientInvoices
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve patient dossier.' });
  }
});

// POST /api/patients (Staff/Doctor/Admin)
router.post('/', verifyToken, requireRole(['admin', 'doctor', 'staff']), async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      dob,
      age,
      gender,
      blood_group,
      phone,
      email,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      allergies,
      medical_history,
      insurance_provider,
      insurance_policy_number,
      admission_status = 'outpatient'
    } = req.body;

    if (!first_name || !last_name || !phone) {
      return res.status(400).json({ success: false, message: 'First name, last name, and phone are required.' });
    }

    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const mrn = `MRN-${year}-${randomSuffix}`;

    const calculatedAge = age ? parseInt(age, 10) : (dob ? Math.max(1, new Date().getFullYear() - new Date(dob).getFullYear()) : 30);

    const newPatient = await db.insert('patients', {
      user_id: null,
      mrn,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      dob: dob || '1990-01-01',
      age: calculatedAge,
      gender: gender || 'Other',
      blood_group: blood_group || 'O+',
      phone: phone.trim(),
      email: email ? email.trim() : null,
      address: address || '',
      emergency_contact_name: emergency_contact_name || '',
      emergency_contact_phone: emergency_contact_phone || '',
      allergies: allergies || 'None known',
      medical_history: medical_history || 'No prior chronic conditions logged.',
      insurance_provider: insurance_provider || 'Self-Pay',
      insurance_policy_number: insurance_policy_number || 'N/A',
      admission_status
    });

    await db.addAuditLog({
      user_id: req.user.id,
      user_name: req.user.name,
      role: req.user.role,
      action: 'PATIENT_REGISTERED',
      entity_type: 'Patient',
      entity_id: newPatient.id.toString(),
      details: `Registered patient ${newPatient.first_name} ${newPatient.last_name} (${newPatient.mrn})`
    });

    return res.status(201).json({ success: true, data: newPatient });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create patient.' });
  }
});

// PUT /api/patients/:id (Staff/Doctor/Admin)
router.put('/:id', verifyToken, requireRole(['admin', 'doctor', 'staff']), async (req, res) => {
  try {
    const updated = await db.update('patients', req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    await db.addAuditLog({
      user_id: req.user.id,
      user_name: req.user.name,
      role: req.user.role,
      action: 'PATIENT_UPDATED',
      entity_type: 'Patient',
      entity_id: req.params.id,
      details: `Updated details for patient ${updated.first_name} ${updated.last_name}`
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update patient details.' });
  }
});

export default router;
