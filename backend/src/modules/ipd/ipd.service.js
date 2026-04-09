import { demoUsers } from "../../config/constants.js";
import { createId, db, nextIpdNumber } from "../../data/store.js";
import { createBill } from "../billing/billing.service.js";

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = message;
  return error;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function currentTime() {
  return new Date().toTimeString().slice(0, 5);
}

function getAdmissionById(admissionId) {
  const admission = db.ipdAdmissions.find((entry) => entry.id === admissionId);

  if (!admission) {
    throw createError("IPD admission not found.", 404);
  }

  return admission;
}

function getPatientById(patientId) {
  const patient = db.patients.find((entry) => entry.id === patientId);

  if (!patient) {
    throw createError("Patient not found.", 404);
  }

  return patient;
}

function getRoomById(roomId) {
  const room = db.rooms.find((entry) => entry.id === roomId);

  if (!room) {
    throw createError("Room not found.", 404);
  }

  return room;
}

function getBedById(bedId) {
  const bed = db.beds.find((entry) => entry.id === bedId);

  if (!bed) {
    throw createError("Bed not found.", 404);
  }

  return bed;
}

function getDoctorById(doctorId) {
  return demoUsers.find((entry) => entry.id === doctorId) || null;
}

function ensureDoctorExists(doctorId) {
  const doctor = getDoctorById(doctorId);

  if (!doctor || doctor.role !== "doctor") {
    throw createError("Attending doctor not found.");
  }

  return doctor;
}

function formatPatientName(patient) {
  return `${patient.firstName} ${patient.lastName}`.trim();
}

function calculateStayDays(admissionDate, dischargeDate, explicitStayDays) {
  if (explicitStayDays) {
    return Math.max(Number(explicitStayDays || 1), 1);
  }

  const start = new Date(admissionDate);
  const end = new Date(dischargeDate || todayDate());

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 1;
  }

  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff || 1, 1);
}

function enrichAdmission(admission) {
  const patient = db.patients.find((entry) => entry.id === admission.patientId) || null;
  const room = db.rooms.find((entry) => entry.id === admission.roomId) || null;
  const bed = db.beds.find((entry) => entry.id === admission.bedId) || null;
  const doctor = getDoctorById(admission.attendingDoctorId);
  const bill = admission.billId ? db.bills.find((entry) => entry.id === admission.billId) || null : null;

  return {
    ...admission,
    patient,
    room,
    bed,
    doctor,
    bill,
    notes: [...(admission.notes || [])].sort((a, b) => b.noteDate.localeCompare(a.noteDate)),
    vitals: [...(admission.vitals || [])].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
  };
}

export function getIpdMasters() {
  const bedsByRoom = db.rooms.map((room) => ({
    roomId: room.id,
    roomNumber: room.roomNumber,
    ward: room.ward,
    roomType: room.roomType,
    chargePerDay: room.chargePerDay,
    beds: db.beds
      .filter((bed) => bed.roomId === room.id && ["available", "reserved"].includes(bed.status))
      .sort((a, b) => a.bedNumber.localeCompare(b.bedNumber))
  }));

  return {
    doctors: demoUsers.filter((user) => user.role === "doctor").map(({ password, ...doctor }) => doctor),
    admissionSources: ["opd", "direct", "emergency", "referral"],
    noteCategories: ["admission", "progress", "doctor_round", "nursing", "diet", "discharge_plan"],
    dischargeStatuses: ["recovered", "referred", "discharged_on_request", "absconded"],
    rooms: bedsByRoom
  };
}

export function getIpdSummary() {
  const admissions = db.ipdAdmissions.map((entry) => enrichAdmission(entry));
  const activeAdmissions = admissions.filter((entry) => entry.status === "active");
  const dischargedAdmissions = admissions.filter((entry) => entry.status === "discharged");

  return {
    totalAdmissions: admissions.length,
    activeAdmissions: activeAdmissions.length,
    dischargedAdmissions: dischargedAdmissions.length,
    todayAdmissions: admissions.filter((entry) => entry.admissionDate === todayDate()).length,
    pendingDischarges: activeAdmissions.filter((entry) => entry.expectedDischargeDate && entry.expectedDischargeDate <= todayDate()).length,
    activeRooms: Array.from(new Set(activeAdmissions.map((entry) => entry.roomId))).length
  };
}

export function listAdmissions(query = {}) {
  const search = String(query.search || "").trim().toLowerCase();
  let items = db.ipdAdmissions.map((entry) => enrichAdmission(entry));

  if (query.status) {
    items = items.filter((entry) => entry.status === query.status);
  }

  if (query.patientId) {
    items = items.filter((entry) => entry.patientId === query.patientId);
  }

  if (query.roomId) {
    items = items.filter((entry) => entry.roomId === query.roomId);
  }

  if (search) {
    items = items.filter((entry) =>
      [entry.admissionNumber, entry.patientName, entry.reasonForAdmission, entry.diagnosis, entry.room?.roomNumber]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }

  return items.sort((a, b) => `${b.admissionDate} ${b.admissionTime}`.localeCompare(`${a.admissionDate} ${a.admissionTime}`));
}

export function getAdmissionDetails(admissionId) {
  return enrichAdmission(getAdmissionById(admissionId));
}

export function admitPatient(payload, userId) {
  if (!payload.patientId || !payload.roomId || !payload.bedId || !payload.attendingDoctorId || !payload.reasonForAdmission) {
    throw createError("Patient, room, bed, doctor, and admission reason are required.");
  }

  const patient = getPatientById(payload.patientId);
  const room = getRoomById(payload.roomId);
  const bed = getBedById(payload.bedId);
  ensureDoctorExists(payload.attendingDoctorId);

  if (bed.roomId !== room.id) {
    throw createError("Selected bed does not belong to the selected room.");
  }

  if (!["available", "reserved"].includes(bed.status)) {
    throw createError("Selected bed is not available for admission.");
  }

  const existingActiveAdmission = db.ipdAdmissions.find((entry) => entry.patientId === patient.id && entry.status === "active");
  if (existingActiveAdmission) {
    throw createError("This patient already has an active IPD admission.");
  }

  const admissionNumber = nextIpdNumber();
  const admission = {
    id: createId(),
    admissionNumber,
    patientId: patient.id,
    patientName: formatPatientName(patient),
    roomId: room.id,
    bedId: bed.id,
    attendingDoctorId: payload.attendingDoctorId,
    admissionDate: payload.admissionDate || todayDate(),
    admissionTime: payload.admissionTime || currentTime(),
    admissionSource: payload.admissionSource || "opd",
    admissionType: payload.admissionType || "ipd",
    reasonForAdmission: payload.reasonForAdmission,
    diagnosis: payload.diagnosis || "",
    expectedDischargeDate: payload.expectedDischargeDate || "",
    status: "active",
    admittedBy: userId,
    notes: payload.initialNote ? [{ id: createId(), noteDate: new Date().toISOString(), category: "admission", note: payload.initialNote, authorId: userId }] : [],
    vitals: [],
    dischargeSummary: null,
    billId: ""
  };

  bed.status = "occupied";
  bed.patientId = patient.id;
  bed.patientName = formatPatientName(patient);
  bed.assignedAt = new Date().toISOString();
  bed.expectedDischargeDate = admission.expectedDischargeDate;
  bed.note = payload.reasonForAdmission || "";
  bed.admissionType = "ipd";
  bed.assignedBy = userId;
  patient.opdIpdNumber = admissionNumber;

  db.ipdAdmissions.unshift(admission);
  return enrichAdmission(admission);
}

export function addAdmissionNote(admissionId, payload, userId) {
  const admission = getAdmissionById(admissionId);

  if (admission.status !== "active") {
    throw createError("Notes can only be added to active admissions.");
  }

  if (!payload.note) {
    throw createError("Clinical note is required.");
  }

  admission.notes.unshift({
    id: createId(),
    noteDate: new Date().toISOString(),
    category: payload.category || "progress",
    note: payload.note,
    authorId: userId
  });

  return enrichAdmission(admission);
}

export function addAdmissionVitals(admissionId, payload, userId) {
  const admission = getAdmissionById(admissionId);

  if (admission.status !== "active") {
    throw createError("Vitals can only be recorded for active admissions.");
  }

  if (!payload.bp && !payload.pulse && !payload.temp && !payload.spo2 && !payload.rr && !payload.weight) {
    throw createError("At least one vital measurement is required.");
  }

  admission.vitals.unshift({
    id: createId(),
    recordedAt: new Date().toISOString(),
    bp: payload.bp || "",
    pulse: Number(payload.pulse || 0),
    temp: Number(payload.temp || 0),
    spo2: Number(payload.spo2 || 0),
    rr: Number(payload.rr || 0),
    weight: Number(payload.weight || 0),
    notes: payload.notes || "",
    recordedBy: userId
  });

  return enrichAdmission(admission);
}

export function dischargeAdmission(admissionId, payload, userId) {
  const admission = getAdmissionById(admissionId);

  if (admission.status !== "active") {
    throw createError("This admission is already discharged.");
  }

  if (!payload.dischargeNote) {
    throw createError("Discharge summary note is required.");
  }

  const patient = getPatientById(admission.patientId);
  const room = getRoomById(admission.roomId);
  const bed = getBedById(admission.bedId);
  const dischargeDate = payload.dischargeDate || todayDate();
  const stayDays = calculateStayDays(admission.admissionDate, dischargeDate, payload.stayDays);
  const roomCharge = Number(room.chargePerDay || 0) * stayDays;
  const extraCharge = Number(payload.extraCharge || 0);
  let bill = null;

  if (payload.createBill) {
    const billItems = [
      {
        description: `IPD Room Charges (${room.roomNumber})`,
        category: "room",
        quantity: stayDays,
        unitPrice: Number(room.chargePerDay || 0)
      }
    ];

    if (extraCharge > 0) {
      billItems.push({
        description: payload.extraChargeLabel || "IPD Additional Charges",
        category: "service",
        quantity: 1,
        unitPrice: extraCharge
      });
    }

    bill = createBill({
      patientId: patient.id,
      patientName: admission.patientName,
      bedId: bed.id,
      billType: "ipd",
      billDate: dischargeDate,
      notes: `Generated from discharge ${admission.admissionNumber}`,
      items: billItems,
      createdBy: userId
    });
    admission.billId = bill.id;
  }

  admission.status = "discharged";
  admission.dischargeSummary = {
    dischargeDate,
    dischargeTime: payload.dischargeTime || currentTime(),
    dischargeStatus: payload.dischargeStatus || "recovered",
    dischargeNote: payload.dischargeNote,
    conditionOnDischarge: payload.conditionOnDischarge || "stable",
    advice: payload.advice || "",
    stayDays,
    roomCharge,
    extraCharge,
    dischargedBy: userId,
    billId: bill?.id || admission.billId || ""
  };

  admission.notes.unshift({
    id: createId(),
    noteDate: new Date().toISOString(),
    category: "discharge_plan",
    note: payload.dischargeNote,
    authorId: userId
  });

  bed.status = payload.nextBedStatus || "cleaning";
  bed.patientId = null;
  bed.patientName = "";
  bed.assignedAt = "";
  bed.expectedDischargeDate = "";
  bed.note = payload.bedNote || "Discharged from IPD";
  bed.admissionType = "";
  bed.assignedBy = "";

  return enrichAdmission(admission);
}
