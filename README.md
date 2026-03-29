# HealthHub Bridge — Community Clinic Management System

> A web-based clinic management platform designed for community health facilities in South Sudan.  
> Built for the BSc. Software Engineering final project, African Leadership University, March 2026.

---

## 1. Project Overview

The **Community Clinic Management System (CCMS)**, developed under the group name **HealthHub Bridge** — is a full-stack web application that digitises the daily operations of small community clinics. The system was designed specifically for clinics in South Sudan, where most facilities still rely on paper-based records, manual appointment books, and handwritten prescriptions.

### Problem Being Solved

Community clinics in South Sudan operate in a resource-constrained environment characterised by:
- Paper patient files that get lost, damaged, or left behind when staff change
- No structured appointment scheduling, leading to overcrowding on some days and empty clinics on others
- Prescriptions going unrecorded, making it impossible to review a patient's medication history
- No reporting infrastructure, meaning clinic managers cannot produce data for the NGOs and government bodies that fund them

### What the System Does

| Module | What it enables |
|---|---|
| Patient Registration | Register patients without formal ID, search by name or clinic number |
| Appointment Scheduling | Book appointments with availability checking and double-booking prevention |
| Medical Records | Record clinical visits, diagnoses, and prescriptions linked to each patient |
| Billing | Create itemised invoices, record partial and full payments, track outstanding balances |
| Reports & Analytics | Generate financial, clinical, and operational reports for administrators and funders |
| Role-Based Access | Receptionist, Doctor, and Admin roles with enforced permission boundaries |

---

## 2. Team Members

| Name | Role | Responsibilities |
|---|---|---|
| **Belyse Intwaza** | Project Manager/Frontend Developer 
| **Solomon Leek** | Frontend Developer 
| **Toluwani Oladeji** | Backend Developer
| **Ahmad Daib** | System Architect

---

## 3. Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.12 | Core backend language |
| Flask | 3.0.3 | REST API web framework |
| Flask-CORS | 4.0.1 | Cross-origin resource sharing |
| mysql-connector-python | 8.3.0 | MySQL database driver |

### Database
| Technology | Version | Purpose |
|---|---|---|
| MySQL | 8.0 | Relational database |

### Frontend
| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styling and layout |
| Vanilla JavaScript | Dynamic behaviour and API calls |

### Development Tools
| Tool | Purpose |
|---|---|
| DataGrip | Database IDE for schema management and testing |
| Postman | API testing |
| VS Code | Frontend and Backend development environment |
| GitHub | Version control |

---

## 4. Project Structure

```
HEALTHHUBBRIDGE_PROJECT/
├── backend/                  ← Flask REST API
│   ├── routes/               ← One blueprint per module
│   ├── app.py                ← App entry point, blueprint registration
│   ├── config.py             ← DB config, session lifetime, cache TTL
│   ├── cache.py              ← In-memory cache layer
│   └── requirements.txt
├── frontend/                 ← Vanilla HTML/CSS/JS
│   ├── index.html            ← Login page
│   ├── dashboard/
│   ├── patients/
│   ├── appointments/
│   ├── billing/
│   ├── doctors/
│   ├── reports/
│   ├── auth/
│   └── assets/
├── db_setup/
│   ├── clinic_db.sql         ← Full schema with constraints
│   ├── test_data.sql         ← Sample data for development
│   └── ERD_diagram.pdf
```

---

## 5. Prerequisites

Make sure the following are installed on your machine before setup:

- **Python 3.10+** — [https://www.python.org/downloads/](https://www.python.org/downloads/)
- **MySQL 8.0+** — [https://dev.mysql.com/downloads/](https://dev.mysql.com/downloads/)
- **pip** — comes with Python
- **Git** — [https://git-scm.com/](https://git-scm.com/)
- **VS Code** with the **Live Server** extension — for the frontend
- **Postman** (optional but recommended for API testing) — [https://www.postman.com/](https://www.postman.com/)

---

## 6. Database Setup

### Step 1 — Clone the repository

```bash
git clone https://github.com/solomon-211/HealthHubBridge_Project.git
cd HealthHubBridge_Project
```

### Step 2 — Create the database and tables

Open a terminal and run:

```bash
mysql -u root -p < db_setup/clinic_db.sql
```

This single command creates the `healthbridge_db` database, all 14 tables with correct constraints and indexes, and seeds the doctor and service catalogue data.

### Step 3 — Load test data

```bash
mysql -u root -p healthbridge_db < db_setup/test_data.sql
```

This inserts sample patients, appointments, visits, diagnoses, prescriptions, invoices, payments, and user accounts for testing all features.

### Step 4 — Set correct password hashes

The test data contains placeholder password hashes. Run these SQL statements to set working passwords:

```sql
USE healthbridge_db;

UPDATE users SET password = SHA2('admin123',    256) WHERE username = 'admin.juba';
UPDATE users SET password = SHA2('doctor123',   256) WHERE username = 'j.lual';
UPDATE users SET password = SHA2('doctor123',   256) WHERE username = 'g.akuei';
UPDATE users SET password = SHA2('reception123',256) WHERE username = 'amina.lado';
UPDATE users SET password = SHA2('reception123',256) WHERE username = 'john.ladu';
```

---

## 7. Backend Setup

### Step 1 — Navigate to the backend folder

```bash
cd backend
```

### Step 2 — Create and activate a virtual environment (recommended)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 3 — Install dependencies

```bash
pip install -r requirements.txt
```

### Step 4 — Configure your database credentials

Open `backend/config.py` and update the following values to match your local MySQL setup:

```python
DB_HOST     = 'localhost'
DB_PORT     = 3306
DB_USER     = 'root'
DB_PASSWORD = 'your_mysql_password_here'
DB_NAME     = 'healthbridge_db'
```

---

## 8. Frontend Setup

No build step is required. The frontend is plain HTML, CSS, and JavaScript.

---

## 9. Running the Project

### Start the backend

```bash
cd backend
python app.py
```

You should see:

```
* Serving Flask app 'app'
* Debug mode: on
* Running on http://127.0.0.1:5000
* Running on http://0.0.0.0:5000
```

### Start the frontend

Launch the frontend with python -m http.server 5500

The app will open at `http://127.0.0.1:5500`

## 10. Environment Configuration

All configuration lives in `backend/config.py`. The following values can be set via environment variables or edited directly:

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | `healthbridge-dev-secret-key` | Flask session signing key — **change in production** |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | MySQL username |
| `DB_PASSWORD` | `''` | MySQL password |
| `DB_NAME` | `healthbridge_db` | Database name |
| `SESSION_LIFETIME` | `3600` | Session expiry in seconds (1 hour) |
| `CACHE_TTL` | `30` | Default cache duration in seconds |
| `SESSION_COOKIE_SAMESITE` | `Lax` | Cookie SameSite policy |
| `SESSION_COOKIE_SECURE` | `False` | Set to `True` in HTTPS production |

CORS is configured in `app.py`. By default it allows:

```python
origins=["http://127.0.0.1:5500", "http://localhost:5500"]
```

Update this if your frontend runs on a different port or domain.

---

## 11. API Reference

All endpoints are prefixed with `/api`. All request and response bodies use JSON. All endpoints except `/api/auth/login` require an active session (login first).

### Authentication

#### `POST /api/auth/login`

Authenticates a staff member and creates a server-side session.

**Request body:**
```json
{
    "username": "admin.juba",
    "password": "admin123"
}
```

**Success response `200`:**
```json
{
    "message": "Login successful",
    "user": {
        "username": "admin.juba",
        "role": "admin"
    }
}
```

**Error responses:**
- `400` — missing username or password
- `401` — invalid credentials
- `503` — database unavailable

---

#### `POST /api/auth/logout`

Clears the current session.

**Success response `200`:**
```json
{ "message": "Logged out successfully" }
```

---

### Patients

#### `GET /api/patients`

Returns all registered patients. Supports optional search filtering.

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `search` | string | Filters by first name, last name, or clinic number |

**Example:** `GET /api/patients?search=Akol`

**Success response `200`:**
```json
{
    "patients": [
        {
            "patient_id": 1,
            "first_name": "Akol",
            "last_name": "Deng",
            "date_of_birth": "1990-04-12",
            "gender": "M",
            "clinic_number": "CLN-0001",
            "blood_type": "O+",
            "insurance_provider": "SSRA Health",
            "registered_at": "2025-06-10T08:00:00"
        }
    ],
    "source": "db"
}
```

---

#### `POST /api/patients`

Registers a new patient.

**Required fields:** `first_name`, `last_name`, `date_of_birth`, `gender`, `clinic_number`

**Request body:**
```json
{
    "first_name": "Ayen",
    "last_name": "Bior",
    "date_of_birth": "1998-03-10",
    "gender": "F",
    "phone": "+211 912 100 099",
    "blood_type": "A+",
    "emergency_contact": "James Bior — +211 912 100 100",
    "insurance_provider": "None",
    "national_id": "SS-NID-00199",
    "clinic_number": "CLN-0006"
}
```

**Success response `201`:**
```json
{ "id": 6, "clinic_number": "CLN-0006" }
```

**Error responses:**
- `400` — missing required fields
- `409` — clinic number already registered

---

#### `GET /api/patients/:id`

Returns the full profile of a single patient.

**Success response `200`:**
```json
{ "patient": { ...all fields... }, "source": "db" }
```

**Error responses:**
- `404` — patient not found

---

#### `PATCH /api/patients/:id`

Updates editable patient fields. Protected fields (`patient_id`, `clinic_number`, `registered_at`) are silently ignored even if included.

**Updatable fields:** `phone`, `email`, `address`, `emergency_contact`, `insurance_provider`, `blood_type`

**Request body:**
```json
{
    "phone": "+211 912 999 999",
    "email": "updated@email.com"
}
```

**Success response `200`:**
```json
{ "message": "Patient updated successfully" }
```

---

### Doctors

#### `GET /api/doctors`

Returns all active doctors (`is_active = 1`).

**Success response `200`:**
```json
{
    "doctors": [
        {
            "doctor_id": 1,
            "full_name": "Dr. James Lual",
            "specialization": "General Practice",
            "phone": "+211 922 200 001",
            "email": "j.lual@clinic.ss"
        }
    ],
    "source": "cache"
}
```

---

#### `GET /api/doctor-schedules`

Returns the weekly schedules of all active doctors.

**Success response `200`:**
```json
{
    "schedules": [
        {
            "schedule_id": 1,
            "doctor_id": 1,
            "full_name": "Dr. James Lual",
            "specialization": "General Practice",
            "day_of_week": "Mon",
            "start_time": "08:00"
        }
    ]
}
```

---

#### `GET /api/doctor-schedules/:doctor_id?date=YYYY-MM-DD`

Returns availability for a specific doctor on a given date.

**Query parameter:** `date` (required) — format `YYYY-MM-DD`

**Example:** `GET /api/doctor-schedules/1?date=2026-04-07`

**Success response `200` (available):**
```json
{
    "doctor_id": 1,
    "date": "2026-04-07",
    "available": true,
    "start_time": "08:00",
    "booked_slots": ["2026-04-07 09:00:00"]
}
```

**Success response `200` (unavailable):**
```json
{
    "available": false,
    "message": "Doctor does not work on this day"
}
```

---

### Appointments

#### `GET /api/appointments`

Returns all appointments. Supports optional filtering.

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `doctor_id` | int | Filter by doctor |
| `status` | string | Filter by status: `Scheduled`, `Completed`, `Cancelled`, `No-show` |
| `date` | string | Filter by date: `YYYY-MM-DD` |

**Success response `200`:**
```json
{
    "appointments": [
        {
            "appointment_id": 1,
            "appointment_datetime": "2025-06-10T09:00:00",
            "reason": "Persistent fever and headache",
            "status": "Completed",
            "first_name": "Akol",
            "last_name": "Deng",
            "clinic_number": "CLN-0001",
            "doctor_name": "Dr. James Lual"
        }
    ]
}
```

---

#### `GET /api/appointments/today`

Returns all appointments scheduled for today.

---

#### `GET /api/appointments/upcoming`

Returns all future appointments with status `Scheduled`.

---

#### `GET /api/appointments/week-summary`

Returns a day-by-day count of appointments for the current 7-day window.

**Success response `200`:**
```json
{
    "summary": [
        {
            "appt_date": "2026-03-25",
            "total": 5,
            "completed": 3,
            "cancelled": 1,
            "no_show": 0,
            "scheduled": 1
        }
    ]
}
```

---

#### `POST /api/appointments`

Books a new appointment. Validates doctor availability and checks for double-bookings.

**Required fields:** `patient_id`, `doctor_id`, `appointment_datetime`

**Request body:**
```json
{
    "patient_id": 1,
    "doctor_id": 1,
    "appointment_datetime": "2026-04-07 09:00:00",
    "reason": "Follow-up consultation"
}
```

**Success response `201`:**
```json
{ "id": 6, "message": "Appointment booked successfully" }
```

**Error responses:**
- `400` — missing fields, past datetime, or invalid format
- `409` — doctor unavailable that day, or slot already booked within 30 minutes

---

#### `PATCH /api/appointments/:id`

Updates the status of an appointment.

**Valid statuses:** `Scheduled`, `Completed`, `Cancelled`, `No-show`

**Request body:**
```json
{ "status": "Completed" }
```

**Success response `200`:**
```json
{ "message": "Appointment marked as Completed" }
```

**Error responses:**
- `400` — invalid status value
- `404` — appointment not found

---

### Medical Visits

#### `GET /api/medical-visits/:patient_id`

Returns all medical visits for a patient, newest first. Each visit includes its diagnoses and prescriptions pre-attached.

**Success response `200`:**
```json
{
    "visits": [
        {
            "visit_id": 1,
            "visit_date": "2025-06-10",
            "notes": "Patient had 38.9°C fever. Malaria RDT positive.",
            "doctor_name": "Dr. James Lual",
            "diagnoses": ["Plasmodium falciparum malaria — uncomplicated"],
            "prescriptions": [
                {
                    "drug_name": "Artemether-Lumefantrine (Coartem)",
                    "dosage": "4 tablets twice daily",
                    "duration": "3 days"
                }
            ]
        }
    ]
}
```

---

#### `POST /api/medical-visits`

Records a new medical visit. Walk-in patients can be recorded by omitting `appointment_id`.

**Requires role:** `doctor` or `admin`

**Required fields:** `patient_id`, `doctor_id`, `visit_date`

**Request body:**
```json
{
    "patient_id": 1,
    "doctor_id": 1,
    "appointment_id": 1,
    "visit_date": "2026-04-07",
    "notes": "Patient presented with mild cough."
}
```

**Success response `201`:**
```json
{ "visit_id": 6, "message": "Visit recorded" }
```

---

### Diagnoses

#### `GET /api/diagnoses/:visit_id`

Returns all diagnoses recorded during a specific visit.

---

#### `POST /api/diagnoses`

Adds a diagnosis to a visit.

**Requires role:** `doctor` or `admin`

**Required fields:** `visit_id`, `description`

**Request body:**
```json
{
    "visit_id": 6,
    "description": "Acute upper respiratory tract infection"
}
```

**Success response `201`:**
```json
{ "diagnosis_id": 6 }
```

---

### Prescriptions

#### `GET /api/prescriptions/:patient_id`

Returns all prescriptions for a patient across all visits, newest first.

---

#### `POST /api/prescriptions`

Adds a prescription to a visit.

**Requires role:** `doctor` or `admin`

**Required fields:** `visit_id`, `drug_name`

**Request body:**
```json
{
    "visit_id": 6,
    "drug_name": "Amoxicillin",
    "dosage": "500mg three times daily",
    "duration": "7 days",
    "end_time": "2026-04-14 00:00:00"
}
```

**Success response `201`:**
```json
{ "prescription_id": 6 }
```

---

### Billing — Invoices

#### `GET /api/invoices`

Returns all invoices. Supports optional filtering.

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `patient_id` | int | Filter by patient |
| `status` | string | Filter by `Unpaid`, `Partial`, or `Paid` |

---

#### `GET /api/invoices/:id`

Returns a single invoice with its full line-item breakdown.

**Success response `200`:**
```json
{
    "invoice": {
        "invoice_id": 1,
        "invoice_date": "2025-06-10",
        "total_amount": 800.00,
        "discount": 0.00,
        "amount_due": 800.00,
        "payment_status": "Paid",
        "first_name": "Akol",
        "last_name": "Deng",
        "items": [
            {
                "service_name": "General Consultation",
                "quantity": 1,
                "unit_price": 500.00,
                "subtotal": 500.00,
                "category": "Consultation"
            }
        ]
    }
}
```

---

#### `POST /api/invoices`

Creates a new invoice. Totals are always calculated server-side from the services table.

**Requires role:** `admin` or `receptionist`

**Required fields:** `patient_id`, `items` (array with at least one item)

**Request body:**
```json
{
    "patient_id": 1,
    "appointment_id": 6,
    "discount": 50.00,
    "items": [
        { "service_id": 1, "quantity": 1 },
        { "service_id": 2, "quantity": 1 }
    ]
}
```

**Success response `201`:**
```json
{
    "invoice_id": 6,
    "total": 800.00,
    "amount_due": 750.00
}
```

**Error responses:**
- `400` — missing patient_id, empty items array, or unknown service_id

---

### Billing — Payments

#### `POST /api/payments`

Records a payment against an invoice. Automatically updates the invoice status to `Partial` or `Paid` based on the total paid.

**Requires role:** `admin` or `receptionist`

**Required fields:** `invoice_id`, `amount_paid`, `payment_date`

**Request body:**
```json
{
    "invoice_id": 4,
    "payment_date": "2026-04-07",
    "amount_paid": 400.00,
    "payment_method": "Cash",
    "reference_no": "RCP-SS-010",
    "received_by": "Amina Lado"
}
```

**Valid payment methods:** `Cash`, `Card`, `Mobile`, `Insurance`

**Success response `201`:**
```json
{ "message": "Payment recorded", "new_status": "Paid" }
```

**Error responses:**
- `400` — missing required fields
- `404` — invoice not found
- `409` — invoice is already fully paid

---

### Services

#### `GET /api/services`

Returns the full catalogue of billable services.

**Success response `200`:**
```json
{
    "services": [
        {
            "service_id": 1,
            "service_name": "General Consultation",
            "description": "Standard outpatient doctor consultation",
            "unit_price": 500.00,
            "category": "Consultation"
        }
    ]
}
```

---

### Dashboard & Analytics

#### `GET /api/dashboard/stats`

Returns today's summary statistics for the reception dashboard.

**Requires:** Any logged-in role

**Success response `200`:**
```json
{
    "stats": {
        "total_patients": 126,
        "appointments_today": {
            "Scheduled": 3,
            "Completed": 8,
            "Cancelled": 1,
            "No-show": 0
        },
        "revenue_today": 4500.00,
        "unpaid_invoices": 2
    },
    "source": "db"
}
```

---

#### `GET /api/analytics/weekly`

Returns a 7-day trend of appointments and revenue.

---

#### `GET /api/analytics/snapshots`

Returns pre-aggregated daily statistics from the `analytics_snapshots` table.

**Query parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | int | 30 | Number of days to return (max 90) |

**Success response `200`:**
```json
{
    "snapshots": [
        {
            "snapshot_date": "2025-06-14",
            "total_patients": 126,
            "total_appointments": 19,
            "total_revenue": 2950.00,
            "top_diagnosis": "Malaria",
            "cancellation_rate": 10.53,
            "avg_wait_time_min": 14
        }
    ]
}
```

---

### Reports

All report endpoints require the `admin` role.

#### `GET /api/reports/financial`

Returns revenue collected, breakdown by payment method, and outstanding balances for a date range.

**Query parameters:** `from` (default: first of current month), `to` (default: today)

**Example:** `GET /api/reports/financial?from=2025-06-01&to=2025-06-30`

**Success response `200`:**
```json
{
    "period": { "from": "2025-06-01", "to": "2025-06-30" },
    "total_collected": 2300.00,
    "by_method": [
        { "payment_method": "Cash", "total": 1200.00, "transactions": 2 },
        { "payment_method": "Insurance", "total": 450.00, "transactions": 1 }
    ],
    "by_status": [
        { "payment_status": "Paid", "count": 3, "total_owed": 1800.00 },
        { "payment_status": "Unpaid", "count": 1, "total_owed": 400.00 }
    ]
}
```

---

#### `GET /api/reports/clinical`

Returns the top 10 most frequent diagnoses and total visit count for a date range.

**Requires role:** `admin` or `doctor`

**Example:** `GET /api/reports/clinical?from=2025-06-01&to=2025-06-30`

---

#### `GET /api/reports/operational`

Returns appointment completion rates, cancellation rates, and average wait times for a date range.

**Example:** `GET /api/reports/operational?from=2025-06-01&to=2025-06-30`

---

## 12. Role-Based Access Control

The system enforces three staff roles. Every route is protected by either `@login_required` or `@role_required`.

| Route Category | Receptionist | Doctor | Admin |
|---|---|---|---|
| Login / Logout | ✅ | ✅ | ✅ |
| View patients | ✅ | ✅ | ✅ |
| Register / update patients | ✅ | ❌ | ✅ |
| Book / view appointments | ✅ | ✅ | ✅ |
| Record medical visits | ❌ | ✅ | ✅ |
| Add diagnoses | ❌ | ✅ | ✅ |
| Add prescriptions | ❌ | ✅ | ✅ |
| Create invoices | ✅ | ❌ | ✅ |
| Record payments | ✅ | ❌ | ✅ |
| Financial reports | ❌ | ❌ | ✅ |
| Clinical reports | ❌ | ✅ | ✅ |
| Operational reports | ❌ | ❌ | ✅ |
| Dashboard stats | ✅ | ✅ | ✅ |
| Analytics snapshots | ✅ | ✅ | ✅ |

Attempting to access a restricted route returns:
```json
{ "error": "You do not have permission to access this resource" }
```
with HTTP status `403 Forbidden`.

---

## 13. Low-Connectivity Features

This system was specifically designed to remain functional on slow or intermittent internet connections, which is a real constraint for clinics in South Sudan.

### In-Memory Cache (`cache.py`)

All frequently-loaded GET endpoints cache their responses in memory for a configurable TTL. This drastically reduces database queries when multiple staff members use the system simultaneously.

| Endpoint | Cache TTL | Reason |
|---|---|---|
| `GET /api/patients` | 30s | New registrations happen regularly |
| `GET /api/appointments/today` | 60s | Refreshed constantly by reception |
| `GET /api/dashboard/stats` | 60s | Loaded on every app open |
| `GET /api/analytics/weekly` | 5 min | Week trends change slowly |
| `GET /api/doctors` | 5 min | Doctor roster rarely changes |
| `GET /api/services` | 10 min | Service prices almost never change |

Cache is automatically invalidated after any POST or PATCH request using prefix-based key deletion.

### Fast-Fail Database Connections

All database connections use `connect_timeout=10`. On a poor network, instead of hanging indefinitely, requests fail within 10 seconds and return a clean `503` response so the frontend can display a retry prompt.

### Pre-Aggregated Analytics

The `analytics_snapshots` table stores pre-computed daily statistics written by a scheduled job. The dashboard reads a single indexed row instead of running complex multi-table aggregations on every page load.

### Structured Error Handling

Every route is wrapped in `try/except`. Network failures, database timeouts, and unexpected errors all return structured JSON responses — never raw Python tracebacks — so the frontend always has something it can handle gracefully.

### Frontend indexdb Caching
The data is cached on the frontend so the service still works even though the backend fails.

---

## 14. Database Schema Summary

The system uses 14 tables in MySQL. All tables include appropriate indexes for performance.

| Table | Purpose | Key Relationships |
|---|---|---|
| `users` | Staff login accounts with role | Standalone |
| `patients` | Patient registry | Standalone |
| `doctors` | Medical staff profiles | Standalone |
| `doctor_schedule` | Weekly availability per doctor | → doctors |
| `appointments` | Scheduled visits | → patients, doctors |
| `medical_visits` | Actual clinical consultations | → patients, doctors, appointments |
| `diagnoses` | Diagnoses per visit | → medical_visits |
| `prescriptions` | Medications prescribed per visit | → medical_visits |
| `services` | Billable service catalogue | Standalone |
| `invoices` | Billing records per patient | → patients, appointments |
| `invoice_items` | Line items on each invoice | → invoices, services |
| `payments` | Payment transactions | → invoices |
| `reports` | Generated report metadata | Standalone |
| `analytics_snapshots` | Pre-computed daily statistics | Standalone |

---

## 15. Testing the API with Postman

### Setup

1. Open Postman
2. Create a new Environment called `CCMS Local`
3. Add variable: `base_url` = `http://127.0.0.1:5000`
4. Select the environment from the top-right dropdown

### Recommended test sequence

```
1.  POST {{base_url}}/api/auth/login          → Login as admin.juba
2.  GET  {{base_url}}/api/patients             → View all patients
3.  POST {{base_url}}/api/patients             → Register a new patient
4.  GET  {{base_url}}/api/doctors              → View active doctors
5.  GET  {{base_url}}/api/doctor-schedules/1?date=2026-04-07
6.  POST {{base_url}}/api/appointments         → Book appointment
7.  POST {{base_url}}/api/auth/login           → Switch to doctor role (j.lual)
8.  POST {{base_url}}/api/medical-visits       → Record a visit
9. POST {{base_url}}/api/diagnoses            → Add diagnosis
10. POST {{base_url}}/api/prescriptions        → Add prescription
11. POST {{base_url}}/api/auth/login           → Switch back to receptionist
12. GET  {{base_url}}/api/services             → View service catalogue
13. POST {{base_url}}/api/invoices             → Create invoice
14. POST {{base_url}}/api/payments             → Record payment
15. GET  {{base_url}}/api/dashboard/stats      → View dashboard
16. GET  {{base_url}}/api/reports/financial?from=2025-06-01&to=2025-06-30
17. POST {{base_url}}/api/auth/logout          → Logout
18. GET  {{base_url}}/api/patients             → Confirm 401 after logout
```

---

## 16. Default Login Credentials

> These credentials are for development and testing only. Change all passwords before any real-world deployment.

| Username | Password | Role |
|---|---|---|
| `admin.juba` | `admin123` | Admin |
| `j.lual` | `doctor123` | Doctor |
| `g.akuei` | `doctor123` | Doctor |
| `amina.lado` | `reception123` | Receptionist |
| `john.ladu` | `reception123` | Receptionist |

---
### License

This project was developed as an academic submission for the BSc. Software Engineering programme at African Leadership University. It is not licensed for commercial use.

---

*HealthHub Bridge — HealthHub Bridge Team — March 2026*
