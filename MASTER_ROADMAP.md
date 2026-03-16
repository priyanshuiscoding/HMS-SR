# SR-AIIMS HMS Master Roadmap

## 1. Project Objective

Build a web-based Hospital Management System for SR-AIIMS Ayurvedic Hospital using:

- Frontend: React 18, Vite, Tailwind CSS, Redux Toolkit, React Query
- Backend: Node.js 20, Express
- Database: PostgreSQL 16
- Cache and jobs: Redis 7, Bull
- Infra: Docker, Nginx, PM2, Ubuntu VPS

The system should support hospital operations across OPD, IPD, Panchkarma, Pharmacy, Inventory, Laboratory, Billing, Reporting, CRM, and Administration with strong security, auditability, and role-based access control.

## 2. Recommended Delivery Strategy

Do not treat this as a single giant build. Deliver it in layers:

1. Platform foundation
2. Front desk operations
3. Core clinical workflows
4. Financial workflows
5. Operational modules
6. Reporting and automation
7. Production hardening and rollout

Recommended target:

- Controlled MVP: 8-10 weeks
- Strong v1: 12-16 weeks

## 3. Scope Breakdown

### Foundation Modules

- Authentication
- Refresh/logout/OTP reset
- RBAC
- User/staff management
- Audit logs
- Shared settings
- Dashboard shell

### Front Desk Modules

- Patient registry
- Patient search and profile
- Appointment booking and rescheduling
- Token and queue management

### Clinical Modules

- OPD visits
- Vitals recording
- Ayurvedic assessment
- Prescription management
- EMR timeline
- IPD admissions
- IPD notes and vitals
- Discharge workflow

### Ayurveda and Therapy Modules

- Panchkarma therapy scheduling
- Therapist assignment
- Session execution
- Material usage tracking

### Pharmacy and Inventory Modules

- Medicine master
- Batch stock inventory
- GRN and supplier management
- Prescription-linked dispensing
- Stock ledger
- Low-stock and expiry alerts

### Laboratory Modules

- Test catalogue
- Lab order placement
- Sample collection
- Results entry
- PDF report generation

### Finance Modules

- Bill creation
- Payment collection
- Partial payment support
- Refunds
- GST and discounts
- Invoice PDF generation

### Admin and Analytics Modules

- Rooms and beds
- Operational dashboards
- Reports and analytics
- SMS configuration
- CRM/follow-up tracking

## 4. Dependency Map

Build order should follow these dependencies:

1. Auth, users, RBAC, shared frontend shell
2. Patient registry
3. Appointments
4. OPD visits
5. Ayurveda assessment and prescriptions
6. Billing base
7. Rooms and beds
8. IPD
9. Panchkarma
10. Pharmacy
11. Inventory
12. Laboratory
13. Reports and CRM
14. SMS automation and hardening

Critical dependency notes:

- Billing depends on OPD, IPD, Panchkarma, Pharmacy, and Lab charge sources
- Pharmacy depends on medicines, inventory batches, and prescriptions
- IPD depends on patients, users, rooms, and beds
- Panchkarma depends on patients, therapists, prescriptions, rooms, and billing
- Reports depend on stable schemas across all modules

## 5. Phase 0: Product Definition

This phase is mandatory before coding deeply.

### Decisions to Freeze

- Final hospital departments and roles
- OPD consultation workflow
- IPD admission and discharge workflow
- Panchkarma therapy catalogue
- Billing rules and GST applicability
- Payment modes and refund rules
- Patient registration fields required at reception
- Lab test catalogue and result format
- Medicine master categories and units
- Required reports for launch
- SMS templates and trigger events

### Output of Phase 0

- Module scope list for MVP
- Approved role matrix
- Final field list per module
- Report priority list
- Document upload policy
- Pricing and billing rules
- UAT stakeholders list

## 6. Target Architecture

### Monorepo Structure

```text
hms-ayurvedic/
  backend/
  frontend/
  nginx/
  docker/
  scripts/
  docs/
  .env.example
  docker-compose.yml
  README.md
```

### Backend Structure

Use module-based folders with clear separation:

- config
- middleware
- modules
- database
- utils
- jobs

Each module should contain:

- controller
- service
- routes
- validator
- queries or repository layer

### Frontend Structure

Use route-first organization with shared UI and feature modules:

- components/common
- components/layout
- modules
- pages
- hooks
- services
- store
- routes

## 7. Database Implementation Order

Create the schema in this order to avoid migration pain:

1. extensions
   - uuid-ossp or pgcrypto/gen_random_uuid setup
2. users
3. audit_logs
4. patients
5. appointments
6. opd_visits
7. ayurveda_assessments
8. prescriptions
9. prescription_medicines
10. rooms
11. beds
12. ipd_admissions
13. panchkarma_therapies
14. medicines
15. suppliers
16. inventory_batches
17. inventory_transactions
18. lab_tests
19. lab_orders
20. lab_results
21. bills
22. bill_items
23. payments
24. refunds
25. crm_followups
26. sms_logs

Also add:

- created_at
- updated_at
- deleted_at where soft delete is needed
- indexes on all searchable and foreign key columns

## 8. API Implementation Order

### Foundation APIs

- `/auth/login`
- `/auth/logout`
- `/auth/refresh`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/change-password`
- `/auth/me`
- `/users`

### Patient and Front Desk APIs

- `/patients`
- `/patients/search`
- `/appointments`
- `/appointments/today`
- `/appointments/available-slots`

### Clinical APIs

- `/opd/queue`
- `/opd/visits`
- `/opd/visits/:id/vitals`
- `/opd/visits/:id/prescriptions`
- `/opd/visits/:id/ayurveda`
- `/opd/visits/:id/lab-orders`
- `/opd/visits/:id/refer-ipd`

### IPD and Rooms APIs

- `/rooms`
- `/rooms/:id/beds`
- `/rooms/availability`
- `/ipd/admissions`
- `/ipd/admissions/:id/notes`
- `/ipd/admissions/:id/vitals`
- `/ipd/admissions/:id/discharge`

### Therapy, Pharmacy, Inventory, Lab APIs

- `/panchkarma/therapies`
- `/panchkarma/schedule`
- `/pharmacy/medicines`
- `/pharmacy/dispense`
- `/pharmacy/stock`
- `/inventory/receive`
- `/inventory/batches`
- `/inventory/transactions`
- `/lab/tests`
- `/lab/orders`

### Finance and Reporting APIs

- `/billing/bills`
- `/billing/payments`
- `/billing/refunds`
- `/billing/summary`
- `/reports/*`

## 9. Frontend Page Map

### Authentication

- Login
- Change password
- Forgot/reset password

### Dashboard

- Role-aware landing dashboard

### Patients

- Patient list
- Patient registration
- Patient profile
- Patient history

### Appointments

- Appointment list
- Appointment booking
- Daily queue
- Calendar/slots

### OPD

- OPD queue
- Visit details
- Vitals form
- Ayurvedic assessment
- Prescription builder

### IPD

- Admissions list
- New admission
- Bed assignment
- Daily notes
- Vitals chart
- Discharge summary

### Panchkarma

- Therapy schedule
- Therapist board
- Session execution page

### Pharmacy

- Medicine master
- Dispensing screen
- Stock dashboard
- Low stock
- Expiry alerts

### Inventory

- GRN entry
- Batch stock list
- Supplier management
- Purchase orders
- Stock ledger

### Laboratory

- Test catalogue
- Lab orders
- Pending samples
- Result entry
- Report view/download

### Billing

- Bill creation
- Bill details
- Payment entry
- Refunds
- Invoice view

### Reports and Admin

- Daily OPD
- IPD census
- Revenue
- Pharmacy sales
- Lab workload
- Panchkarma stats
- User management
- Room and bed settings
- SMS settings
- Audit logs

## 10. Sprint Plan

## Sprint 1: Foundation

Goals:

- Initialize monorepo
- Setup backend and frontend apps
- Configure database and Redis
- Build auth and RBAC
- Build dashboard shell

Deliverables:

- Login working
- Protected routes working
- User roles seeded
- Layout and navigation working

## Sprint 2: Patients and Appointments

Goals:

- Patient registration
- Patient search
- Profile and history placeholders
- Appointment booking and listing

Deliverables:

- Reception can register patients
- Search by UHID/name/phone works
- Appointment booking works

## Sprint 3: OPD Core

Goals:

- Queue dashboard
- Visit creation
- Vitals
- Consultation lifecycle

Deliverables:

- Daily OPD workflow is usable end to end

## Sprint 4: Ayurveda and Prescription

Goals:

- Ayurvedic assessment forms
- Prescription builder
- Follow-up capture
- Link to billing and pharmacy

Deliverables:

- Doctor can complete a consultation and issue prescription

## Sprint 5: Billing Base and Rooms

Goals:

- Basic bill and bill items
- Payments
- Rooms and beds setup
- Availability dashboard

Deliverables:

- OPD bills and room management usable

## Sprint 6: IPD

Goals:

- Admission workflow
- Bed assignment
- Clinical notes
- Vitals
- Discharge summary

Deliverables:

- IPD patient flow usable for controlled cases

## Sprint 7: Panchkarma

Goals:

- Therapy scheduling
- Therapist assignment
- Session execution and notes
- Therapy billing link

Deliverables:

- Daily Panchkarma operations manageable in system

## Sprint 8: Pharmacy and Inventory

Goals:

- Medicine master
- Batch inventory
- GRN
- Dispensing
- Stock alerts

Deliverables:

- Prescription-to-dispense flow complete

## Sprint 9: Lab and Reports

Goals:

- Lab test management
- Lab order workflow
- Result entry
- PDF reports
- Core operational reports

Deliverables:

- Lab flow complete
- Admin reports available

## Sprint 10: Hardening and Launch

Goals:

- SMS reminders
- Backup automation
- Security audit
- Performance tuning
- UAT and bug fixing

Deliverables:

- Production deployment
- Training-ready build
- Launch checklist signoff

## 11. MVP vs Post-MVP

### MVP Must-Haves

- Auth and RBAC
- Users
- Patients
- Appointments
- OPD visits
- Ayurveda assessment
- Prescriptions
- Basic billing
- Rooms and beds
- IPD admission/discharge
- Panchkarma scheduling
- Pharmacy dispensing
- Inventory stock receipt
- Lab order and results
- Basic reports
- Audit logs

### Post-MVP

- CRM depth
- Advanced analytics
- Package billing
- Rich document management
- Advanced EMR summaries
- WhatsApp integrations
- Multi-branch support
- Advanced financial exports

## 12. Team Recommendation

Single developer is possible for a rough MVP, but this is healthier:

- 1 full-stack lead developer
- 1 frontend-focused developer
- 1 QA/UAT coordinator
- 1 hospital operations stakeholder from reception/admin
- 1 doctor champion for clinical workflow signoff
- 1 accounts stakeholder for billing validation

If solo:

- Reduce scope
- Freeze change requests aggressively
- Delay non-essential analytics and CRM

## 13. Environment Plan

### Local

- Docker Compose for PostgreSQL and Redis
- Backend and frontend run in dev mode

### Staging

- Mirror production topology
- Separate DB and secrets
- Used for UAT and restore drills

### Production

- Ubuntu VPS
- Nginx reverse proxy
- PM2 cluster
- Dockerized DB/Redis/backend
- Static frontend via Nginx

## 14. Security Plan

Implement these from the first sprint:

- bcrypt password hashing
- JWT access and refresh flows
- Redis token revocation and OTP storage
- Zod validation on every endpoint
- Parameterized SQL only
- Helmet and CORS restrictions
- Role middleware on all protected routes
- Audit logs for sensitive actions
- Aadhaar encryption at rest
- Secure upload handling
- Rate limits on auth and general APIs

## 15. Testing Strategy

### Backend

- Unit tests for services and validators
- Integration tests for critical API workflows
- Permission tests for RBAC

### Frontend

- Component tests for reusable pieces
- Flow tests for login, registration, OPD, billing

### UAT

Run scenario-based testing:

- Register patient to OPD bill
- Register patient to IPD discharge bill
- Prescription to pharmacy dispense
- Lab order to report to billing
- Panchkarma schedule to completion to invoice

## 16. Data and Operational Readiness

Before launch, collect:

- Staff list with roles
- Doctors and therapists list
- Room and bed master
- Therapy master and pricing
- Medicine master
- Supplier master
- Lab test catalogue
- Billing charge catalogue
- Invoice header and branding
- SMS templates

## 17. Launch Checklist

- Production secrets set
- SSL configured
- Backups verified
- Restore drill completed
- Audit logs validated
- All core roles tested
- UAT signoff received
- Staff training completed
- Monitoring in place
- Rollback plan ready

## 18. Practical Recommendation for This Project

Use this execution model:

1. Build the platform and patient-facing operational core first
2. Reach a real usable OPD flow as early as possible
3. Add billing early, not at the end
4. Delay advanced reports until transactional modules stabilize
5. Keep every module thin and operational for MVP
6. Review workflow with hospital staff at the end of every sprint

## 19. Immediate Next Steps

1. Create project scaffold
2. Write detailed product requirement document per module
3. Design database migrations
4. Prepare API contract draft
5. Build authentication and users module
6. Build patient registry and appointments

