import { createId, db, getRoomMasters as getStaticRoomMasters } from "../../data/store.js";

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = message;
  return error;
}

function getRoomById(roomId) {
  const room = db.rooms.find((entry) => entry.id === roomId);

  if (!room) {
    throw createError("Room not found.", 404);
  }

  return room;
}

function getBedById(roomId, bedId) {
  const bed = db.beds.find((entry) => entry.id === bedId && entry.roomId === roomId);

  if (!bed) {
    throw createError("Bed not found.", 404);
  }

  return bed;
}

function getPatientById(patientId) {
  const patient = db.patients.find((entry) => entry.id === patientId);

  if (!patient) {
    throw createError("Patient not found.", 404);
  }

  return patient;
}

function findExistingBedAssignment(patientId, excludeBedId = "") {
  return db.beds.find((entry) => entry.patientId === patientId && entry.status === "occupied" && entry.id !== excludeBedId) || null;
}

function summarizeRoom(room) {
  const beds = db.beds.filter((bed) => bed.roomId === room.id);
  const occupiedBeds = beds.filter((bed) => bed.status === "occupied").length;
  const availableBeds = beds.filter((bed) => bed.status === "available").length;
  const reservedBeds = beds.filter((bed) => bed.status === "reserved").length;
  const maintenanceBeds = beds.filter((bed) => ["cleaning", "maintenance"].includes(bed.status)).length;

  return {
    ...room,
    totalBeds: beds.length,
    occupiedBeds,
    availableBeds,
    reservedBeds,
    maintenanceBeds,
    occupancyPercent: beds.length ? Math.round((occupiedBeds / beds.length) * 100) : 0,
    status: availableBeds > 0 ? "available" : occupiedBeds > 0 ? "full" : "blocked"
  };
}

export function listRooms(query = {}) {
  let items = db.rooms.map((room) => summarizeRoom(room));

  if (query.roomType) {
    items = items.filter((room) => room.roomType === query.roomType);
  }

  if (query.floor) {
    items = items.filter((room) => room.floor === query.floor);
  }

  if (query.status) {
    items = items.filter((room) => room.status === query.status);
  }

  return items.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
}

export function getRoomDetails(roomId) {
  const room = summarizeRoom(getRoomById(roomId));
  const beds = db.beds.filter((bed) => bed.roomId === roomId).sort((a, b) => a.bedNumber.localeCompare(b.bedNumber));

  return {
    item: room,
    beds
  };
}

export function getRoomsAvailability() {
  const rooms = listRooms();
  const beds = [...db.beds].sort((a, b) => a.bedNumber.localeCompare(b.bedNumber));

  return {
    summary: {
      totalRooms: rooms.length,
      totalBeds: beds.length,
      occupiedBeds: beds.filter((bed) => bed.status === "occupied").length,
      availableBeds: beds.filter((bed) => bed.status === "available").length,
      reservedBeds: beds.filter((bed) => bed.status === "reserved").length,
      blockedBeds: beds.filter((bed) => ["cleaning", "maintenance"].includes(bed.status)).length
    },
    items: rooms
  };
}

export function createRoom(payload) {
  if (!payload.roomNumber || !payload.roomType || !payload.floor || !payload.bedCount) {
    throw createError("Room number, type, floor, and bed count are required.");
  }

  if (db.rooms.some((room) => room.roomNumber === payload.roomNumber)) {
    throw createError("A room with this room number already exists.");
  }

  const bedCount = Number(payload.bedCount || 0);

  if (bedCount <= 0) {
    throw createError("Bed count must be greater than zero.");
  }

  const room = {
    id: createId(),
    roomNumber: payload.roomNumber.trim(),
    ward: payload.ward?.trim() || "General Ward",
    roomType: payload.roomType,
    floor: payload.floor.trim(),
    chargePerDay: Number(payload.chargePerDay || 0),
    nursingStation: payload.nursingStation?.trim() || "Main Ward",
    notes: payload.notes || ""
  };

  db.rooms.push(room);

  Array.from({ length: bedCount }).forEach((_, index) => {
    db.beds.push({
      id: createId(),
      roomId: room.id,
      bedNumber: `${room.roomNumber}-${index + 1}`,
      bedLabel: payload.bedPrefix ? `${payload.bedPrefix} ${index + 1}` : `Bed ${index + 1}`,
      status: "available",
      patientId: null,
      patientName: "",
      assignedAt: "",
      expectedDischargeDate: "",
      note: ""
    });
  });

  return getRoomDetails(room.id);
}

export function assignBed(roomId, bedId, payload) {
  getRoomById(roomId);
  const bed = getBedById(roomId, bedId);

  if (!["available", "reserved"].includes(bed.status)) {
    throw createError("This bed is not currently assignable.");
  }

  if (!payload.patientId) {
    throw createError("Patient is required for bed assignment.");
  }

  const patient = getPatientById(payload.patientId);
  const existingAssignment = findExistingBedAssignment(patient.id, bed.id);

  if (existingAssignment) {
    throw createError("This patient already occupies another bed.");
  }

  bed.status = "occupied";
  bed.patientId = patient.id;
  bed.patientName = `${patient.firstName} ${patient.lastName}`;
  bed.assignedAt = new Date().toISOString();
  bed.expectedDischargeDate = payload.expectedDischargeDate || "";
  bed.note = payload.note || "";
  bed.admissionType = payload.admissionType || "observation";
  bed.assignedBy = payload.assignedBy;

  return getRoomDetails(roomId);
}

export function dischargeBed(roomId, bedId, payload) {
  getRoomById(roomId);
  const bed = getBedById(roomId, bedId);

  if (bed.status !== "occupied") {
    throw createError("Only occupied beds can be discharged.");
  }

  bed.status = payload.nextStatus || "cleaning";
  bed.patientId = null;
  bed.patientName = "";
  bed.assignedAt = "";
  bed.expectedDischargeDate = "";
  bed.note = payload.note || "";
  bed.admissionType = "";
  bed.assignedBy = "";

  return getRoomDetails(roomId);
}

export function getRoomMasters() {
  return {
    ...getStaticRoomMasters(),
    floors: Array.from(new Set(db.rooms.map((room) => room.floor))).sort(),
    wards: Array.from(new Set(db.rooms.map((room) => room.ward))).sort(),
    roomStatuses: ["available", "full", "blocked"]
  };
}
