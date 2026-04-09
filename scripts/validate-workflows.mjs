import { db } from "../backend/src/data/store.js";
import { createAppointment } from "../backend/src/modules/appointments/appointments.service.js";
import { createBill, collectPayment } from "../backend/src/modules/billing/billing.service.js";
import { admitPatient, addAdmissionNote, addAdmissionVitals, dischargeAdmission } from "../backend/src/modules/ipd/ipd.service.js";
import { collectLabSample, createLabBill, createLabOrder, getLabOrderDetails, saveLabResults } from "../backend/src/modules/laboratory/laboratory.service.js";
import { saveAssessment, completeVisit, createVisit, savePrescription, saveVitals } from "../backend/src/modules/opd/opd.service.js";
import { completePanchkarmaSession, createPanchkarmaSchedule, startPanchkarmaSession } from "../backend/src/modules/panchkarma/panchkarma.service.js";
import { dispensePrescription } from "../backend/src/modules/pharmacy/pharmacy.service.js";
import { createPatient, getPatientHistory } from "../backend/src/modules/patients/patients.service.js";
import {
  getDailyOpdReport,
  getIpdCensusReport,
  getLabWorkloadReport,
  getPanchkarmaStatsReport,
  getPharmacySalesReport,
  getReportsOverview,
  getRevenueReport
} from "../backend/src/modules/reports/reports.service.js";

const results = [];
const today = new Date().toISOString().slice(0, 10);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run(name, fn) {
  try {
    const detail = await fn();
    results.push({ name, status: "passed", detail });
  } catch (error) {
    results.push({ name, status: "failed", detail: error.message });
  }
}

await run("Register patient to OPD billing flow", async () => {
  const patient = await createPatient(
    {
      firstName: "Validate",
      lastName: "Opd",
      phone: "9010000001",
      dateOfBirth: "1992-05-04",
      gender: "female",
      houseStreet: "Validation Street",
      cityDistrict: "Sagar",
      state: "Madhya Pradesh"
    },
    "validator"
  );
  const doctorId = db.appointments[0].doctorId;
  const appointment = await createAppointment(
    {
      patientId: patient.id,
      doctorId,
      appointmentDate: today,
      appointmentTime: "09:00",
      department: "Clinical Department",
      chiefComplaint: "Fatigue and stiffness"
    },
    "validator"
  );
  const visit = createVisit({ appointmentId: appointment.id });
  saveVitals(visit.id, { vitalsBp: "120/80", vitalsPulse: 74, vitalsTemp: 98.4 });
  saveAssessment(visit.id, { prakritiDominant: "Vata", observations: "Stable" }, doctorId);
  const prescription = savePrescription(
    visit.id,
    {
      diagnosis: "General fatigue",
      medicines: [{ medicineId: "med-001", medicineName: "Mahayograj Guggulu", quantityDispensed: 5, dose: "1 tab", frequency: "BD" }]
    },
    doctorId
  );
  createLabOrder({ visitId: visit.id, patientId: patient.id, patientName: patient.fullName, orderedBy: doctorId, tests: ["lab-001"] });
  completeVisit(visit.id);
  const bill = createBill({
    patientId: patient.id,
    visitId: visit.id,
    billType: "opd",
    items: [{ description: "Consultation", category: "consultation", quantity: 1, unitPrice: 500 }]
  });
  const payment = collectPayment(bill.id, { amount: 250, paymentMode: "cash", receivedBy: "validator" });
  const dispensation = dispensePrescription(prescription.id, { items: [{ medicineId: "med-001", quantity: 5 }] }, "validator");

  assert(payment.bill.paymentStatus === "partial", "Expected OPD bill to become partial after payment.");
  assert(dispensation.items.length === 1, "Expected prescription dispense item to be created.");

  return `Patient ${patient.uhid}, visit ${visit.opdNumber}, bill ${bill.billNumber}`;
});

await run("Laboratory collection to reporting flow", async () => {
  const patient = await createPatient(
    {
      firstName: "Validate",
      lastName: "Lab",
      phone: "9010000004",
      dateOfBirth: "1991-03-14",
      gender: "male",
      houseStreet: "Validation Street",
      cityDistrict: "Sagar",
      state: "Madhya Pradesh"
    },
    "validator"
  );
  const doctorId = db.appointments[0].doctorId;
  const appointment = await createAppointment(
    {
      patientId: patient.id,
      doctorId,
      appointmentDate: today,
      appointmentTime: "09:10",
      department: "Clinical Department",
      chiefComplaint: "Needs investigations"
    },
    "validator"
  );
  const visit = createVisit({ appointmentId: appointment.id });
  const order = createLabOrder({
    visitId: visit.id,
    patientId: patient.id,
    patientName: `${patient.firstName} ${patient.lastName}`,
    orderedBy: doctorId,
    tests: ["lab-001", "lab-002"]
  });
  collectLabSample(order.id, { sampleType: "blood" }, "validator");
  saveLabResults(
    order.id,
    {
      processingSummary: "CBC and ESR processed successfully",
      markReported: true,
      tests: [
        { testId: "lab-001", result: "Normal", resultFlag: "normal", remarks: "Within range" },
        { testId: "lab-002", result: "18 mm/hr", resultFlag: "borderline", remarks: "Slightly elevated" }
      ]
    },
    "validator"
  );
  createLabBill(order.id, {}, "validator");
  const detail = getLabOrderDetails(order.id);

  assert(detail.status === "reported", "Expected lab order to be reported.");
  assert(detail.billId, "Expected lab order to have a bill.");
  assert(detail.reportUrl, "Expected reported lab order to have a report URL.");

  return `Order ${detail.orderNumber}, bill ${detail.billId}`;
});

await run("IPD admission to discharge billing flow", async () => {
  const patient = await createPatient(
    {
      firstName: "Validate",
      lastName: "Ipd",
      phone: "9010000002",
      dateOfBirth: "1988-08-12",
      gender: "male",
      houseStreet: "Validation Street",
      cityDistrict: "Sagar",
      state: "Madhya Pradesh"
    },
    "validator"
  );
  const room = db.rooms.find((entry) => entry.roomNumber === "A-101");
  const bed = db.beds.find((entry) => entry.roomId === room.id && entry.status === "available");
  const doctorId = db.appointments[0].doctorId;
  const admission = admitPatient(
    {
      patientId: patient.id,
      roomId: room.id,
      bedId: bed.id,
      attendingDoctorId: doctorId,
      reasonForAdmission: "Observation stay"
    },
    "validator"
  );
  addAdmissionNote(admission.id, { category: "progress", note: "Responding well" }, "validator");
  addAdmissionVitals(admission.id, { bp: "118/76", pulse: 70 }, "validator");
  const discharged = dischargeAdmission(admission.id, { dischargeNote: "Recovered", createBill: true }, "validator");

  assert(discharged.status === "discharged", "Expected IPD admission to be discharged.");
  assert(discharged.billId, "Expected discharge to create a bill.");

  return `Admission ${admission.admissionNumber}, bill ${discharged.billId}`;
});

await run("Panchkarma schedule to therapy billing flow", async () => {
  const patient = await createPatient(
    {
      firstName: "Validate",
      lastName: "Therapy",
      phone: "9010000003",
      dateOfBirth: "1994-11-09",
      gender: "female",
      houseStreet: "Validation Street",
      cityDistrict: "Sagar",
      state: "Madhya Pradesh"
    },
    "validator"
  );
  const therapyRoom = db.rooms.find((entry) => entry.roomType === "therapy");
  const therapistId = db.panchkarmaSchedules[0].therapistId;
  const doctorId = db.appointments[0].doctorId;
  const schedule = createPanchkarmaSchedule(
    {
      patientId: patient.id,
      therapyId: db.panchkarmaTherapies[0].id,
      therapistId,
      recommendedBy: doctorId,
      therapyRoomId: therapyRoom.id,
      scheduledDate: today,
      scheduledTime: "12:00",
      complaint: "Stress relief"
    },
    "validator"
  );
  startPanchkarmaSession(schedule.id, {}, "validator");
  const completed = completePanchkarmaSession(
    schedule.id,
    {
      outcome: "Session tolerated well",
      createBill: true,
      addMaterialCharges: true,
      materialsUsed: [{ medicineId: "med-005", quantity: 1 }]
    },
    "validator"
  );

  assert(completed.status === "completed", "Expected Panchkarma session to be completed.");
  assert(completed.billId, "Expected Panchkarma completion to create a bill.");

  return `Schedule ${schedule.scheduleNumber}, bill ${completed.billId}`;
});

await run("Patient timeline integration", async () => {
  const latestPatient = db.patients.find((entry) => entry.phone === "9010000003");
  const history = getPatientHistory(latestPatient.id);

  assert(history.timeline.some((item) => item.type === "panchkarma"), "Expected Panchkarma timeline item.");
  assert(history.bills.length > 0, "Expected patient history to include bills.");

  return `Timeline entries ${history.timeline.length}`;
});

await run("Operational reports generation", async () => {
  const overview = getReportsOverview({ dateFrom: today, dateTo: today });
  const opd = getDailyOpdReport({ date: today });
  const ipd = getIpdCensusReport({ date: today });
  const revenue = getRevenueReport({ dateFrom: today, dateTo: today });
  const pharmacy = getPharmacySalesReport({ dateFrom: today, dateTo: today });
  const lab = getLabWorkloadReport({ dateFrom: today, dateTo: today });
  const panchkarma = getPanchkarmaStatsReport({ dateFrom: today, dateTo: today });

  assert(overview.revenue >= 0, "Expected reports overview revenue to be numeric.");
  assert(opd.summary.totalVisits >= 0, "Expected OPD report summary.");
  assert(ipd.summary.totalBeds > 0, "Expected IPD census to include beds.");
  assert(revenue.summary.totalBills >= 0, "Expected revenue report summary.");
  assert(pharmacy.summary.prescriptionsDispensed >= 0, "Expected pharmacy report summary.");
  assert(lab.summary.totalOrders >= 0, "Expected lab workload summary.");
  assert(panchkarma.summary.totalSessions >= 0, "Expected Panchkarma report summary.");

  return `Overview revenue ${overview.revenue}, OPD visits ${opd.summary.totalVisits}`;
});

const failed = results.filter((item) => item.status === "failed");

console.log(JSON.stringify({ results, failed: failed.length }, null, 2));

if (failed.length) {
  process.exitCode = 1;
}
