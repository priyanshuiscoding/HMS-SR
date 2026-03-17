import { createId, db, getMedicineMasters, nextDispenseNumber } from "../../data/store.js";

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = message;
  return error;
}

function sortByExpiry(a, b) {
  return a.expiryDate.localeCompare(b.expiryDate);
}

function getPrescriptionById(prescriptionId) {
  const prescription = db.prescriptions.find((entry) => entry.id === prescriptionId);

  if (!prescription) {
    throw createError("Prescription not found.", 404);
  }

  return prescription;
}

function getBatchById(batchId) {
  const batch = db.inventoryBatches.find((entry) => entry.id === batchId);

  if (!batch) {
    throw createError("Inventory batch not found.", 404);
  }

  return batch;
}

function getStockSummaryForMedicine(medicine) {
  const batches = db.inventoryBatches
    .filter((batch) => batch.medicineId === medicine.id)
    .sort(sortByExpiry);
  const totalAvailable = batches.reduce((sum, batch) => sum + Number(batch.quantityAvailable || 0), 0);
  const nearestExpiry = batches[0]?.expiryDate || "";
  const lowStock = totalAvailable <= Number(medicine.reorderLevel || 0);
  const expiringSoon = Boolean(
    nearestExpiry &&
      new Date(nearestExpiry).getTime() - Date.now() <= 1000 * 60 * 60 * 24 * 90
  );

  return {
    ...medicine,
    totalAvailable,
    nearestExpiry,
    lowStock,
    expiringSoon,
    activeBatches: batches.length
  };
}

function buildDispenseItems(prescription, payloadItems = []) {
  const sourceItems = payloadItems.length
    ? payloadItems
    : prescription.medicines.map((item) => ({
        medicineId: item.medicineId,
        quantity: item.quantityDispensed || 0
      }));

  return sourceItems.map((item) => {
    const medicine = getMedicineMasters().find((entry) => entry.id === item.medicineId);

    if (!medicine) {
      throw createError(`Unknown medicine: ${item.medicineId}`);
    }

    const quantity = Number(item.quantity || 0);

    if (!quantity) {
      throw createError(`Dispense quantity is required for ${medicine.name}.`);
    }

    const preferredBatch = item.batchId
      ? getBatchById(item.batchId)
      : db.inventoryBatches
          .filter((batch) => batch.medicineId === item.medicineId && Number(batch.quantityAvailable) > 0)
          .sort(sortByExpiry)[0];

    if (!preferredBatch || Number(preferredBatch.quantityAvailable) < quantity) {
      throw createError(`Insufficient stock for ${medicine.name}.`);
    }

    return {
      id: createId(),
      medicineId: medicine.id,
      medicineName: medicine.name,
      batchId: preferredBatch.id,
      batchNumber: preferredBatch.batchNumber,
      quantity,
      unitPrice: Number(preferredBatch.sellingPrice || medicine.price || 0),
      amount: quantity * Number(preferredBatch.sellingPrice || medicine.price || 0)
    };
  });
}

export function getPharmacyMasters() {
  return {
    medicines: getMedicineMasters(),
    statuses: ["pending", "completed"],
    alerts: getPharmacyAlerts()
  };
}

export function getPharmacyStock() {
  return getMedicineMasters()
    .map((medicine) => getStockSummaryForMedicine(medicine))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getPharmacyAlerts() {
  const stock = getPharmacyStock();

  return {
    lowStock: stock.filter((item) => item.lowStock),
    expiringSoon: stock.filter((item) => item.expiringSoon),
    outOfStock: stock.filter((item) => item.totalAvailable === 0)
  };
}

export function listPrescriptionQueue(query = {}) {
  let items = [...db.prescriptions];

  if (query.status === "pending") {
    items = items.filter((item) => !item.isDispensed);
  }

  if (query.status === "completed") {
    items = items.filter((item) => item.isDispensed);
  }

  if (query.patientId) {
    items = items.filter((item) => item.patientId === query.patientId);
  }

  return items
    .map((prescription) => ({
      ...prescription,
      visit: db.opdVisits.find((visit) => visit.id === prescription.visitId) || null,
      dispensation:
        db.dispensations.find((dispense) => dispense.prescriptionId === prescription.id) || null
    }))
    .sort((a, b) => b.prescriptionDate.localeCompare(a.prescriptionDate));
}

export function listDispensations(query = {}) {
  let items = [...db.dispensations];

  if (query.patientId) {
    items = items.filter((item) => item.patientId === query.patientId);
  }

  return items.sort((a, b) => b.dispensedDate.localeCompare(a.dispensedDate));
}

export function dispensePrescription(prescriptionId, payload, userId) {
  const prescription = getPrescriptionById(prescriptionId);

  if (prescription.isDispensed) {
    throw createError("This prescription has already been dispensed.");
  }

  const items = buildDispenseItems(prescription, payload.items || []);

  items.forEach((item) => {
    const batch = getBatchById(item.batchId);
    batch.quantityAvailable = Number(batch.quantityAvailable || 0) - Number(item.quantity || 0);

    db.stockTransactions.unshift({
      id: createId(),
      transactionDate: new Date().toISOString(),
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      batchId: item.batchId,
      type: "issue",
      quantity: -Number(item.quantity || 0),
      referenceNumber: prescription.prescriptionNumber,
      note: `Dispensed against ${prescription.prescriptionNumber}`
    });
  });

  prescription.isDispensed = true;

  const dispensation = {
    id: createId(),
    dispenseNumber: nextDispenseNumber(),
    prescriptionId: prescription.id,
    patientId: prescription.patientId,
    patientName: prescription.patientName,
    visitId: prescription.visitId,
    dispensedBy: userId,
    dispensedDate: new Date().toISOString(),
    status: "completed",
    items
  };

  db.dispensations.unshift(dispensation);

  return dispensation;
}
