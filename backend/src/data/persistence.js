import { query } from "../config/postgres.js";
import { logger } from "../config/logger.js";
import { db } from "./store.js";

const CREATE_PATIENTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS hms_patients (
  id TEXT PRIMARY KEY,
  uhid TEXT,
  registration_number TEXT,
  full_name TEXT,
  phone TEXT,
  city TEXT,
  registration_date DATE,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hms_patients_uhid ON hms_patients(uhid);
CREATE INDEX IF NOT EXISTS idx_hms_patients_phone ON hms_patients(phone);
CREATE INDEX IF NOT EXISTS idx_hms_patients_registration_date ON hms_patients(registration_date);
`;

const CREATE_APPOINTMENTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS hms_appointments (
  id TEXT PRIMARY KEY,
  appointment_number TEXT,
  patient_id TEXT,
  patient_name TEXT,
  doctor_id TEXT,
  appointment_date DATE,
  appointment_time TEXT,
  status TEXT,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hms_appointments_date ON hms_appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_hms_appointments_doctor_date_time ON hms_appointments(doctor_id, appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_hms_appointments_patient_id ON hms_appointments(patient_id);
`;

function patientRow(patient) {
  return {
    id: patient.id,
    uhid: patient.uhid || "",
    registration_number: patient.registrationNumber || "",
    full_name: patient.fullName || `${patient.firstName || ""} ${patient.lastName || ""}`.trim(),
    phone: patient.phone || "",
    city: patient.cityDistrict || patient.city || "",
    registration_date: patient.registrationDate || null,
    payload: JSON.stringify(patient)
  };
}

function appointmentRow(appointment) {
  return {
    id: appointment.id,
    appointment_number: appointment.appointmentNumber || "",
    patient_id: appointment.patientId || null,
    patient_name: appointment.patientName || "",
    doctor_id: appointment.doctorId || null,
    appointment_date: appointment.appointmentDate || null,
    appointment_time: appointment.appointmentTime || "",
    status: appointment.status || "",
    payload: JSON.stringify(appointment)
  };
}

async function ensureSchema() {
  await query(CREATE_PATIENTS_TABLE_SQL);
  await query(CREATE_APPOINTMENTS_TABLE_SQL);
}

async function upsertPatients(items) {
  for (const item of items) {
    const row = patientRow(item);
    await query(
      `
      INSERT INTO hms_patients (id, uhid, registration_number, full_name, phone, city, registration_date, payload)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
      ON CONFLICT (id) DO UPDATE
      SET
        uhid = EXCLUDED.uhid,
        registration_number = EXCLUDED.registration_number,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        city = EXCLUDED.city,
        registration_date = EXCLUDED.registration_date,
        payload = EXCLUDED.payload,
        updated_at = NOW()
      `,
      [row.id, row.uhid, row.registration_number, row.full_name, row.phone, row.city, row.registration_date, row.payload]
    );
  }

  if (items.length) {
    await query("DELETE FROM hms_patients WHERE id <> ALL($1::text[])", [items.map((item) => item.id)]);
  }
}

async function upsertAppointments(items) {
  for (const item of items) {
    const row = appointmentRow(item);
    await query(
      `
      INSERT INTO hms_appointments (id, appointment_number, patient_id, patient_name, doctor_id, appointment_date, appointment_time, status, payload)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
      ON CONFLICT (id) DO UPDATE
      SET
        appointment_number = EXCLUDED.appointment_number,
        patient_id = EXCLUDED.patient_id,
        patient_name = EXCLUDED.patient_name,
        doctor_id = EXCLUDED.doctor_id,
        appointment_date = EXCLUDED.appointment_date,
        appointment_time = EXCLUDED.appointment_time,
        status = EXCLUDED.status,
        payload = EXCLUDED.payload,
        updated_at = NOW()
      `,
      [
        row.id,
        row.appointment_number,
        row.patient_id,
        row.patient_name,
        row.doctor_id,
        row.appointment_date,
        row.appointment_time,
        row.status,
        row.payload
      ]
    );
  }

  if (items.length) {
    await query("DELETE FROM hms_appointments WHERE id <> ALL($1::text[])", [items.map((item) => item.id)]);
  }
}

async function loadRows() {
  const [patientsResult, appointmentsResult] = await Promise.all([
    query("SELECT payload FROM hms_patients ORDER BY registration_date DESC NULLS LAST, created_at DESC"),
    query("SELECT payload FROM hms_appointments ORDER BY appointment_date ASC NULLS LAST, appointment_time ASC")
  ]);

  return {
    patients: patientsResult.rows.map((row) => row.payload),
    appointments: appointmentsResult.rows.map((row) => row.payload)
  };
}

export async function initDataPersistence() {
  await ensureSchema();

  const counts = await Promise.all([
    query("SELECT COUNT(*)::int AS count FROM hms_patients"),
    query("SELECT COUNT(*)::int AS count FROM hms_appointments")
  ]);

  const patientCount = counts[0].rows[0].count;
  const appointmentCount = counts[1].rows[0].count;

  if (patientCount === 0 && appointmentCount === 0) {
    await Promise.all([upsertPatients(db.patients), upsertAppointments(db.appointments)]);
    logger.info("Seeded PostgreSQL persistence with in-memory patient and appointment data.");
    return;
  }

  const persisted = await loadRows();
  db.patients.splice(0, db.patients.length, ...persisted.patients);
  db.appointments.splice(0, db.appointments.length, ...persisted.appointments);

  logger.info(
    `Loaded persisted data from PostgreSQL (patients: ${persisted.patients.length}, appointments: ${persisted.appointments.length}).`
  );
}

export async function persistPatients() {
  await upsertPatients(db.patients);
}

export async function persistAppointments() {
  await upsertAppointments(db.appointments);
}
