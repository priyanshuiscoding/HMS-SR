import { db, getDepartments, getDoctors, nextAppointmentNumber, createId } from "../../data/store.js";
import { getPatientById } from "../patients/patients.service.js";

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = message;
  return error;
}

const standardSlots = [
  "09:00", "09:10", "09:20", "09:30", "09:40", "09:50",
  "10:00", "10:10", "10:20", "10:30", "10:40", "10:50",
  "11:00", "11:10", "11:20", "11:30", "11:40", "11:50",
  "12:00", "12:10", "12:20", "12:30", "12:40", "12:50",
  "14:00", "14:10", "14:20", "14:30", "14:40", "14:50",
  "15:00", "15:10", "15:20", "15:30", "15:40", "15:50",
  "16:00", "16:10", "16:20", "16:30", "16:40", "16:50"
];

function sameSlot(appointment, date, doctorId, time) {
  return (
    appointment.appointmentDate === date &&
    appointment.doctorId === doctorId &&
    appointment.appointmentTime === time &&
    appointment.status !== "cancelled"
  );
}

export function listAppointments(query = {}) {
  let items = [...db.appointments];

  if (query.date) {
    items = items.filter((appointment) => appointment.appointmentDate === query.date);
  }

  if (query.doctorId) {
    items = items.filter((appointment) => appointment.doctorId === query.doctorId);
  }

  if (query.status) {
    items = items.filter((appointment) => appointment.status === query.status);
  }

  return items.sort((a, b) => `${a.appointmentDate} ${a.appointmentTime}`.localeCompare(`${b.appointmentDate} ${b.appointmentTime}`));
}

export function getAppointmentById(id) {
  const item = db.appointments.find((appointment) => appointment.id === id);

  if (!item) {
    throw createError("Appointment not found.", 404);
  }

  return item;
}

export function createAppointment(payload, bookedBy) {
  if (!payload.doctorId || !payload.appointmentDate || !payload.appointmentTime || !payload.department) {
    throw createError("Doctor, appointment date, time, and department are required.");
  }

  if (!payload.patientId && !payload.patientName) {
    throw createError("Choose an existing patient or enter a patient name.");
  }

  if (db.appointments.some((appointment) => sameSlot(appointment, payload.appointmentDate, payload.doctorId, payload.appointmentTime))) {
    throw createError("This slot is already booked for the selected doctor.");
  }

  let patientId = payload.patientId || null;
  let patientName = payload.patientName || "";

  if (patientId) {
    const patient = getPatientById(patientId);
    patientName = `${patient.firstName} ${patient.lastName}`;
  }

  const dailyCount = db.appointments.filter((appointment) => appointment.appointmentDate === payload.appointmentDate).length;

  const item = {
    id: createId(),
    appointmentNumber: nextAppointmentNumber(),
    patientId,
    patientName,
    doctorId: payload.doctorId,
    appointmentDate: payload.appointmentDate,
    appointmentTime: payload.appointmentTime,
    type: payload.type || "new",
    department: payload.department,
    status: payload.status || "scheduled",
    chiefComplaint: payload.chiefComplaint || "",
    tokenNumber: dailyCount + 1,
    bookedBy,
    source: payload.source || "Reception",
    smsSent: false
  };

  db.appointments.push(item);
  return item;
}

export function updateAppointment(id, payload) {
  const item = getAppointmentById(id);

  if (
    (payload.appointmentDate || payload.doctorId || payload.appointmentTime) &&
    db.appointments.some(
      (appointment) =>
        appointment.id !== id &&
        sameSlot(
          appointment,
          payload.appointmentDate || item.appointmentDate,
          payload.doctorId || item.doctorId,
          payload.appointmentTime || item.appointmentTime
        )
    )
  ) {
    throw createError("The updated slot conflicts with an existing booking.");
  }

  Object.assign(item, {
    appointmentDate: payload.appointmentDate ?? item.appointmentDate,
    appointmentTime: payload.appointmentTime ?? item.appointmentTime,
    doctorId: payload.doctorId ?? item.doctorId,
    type: payload.type ?? item.type,
    department: payload.department ?? item.department,
    status: payload.status ?? item.status,
    chiefComplaint: payload.chiefComplaint ?? item.chiefComplaint,
    source: payload.source ?? item.source
  });

  return item;
}

export function cancelAppointment(id) {
  const item = getAppointmentById(id);
  item.status = "cancelled";
  return item;
}

export function getTodayAppointments() {
  const today = new Date().toISOString().slice(0, 10);
  return listAppointments({ date: today });
}

export function getAvailableSlots(date, doctorId) {
  if (!date || !doctorId) {
    throw createError("Date and doctor are required.");
  }

  const bookedTimes = db.appointments
    .filter((appointment) => sameSlot(appointment, date, doctorId, appointment.appointmentTime))
    .map((appointment) => appointment.appointmentTime);

  return standardSlots.map((time) => ({
    time,
    isBooked: bookedTimes.includes(time)
  }));
}

export function getAppointmentMasters() {
  return {
    doctors: getDoctors(),
    departments: getDepartments(),
    types: ["new", "follow_up", "emergency"],
    statuses: ["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"],
    sources: ["Website", "Reception", "Call", "WhatsApp", "Walk-in"]
  };
}
