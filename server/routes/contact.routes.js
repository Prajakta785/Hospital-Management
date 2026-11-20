import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

// GET /api/contact - List all website patient support inquiries (Staff & Admin)
router.get('/', async (req, res) => {
  try {
    let messages = await db.getCollection('support_messages');
    if (!messages) messages = [];
    return res.json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve messages.' });
  }
});

// POST /api/contact - Submit patient inquiry from public website
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, department, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const year = new Date().getFullYear();
    const ticketId = `TCK-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket = await db.insert('support_messages', {
      ticket_id: ticketId,
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : '',
      department: department || 'General Inquiries',
      subject: subject || 'Public Website Consultation Request',
      message: message.trim(),
      status: 'new',
      created_at: new Date().toISOString()
    });

    // Notify Hospital Front Desk
    try {
      await db.insert('notifications', {
        patient_id: null,
        type: 'whatsapp',
        title: `New Website Inquiry (${ticketId})`,
        message: `From ${name} (${phone || email}) regarding ${department || 'General'}: "${message.slice(0, 100)}"`,
        phone: '+1 (800) 273-9227',
        status: 'delivered',
        timestamp: new Date().toISOString()
      });
    } catch (notifErr) {
      console.warn('Contact notification error:', notifErr);
    }

    // Add Audit Log
    await db.addAuditLog({
      user_id: null,
      user_name: name,
      role: 'guest',
      action: 'WEBSITE_CONTACT_SUBMISSION',
      entity_type: 'SupportTicket',
      entity_id: ticketId,
      details: `Inquiry submitted for ${department} department.`
    });

    return res.status(201).json({
      success: true,
      message: 'Your inquiry has been logged with the patient relations desk.',
      data: newTicket
    });
  } catch (err) {
    console.error('Contact submission error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send inquiry.' });
  }
});

// PATCH /api/contact/:id - Update status of inquiry (e.g. 'resolved', 'reviewed')
router.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    const updated = await db.update('support_messages', id, { status: status || 'reviewed' });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    return res.json({ success: true, message: 'Status updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update message.' });
  }
});

// DELETE /api/contact/:id - Delete inquiry
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete('support_messages', id);
    return res.json({ success: true, message: 'Message deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete message.' });
  }
});

export default router;
