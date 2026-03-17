import { createId, db, nextBillNumber, nextReceiptNumber } from "../../data/store.js";

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

function getBillById(billId) {
  const bill = db.bills.find((entry) => entry.id === billId);

  if (!bill) {
    throw createError("Bill not found.", 404);
  }

  return bill;
}

function enrichBill(bill) {
  const payments = db.payments
    .filter((payment) => payment.billId === bill.id)
    .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
  const paidAmount = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const balanceAmount = Number(bill.totalAmount || 0) - paidAmount;

  let paymentStatus = "unpaid";

  if (balanceAmount <= 0) {
    paymentStatus = "paid";
  } else if (paidAmount > 0) {
    paymentStatus = "partial";
  }

  return {
    ...bill,
    paidAmount,
    balanceAmount,
    paymentStatus,
    payments
  };
}

function getPatientById(patientId) {
  return db.patients.find((entry) => entry.id === patientId) || null;
}

export function listBills(query = {}) {
  let items = [...db.bills];

  if (query.patientId) {
    items = items.filter((item) => item.patientId === query.patientId);
  }

  if (query.visitId) {
    items = items.filter((item) => item.visitId === query.visitId);
  }

  if (query.paymentStatus) {
    items = items.map((bill) => enrichBill(bill)).filter((bill) => bill.paymentStatus === query.paymentStatus);
    return items.sort((a, b) => b.billDate.localeCompare(a.billDate));
  }

  return items.map((bill) => enrichBill(bill)).sort((a, b) => b.billDate.localeCompare(a.billDate));
}

export function getBillDetails(billId) {
  const bill = getBillById(billId);
  const patient = getPatientById(bill.patientId);
  const visit = bill.visitId ? db.opdVisits.find((entry) => entry.id === bill.visitId) || null : null;

  return {
    item: enrichBill(bill),
    patient,
    visit
  };
}

export function getBillingSummary() {
  const bills = listBills();
  const totalRevenue = bills.reduce((sum, bill) => sum + Number(bill.paidAmount || 0), 0);
  const outstanding = bills.reduce((sum, bill) => sum + Math.max(Number(bill.balanceAmount || 0), 0), 0);

  return {
    totalBills: bills.length,
    paidBills: bills.filter((bill) => bill.paymentStatus === "paid").length,
    partialBills: bills.filter((bill) => bill.paymentStatus === "partial").length,
    unpaidBills: bills.filter((bill) => bill.paymentStatus === "unpaid").length,
    totalRevenue,
    outstanding
  };
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
    paymentStatus: payload.paymentStatus || "unpaid",
    createdBy: payload.createdBy,
    notes: payload.notes || "",
    items
  };

  db.bills.unshift(bill);
  return enrichBill(bill);
}

export function collectPayment(billId, payload) {
  const bill = getBillById(billId);
  const enrichedBill = enrichBill(bill);

  if (!payload.amount) {
    throw createError("Payment amount is required.");
  }

  const amount = Number(payload.amount || 0);

  if (amount <= 0) {
    throw createError("Payment amount must be greater than zero.");
  }

  if (amount > enrichedBill.balanceAmount) {
    throw createError("Payment amount cannot exceed the outstanding balance.");
  }

  const payment = {
    id: createId(),
    receiptNumber: nextReceiptNumber(),
    billId: bill.id,
    patientId: bill.patientId,
    patientName: bill.patientName,
    paymentDate: new Date().toISOString(),
    amount,
    paymentMode: payload.paymentMode || "cash",
    referenceNumber: payload.referenceNumber || "",
    receivedBy: payload.receivedBy,
    note: payload.note || ""
  };

  db.payments.unshift(payment);

  const updated = enrichBill(bill);
  bill.paymentStatus = updated.paymentStatus;

  return {
    payment,
    bill: updated
  };
}
