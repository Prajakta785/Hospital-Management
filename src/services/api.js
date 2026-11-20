// Centralized API client for ApexCare Hospital Management System
import { fallbackDepartments, fallbackDoctors } from '../data/fallbackData.js';

const BASE_URL = '/api';

async function request(endpoint, options = {}, retryCount = 0) {
  const token = localStorage.getItem('apexcare_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    // If 502/503/504 Bad Gateway, the backend is likely restarting or proxy connecting: auto-retry once after 600ms
    if ((response.status === 502 || response.status === 503 || response.status === 504) && retryCount < 2) {
      await new Promise(r => setTimeout(r, 650));
      return request(endpoint, options, retryCount + 1);
    }

    if (!response.ok) {
      let msg = data.message;
      if (!msg) {
        if (response.status === 502 || response.status === 503 || response.status === 504) {
          msg = 'सर्व्हर कनेक्ट होत आहे (Server initializing)... कृपया पुन्हा प्रयत्न करा.';
        } else {
          msg = `Request failed with status ${response.status}`;
        }
      }
      const error = new Error(msg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // If network failure / connection refused, auto-retry once
    if ((err.name === 'TypeError' || err.message?.includes('Failed to fetch')) && retryCount < 1) {
      await new Promise(r => setTimeout(r, 750));
      return request(endpoint, options, retryCount + 1);
    }
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  get: (endpoint, headers) => request(endpoint, { method: 'GET', headers }),
  post: (endpoint, body, headers) => request(endpoint, { method: 'POST', body: JSON.stringify(body), headers }),
  put: (endpoint, body, headers) => request(endpoint, { method: 'PUT', body: JSON.stringify(body), headers }),
  patch: (endpoint, body, headers) => request(endpoint, { method: 'PATCH', body: JSON.stringify(body), headers }),
  delete: (endpoint, headers) => request(endpoint, { method: 'DELETE', headers })
};

// Specialized Domain API Helpers
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  me: () => api.get('/auth/me'),
  switchDemo: (role) => api.post('/auth/demo-switch', { role })
};

export const departmentsApi = {
  getAll: async () => {
    try {
      const res = await api.get('/departments');
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        return res;
      }
      return { success: true, data: fallbackDepartments };
    } catch {
      return { success: true, data: fallbackDepartments };
    }
  },
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data)
};

export const doctorsApi = {
  getAll: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await api.get(`/doctors${query ? `?${query}` : ''}`);
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        return res;
      }
      return { success: true, data: fallbackDoctors };
    } catch {
      return { success: true, data: fallbackDoctors };
    }
  },
  getById: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`)
};

export const patientsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/patients${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/patients/${id}`),
  getDossier: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`)
};

export const appointmentsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/appointments${query ? `?${query}` : ''}`);
  },
  getOnlineStats: () => api.get('/appointments/online-stats'),
  getById: (id) => api.get(`/appointments/${id}`),
  book: (data) => api.post('/appointments', data),
  updateStatus: (id, status, notes) => api.patch(`/appointments/${id}/status`, { status, notes })
};

export const bedsApi = {
  getAll: () => api.get('/beds'),
  recommend: (data) => api.post('/beds/recommend', data),
  admit: (data) => api.post('/beds/admit', data),
  discharge: (data) => api.post('/beds/discharge', data),
  updateStatus: (id, status, notes) => api.patch(`/beds/${id}/status`, { status, notes })
};

export const pharmacyApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/pharmacy${query ? `?${query}` : ''}`);
  },
  checkSafety: (medicine_name, patient_id) => api.post('/pharmacy/check-safety', { medicine_name, patient_id }),
  add: (data) => api.post('/pharmacy', data),
  update: (id, data) => api.put(`/pharmacy/${id}`, data),
  dispense: (id, quantity, patient_id) => api.post(`/pharmacy/${id}/dispense`, { quantity, patient_id })
};

export const labApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/lab${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/lab/${id}`),
  order: (data) => api.post('/lab', data),
  authorizeResults: (id, resultsData) => api.put(`/lab/${id}/results`, resultsData)
};

export const billingApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/billing${query ? `?${query}` : ''}`);
  },
  getPaidTransactions: () => api.get('/billing/paid-transactions'),
  getById: (id) => api.get(`/billing/${id}`),
  create: (data) => api.post('/billing', data),
  autoDischarge: (patient_id) => api.post('/billing/auto-discharge', { patient_id }),
  pay: (id, paymentData) => api.post(`/billing/${id}/pay`, paymentData)
};

export const reportsApi = {
  getAnalytics: () => api.get('/reports/analytics')
};

export const auditApi = {
  getLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/audit${query ? `?${query}` : ''}`);
  },
  getSettings: () => api.get('/audit/settings'),
  updateSettings: (data) => api.put('/audit/settings', data)
};

export const prescriptionsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/prescriptions${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/prescriptions/${id}`),
  create: (data) => api.post('/prescriptions', data),
  delete: (id) => api.delete(`/prescriptions/${id}`)
};

export const staffApi = {
  getAll: () => api.get('/staff'),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  getAttendance: () => api.get('/staff/attendance'),
  punch: (data) => api.post('/staff/punch', data)
};

export const notificationsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/notifications${query ? `?${query}` : ''}`);
  },
  send: (data) => api.post('/notifications/send', data)
};

export const contactApi = {
  submit: (data) => api.post('/contact', data),
  getAll: () => api.get('/contact'),
  updateStatus: (id, status) => api.patch(`/contact/${id}`, { status }),
  delete: (id) => api.delete(`/contact/${id}`)
};

// Clinical Workflow API (Super Admin, Nurse, Doctor, QR Registration, WhatsApp)
export const workflowApi = {
  login: (loginId, password, expectedRole) => api.post('/workflow/login', { loginId, password, expectedRole }),
  registerPatient: (patientData) => api.post('/workflow/register', patientData),
  lookupPatient: (query) => api.get(`/workflow/lookup-patient?query=${encodeURIComponent(query)}`),
  getRegistrations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/workflow/registrations${query ? `?${query}` : ''}`);
  },
  getRegistrationById: (id) => api.get(`/workflow/registrations/${id}`),
  assignDoctor: (data) => api.post('/workflow/assign', data),
  updateRegistrationStatus: (id, status, notes) => api.patch(`/workflow/registrations/${id}/status`, { status, notes }),
  submitConsultation: (consultationData) => api.post('/workflow/consultation', consultationData),
  getConsultations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/workflow/consultations${query ? `?${query}` : ''}`);
  },
  getConsultationById: (id) => api.get(`/workflow/consultations/${id}`),
  getPrescription: (id) => api.get(`/workflow/consultations/${id}`),
  getStats: () => api.get('/workflow/stats'),
  getNurses: () => api.get('/workflow/nurses'),
  createNurse: (data) => api.post('/workflow/nurses', data),
  updateNurse: (id, data) => api.put(`/workflow/nurses/${id}`, data),
  getDoctors: () => api.get('/workflow/doctors'),
  createDoctor: (data) => api.post('/workflow/doctors', data),
  updateDoctor: (id, data) => api.put(`/workflow/doctors/${id}`, data),
  getWhatsAppLogs: () => api.get('/workflow/whatsapp/logs'),
  resendWhatsApp: (logId) => api.post('/workflow/whatsapp/resend', { logId }),
  getActivityLogs: () => api.get('/workflow/activity-logs'),
  getNurseDoctorAssignments: () => api.get('/workflow/nurse-doctor-assignments'),
  assignNurseToDoctor: (data) => api.post('/workflow/nurse-doctor-assignments', data),
  removeNurseDoctorAssignment: (id) => api.delete(`/workflow/nurse-doctor-assignments/${id}`)
};

// Re-export full Cloud Firestore & Firebase Storage services for direct real-time access
export * from '../firebase/firestoreService.js';
export { auth, firestoreDb, storage, isFirebaseConfigured } from '../firebase/config.js';


