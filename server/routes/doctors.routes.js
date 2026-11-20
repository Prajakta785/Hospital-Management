import express from 'express';
import { db } from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/doctors (Public with query filters: departmentId, search, status)
router.get('/', async (req, res) => {
  try {
    const { departmentId, search, status } = req.query;
    let doctors = await db.getCollection('doctors');
    const departments = await db.getCollection('departments');

    if (departmentId) {
      const dId = parseInt(departmentId, 10);
      doctors = doctors.filter(d => d.department_id === dId);
    }

    if (status) {
      doctors = doctors.filter(d => d.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      doctors = doctors.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.qualifications.toLowerCase().includes(q)
      );
    }

    // Attach department name
    const enriched = doctors.map(doc => {
      const dept = departments.find(dep => dep.id === doc.department_id);
      return {
        ...doc,
        departmentName: dept?.name || 'General Medicine'
      };
    });

    enriched.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));

    return res.json({ success: true, data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve doctors.' });
  }
});

// GET /api/doctors/:id (Public)
router.get('/:id', async (req, res) => {
  try {
    const doctor = await db.findById('doctors', req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const departments = await db.getCollection('departments');
    const dept = departments.find(d => d.id === doctor.department_id);

    return res.json({
      success: true,
      data: {
        ...doctor,
        departmentName: dept?.name || 'General Medicine'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve doctor profile.' });
  }
});

// POST /api/doctors (Admin/Staff only)
router.post('/', verifyToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const {
      name,
      specialty,
      department_id,
      qualifications,
      experience_years,
      consultation_fee,
      available_days,
      available_time_slots,
      room_number,
      bio,
      avatar,
      status = 'active'
    } = req.body;

    if (!name || !specialty) {
      return res.status(400).json({ success: false, message: 'Doctor name and specialty are required.' });
    }

    const newDoctor = await db.insert('doctors', {
      user_id: null,
      name: name.trim(),
      specialty: specialty.trim(),
      department_id: department_id ? parseInt(department_id, 10) : 1,
      qualifications: qualifications || 'MD, MBBS',
      experience_years: parseInt(experience_years || 5, 10),
      consultation_fee: parseFloat(consultation_fee || 75.00),
      available_days: available_days || 'Mon, Tue, Wed, Thu, Fri',
      available_time_slots: available_time_slots || '09:00 AM, 11:00 AM, 02:00 PM, 04:00 PM',
      room_number: room_number || 'Room 101',
      bio: bio || 'Dedicated physician committed to patient-centered clinical excellence.',
      avatar: avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
      rating: 4.9,
      status
    });

    await db.addAuditLog({
      user_id: req.user.id,
      user_name: req.user.name,
      role: req.user.role,
      action: 'DOCTOR_ADDED',
      entity_type: 'Doctor',
      entity_id: newDoctor.id.toString(),
      details: `Added new doctor ${newDoctor.name} (${newDoctor.specialty})`
    });

    return res.status(201).json({ success: true, data: newDoctor });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to add doctor.' });
  }
});

// PUT /api/doctors/:id (Admin/Staff only)
router.put('/:id', verifyToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const updated = await db.update('doctors', req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    await db.addAuditLog({
      user_id: req.user.id,
      user_name: req.user.name,
      role: req.user.role,
      action: 'DOCTOR_UPDATED',
      entity_type: 'Doctor',
      entity_id: req.params.id,
      details: `Updated doctor profile for ${updated.name}`
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update doctor profile.' });
  }
});

// DELETE /api/doctors/:id (Admin/Staff)
router.delete('/:id', async (req, res) => {
  try {
    const doctorId = parseInt(req.params.id, 10);
    const doctor = await db.findById('doctors', doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    await db.delete('doctors', doctorId);

    try {
      await db.addAuditLog({
        user_id: 1,
        user_name: 'Administrator',
        role: 'admin',
        action: 'DOCTOR_DELETED',
        entity_type: 'Doctor',
        entity_id: doctorId.toString(),
        details: `Removed doctor ${doctor.name} (${doctor.specialty})`
      });
    } catch (auditErr) {
      console.warn('Audit log write warning:', auditErr.message);
    }

    return res.json({ success: true, message: `Doctor ${doctor.name} removed successfully.` });
  } catch (err) {
    console.error('Failed to remove doctor:', err);
    return res.status(500).json({ success: false, message: 'Failed to remove doctor profile.' });
  }
});

export default router;
