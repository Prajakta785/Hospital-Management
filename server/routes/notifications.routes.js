import express from 'express';
import { db } from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/notifications (Filter by patientId)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { patientId } = req.query;
    let notifications = await db.getCollection('notifications');

    if (patientId) {
      notifications = notifications.filter(n => n.patient_id === parseInt(patientId, 10));
    }

    return res.json({ success: true, data: notifications || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
});

// POST /api/notifications/send (Simulate WhatsApp or SMS alert)
router.post('/send', verifyToken, async (req, res) => {
  try {
    const { patient_id, phone, type = 'whatsapp', title, message } = req.body;

    if (!message || !title) {
      return res.status(400).json({ success: false, message: 'Notification title and message are required.' });
    }

    const newNotification = await db.insert('notifications', {
      patient_id: patient_id ? parseInt(patient_id, 10) : null,
      phone: phone || '+1 (555) 019-7756',
      type: type === 'sms' ? 'sms' : 'whatsapp',
      title,
      message,
      status: 'Delivered',
      timestamp: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: `${type.toUpperCase()} notification sent successfully!`,
      data: newNotification
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to send notification.' });
  }
});

export default router;
