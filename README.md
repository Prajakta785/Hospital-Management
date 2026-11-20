# 🏥 ApexCare Hospital Management Website & Admin Dashboard

A modern, production-grade Hospital Management System and Public Healthcare Portal built with **React 19 + Vite**, **Tailwind CSS v4**, **Node.js + Express**, and a resilient **MySQL & Persistent SQL Database Architecture**.

Designed with a premium clinical aesthetic featuring **Deep Emerald Green** (`#064e3b`), **Warm Subtle Gold** (`#d97706`), and **Crisp Slate & White** neutrals.

---

## 🌟 Key Features & System Modules

### 🌐 1. Public Healthcare Portal
1. **Home Page**:
   - Hero banner with 24/7 trauma care callout, stats counter (50k+ patients, 120+ MDs, 99.4% satisfaction).
   - 24/7 Emergency Ambulance hotline ribbon.
   - Clinical Specialties grid (Cardiology, Neurology, Orthopedics, Pediatrics, Oncology, Radiology, Emergency, OB/GYN).
   - Featured Senior Specialists directory with fees and booking links.
   - International accreditations (JCI Gold Seal, NABH, CAP, ISO 9001).
   - Real patient testimonials and trust metrics.
2. **About Us Page**:
   - Mission, vision, core ethical values.
   - State-of-the-art campus infrastructure (Robotic surgical theaters, 3T MRI, Smart ICUs).
   - Medical Executive & Advisory Board profiles.
3. **Doctors Page**:
   - Search by name, specialty, or condition.
   - Filter by clinical department chips.
   - Detailed physician cards with credentials, consultation fees, weekly availability, and instant booking CTA.
4. **Departments Page**:
   - Deep dive into specialized medical disciplines with scope of care, floor locations, and direct doctor links.
5. **Appointment Booking Wizard**:
   - 3-step interactive booking flow:
     1. Department & Doctor selection (with fee preview).
     2. Date picker and interactive time slot chips.
     3. Patient details & triage notes.
   - **Printable Clinical Appointment Voucher Slip** with reference number and arrival guidelines.
6. **Contact Page**:
   - 24/7 Emergency trauma numbers and ambulance desk.
   - Interactive inquiry form with feedback.
   - Campus directions, department extensions, and visiting hours.
7. **Authentication Page**:
   - Secure login & patient account registration.
   - **1-Click Demo Evaluation Box**: Instantly switch between Super Admin, Chief Doctor, Front Desk Staff, and Patient with zero typing!

---

### 🩺 2. Patient Health Records Portal
Dedicated self-service hub for logged-in patients:
- **My Appointments**: Active and completed consultations with status badges and printable booking vouchers.
- **My Prescriptions**: Active medication regimens, dosages, frequencies, and instructions.
- **Lab Diagnostic Reports**: Certified test findings, biological reference ranges, abnormal flags, and printable certificates.
- **Invoices & Billing**: View itemized hospital charges, simulated "Pay Online" action, and printable official receipts.
- **EHR Health Profile**: Confidential medical record, blood group, allergies, emergency contacts.

---

### 📊 3. Admin & Staff Management Dashboard
Full administrative hospital management suite:
- **Overview & Analytics**:
  - Real-time KPI stat cards (Total Patients, Active Doctors, Today's Bookings, Bed Occupancy %, Total Revenue, Low Stock Alerts).
  - Dynamic Recharts: 6-Month Inflow Trend (Area chart) and Department Volume (Bar chart).
  - Recent appointments feed and critical ward capacity monitor.
- **Patient Management (EHR)**:
  - Searchable, filterable patient table.
  - Register new patient modal with automatic unique MRN generation.
  - Edit patient demographics.
  - **Comprehensive Longitudinal Patient Dossier** (history, past visits, vitals, invoices, allocated bed).
- **Doctors & Clinical Staff**:
  - Physician directory with consultation fees, weekly schedules, and clinic rooms.
  - Add and edit doctor profiles.
- **Appointments Schedule**:
  - Live consultation queue with filters by doctor, department, and status.
  - Lifecycle actions: Complete, Cancel, or Print Appointment Voucher Slip.
- **Inpatient Ward & Bed Map**:
  - Interactive visual map across 4 wards: ICU (ICCU), General Surgical Ward, Private Suites, and Pediatric Care.
  - Color-coded bed tiles: Available (Green), Occupied (Amber/Red), Maintenance (Gray).
  - **1-Click Inpatient Admission Workflow**: Allocate vacant bed to patient -> bed turns occupied and patient status updates to Inpatient.
  - **Patient Discharge Action**: Frees bed and updates records.
- **Pharmacy Inventory & Batch Control**:
  - Medication catalog with brand name, generic formulation, strength, unit price, batch number, and expiry date.
  - Visual **Low Stock Alert Badges** (< threshold).
  - Add medicine batch and dispense units.
- **Laboratory Diagnostics & Pathology**:
  - Diagnostic test orders queue.
  - Order new lab test modal.
  - **Record & Authorize Results**: Input findings, reference range, abnormal flag, and electronic signature.
  - **Printable Certified Lab Report Modal**.
- **Billing, Invoices & Receipts**:
  - Financial summary: Total revenue, pending receivables, unpaid bills.
  - **Generate Itemized Invoice**: Dynamic line items (Consultation, Room & Board, Surgery, Pharmacy), automatic 5% tax and discount calculation.
  - **Record Payment Modal**: Cash, Credit Card, Debit Card, UPI, Insurance claim.
  - **Printable Official Tax Invoice / Receipt Modal**.
- **Reports & Operational Analytics**:
  - KPI filters (Last 7 Days, This Month, This Quarter).
  - Recharts revenue growth and department distribution.
  - **Export CSV Button**: Generates and downloads real `.csv` file.
- **Settings & Security Audit Logs**:
  - Hospital profile configuration (name, address, hotline, currency symbol, tax rate).
  - **Security Audit Trail**: Logs every system event (logins, patient registrations, bed allocations, lab authorizations, billing payments) with actor, timestamp, and IP.

---

## 🔑 Pre-Seeded Demo Credentials

For quick evaluation, use the 1-click switcher on the top navigation bar or the login page:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Super Admin** | `admin@hospital.com` | `admin123` | Full access to all admin modules & settings |
| **Chief Doctor** | `doctor@hospital.com` | `doctor123` | Clinical records, lab authorization, schedule |
| **Front Desk Staff**| `staff@hospital.com` | `staff123` | Patient intake, appointments, beds, billing |
| **Patient** | `patient@hospital.com` | `patient123` | Personal EHR, appointments, bills, reports |

---

## 🚀 Running the Project

### 1. Start the Backend API Server
```powershell
# From the project root:
npm run server

# Or with auto-reload:
npm run server:dev
```
Backend runs on: `http://localhost:5000`  
Health check endpoint: `http://localhost:5000/api/health`

### 2. Start the Frontend Application
```powershell
# In a second terminal:
npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## 🗄️ Database Setup & MySQL Integration

### Out-of-the-Box Mode (Zero Setup Required)
The backend features an automatic resilient data engine (`server/data/hospital_store.json`). If local MySQL credentials are not yet configured, the system operates in persistent SQL mode with full CRUD, auto-incrementing IDs, and rich seed data.

### Connecting to Your Local MySQL 8.0 Server
1. Ensure your local `MySQL80` service is running.
2. Open `server/.env` and supply your MySQL password:
   ```env
   PORT=5000
   JWT_SECRET=apexcare_hospital_super_secret_jwt_key_2026
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
   DB_NAME=hospital_db
   ```
3. Restart the server (`npm run server`). The application will connect to MySQL, create the `hospital_db` database, execute `schema.sql`, and populate the tables automatically.

---

## 🛠️ Technology Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React, Recharts, Date-fns
- **Backend**: Node.js, Express, MySQL2, JSON Web Tokens (JWT), Bcrypt.js, Morgan, CORS
- **Design System**: Emerald Green (`#064e3b` / `#047857`), Warm Gold (`#d97706` / `#f59e0b`), Slate White
