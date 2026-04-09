import {
  createId,
  db,
  getDoctors,
  getLabTestMasters,
  getMedicineMasters,
  nextOpdNumber,
  nextPrescriptionNumber
} from "../../data/store.js";
import { getAppointmentById } from "../appointments/appointments.service.js";

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = message;
  return error;
}

const CONSULTATION_FEE = 200;

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getVisitById(visitId) {
  const visit = db.opdVisits.find((entry) => entry.id === visitId);

  if (!visit) {
    throw createError("OPD visit not found.", 404);
  }

  return visit;
}

function getDoctorName(doctorId) {
  return getDoctors().find((doctor) => doctor.id === doctorId)?.fullName || "Unassigned";
}

function getAssessmentByVisitId(visitId) {
  return db.ayurvedaAssessments.find((entry) => entry.visitId === visitId) || null;
}

function getPrescriptionByVisitId(visitId) {
  return db.prescriptions.find((entry) => entry.visitId === visitId) || null;
}

export function getQueue(date = todayDate(), doctorId = "") {
  return db.appointments
    .filter((appointment) => appointment.appointmentDate === date)
    .filter((appointment) => !doctorId || appointment.doctorId === doctorId)
    .filter((appointment) => !["cancelled", "no_show"].includes(appointment.status))
    .map((appointment) => {
      const visit = db.opdVisits.find((entry) => entry.appointmentId === appointment.id);

      return {
        ...appointment,
        doctorName: getDoctorName(appointment.doctorId),
        visitId: visit?.id || null,
        visitStatus: visit?.status || null
      };
    })
    .sort((a, b) => a.tokenNumber - b.tokenNumber);
}

export function createVisit({ appointmentId }) {
  const appointment = getAppointmentById(appointmentId);
  const existingVisit = db.opdVisits.find((entry) => entry.appointmentId === appointmentId);

  if (existingVisit) {
    return existingVisit;
  }

  const visit = {
    id: createId(),
    opdNumber: nextOpdNumber(),
    patientId: appointment.patientId,
    patientName: appointment.patientName,
    doctorId: appointment.doctorId,
    appointmentId: appointment.id,
    visitDate: appointment.appointmentDate,
    visitType: appointment.type,
    chiefComplaint: appointment.chiefComplaint || "",
    vitalsBp: "",
    vitalsPulse: null,
    vitalsTemp: null,
    vitalsWeight: null,
    vitalsHeight: null,
    vitalsSpo2: null,
    vitalsRr: null,
    status: "waiting",
    consultationFee: CONSULTATION_FEE
  };

  db.opdVisits.push(visit);
  appointment.status = "in_progress";

  return visit;
}

export function getVisitDetails(visitId) {
  const visit = getVisitById(visitId);

  return {
    visit,
    doctorName: getDoctorName(visit.doctorId),
    assessment: getAssessmentByVisitId(visitId),
    prescription: getPrescriptionByVisitId(visitId),
    labOrders: db.labOrders.filter((entry) => entry.visitId === visitId),
    bills: db.bills.filter((entry) => entry.visitId === visitId)
  };
}

export function saveVitals(visitId, payload) {
  const visit = getVisitById(visitId);

  Object.assign(visit, {
    vitalsBp: payload.vitalsBp ?? visit.vitalsBp,
    vitalsPulse: payload.vitalsPulse ?? visit.vitalsPulse,
    vitalsTemp: payload.vitalsTemp ?? visit.vitalsTemp,
    vitalsWeight: payload.vitalsWeight ?? visit.vitalsWeight,
    vitalsHeight: payload.vitalsHeight ?? visit.vitalsHeight,
    vitalsSpo2: payload.vitalsSpo2 ?? visit.vitalsSpo2,
    vitalsRr: payload.vitalsRr ?? visit.vitalsRr,
    status: visit.status === "waiting" ? "in_consultation" : visit.status
  });

  return visit;
}

export function saveAssessment(visitId, payload, doctorId) {
  const visit = getVisitById(visitId);
  let assessment = getAssessmentByVisitId(visitId);

  if (!assessment) {
    assessment = {
      id: createId(),
      patientId: visit.patientId,
      visitId,
      doctorId: doctorId || visit.doctorId,
      assessmentDate: todayDate()
    };
    db.ayurvedaAssessments.push(assessment);
  }

  Object.assign(assessment, {
    patientId: visit.patientId,
    visitId,
    doctorId: doctorId || visit.doctorId,
    assessmentDate: payload.assessmentDate || assessment.assessmentDate || todayDate(),
    prakritiVata: payload.prakritiVata ?? assessment.prakritiVata ?? 0,
    prakritiPitta: payload.prakritiPitta ?? assessment.prakritiPitta ?? 0,
    prakritiKapha: payload.prakritiKapha ?? assessment.prakritiKapha ?? 0,
    prakritiDominant: payload.prakritiDominant ?? assessment.prakritiDominant ?? "",
    nadiPariksha: payload.nadiPariksha ?? assessment.nadiPariksha ?? "",
    nadiType: payload.nadiType ?? assessment.nadiType ?? "",
    jihvaPariksha: payload.jihvaPariksha ?? assessment.jihvaPariksha ?? "",
    agniStatus: payload.agniStatus ?? assessment.agniStatus ?? "",
    koshthaNature: payload.koshthaNature ?? assessment.koshthaNature ?? "",
    vikritiAssessment: payload.vikritiAssessment ?? assessment.vikritiAssessment ?? "",
    observations: payload.observations ?? assessment.observations ?? ""
  });

  return assessment;
}

export function savePrescription(visitId, payload, doctorId) {
  const visit = getVisitById(visitId);
  let prescription = getPrescriptionByVisitId(visitId);

  if (!payload.diagnosis) {
    throw createError("Diagnosis is required to save a prescription.");
  }

  if (!prescription) {
    prescription = {
      id: createId(),
      prescriptionNumber: nextPrescriptionNumber(),
      patientId: visit.patientId,
      patientName: visit.patientName,
      doctorId: doctorId || visit.doctorId,
      visitId,
      prescriptionDate: todayDate(),
      isDispensed: false,
      medicines: []
    };
    db.prescriptions.push(prescription);
  }

  Object.assign(prescription, {
    patientId: visit.patientId,
    patientName: visit.patientName,
    doctorId: doctorId || visit.doctorId,
    visitId,
    prescriptionDate: payload.prescriptionDate || prescription.prescriptionDate || todayDate(),
    diagnosis: payload.diagnosis,
    diagnosisAyurvedic: payload.diagnosisAyurvedic || "",
    nidana: payload.nidana || "",
    samprapti: payload.samprapti || "",
    chikitsaSutra: payload.chikitsaSutra || "",
    dietRecommendations: payload.dietRecommendations || "",
    followUpDate: payload.followUpDate || "",
    medicines: (payload.medicines || []).map((medicine) => ({
      id: medicine.id || createId(),
      medicineId: medicine.medicineId || "",
      medicineName: medicine.medicineName || "",
      dose: medicine.dose || "",
      frequency: medicine.frequency || "",
      route: medicine.route || "oral",
      timing: medicine.timing || "",
      durationDays: Number(medicine.durationDays || 0),
      anupana: medicine.anupana || "",
      quantityDispensed: Number(medicine.quantityDispensed || 0),
      specialInstructions: medicine.specialInstructions || ""
    }))
  });

  return prescription;
}

export function completeVisit(visitId) {
  const visit = getVisitById(visitId);
  const appointment = visit.appointmentId ? getAppointmentById(visit.appointmentId) : null;

  visit.status = "completed";

  if (appointment) {
    appointment.status = "completed";
  }

  return visit;
}

export function getOpdMasters() {
  return {
    doctors: getDoctors(),
    medicines: getMedicineMasters(),
    labTests: getLabTestMasters(),
    nadiTypes: ["Vataja", "Pittaja", "Kaphaja", "Mixed"],
    agniStatuses: ["sama", "vishama", "tikshna", "manda"],
    koshthaTypes: ["mridu", "madhyama", "krura"],
    frequencies: ["OD", "BD", "TDS", "QID", "SOS"],
    routes: ["oral", "external", "nasya", "enema"],
    consultationFee: CONSULTATION_FEE
  };
}
