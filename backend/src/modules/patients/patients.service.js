import { db, createId, nextUhid } from "../../data/store.js";

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = message;
  return error;
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

export function listPatients(query = {}) {
  const search = normalize(query.search);
  const city = normalize(query.city);

  let items = [...db.patients];

  if (search) {
    items = items.filter((patient) =>
      [
        patient.uhid,
        patient.firstName,
        patient.lastName,
        patient.phone,
        `${patient.firstName} ${patient.lastName}`
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }

  if (city) {
    items = items.filter((patient) => normalize(patient.city) === city);
  }

  return items.sort((a, b) => b.registrationDate.localeCompare(a.registrationDate));
}

export function getPatientById(id) {
  const patient = db.patients.find((entry) => entry.id === id);

  if (!patient) {
    throw createError("Patient not found.", 404);
  }

  return patient;
}

export function getPatientHistory(id) {
  const patient = getPatientById(id);

  const appointmentHistory = db.appointments
    .filter((appointment) => appointment.patientId === id)
    .sort((a, b) => `${b.appointmentDate} ${b.appointmentTime}`.localeCompare(`${a.appointmentDate} ${a.appointmentTime}`));

  const opdVisits = db.opdVisits
    .filter((visit) => visit.patientId === id)
    .sort((a, b) => b.visitDate.localeCompare(a.visitDate));

  const assessments = db.ayurvedaAssessments
    .filter((assessment) => assessment.patientId === id)
    .sort((a, b) => b.assessmentDate.localeCompare(a.assessmentDate));

  const prescriptions = db.prescriptions
    .filter((prescription) => prescription.patientId === id)
    .sort((a, b) => b.prescriptionDate.localeCompare(a.prescriptionDate));

  const labOrders = db.labOrders
    .filter((order) => order.patientId === id)
    .sort((a, b) => b.orderDate.localeCompare(a.orderDate));

  const bills = db.bills
    .filter((bill) => bill.patientId === id)
    .sort((a, b) => b.billDate.localeCompare(a.billDate));

  const timeline = [
    ...appointmentHistory.map((appointment) => ({
      id: `apt-${appointment.id}`,
      type: "appointment",
      date: appointment.appointmentDate,
      title: appointment.appointmentNumber,
      summary: `${appointment.department} appointment - ${appointment.status}`,
      detail: appointment.chiefComplaint || "General consultation"
    })),
    ...opdVisits.map((visit) => ({
      id: `opd-${visit.id}`,
      type: "opd_visit",
      date: visit.visitDate,
      title: visit.opdNumber,
      summary: `OPD visit - ${visit.status}`,
      detail: visit.chiefComplaint || "Consultation visit"
    })),
    ...assessments.map((assessment) => ({
      id: `ayu-${assessment.id}`,
      type: "assessment",
      date: assessment.assessmentDate,
      title: "Ayurvedic Assessment",
      summary: `${assessment.prakritiDominant || "Clinical"} dosha review`,
      detail: assessment.vikritiAssessment || assessment.observations || "Assessment recorded"
    })),
    ...prescriptions.map((prescription) => ({
      id: `rx-${prescription.id}`,
      type: "prescription",
      date: prescription.prescriptionDate,
      title: prescription.prescriptionNumber,
      summary: "Prescription issued",
      detail: prescription.diagnosis
    })),
    ...labOrders.map((order) => ({
      id: `lab-${order.id}`,
      type: "lab_order",
      date: order.orderDate,
      title: order.orderNumber,
      summary: `Lab order - ${order.status}`,
      detail: order.tests.map((test) => test.testName).join(", ")
    })),
    ...bills.map((bill) => ({
      id: `bill-${bill.id}`,
      type: "bill",
      date: bill.billDate,
      title: bill.billNumber,
      summary: `Billing - ${bill.paymentStatus}`,
      detail: `Rs. ${bill.totalAmount}`
    }))
  ].sort((a, b) => b.date.localeCompare(a.date));

  return {
    patient,
    appointments: appointmentHistory,
    opdVisits,
    assessments,
    prescriptions,
    labOrders,
    bills,
    timeline
  };
}

export function createPatient(payload, createdBy) {
  if (!payload.firstName || !payload.lastName || !payload.phone || !payload.dateOfBirth || !payload.gender || !payload.address) {
    throw createError("First name, last name, phone, date of birth, gender, and address are required.");
  }

  const phoneExists = db.patients.some((patient) => patient.phone === payload.phone);

  if (phoneExists) {
    throw createError("A patient with this phone number already exists.");
  }

  const patient = {
    id: createId(),
    uhid: nextUhid(),
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    dateOfBirth: payload.dateOfBirth,
    gender: payload.gender,
    bloodGroup: payload.bloodGroup || "",
    phone: payload.phone.trim(),
    altPhone: payload.altPhone || "",
    email: payload.email || "",
    address: payload.address.trim(),
    city: payload.city || "Sagar",
    state: payload.state || "Madhya Pradesh",
    pincode: payload.pincode || "",
    emergencyContactName: payload.emergencyContactName || "",
    emergencyContactPhone: payload.emergencyContactPhone || "",
    registrationDate: new Date().toISOString().slice(0, 10),
    referredBy: payload.referredBy || "Front Desk",
    createdBy
  };

  db.patients.unshift(patient);
  return patient;
}

export function updatePatient(id, payload) {
  const patient = getPatientById(id);

  Object.assign(patient, {
    firstName: payload.firstName ?? patient.firstName,
    lastName: payload.lastName ?? patient.lastName,
    dateOfBirth: payload.dateOfBirth ?? patient.dateOfBirth,
    gender: payload.gender ?? patient.gender,
    bloodGroup: payload.bloodGroup ?? patient.bloodGroup,
    phone: payload.phone ?? patient.phone,
    altPhone: payload.altPhone ?? patient.altPhone,
    email: payload.email ?? patient.email,
    address: payload.address ?? patient.address,
    city: payload.city ?? patient.city,
    state: payload.state ?? patient.state,
    pincode: payload.pincode ?? patient.pincode,
    emergencyContactName: payload.emergencyContactName ?? patient.emergencyContactName,
    emergencyContactPhone: payload.emergencyContactPhone ?? patient.emergencyContactPhone,
    referredBy: payload.referredBy ?? patient.referredBy
  });

  return patient;
}
