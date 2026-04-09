import {
  createId,
  db,
  getDoctors,
  getMedicineMasters,
  getTherapists,
  nextPanchkarmaScheduleNumber
} from "../../data/store.js";
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

function getPatientById(patientId) {
  const patient = db.patients.find((entry) => entry.id === patientId);

  if (!patient) {
    throw createError("Patient not found.", 404);
  }

  return patient;
}

function getTherapyById(therapyId) {
  const therapy = db.panchkarmaTherapies.find((entry) => entry.id === therapyId);

  if (!therapy) {
    throw createError("Therapy not found.", 404);
  }

  return therapy;
}

function getTherapistById(therapistId) {
  const therapist = getTherapists().find((entry) => entry.id === therapistId);

  if (!therapist) {
    throw createError("Therapist not found.", 404);
  }

  return therapist;
}

function getDoctorById(doctorId) {
  return getDoctors().find((entry) => entry.id === doctorId) || null;
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

function getScheduleById(scheduleId) {
  const schedule = db.panchkarmaSchedules.find((entry) => entry.id === scheduleId);

  if (!schedule) {
    throw createError("Panchkarma session not found.", 404);
  }

  return schedule;
}

function getAvailableTherapyBatches(medicineId) {
  return db.inventoryBatches
    .filter((batch) => batch.medicineId === medicineId && Number(batch.quantityAvailable || 0) > 0)
    .sort((left, right) => left.expiryDate.localeCompare(right.expiryDate));
}

function consumeMaterials(materials, scheduleNumber) {
  return materials.map((item) => {
    const medicine = getMedicineMasters().find((entry) => entry.id === item.medicineId);

    if (!medicine) {
      throw createError("Material medicine not found.", 404);
    }

    const quantity = Number(item.quantity || 0);

    if (quantity <= 0) {
      throw createError(`Material quantity must be greater than zero for ${medicine.name}.`);
    }

    const availableBatches = getAvailableTherapyBatches(medicine.id);
    const totalAvailable = availableBatches.reduce((sum, batch) => sum + Number(batch.quantityAvailable || 0), 0);

    if (totalAvailable < quantity) {
      throw createError(`Insufficient stock for ${medicine.name}.`);
    }

    let pendingQuantity = quantity;

    availableBatches.forEach((batch) => {
      if (pendingQuantity <= 0) {
        return;
      }

      const issued = Math.min(Number(batch.quantityAvailable || 0), pendingQuantity);
      batch.quantityAvailable = Number(batch.quantityAvailable || 0) - issued;
      pendingQuantity -= issued;

      db.stockTransactions.unshift({
        id: createId(),
        transactionDate: new Date().toISOString(),
        medicineId: medicine.id,
        medicineName: medicine.name,
        batchId: batch.id,
        type: "therapy_issue",
        quantity: -issued,
        referenceNumber: scheduleNumber,
        note: item.notes || "Panchkarma therapy consumption"
      });
    });

    return {
      id: createId(),
      medicineId: medicine.id,
      medicineName: medicine.name,
      quantity,
      unit: medicine.unit || "unit",
      notes: item.notes || ""
    };
  });
}

function buildMaterialBillItems(materialsUsed) {
  return materialsUsed.map((item) => {
    const medicine = getMedicineMasters().find((entry) => entry.id === item.medicineId);
    const unitPrice = Number(medicine?.price || 0);

    return {
      description: `${item.medicineName} therapy material`,
      category: "therapy",
      quantity: Number(item.quantity || 0),
      unitPrice,
      amount: Number(item.quantity || 0) * unitPrice
    };
  });
}

function enrichSchedule(schedule) {
  const therapy = db.panchkarmaTherapies.find((entry) => entry.id === schedule.therapyId) || null;
  const patient = db.patients.find((entry) => entry.id === schedule.patientId) || null;
  const therapist = getTherapists().find((entry) => entry.id === schedule.therapistId) || null;
  const doctor = schedule.recommendedBy ? getDoctorById(schedule.recommendedBy) : null;
  const therapyRoom = schedule.therapyRoomId ? db.rooms.find((entry) => entry.id === schedule.therapyRoomId) || null : null;
  const recoveryBed = schedule.recoveryBedId ? db.beds.find((entry) => entry.id === schedule.recoveryBedId) || null : null;
  const recoveryRoom = recoveryBed ? db.rooms.find((entry) => entry.id === recoveryBed.roomId) || null : null;
  const bill = schedule.billId ? db.bills.find((entry) => entry.id === schedule.billId) || null : null;

  return {
    ...schedule,
    therapy,
    patient,
    therapist,
    doctor,
    therapyRoom,
    recoveryBed,
    recoveryRoom,
    bill
  };
}

export function getPanchkarmaTherapies() {
  return [...db.panchkarmaTherapies].sort((left, right) => left.name.localeCompare(right.name));
}

export function getPanchkarmaMasters() {
  const therapyRooms = db.rooms.filter((entry) => entry.roomType === "therapy");
  const recoveryBeds = db.beds
    .filter((bed) => ["available", "reserved"].includes(bed.status))
    .map((bed) => ({
      ...bed,
      room: db.rooms.find((room) => room.id === bed.roomId) || null
    }));

  return {
    therapies: getPanchkarmaTherapies(),
    therapists: getTherapists(),
    doctors: getDoctors(),
    therapyRooms,
    recoveryBeds,
    materialMedicines: getMedicineMasters().filter((entry) =>
      ["External Therapy", "Ayurvedic Classical"].includes(entry.category)
    ),
    statuses: ["scheduled", "in_progress", "completed", "cancelled"]
  };
}

export function getPanchkarmaSummary() {
  const today = todayDate();
  const sessions = db.panchkarmaSchedules.map((entry) => enrichSchedule(entry));

  return {
    totalSessions: sessions.length,
    todaySessions: sessions.filter((entry) => entry.scheduledDate === today).length,
    scheduled: sessions.filter((entry) => entry.status === "scheduled").length,
    inProgress: sessions.filter((entry) => entry.status === "in_progress").length,
    completed: sessions.filter((entry) => entry.status === "completed").length,
    pendingBilling: sessions.filter((entry) => entry.status === "completed" && !entry.billId).length
  };
}

export function listPanchkarmaSchedules(query = {}) {
  const search = String(query.search || "").trim().toLowerCase();
  let items = db.panchkarmaSchedules.map((entry) => enrichSchedule(entry));

  if (query.status) {
    items = items.filter((entry) => entry.status === query.status);
  }

  if (query.scheduledDate) {
    items = items.filter((entry) => entry.scheduledDate === query.scheduledDate);
  }

  if (query.therapistId) {
    items = items.filter((entry) => entry.therapistId === query.therapistId);
  }

  if (query.patientId) {
    items = items.filter((entry) => entry.patientId === query.patientId);
  }

  if (search) {
    items = items.filter((entry) =>
      [
        entry.scheduleNumber,
        entry.patientName,
        entry.therapyName,
        entry.therapistName,
        entry.complaint,
        entry.outcome
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }

  return items.sort((left, right) =>
    `${right.scheduledDate} ${right.scheduledTime}`.localeCompare(`${left.scheduledDate} ${left.scheduledTime}`)
  );
}

export function getPanchkarmaScheduleDetails(scheduleId) {
  return enrichSchedule(getScheduleById(scheduleId));
}

export function createPanchkarmaSchedule(payload, userId) {
  if (!payload.patientId || !payload.therapyId || !payload.therapistId || !payload.scheduledDate || !payload.scheduledTime) {
    throw createError("Patient, therapy, therapist, date, and time are required.");
  }

  const patient = getPatientById(payload.patientId);
  const therapy = getTherapyById(payload.therapyId);
  const therapist = getTherapistById(payload.therapistId);
  const therapyRoom = payload.therapyRoomId ? getRoomById(payload.therapyRoomId) : null;

  if (therapyRoom && therapyRoom.roomType !== "therapy") {
    throw createError("Selected room is not a therapy room.");
  }

  let recoveryBed = null;
  if (payload.recoveryBedId) {
    recoveryBed = getBedById(payload.recoveryBedId);

    if (recoveryBed.status === "occupied") {
      throw createError("Selected recovery bed is currently occupied.");
    }
  }

  let recommendedByName = "";
  if (payload.recommendedBy) {
    const doctor = getDoctorById(payload.recommendedBy);

    if (!doctor) {
      throw createError("Recommending doctor not found.");
    }

    recommendedByName = doctor.fullName;
  }

  const schedule = {
    id: createId(),
    scheduleNumber: nextPanchkarmaScheduleNumber(),
    patientId: patient.id,
    patientName: `${patient.firstName} ${patient.lastName}`.trim(),
    therapyId: therapy.id,
    therapyName: therapy.name,
    recommendedBy: payload.recommendedBy || "",
    recommendedByName,
    linkedVisitId: payload.linkedVisitId || "",
    prescriptionId: payload.prescriptionId || "",
    therapyRoomId: therapyRoom?.id || "",
    recoveryBedId: recoveryBed?.id || "",
    therapistId: therapist.id,
    therapistName: therapist.fullName,
    scheduledDate: payload.scheduledDate,
    scheduledTime: payload.scheduledTime,
    estimatedDurationMinutes: Number(payload.estimatedDurationMinutes || therapy.defaultDurationMinutes || 30),
    status: "scheduled",
    complaint: payload.complaint || "",
    preparationNotes: payload.preparationNotes || "",
    executionNotes: "",
    followUpAdvice: "",
    materialsUsed: [],
    sessionStartedAt: "",
    sessionCompletedAt: "",
    outcome: "",
    billId: "",
    billedAmount: 0,
    createdBy: userId
  };

  db.panchkarmaSchedules.unshift(schedule);
  return enrichSchedule(schedule);
}

export function startPanchkarmaSession(scheduleId, payload, userId) {
  const schedule = getScheduleById(scheduleId);

  if (schedule.status !== "scheduled") {
    throw createError("Only scheduled sessions can be started.");
  }

  if (payload?.therapistId) {
    const therapist = getTherapistById(payload.therapistId);
    schedule.therapistId = therapist.id;
    schedule.therapistName = therapist.fullName;
  }

  schedule.status = "in_progress";
  schedule.sessionStartedAt = payload?.sessionStartedAt || new Date().toISOString();
  schedule.executionNotes = payload?.executionNotes || schedule.executionNotes;
  schedule.startedBy = userId;

  return enrichSchedule(schedule);
}

export function completePanchkarmaSession(scheduleId, payload, userId) {
  const schedule = getScheduleById(scheduleId);

  if (!["scheduled", "in_progress"].includes(schedule.status)) {
    throw createError("Only scheduled or in-progress sessions can be completed.");
  }

  if (!payload.outcome) {
    throw createError("Session outcome is required.");
  }

  const therapy = getTherapyById(schedule.therapyId);
  const materialsUsed = consumeMaterials(payload.materialsUsed || [], schedule.scheduleNumber);
  let bill = null;

  if (payload.createBill) {
    const items = [
      {
        description: `${therapy.name} Panchkarma session`,
        category: "therapy",
        quantity: 1,
        unitPrice: Number(payload.sessionCharge || therapy.price || 0),
        amount: Number(payload.sessionCharge || therapy.price || 0)
      }
    ];

    if (payload.addMaterialCharges) {
      items.push(...buildMaterialBillItems(materialsUsed));
    }

    bill = createBill({
      patientId: schedule.patientId,
      patientName: schedule.patientName,
      billType: "therapy",
      billDate: payload.billDate || todayDate(),
      paymentStatus: payload.paymentStatus || "unpaid",
      createdBy: userId,
      notes: `Generated from Panchkarma session ${schedule.scheduleNumber}`,
      items
    });
  }

  schedule.status = "completed";
  schedule.sessionStartedAt = schedule.sessionStartedAt || new Date().toISOString();
  schedule.sessionCompletedAt = payload.sessionCompletedAt || new Date().toISOString();
  schedule.executionNotes = payload.executionNotes || schedule.executionNotes || "";
  schedule.followUpAdvice = payload.followUpAdvice || "";
  schedule.materialsUsed = materialsUsed;
  schedule.outcome = payload.outcome;
  schedule.billId = bill?.id || schedule.billId || "";
  schedule.billedAmount = bill?.totalAmount || Number(payload.sessionCharge || therapy.price || 0);
  schedule.completedBy = userId;

  return enrichSchedule(schedule);
}
