import { createId, db, getLabTestMasters, nextLabOrderNumber } from "../../data/store.js";

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = message;
  return error;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function getLabMasters() {
  return {
    tests: getLabTestMasters(),
    priorities: ["routine", "urgent", "stat"],
    statuses: ["pending", "sample_collected", "processing", "completed", "reported"]
  };
}

export function listLabOrders(query = {}) {
  let items = [...db.labOrders];

  if (query.patientId) {
    items = items.filter((item) => item.patientId === query.patientId);
  }

  if (query.visitId) {
    items = items.filter((item) => item.visitId === query.visitId);
  }

  return items.sort((a, b) => b.orderDate.localeCompare(a.orderDate));
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
      result: "",
      remarks: ""
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
    sampleCollectionTime: ""
  };

  db.labOrders.unshift(order);
  return order;
}
