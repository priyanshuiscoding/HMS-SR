import { db, getDoctors } from "../../data/store.js";

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function matchesDate(value, targetDate) {
  return String(value || "").slice(0, 10) === targetDate;
}

function inRange(value, from, to) {
  const date = String(value || "").slice(0, 10);

  if (!date) {
    return false;
  }

  if (from && date < from) {
    return false;
  }

  if (to && date > to) {
    return false;
  }

  return true;
}

function getDateRange(query = {}) {
  const today = todayDate();
  return {
    dateFrom: query.dateFrom || query.date || today,
    dateTo: query.dateTo || query.date || today
  };
}

function sumAmounts(items, field) {
  return items.reduce((sum, item) => sum + Number(item[field] || 0), 0);
}

export function getReportsOverview(query = {}) {
  const { dateFrom, dateTo } = getDateRange(query);
  const opdVisits = db.opdVisits.filter((visit) => inRange(visit.visitDate, dateFrom, dateTo));
  const ipdAdmissions = db.ipdAdmissions.filter((admission) => inRange(admission.admissionDate, dateFrom, dateTo));
  const bills = db.bills.filter((bill) => inRange(bill.billDate, dateFrom, dateTo));
  const labOrders = db.labOrders.filter((order) => inRange(order.orderDate, dateFrom, dateTo));
  const panchkarmaSessions = db.panchkarmaSchedules.filter((session) => inRange(session.scheduledDate, dateFrom, dateTo));

  return {
    dateFrom,
    dateTo,
    opdVisits: opdVisits.length,
    ipdAdmissions: ipdAdmissions.length,
    revenue: sumAmounts(bills, "totalAmount"),
    collections: sumAmounts(db.payments.filter((payment) => inRange(payment.paymentDate, dateFrom, dateTo)), "amount"),
    labOrders: labOrders.length,
    panchkarmaSessions: panchkarmaSessions.length
  };
}

export function getDailyOpdReport(query = {}) {
  const reportDate = query.date || todayDate();
  const visits = db.opdVisits.filter((visit) => matchesDate(visit.visitDate, reportDate));
  const appointmentLookup = new Map(db.appointments.map((item) => [item.id, item]));
  const doctorLookup = new Map(getDoctors().map((doctor) => [doctor.id, doctor.fullName]));

  const byDoctor = Object.values(
    visits.reduce((summary, visit) => {
      const key = visit.doctorId || "unassigned";
      if (!summary[key]) {
        summary[key] = {
          doctorId: visit.doctorId || "",
          doctorName: doctorLookup.get(visit.doctorId) || "Assigned doctor",
          totalVisits: 0,
          completedVisits: 0,
          waitingVisits: 0
        };
      }

      summary[key].totalVisits += 1;
      if (visit.status === "completed") {
        summary[key].completedVisits += 1;
      } else {
        summary[key].waitingVisits += 1;
      }

      return summary;
    }, {})
  );

  const items = visits
    .map((visit) => {
      const appointment = appointmentLookup.get(visit.appointmentId) || null;
      return {
        opdNumber: visit.opdNumber,
        patientName: visit.patientName,
        doctorId: visit.doctorId,
        appointmentTime: appointment?.appointmentTime || "",
        chiefComplaint: visit.chiefComplaint || "General consultation",
        status: visit.status,
        consultationFee: Number(visit.consultationFee || 0)
      };
    })
    .sort((left, right) => left.appointmentTime.localeCompare(right.appointmentTime));

  return {
    date: reportDate,
    summary: {
      totalVisits: visits.length,
      completedVisits: visits.filter((visit) => visit.status === "completed").length,
      inProgressVisits: visits.filter((visit) => visit.status === "in_consultation").length,
      waitingVisits: visits.filter((visit) => visit.status === "waiting").length,
      consultationValue: sumAmounts(visits, "consultationFee")
    },
    byDoctor,
    items
  };
}

export function getIpdCensusReport(query = {}) {
  const reportDate = query.date || todayDate();
  const activeAdmissions = db.ipdAdmissions.filter((admission) => admission.status === "active");
  const admissionsToday = db.ipdAdmissions.filter((admission) => matchesDate(admission.admissionDate, reportDate));
  const dischargesToday = db.ipdAdmissions.filter((admission) =>
    matchesDate(admission.dischargeSummary?.dischargeDate, reportDate)
  );

  const roomCensus = db.rooms.map((room) => {
    const beds = db.beds.filter((bed) => bed.roomId === room.id);
    const occupied = beds.filter((bed) => bed.status === "occupied").length;

    return {
      roomId: room.id,
      roomNumber: room.roomNumber,
      ward: room.ward,
      totalBeds: beds.length,
      occupiedBeds: occupied,
      availableBeds: beds.filter((bed) => bed.status === "available").length,
      blockedBeds: beds.filter((bed) => ["cleaning", "maintenance"].includes(bed.status)).length,
      occupancyPercent: beds.length ? Math.round((occupied / beds.length) * 100) : 0
    };
  });

  return {
    date: reportDate,
    summary: {
      activeAdmissions: activeAdmissions.length,
      admissionsToday: admissionsToday.length,
      dischargesToday: dischargesToday.length,
      totalBeds: db.beds.length,
      occupiedBeds: db.beds.filter((bed) => bed.status === "occupied").length
    },
    activePatients: activeAdmissions.map((admission) => ({
      admissionNumber: admission.admissionNumber,
      patientName: admission.patientName,
      room: db.rooms.find((room) => room.id === admission.roomId)?.roomNumber || "",
      bed: db.beds.find((bed) => bed.id === admission.bedId)?.bedNumber || "",
      diagnosis: admission.diagnosis || "",
      expectedDischargeDate: admission.expectedDischargeDate || ""
    })),
    roomCensus
  };
}

export function getRevenueReport(query = {}) {
  const { dateFrom, dateTo } = getDateRange(query);
  const bills = db.bills.filter((bill) => inRange(bill.billDate, dateFrom, dateTo));
  const payments = db.payments.filter((payment) => inRange(payment.paymentDate, dateFrom, dateTo));

  const byType = Object.values(
    bills.reduce((summary, bill) => {
      if (!summary[bill.billType]) {
        summary[bill.billType] = { billType: bill.billType, bills: 0, totalAmount: 0, paidAmount: 0 };
      }

      summary[bill.billType].bills += 1;
      summary[bill.billType].totalAmount += Number(bill.totalAmount || 0);
      summary[bill.billType].paidAmount += Number(bill.paidAmount || 0);
      return summary;
    }, {})
  ).sort((left, right) => right.totalAmount - left.totalAmount);

  const byMode = Object.values(
    payments.reduce((summary, payment) => {
      if (!summary[payment.paymentMode]) {
        summary[payment.paymentMode] = { paymentMode: payment.paymentMode, count: 0, amount: 0 };
      }

      summary[payment.paymentMode].count += 1;
      summary[payment.paymentMode].amount += Number(payment.amount || 0);
      return summary;
    }, {})
  ).sort((left, right) => right.amount - left.amount);

  return {
    dateFrom,
    dateTo,
    summary: {
      totalBills: bills.length,
      totalBilled: sumAmounts(bills, "totalAmount"),
      totalCollected: sumAmounts(payments, "amount"),
      outstanding: bills.reduce((sum, bill) => sum + Math.max(Number(bill.totalAmount || 0) - Number(bill.paidAmount || 0), 0), 0)
    },
    byType,
    byMode
  };
}

export function getPharmacySalesReport(query = {}) {
  const { dateFrom, dateTo } = getDateRange(query);
  const dispensations = db.dispensations.filter((dispense) => inRange(dispense.dispensedDate, dateFrom, dateTo));

  const byMedicine = Object.values(
    dispensations
      .flatMap((dispense) => dispense.items)
      .reduce((summary, item) => {
        if (!summary[item.medicineId]) {
          summary[item.medicineId] = {
            medicineId: item.medicineId,
            medicineName: item.medicineName,
            quantity: 0,
            amount: 0
          };
        }

        summary[item.medicineId].quantity += Number(item.quantity || 0);
        summary[item.medicineId].amount += Number(item.amount || 0);
        return summary;
      }, {})
  ).sort((left, right) => right.amount - left.amount);

  return {
    dateFrom,
    dateTo,
    summary: {
      prescriptionsDispensed: dispensations.length,
      salesAmount: dispensations.reduce(
        (sum, dispense) => sum + dispense.items.reduce((lineSum, item) => lineSum + Number(item.amount || 0), 0),
        0
      ),
      medicineLines: byMedicine.length
    },
    byMedicine
  };
}

export function getLabWorkloadReport(query = {}) {
  const { dateFrom, dateTo } = getDateRange(query);
  const orders = db.labOrders.filter((order) => inRange(order.orderDate, dateFrom, dateTo));

  const byStatus = Object.values(
    orders.reduce((summary, order) => {
      if (!summary[order.status]) {
        summary[order.status] = { status: order.status, count: 0 };
      }

      summary[order.status].count += 1;
      return summary;
    }, {})
  ).sort((left, right) => right.count - left.count);

  const byTest = Object.values(
    orders
      .flatMap((order) => order.tests)
      .reduce((summary, test) => {
        if (!summary[test.testId]) {
          summary[test.testId] = { testId: test.testId, testName: test.testName, count: 0 };
        }

        summary[test.testId].count += 1;
        return summary;
      }, {})
  ).sort((left, right) => right.count - left.count);

  return {
    dateFrom,
    dateTo,
    summary: {
      totalOrders: orders.length,
      reportedOrders: orders.filter((order) => order.status === "reported").length,
      pendingOrders: orders.filter((order) => ["pending", "sample_collected", "processing"].includes(order.status)).length,
      testLines: orders.reduce((sum, order) => sum + order.tests.length, 0)
    },
    byStatus,
    byTest
  };
}

export function getPanchkarmaStatsReport(query = {}) {
  const { dateFrom, dateTo } = getDateRange(query);
  const sessions = db.panchkarmaSchedules.filter((session) => inRange(session.scheduledDate, dateFrom, dateTo));

  const byTherapy = Object.values(
    sessions.reduce((summary, session) => {
      if (!summary[session.therapyId]) {
        summary[session.therapyId] = {
          therapyId: session.therapyId,
          therapyName: session.therapyName,
          sessions: 0,
          billedAmount: 0
        };
      }

      summary[session.therapyId].sessions += 1;
      summary[session.therapyId].billedAmount += Number(session.billedAmount || 0);
      return summary;
    }, {})
  ).sort((left, right) => right.sessions - left.sessions);

  const byTherapist = Object.values(
    sessions.reduce((summary, session) => {
      if (!summary[session.therapistId]) {
        summary[session.therapistId] = {
          therapistId: session.therapistId,
          therapistName: session.therapistName,
          sessions: 0
        };
      }

      summary[session.therapistId].sessions += 1;
      return summary;
    }, {})
  ).sort((left, right) => right.sessions - left.sessions);

  return {
    dateFrom,
    dateTo,
    summary: {
      totalSessions: sessions.length,
      completedSessions: sessions.filter((session) => session.status === "completed").length,
      pendingSessions: sessions.filter((session) => session.status !== "completed").length,
      totalBilled: sumAmounts(sessions, "billedAmount")
    },
    byTherapy,
    byTherapist
  };
}
