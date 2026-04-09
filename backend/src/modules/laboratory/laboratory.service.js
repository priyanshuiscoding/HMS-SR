import { createId, db, getLabTestMasters, nextLabOrderNumber } from "../../data/store.js";
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

function nowIso() {
  return new Date().toISOString();
}

function getOrderById(orderId) {
  const order = db.labOrders.find((entry) => entry.id === orderId);

  if (!order) {
    throw createError("Lab order not found.", 404);
  }

  return order;
}

function enrichOrder(order) {
  const visit = order.visitId ? db.opdVisits.find((entry) => entry.id === order.visitId) || null : null;
  const patient = db.patients.find((entry) => entry.id === order.patientId) || null;
  const bill = order.billId ? db.bills.find((entry) => entry.id === order.billId) || null : null;

  return {
    ...order,
    visit,
    patient,
    bill
  };
}

export function getLabMasters() {
  return {
    tests: getLabTestMasters(),
    priorities: ["routine", "urgent", "stat"],
    statuses: ["pending", "sample_collected", "processing", "completed", "reported"],
    resultFlags: ["normal", "high", "low", "critical", "borderline"]
  };
}

export function getLabSummary() {
  const orders = db.labOrders.map((entry) => enrichOrder(entry));
  const today = todayDate();

  return {
    totalOrders: orders.length,
    todayOrders: orders.filter((entry) => entry.orderDate === today).length,
    pendingOrders: orders.filter((entry) => entry.status === "pending").length,
    collectedOrders: orders.filter((entry) => entry.status === "sample_collected").length,
    processingOrders: orders.filter((entry) => entry.status === "processing").length,
    reportedOrders: orders.filter((entry) => entry.status === "reported").length,
    pendingBilling: orders.filter((entry) => entry.status === "reported" && !entry.billId).length
  };
}

export function listLabOrders(query = {}) {
  const search = String(query.search || "").trim().toLowerCase();
  let items = db.labOrders.map((entry) => enrichOrder(entry));

  if (query.patientId) {
    items = items.filter((item) => item.patientId === query.patientId);
  }

  if (query.visitId) {
    items = items.filter((item) => item.visitId === query.visitId);
  }

  if (query.status) {
    items = items.filter((item) => item.status === query.status);
  }

  if (query.priority) {
    items = items.filter((item) => item.priority === query.priority);
  }

  if (query.orderDate) {
    items = items.filter((item) => item.orderDate === query.orderDate);
  }

  if (search) {
    items = items.filter((item) =>
      [item.orderNumber, item.patientName, item.priority, item.status, item.tests.map((test) => test.testName).join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }

  return items.sort((a, b) => `${b.orderDate} ${b.orderNumber}`.localeCompare(`${a.orderDate} ${a.orderNumber}`));
}

export function getLabOrderDetails(orderId) {
  return enrichOrder(getOrderById(orderId));
}

export function createLabOrder(payload) {
  if (!payload.visitId || !payload.patientId || !payload.tests?.length) {
    throw createError("Visit, patient, and at least one test are required.");
  }

  const tests = payload.tests.map((testId) => {
    const master = getLabTestMasters().find((item) => item.id === testId);

    if (!master) {
      throw createError(`Unknown lab test: ${testId}`);
    }

    return {
      id: createId(),
      testId: master.id,
      testName: master.name,
      code: master.code,
      department: master.department,
      normalRange: master.normalRange,
      result: "",
      remarks: "",
      resultFlag: "normal",
      status: "pending"
    };
  });

  const order = {
    id: createId(),
    orderNumber: nextLabOrderNumber(),
    patientId: payload.patientId,
    patientName: payload.patientName,
    orderedBy: payload.orderedBy,
    visitId: payload.visitId,
    orderDate: todayDate(),
    priority: payload.priority || "routine",
    status: "pending",
    tests,
    reportUrl: "",
    sampleCollectionTime: "",
    sampleCollectedBy: "",
    reportedAt: "",
    reportedBy: "",
    billId: ""
  };

  db.labOrders.unshift(order);
  return enrichOrder(order);
}

export function collectLabSample(orderId, payload, userId) {
  const order = getOrderById(orderId);

  if (!["pending", "sample_collected"].includes(order.status)) {
    throw createError("Sample collection is only allowed for pending or recollection orders.");
  }

  order.status = "sample_collected";
  order.sampleCollectionTime = payload.sampleCollectionTime || nowIso();
  order.sampleCollectedBy = userId;
  order.sampleType = payload.sampleType || order.sampleType || "";
  order.collectionNote = payload.collectionNote || order.collectionNote || "";
  order.tests = order.tests.map((test) => ({
    ...test,
    status: "sample_collected"
  }));

  return enrichOrder(order);
}

export function saveLabResults(orderId, payload, userId) {
  const order = getOrderById(orderId);

  if (!payload.tests?.length) {
    throw createError("At least one test result is required.");
  }

  const nextStatus = payload.markReported ? "reported" : "processing";
  let completedCount = 0;

  order.tests = order.tests.map((test) => {
    const incoming = payload.tests.find((entry) => entry.testId === test.testId);

    if (!incoming) {
      return test;
    }

    if (!incoming.result && nextStatus === "reported") {
      throw createError(`Result is required for ${test.testName} before reporting.`);
    }

    const updated = {
      ...test,
      result: incoming.result ?? test.result,
      remarks: incoming.remarks ?? test.remarks,
      resultFlag: incoming.resultFlag || test.resultFlag || "normal",
      status: incoming.result || nextStatus === "reported" ? "completed" : test.status
    };

    if (updated.status === "completed") {
      completedCount += 1;
    }

    return updated;
  });

  order.status = nextStatus;
  order.reportedAt = nextStatus === "reported" ? nowIso() : order.reportedAt;
  order.reportedBy = userId;
  order.reportUrl = nextStatus === "reported" ? `/lab/reports/${order.orderNumber}` : order.reportUrl;
  order.processingSummary = payload.processingSummary || order.processingSummary || "";
  order.completedTests = completedCount;

  return enrichOrder(order);
}

export function createLabBill(orderId, payload, userId) {
  const order = getOrderById(orderId);

  if (order.billId) {
    throw createError("A lab bill has already been created for this order.");
  }

  const items = order.tests.map((test) => {
    const master = getLabTestMasters().find((entry) => entry.id === test.testId);

    return {
      description: test.testName,
      category: "lab",
      quantity: 1,
      unitPrice: Number(master?.price || 0),
      amount: Number(master?.price || 0)
    };
  });

  const bill = createBill({
    patientId: order.patientId,
    patientName: order.patientName,
    visitId: order.visitId || "",
    billType: "lab",
    paymentStatus: payload.paymentStatus || "unpaid",
    billDate: payload.billDate || todayDate(),
    createdBy: userId,
    notes: `Generated from lab order ${order.orderNumber}`,
    items
  });

  order.billId = bill.id;
  return enrichOrder(order);
}
