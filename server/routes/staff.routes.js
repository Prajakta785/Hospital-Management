import express from 'express';
import { db } from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/staff (List all staff)
router.get('/', verifyToken, async (req, res) => {
  try {
    const staff = await db.getCollection('staff');
    return res.json({ success: true, data: staff || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve staff.' });
  }
});

// POST /api/staff (Add new staff member)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, role_title, department, email, phone, shift, qualification } = req.body;
    if (!name || !role_title || !department) {
      return res.status(400).json({ success: false, message: 'Name, role title, and department are required.' });
    }

    const newStaff = await db.insert('staff', {
      name: name.trim(),
      role_title: role_title.trim(),
      department: department.trim(),
      email: email || '',
      phone: phone || '',
      shift: shift || 'Morning (08:00 AM - 04:00 PM)',
      status: 'On Duty',
      joined_date: new Date().toISOString().split('T')[0],
      qualification: qualification || 'Certified Healthcare Professional',
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80'
    });

    await db.addAuditLog({
      user_id: req.user.id,
      user_name: req.user.name,
      role: req.user.role,
      action: 'STAFF_ADDED',
      entity_type: 'Staff',
      entity_id: newStaff.id.toString(),
      details: `Added new staff member: ${name} (${role_title}).`
    });

    return res.status(201).json({ success: true, message: 'Staff member added successfully.', data: newStaff });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to add staff member.' });
  }
});

// GET /api/staff/attendance
router.get('/attendance', verifyToken, async (req, res) => {
  try {
    const attendance = await db.getCollection('attendance');
    return res.json({ success: true, data: attendance || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve attendance logs.' });
  }
});

// POST /api/staff/punch
router.post('/punch', verifyToken, async (req, res) => {
  try {
    const { staff_id, staff_name, type } = req.body; // type: 'in' | 'out'
    const today = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let attendance = await db.getCollection('attendance');
    let record = attendance.find(a => a.staff_id === parseInt(staff_id, 10) && a.date === today);

    if (record) {
      if (type === 'out') {
        record.punch_out = timeStr;
        record.status = 'Completed Shift';
      } else {
        record.punch_in = timeStr;
        record.status = 'Present';
      }
      await db.update('attendance', record.id, record);
    } else {
      record = await db.insert('attendance', {
        staff_id: parseInt(staff_id, 10),
        staff_name: staff_name || 'Staff Member',
        date: today,
        shift: 'Current Shift',
        punch_in: type === 'in' ? timeStr : '--',
        punch_out: type === 'out' ? timeStr : '--',
        status: type === 'in' ? 'Present' : 'Completed Shift'
      });
    }

    return res.json({ success: true, message: `Punch ${type.toUpperCase()} recorded at ${timeStr}.`, data: record });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to record attendance punch.' });
  }
});

// PUT /api/staff/:id (Update staff member details and duty roster)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updates = req.body;
    const updated = await db.update('staff', id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Staff member not found.' });
    }

    await db.addAuditLog({
      user_id: req.user.id,
      user_name: req.user.name,
      role: req.user.role,
      action: 'STAFF_UPDATED',
      entity_type: 'Staff',
      entity_id: id.toString(),
      details: `Updated staff member: ${updated.name || id}`
    });

    return res.json({ success: true, message: 'Staff details updated successfully.', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update staff member.' });
  }
});

export default router;
