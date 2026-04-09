import { demoUsers } from "../../config/constants.js";
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

function getPatientById(patientId) {
  return db.patients.find((entry) => entry.id === patientId) || null;
}

function getDoctorById(doctorId) {
  return demoUsers.find((entry) => entry.id === doctorId) || null;
}

function getBedById(bedId) {
  return db.beds.find((entry) => entry.id === bedId) || null;
}

function formatPatientAddress(patient) {
  if (!patient) {
    return "";
  }

  return [patient.address, patient.city, patient.state, patient.pincode]
    .filter(Boolean)
    .join(", ");
}

function matchesDateRange(value, from, to) {
  if (!value) {
    return false;
  }

  if (from && value < from) {
    return false;
  }

  if (to && value > to) {
    return false;
  }

  return true;
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

export function listBills(query = {}) {
  const search = String(query.search || "").trim().toLowerCase();
  let items = db.bills.map((bill) => enrichBill(bill));

  if (query.patientId) {
    items = items.filter((item) => item.patientId === query.patientId);
  }

  if (query.visitId) {
    items = items.filter((item) => item.visitId === query.visitId);
  }

  if (query.billType) {
    items = items.filter((item) => item.billType === query.billType);
  }

  if (query.paymentStatus) {
    items = items.filter((item) => item.paymentStatus === query.paymentStatus);
  }

  if (query.dateFrom || query.dateTo) {
    items = items.filter((item) => matchesDateRange(item.billDate, query.dateFrom, query.dateTo));
  }

  if (search) {
    items = items.filter((item) =>
      [item.billNumber, item.patientName, item.billType, item.notes]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }

  return items.sort((a, b) => `${b.billDate} ${b.billNumber}`.localeCompare(`${a.billDate} ${a.billNumber}`));
}

export function listPayments(query = {}) {
  const search = String(query.search || "").trim().toLowerCase();
  let items = [...db.payments];

  if (query.billId) {
    items = items.filter((payment) => payment.billId === query.billId);
  }

  if (query.patientId) {
    items = items.filter((payment) => payment.patientId === query.patientId);
  }

  if (query.paymentMode) {
    items = items.filter((payment) => payment.paymentMode === query.paymentMode);
  }

  if (query.dateFrom || query.dateTo) {
    items = items.filter((payment) => matchesDateRange(payment.paymentDate.slice(0, 10), query.dateFrom, query.dateTo));
  }

  if (search) {
    items = items.filter((payment) =>
      [payment.receiptNumber, payment.patientName, payment.referenceNumber, payment.paymentMode]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }

  return items.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
}

export function getBillDetails(billId) {
  const bill = getBillById(billId);
  const patient = getPatientById(bill.patientId);
  const visit = bill.visitId ? db.opdVisits.find((entry) => entry.id === bill.visitId) || null : null;
  const bed = bill.bedId ? getBedById(bill.bedId) : null;
  const room = bed ? db.rooms.find((entry) => entry.id === bed.roomId) || null : null;
  const doctor = visit?.doctorId ? getDoctorById(visit.doctorId) : null;

  return {
    item: enrichBill(bill),
    patient,
    visit,
    doctor,
    room,
    bed
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
    outstanding,
    todayCollections: listPayments({ dateFrom: todayDate(), dateTo: todayDate() }).reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    )
  };
}

export function getBillingMasters() {
  return {
    billTypes: ["opd", "ipd", "lab", "pharmacy", "therapy", "room", "procedure", "miscellaneous"],
    paymentModes: ["cash", "upi", "card", "bank_transfer"],
    itemCategories: ["consultation", "lab", "pharmacy", "room", "therapy", "procedure", "service", "miscellaneous"],
    invoiceProfiles: {
      pharmacy: {
        sellerName: "SU-RA MEDICAL STORES",
        addressLines: ["NEHA NAGAR MAKRONIYA SAGAR (M.P)", "PIN - 470004"],
        phone: "07582-357300",
        website: "shantiratnam.com",
        email: "shantiratnam@gmail.com",
        gstin: "23BISPB2894Q1ZJ",
        invoiceTitle: "GST INVOICE",
        terms: [
          "MEDICINE ONCE PREPARED AND SOLD WILL NOT BE TAKEN BACK OR EXCHANGED.",
          "All disputes subject to SAGAR jurisdiction only."
        ]
      }
    }
  };
}

export function createBill(payload) {
  if (!payload.patientId || !payload.items?.length) {
    throw createError("Patient and at least one bill item are required.");
  }

  const patient = getPatientById(payload.patientId);

  if (!patient) {
    throw createError("Patient not found.", 404);
  }

  const items = payload.items.map((item) => {
    if (!item.description) {
      throw createError("Each bill item requires a description.");
    }

    const quantity = Number(item.quantity || 1);
    const unitPrice = Number(item.unitPrice || 0);
    const amount = Number(item.amount || quantity * unitPrice);

    if (quantity <= 0 || unitPrice < 0 || amount < 0) {
      throw createError("Bill items must have valid quantity and pricing.");
    }

    return {
      id: createId(),
      description: item.description,
      category: item.category || "service",
      quantity,
      unitPrice,
      amount,
      batchNumber: item.batchNumber || "",
      pack: item.pack || "",
      expiryDate: item.expiryDate || "",
      gstPercent: Number(item.gstPercent || 0)
    };
  });

  const subtotal = sumItems(items);
  const discountAmount = Number(payload.discountAmount || 0);
  const taxAmount = Number(payload.taxAmount || 0);

  if (discountAmount < 0 || taxAmount < 0) {
    throw createError("Discount and tax must be zero or greater.");
  }

  const bill = {
    id: createId(),
    billNumber: nextBillNumber(),
    patientId: patient.id,
    patientName: payload.patientName || `${patient.firstName} ${patient.lastName}`,
    visitId: payload.visitId || "",
    bedId: payload.bedId || "",
    billType: payload.billType || "opd",
    billDate: payload.billDate || todayDate(),
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount: subtotal - discountAmount + taxAmount,
    paymentStatus: payload.paymentStatus || "unpaid",
    createdBy: payload.createdBy,
    notes: payload.notes || "",
    invoiceMeta: {
      doctorName: payload.invoiceMeta?.doctorName || "",
      doctorRegNo: payload.invoiceMeta?.doctorRegNo || "",
      patientAddress: payload.invoiceMeta?.patientAddress || formatPatientAddress(patient),
      remark: payload.invoiceMeta?.remark || ""
    },
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
