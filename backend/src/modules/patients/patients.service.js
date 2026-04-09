import { persistPatients } from "../../data/persistence.js";
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

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) {
    return "";
  }

  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) {
    return "";
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

function buildAddress(payload) {
  const segments = [payload.houseStreet, payload.areaVillage, payload.cityDistrict || payload.city, payload.state]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  return payload.address?.trim() || segments.join(", ");
}

function nextRegistrationNumber() {
  return `REG-${new Date().getFullYear()}-${String(db.patients.length + 1).padStart(5, "0")}`;
}

export function listPatients(query = {}) {
  const search = normalize(query.search);
  const city = normalize(query.city);

  let items = [...db.patients];

  if (search) {
    items = items.filter((patient) =>
      [
        patient.uhid,
        patient.registrationNumber,
        patient.opdIpdNumber,
        patient.firstName,
        patient.lastName,
        patient.phone,
        patient.idNumber,
        `${patient.firstName} ${patient.lastName}`
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }

  if (city) {
    items = items.filter((patient) => normalize(patient.cityDistrict || patient.city) === city);
  }

  return items.sort((a, b) => `${b.registrationDate} ${b.registrationTime || ""}`.localeCompare(`${a.registrationDate} ${a.registrationTime || ""}`));
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

  const ipdAdmissions = db.ipdAdmissions
    .filter((admission) => admission.patientId === id)
    .sort((a, b) => `${b.admissionDate} ${b.admissionTime || ""}`.localeCompare(`${a.admissionDate} ${a.admissionTime || ""}`));

  const labOrders = db.labOrders
    .filter((order) => order.patientId === id)
    .sort((a, b) => b.orderDate.localeCompare(a.orderDate));

  const panchkarmaSchedules = db.panchkarmaSchedules
    .filter((schedule) => schedule.patientId === id)
    .sort((a, b) => `${b.scheduledDate} ${b.scheduledTime || ""}`.localeCompare(`${a.scheduledDate} ${a.scheduledTime || ""}`));

  const bills = db.bills
    .filter((bill) => bill.patientId === id)
    .sort((a, b) => b.billDate.localeCompare(a.billDate));

  const dispensations = db.dispensations
    .filter((dispense) => dispense.patientId === id)
    .sort((a, b) => b.dispensedDate.localeCompare(a.dispensedDate));

  const payments = db.payments
    .filter((payment) => payment.patientId === id)
    .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));

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
    ...ipdAdmissions.map((admission) => ({
      id: `ipd-${admission.id}`,
      type: "ipd_admission",
      date: admission.dischargeSummary?.dischargeDate || admission.admissionDate,
      title: admission.admissionNumber,
      summary: `IPD ${admission.status} - ${admission.reasonForAdmission}`,
      detail: `${admission.diagnosis || "Clinical observation"}${admission.dischargeSummary?.billId ? ` | Bill: ${admission.dischargeSummary.billId}` : ""}`
    })),
    ...labOrders.map((order) => ({
      id: `lab-${order.id}`,
      type: "lab_order",
      date: order.orderDate,
      title: order.orderNumber,
      summary: `Lab order - ${order.status}`,
      detail: order.tests.map((test) => test.testName).join(", ")
    })),
    ...panchkarmaSchedules.map((schedule) => ({
      id: `pk-${schedule.id}`,
      type: "panchkarma",
      date: schedule.scheduledDate,
      title: schedule.scheduleNumber,
      summary: `${schedule.therapyName} - ${schedule.status}`,
      detail: schedule.outcome || schedule.complaint || "Panchkarma session scheduled"
    })),
    ...bills.map((bill) => ({
      id: `bill-${bill.id}`,
      type: "bill",
      date: bill.billDate,
      title: bill.billNumber,
      summary: `Billing - ${bill.paymentStatus}`,
      detail: `Rs. ${bill.totalAmount}`
    })),
    ...dispensations.map((dispense) => ({
      id: `disp-${dispense.id}`,
      type: "dispensation",
      date: dispense.dispensedDate.slice(0, 10),
      title: dispense.dispenseNumber,
      summary: "Pharmacy dispensing completed",
      detail: dispense.items.map((item) => `${item.medicineName} x${item.quantity}`).join(", ")
    })),
    ...payments.map((payment) => ({
      id: `pay-${payment.id}`,
      type: "payment",
      date: payment.paymentDate.slice(0, 10),
      title: payment.receiptNumber,
      summary: `Payment received via ${payment.paymentMode}`,
      detail: `Rs. ${payment.amount}`
    }))
  ].sort((a, b) => b.date.localeCompare(a.date));

  return {
    patient,
    appointments: appointmentHistory,
    opdVisits,
    assessments,
    prescriptions,
    ipdAdmissions,
    labOrders,
    panchkarmaSchedules,
    bills,
    dispensations,
    payments,
    timeline
  };
}

export async function createPatient(payload, createdBy) {
  if (!payload.firstName || !payload.lastName || !payload.phone || !payload.dateOfBirth || !payload.gender) {
    throw createError("First name, last name, phone, date of birth, and gender are required.");
  }

  if (!payload.houseStreet && !payload.address) {
    throw createError("House/street or address is required.");
  }

  const phoneExists = db.patients.some((patient) => patient.phone === payload.phone);

  if (phoneExists) {
    throw createError("A patient with this phone number already exists.");
  }

  const registrationDate = new Date().toISOString().slice(0, 10);
  const registrationTime = new Date().toTimeString().slice(0, 5);
  const address = buildAddress(payload);
  const cityDistrict = payload.cityDistrict?.trim() || payload.city?.trim() || "Sagar";

  const patient = {
    id: createId(),
    uhid: nextUhid(),
    registrationNumber: nextRegistrationNumber(),
    opdIpdNumber: payload.opdIpdNumber?.trim() || "",
    registrationDate,
    registrationTime,
    patientType: payload.patientType || "new",
    title: payload.title || "Mr",
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    fullName: `${payload.firstName.trim()} ${payload.lastName.trim()}`,
    gender: payload.gender,
    dateOfBirth: payload.dateOfBirth,
    ageYears: calculateAge(payload.dateOfBirth),
    bloodGroup: payload.bloodGroup || "",
    maritalStatus: payload.maritalStatus || "",
    occupation: payload.occupation || "",
    phone: payload.phone.trim(),
    altPhone: payload.altPhone || "",
    email: payload.email || "",
    houseStreet: payload.houseStreet?.trim() || "",
    areaVillage: payload.areaVillage?.trim() || "",
    cityDistrict,
    city: cityDistrict,
    state: payload.state || "Madhya Pradesh",
    pincode: payload.pincode || "",
    address,
    idType: payload.idType || "",
    idNumber: payload.idNumber || "",
    emergencyContactName: payload.emergencyContactName || "",
    emergencyContactPhone: payload.emergencyContactPhone || "",
    referredBy: payload.referredBy || "Front Desk",
    createdBy
  };

  db.patients.unshift(patient);
  await persistPatients();
  return patient;
}

export async function updatePatient(id, payload) {
  const patient = getPatientById(id);
  const nextDateOfBirth = payload.dateOfBirth ?? patient.dateOfBirth;
  const nextCityDistrict = payload.cityDistrict ?? payload.city ?? patient.cityDistrict ?? patient.city;

  Object.assign(patient, {
    registrationNumber: payload.registrationNumber ?? patient.registrationNumber,
    opdIpdNumber: payload.opdIpdNumber ?? patient.opdIpdNumber,
    patientType: payload.patientType ?? patient.patientType,
    title: payload.title ?? patient.title,
    firstName: payload.firstName ?? patient.firstName,
    lastName: payload.lastName ?? patient.lastName,
    fullName: `${payload.firstName ?? patient.firstName} ${payload.lastName ?? patient.lastName}`,
    dateOfBirth: nextDateOfBirth,
    ageYears: calculateAge(nextDateOfBirth),
    gender: payload.gender ?? patient.gender,
    bloodGroup: payload.bloodGroup ?? patient.bloodGroup,
    maritalStatus: payload.maritalStatus ?? patient.maritalStatus,
    occupation: payload.occupation ?? patient.occupation,
    phone: payload.phone ?? patient.phone,
    altPhone: payload.altPhone ?? patient.altPhone,
    email: payload.email ?? patient.email,
    houseStreet: payload.houseStreet ?? patient.houseStreet,
    areaVillage: payload.areaVillage ?? patient.areaVillage,
    address: buildAddress({
      address: payload.address ?? patient.address,
      houseStreet: payload.houseStreet ?? patient.houseStreet,
      areaVillage: payload.areaVillage ?? patient.areaVillage,
      cityDistrict: nextCityDistrict,
      state: payload.state ?? patient.state,
      city: nextCityDistrict
    }),
    cityDistrict: nextCityDistrict,
    city: nextCityDistrict,
    state: payload.state ?? patient.state,
    pincode: payload.pincode ?? patient.pincode,
    idType: payload.idType ?? patient.idType,
    idNumber: payload.idNumber ?? patient.idNumber,
    emergencyContactName: payload.emergencyContactName ?? patient.emergencyContactName,
    emergencyContactPhone: payload.emergencyContactPhone ?? patient.emergencyContactPhone,
    referredBy: payload.referredBy ?? patient.referredBy
  });

  await persistPatients();
  return patient;
}
