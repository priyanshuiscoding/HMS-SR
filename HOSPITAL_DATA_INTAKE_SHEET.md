# SR-AIIMS HMS Data Intake Sheet (One Page)

Use this sheet to collect all required setup data before database migration and production configuration.

Hospital Name: ____________________  Location: ____________________  Date: ____________________
Prepared By (Hospital): ____________________  Mobile: ____________________  Email: ____________________
Prepared By (Implementation Team): ____________________  Target Go-Live: ____________________

## 1) Roles and Access (RBAC)

| Role Name | Staff Names / Count | Module Access Needed | Approvals Allowed (Y/N) |
|---|---|---|---|
| Admin |  |  |  |
| Reception |  |  |  |
| Doctor |  |  |  |
| Therapist |  |  |  |
| Pharmacy |  |  |  |
| Lab |  |  |  |
| Billing/Accounts |  |  |  |

## 2) Patient Registration and Appointment Rules

- Mandatory registration fields: _________________________________________________
- Optional registration fields: _________________________________________________
- Unique identifiers required (UHID / Reg No / Aadhaar / Other): __________________
- UHID format to use (example): _________________________________________________
- Appointment slot duration (minutes): ______  Max tokens per doctor/day: ______
- Walk-in policy: __________________  Reschedule rule: __________________  Cancel rule: __________________

## 3) Billing and Finance Rules (MVP)

- Consultation fee rules (new/follow-up): _______________________________________
- GST applicability and rates: _________________________________________________
- Discount rules (who can approve and limits): ___________________________________
- Payment modes (cash/card/UPI/bank/other): _____________________________________
- Refund rule and approval authority: ___________________________________________
- Invoice header details (legal name, address, GSTIN, phone): _____________________

## 4) Master Data to Share (Attach Excel/PDF)

Mark status: `Ready` / `Pending`

| Master Data | Status | File Name / Source | Owner |
|---|---|---|---|
| Staff list with roles |  |  |  |
| Doctors list with department |  |  |  |
| Therapists list |  |  |  |
| Departments list |  |  |  |
| Room and bed master |  |  |  |
| Panchkarma therapy catalogue + pricing |  |  |  |
| Lab test catalogue + pricing + ranges |  |  |  |
| Medicine master + units + GST |  |  |  |
| Supplier master |  |  |  |
| Billing charge catalogue |  |  |  |
| SMS templates + trigger events |  |  |  |

## 5) Numbering Formats and UAT Owners

- Number formats:
  UHID: __________________  OPD: __________________  IPD: __________________
  Bill: __________________  Receipt: __________________  Lab Order: __________________
- UAT signoff owners (name + mobile):
  Reception: __________________  Doctor: __________________  Billing: __________________  Admin: __________________

Hospital Authorized Signatory: ____________________  Signature/Stamp: ____________________  Date: ____________________

