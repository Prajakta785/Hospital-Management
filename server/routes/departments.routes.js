import express from 'express';
import { db } from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/departments (Public)
router.get('/', async (req, res) => {
  try {
    const departments = await db.getCollection('departments');
    const doctors = await db.getCollection('doctors');

    // Enrich with doctor count
    const enriched = departments.map(dept => {
      const deptDoctors = doctors.filter(d => d.department_id === dept.id);
      return {
        ...dept,
        doctorsCount: deptDoctors.length,
        doctors: deptDoctors
      };
    });

    return res.json({ success: true, data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve departments.' });
  }
});

// GET /api/departments/:id (Public)
router.get('/:id', async (req, res) => {
  try {
    const dept = await db.findById('departments', req.params.id);
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }
    const doctors = await db.getCollection('doctors');
    const deptDoctors = doctors.filter(d => d.department_id === dept.id);

    return res.json({
      success: true,
      data: {
        ...dept,
        doctors: deptDoctors
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve department.' });
  }
});

// POST /api/departments (Admin only)
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, code, description, icon, head_doctor_name, floor_location, phone_extension, image_url } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and code are required.' });
    }

    const newDept = await db.insert('departments', {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description || '',
      icon: icon || 'Activity',
      head_doctor_name: head_doctor_name || '',
      floor_location: floor_location || 'Main Building',
      phone_extension: phone_extension || '',
      image_url: image_url || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'
    });

    await db.addAuditLog({
      user_id: req.user.id,
      user_name: req.user.name,
      role: req.user.role,
      action: 'DEPARTMENT_CREATED',
      entity_type: 'Department',
      entity_id: newDept.id.toString(),
      details: `Created department ${newDept.name} (${newDept.code})`
    });

    return res.status(201).json({ success: true, data: newDept });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create department.' });
  }
});

export default router;
