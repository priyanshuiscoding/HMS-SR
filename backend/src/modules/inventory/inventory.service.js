import {
  createId,
  db,
  getMedicineMasters,
  getSuppliers,
  nextGrnNumber
} from "../../data/store.js";

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = message;
  return error;
}

function getMedicineById(medicineId) {
  const medicine = getMedicineMasters().find((entry) => entry.id === medicineId);

  if (!medicine) {
    throw createError("Medicine not found.", 404);
  }

  return medicine;
}

export function getInventoryMasters() {
  return {
    medicines: getMedicineMasters(),
    suppliers: getSuppliers()
  };
}

export function listInventoryBatches(query = {}) {
  let items = [...db.inventoryBatches];

  if (query.medicineId) {
    items = items.filter((item) => item.medicineId === query.medicineId);
  }

  return items.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
}

export function listStockTransactions(query = {}) {
  let items = [...db.stockTransactions];

  if (query.medicineId) {
    items = items.filter((item) => item.medicineId === query.medicineId);
  }

  return items.sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));
}

export function receiveStock(payload) {
  if (!payload.medicineId || !payload.batchNumber || !payload.expiryDate || !payload.quantityReceived) {
    throw createError("Medicine, batch number, expiry date, and quantity are required.");
  }

  const medicine = getMedicineById(payload.medicineId);
  const quantityReceived = Number(payload.quantityReceived || 0);

  if (quantityReceived <= 0) {
    throw createError("Quantity received must be greater than zero.");
  }

  const batch = {
    id: createId(),
    medicineId: medicine.id,
    medicineName: medicine.name,
    batchNumber: payload.batchNumber,
    supplierId: payload.supplierId || "",
    receivedDate: payload.receivedDate || new Date().toISOString().slice(0, 10),
    expiryDate: payload.expiryDate,
    quantityReceived,
    quantityAvailable: quantityReceived,
    purchasePrice: Number(payload.purchasePrice || 0),
    sellingPrice: Number(payload.sellingPrice || medicine.price || 0)
  };

  db.inventoryBatches.unshift(batch);

  db.stockTransactions.unshift({
    id: createId(),
    transactionDate: new Date().toISOString(),
    medicineId: medicine.id,
    medicineName: medicine.name,
    batchId: batch.id,
    type: "receipt",
    quantity: quantityReceived,
    referenceNumber: nextGrnNumber(),
    note: payload.note || "Stock received into inventory"
  });

  return batch;
}
