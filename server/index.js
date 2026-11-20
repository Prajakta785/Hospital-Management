import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initDatabase, db } from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import departmentRoutes from './routes/departments.routes.js';
import doctorRoutes from './routes/doctors.routes.js';
import patientRoutes from './routes/patients.routes.js';
import appointmentRoutes from './routes/appointments.routes.js';
import bedRoutes from './routes/beds.routes.js';
import pharmacyRoutes from './routes/pharmacy.routes.js';
import labRoutes from './routes/lab.routes.js';
import billingRoutes from './routes/billing.routes.js';
import reportRoutes from './routes/reports.routes.js';
import auditRoutes from './routes/audit.routes.js';
import prescriptionRoutes from './routes/prescriptions.routes.js';
import staffRoutes from './routes/staff.routes.js';
import notificationRoutes from './routes/notifications.routes.js';
import contactRoutes from './routes/contact.routes.js';
import workflowRoutes from './routes/clinicalWorkflow.routes.js';
import settingsRoutes from './routes/settings.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Mount Modular API Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'ApexCare Hospital Management System API',
    databaseMode: db.getMode()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Boot server
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🏥 ApexCare Hospital API Server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`💾 Database Storage Mode: ${db.getMode()}`);
    console.log(`====================================================`);
  });
}

startServer();

/* reload_trigger: 1795084533699 */