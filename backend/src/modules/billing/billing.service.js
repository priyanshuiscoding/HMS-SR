import { createId, db, nextBillNumber } from "../../data/store.js";

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = message;
  return error;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function sumItems(items) {
  return items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

export function listBills(query = {}) {
  let items = [...db.bills];

  if (query.patientId) {
    items = items.filter((item) => item.patientId === query.patientId);
  }

  if (query.visitId) {
    items = items.filter((item) => item.visitId === query.visitId);
  }

  return items.sort((a, b) => b.billDate.localeCompare(a.billDate));
}

export function createBill(payload) {
  if (!payload.patientId || !payload.visitId || !payload.items?.length) {
    throw createError("Patient, visit, and bill items are required.");
  }

  const items = payload.items.map((item) => ({
    id: createId(),
    description: item.description,
    category: item.category || "service",
    quantity: Number(item.quantity || 1),
    unitPrice: Number(item.unitPrice || 0),
    amount: Number(item.amount || Number(item.quantity || 1) * Number(item.unitPrice || 0))
  }));

  const subtotal = sumItems(items);
  const bill = {
    id: createId(),
    billNumber: nextBillNumber(),
    patientId: payload.patientId,
    patientName: payload.patientName,
    visitId: payload.visitId,
    billType: payload.billType || "opd",
    billDate: todayDate(),
    subtotal,
    discountAmount: Number(payload.discountAmount || 0),
    taxAmount: Number(payload.taxAmount || 0),
    totalAmount: subtotal - Number(payload.discountAmount || 0) + Number(payload.taxAmount || 0),
    paidAmount: Number(payload.paidAmount || 0),
    paymentStatus: payload.paymentStatus || "unpaid",
    createdBy: payload.createdBy,
    items
  };

  db.bills.unshift(bill);
  return bill;
}
