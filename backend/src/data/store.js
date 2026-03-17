import crypto from "crypto";

import { departments, demoUsers, roles } from "../config/constants.js";

function createPatientNumber(number) {
  return String(number).padStart(4, "0");
}

function currentYear() {
  return new Date().getFullYear();
}

export function createId() {
  return crypto.randomUUID();
}

const doctorLookup = demoUsers.filter((user) => user.role === roles.DOCTOR);
const today = new Date().toISOString().slice(0, 10);
const meeraPatientId = createId();
const rajeshPatientId = createId();
const meeraAppointmentId = createId();
const meeraVisitId = createId();
const meeraAssessmentId = createId();
const meeraPrescriptionId = createId();
const meeraLabOrderId = createId();
const meeraBillId = createId();
const meeraDispenseId = createId();
const meeraPaymentId = createId();

export const db = {
  patients: [
    {
      id: meeraPatientId,
      uhid: `SRAIIMS-${currentYear()}-${createPatientNumber(1)}`,
      firstName: "Meera",
      lastName: "Sharma",
      dateOfBirth: "1991-07-16",
      gender: "female",
      bloodGroup: "B+",
      phone: "9876543201",
      altPhone: "9876543211",
      email: "meera.sharma@example.com",
      address: "Civil Lines, Sagar",
      city: "Sagar",
      state: "Madhya Pradesh",
      pincode: "470001",
      emergencyContactName: "Rahul Sharma",
      emergencyContactPhone: "9876543202",
      registrationDate: today,
      referredBy: "Website",
      createdBy: demoUsers[1].id
    },
    {
      id: rajeshPatientId,
      uhid: `SRAIIMS-${currentYear()}-${createPatientNumber(2)}`,
      firstName: "Rajesh",
      lastName: "Patel",
      dateOfBirth: "1985-02-21",
      gender: "male",
      bloodGroup: "O+",
      phone: "9876543203",
      altPhone: "",
      email: "rajesh.patel@example.com",
      address: "Makronia, Sagar",
      city: "Sagar",
      state: "Madhya Pradesh",
      pincode: "470004",
      emergencyContactName: "Pooja Patel",
      emergencyContactPhone: "9876543204",
      registrationDate: today,
      referredBy: "Walk-in",
      createdBy: demoUsers[1].id
    }
  ],
  appointments: [
    {
      id: createId(),
      appointmentNumber: `APT-${currentYear()}-00001`,
      patientId: null,
      patientName: "New Website Lead",
      doctorId: doctorLookup[0]?.id,
      appointmentDate: today,
      appointmentTime: "10:30",
      type: "new",
      department: "Neuro Pain Management",
      status: "confirmed",
      chiefComplaint: "Neck pain and migraine episodes",
      tokenNumber: 1,
      bookedBy: demoUsers[1].id,
      source: "Website",
      smsSent: false
    },
    {
      id: createId(),
      appointmentNumber: `APT-${currentYear()}-00002`,
      patientId: null,
      patientName: "Rohit Verma",
      doctorId: doctorLookup[2]?.id,
      appointmentDate: today,
      appointmentTime: "12:10",
      type: "follow_up",
      department: "Yoga And Naturopathy Department",
      status: "scheduled",
      chiefComplaint: "Lifestyle correction review",
      tokenNumber: 2,
      bookedBy: demoUsers[1].id,
      source: "Call",
      smsSent: false
    },
    {
      id: meeraAppointmentId,
      appointmentNumber: `APT-${currentYear()}-00003`,
      patientId: meeraPatientId,
      patientName: "Meera Sharma",
      doctorId: doctorLookup[0]?.id,
      appointmentDate: today,
      appointmentTime: "09:20",
      type: "follow_up",
      department: "Neuro Pain Management",
      status: "completed",
      chiefComplaint: "Persistent cervical stiffness with headache flare",
      tokenNumber: 3,
      bookedBy: demoUsers[1].id,
      source: "Website",
      smsSent: true
    }
  ],
  opdVisits: [
    {
      id: meeraVisitId,
      opdNumber: `OPD-${currentYear()}-00001`,
      patientId: meeraPatientId,
      patientName: "Meera Sharma",
      doctorId: doctorLookup[0]?.id,
      appointmentId: meeraAppointmentId,
      visitDate: today,
      visitType: "follow_up",
      chiefComplaint: "Neck pain and migraine episodes",
      vitalsBp: "130/84",
      vitalsPulse: 82,
      vitalsTemp: 98.4,
      vitalsWeight: 74,
      vitalsHeight: 171,
      vitalsSpo2: 98,
      vitalsRr: 17,
      status: "completed",
      consultationFee: 500
    }
  ],
  ayurvedaAssessments: [
    {
      id: meeraAssessmentId,
      patientId: meeraPatientId,
      visitId: meeraVisitId,
      doctorId: doctorLookup[0]?.id,
      assessmentDate: today,
      prakritiVata: 7,
      prakritiPitta: 5,
      prakritiKapha: 3,
      prakritiDominant: "Vata",
      nadiPariksha: "Vata aggravation with cervical stiffness and sleep disturbance.",
      nadiType: "Vataja",
      agniStatus: "vishama",
      koshthaNature: "krura",
      vikritiAssessment: "Vata predominance with stress-linked flare up.",
      observations: "Recommend posture correction and abhyanga support."
    }
  ],
  prescriptions: [
    {
      id: meeraPrescriptionId,
      prescriptionNumber: `RX-${currentYear()}-00001`,
      patientId: meeraPatientId,
      patientName: "Meera Sharma",
      doctorId: doctorLookup[0]?.id,
      visitId: meeraVisitId,
      prescriptionDate: today,
      diagnosis: "Cervical spondylosis with stress-triggered migraine",
      diagnosisAyurvedic: "Manya graha with vata prakopa",
      nidana: "Poor posture, irregular sleep, excessive screen strain",
      samprapti: "Vata aggravation leading to neck stiffness and headache episodes.",
      chikitsaSutra: "Vata shamana, srotoshodhana, nidra normalization",
      dietRecommendations: "Warm food, hydration, avoid late-night meals and cold exposure",
      followUpDate: today,
      isDispensed: true,
      medicines: [
        {
          id: createId(),
          medicineId: "med-001",
          medicineName: "Mahayograj Guggulu",
          dose: "1 tab",
          frequency: "BD",
          route: "oral",
          timing: "After food",
          durationDays: 10,
          anupana: "Warm water",
          quantityDispensed: 20,
          specialInstructions: "Continue neck mobility exercises"
        }
      ]
    }
  ],
  labTestMasters: [
    {
      id: "lab-001",
      code: "CBC",
      name: "Complete Blood Count",
      department: "General Lab",
      price: 350,
      normalRange: "As per age and gender"
    },
    {
      id: "lab-002",
      code: "ESR",
      name: "ESR",
      department: "General Lab",
      price: 220,
      normalRange: "0-20 mm/hr"
    },
    {
      id: "lab-003",
      code: "BSF",
      name: "Blood Sugar Fasting",
      department: "Biochemistry",
      price: 180,
      normalRange: "70-100 mg/dL"
    },
    {
      id: "lab-004",
      code: "TSH",
      name: "TSH",
      department: "Hormonal",
      price: 450,
      normalRange: "0.4-4.0 mIU/L"
    }
  ],
  labOrders: [
    {
      id: meeraLabOrderId,
      orderNumber: `LAB-${currentYear()}-00001`,
      patientId: meeraPatientId,
      patientName: "Meera Sharma",
      orderedBy: doctorLookup[0]?.id,
      visitId: meeraVisitId,
      orderDate: today,
      priority: "routine",
      status: "reported",
      tests: [
        {
          id: createId(),
          testId: "lab-001",
          testName: "Complete Blood Count",
          result: "Within normal limits",
          remarks: "Mild stress markers noted"
        }
      ],
      reportUrl: "",
      sampleCollectionTime: `${today}T10:05:00`
    }
  ],
  bills: [
    {
      id: meeraBillId,
      billNumber: `BILL-${currentYear()}-00001`,
      patientId: meeraPatientId,
      patientName: "Meera Sharma",
      visitId: meeraVisitId,
      billType: "opd",
      billDate: today,
      subtotal: 850,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 850,
      paidAmount: 850,
      paymentStatus: "paid",
      createdBy: demoUsers[6]?.id || demoUsers[0].id,
      notes: "Follow-up consultation with CBC charge included.",
      items: [
        {
          id: createId(),
          description: "OPD Consultation Fee",
          category: "consultation",
          quantity: 1,
          unitPrice: 500,
          amount: 500
        },
        {
          id: createId(),
          description: "CBC",
          category: "lab",
          quantity: 1,
          unitPrice: 350,
          amount: 350
        }
      ]
    }
  ],
  payments: [
    {
      id: meeraPaymentId,
      receiptNumber: `RCT-${currentYear()}-00001`,
      billId: meeraBillId,
      patientId: meeraPatientId,
      patientName: "Meera Sharma",
      paymentDate: `${today}T11:25:00`,
      amount: 850,
      paymentMode: "upi",
      referenceNumber: "UPI-SR-10231",
      receivedBy: demoUsers[8]?.id || demoUsers[0].id,
      note: "Collected at billing desk after consultation."
    }
  ],
  medicineMasters: [
    {
      id: "med-001",
      code: "SRA-MED-001",
      name: "Mahayograj Guggulu",
      formulation: "Tablet",
      category: "Ayurvedic Classical",
      unit: "tablet",
      reorderLevel: 40,
      price: 18,
      gstPercent: 5
    },
    {
      id: "med-002",
      code: "SRA-MED-002",
      name: "Dashmool Kwath",
      formulation: "Kwath",
      category: "Ayurvedic Classical",
      unit: "bottle",
      reorderLevel: 20,
      price: 140,
      gstPercent: 5
    },
    {
      id: "med-003",
      code: "SRA-MED-003",
      name: "Ashwagandha Churna",
      formulation: "Churna",
      category: "Ayurvedic Classical",
      unit: "jar",
      reorderLevel: 15,
      price: 165,
      gstPercent: 5
    },
    {
      id: "med-004",
      code: "SRA-MED-004",
      name: "Brahmi Vati",
      formulation: "Tablet",
      category: "Ayurvedic Classical",
      unit: "tablet",
      reorderLevel: 35,
      price: 14,
      gstPercent: 5
    },
    {
      id: "med-005",
      code: "SRA-MED-005",
      name: "Nirgundi Taila",
      formulation: "Taila",
      category: "External Therapy",
      unit: "bottle",
      reorderLevel: 12,
      price: 220,
      gstPercent: 12
    }
  ],
  suppliers: [
    {
      id: "sup-001",
      name: "Ayush Pharma Traders",
      phone: "9876500011",
      city: "Bhopal"
    },
    {
      id: "sup-002",
      name: "Kerala Wellness Distributors",
      phone: "9876500012",
      city: "Indore"
    }
  ],
  inventoryBatches: [
    {
      id: "batch-001",
      medicineId: "med-001",
      medicineName: "Mahayograj Guggulu",
      batchNumber: "MYG-2401",
      supplierId: "sup-001",
      receivedDate: today,
      expiryDate: `${currentYear() + 1}-12-31`,
      quantityReceived: 120,
      quantityAvailable: 100,
      purchasePrice: 11,
      sellingPrice: 18
    },
    {
      id: "batch-002",
      medicineId: "med-002",
      medicineName: "Dashmool Kwath",
      batchNumber: "DMK-2402",
      supplierId: "sup-002",
      receivedDate: today,
      expiryDate: `${currentYear()}-07-15`,
      quantityReceived: 18,
      quantityAvailable: 18,
      purchasePrice: 95,
      sellingPrice: 140
    },
    {
      id: "batch-003",
      medicineId: "med-003",
      medicineName: "Ashwagandha Churna",
      batchNumber: "AWC-2401",
      supplierId: "sup-001",
      receivedDate: today,
      expiryDate: `${currentYear() + 1}-10-30`,
      quantityReceived: 22,
      quantityAvailable: 8,
      purchasePrice: 108,
      sellingPrice: 165
    },
    {
      id: "batch-004",
      medicineId: "med-005",
      medicineName: "Nirgundi Taila",
      batchNumber: "NGT-2401",
      supplierId: "sup-002",
      receivedDate: today,
      expiryDate: `${currentYear()}-05-20`,
      quantityReceived: 10,
      quantityAvailable: 4,
      purchasePrice: 150,
      sellingPrice: 220
    }
  ],
  stockTransactions: [
    {
      id: createId(),
      transactionDate: `${today}T09:00:00`,
      medicineId: "med-001",
      medicineName: "Mahayograj Guggulu",
      batchId: "batch-001",
      type: "receipt",
      quantity: 120,
      referenceNumber: "GRN-2026-00001",
      note: "Opening pharmacy stock"
    },
    {
      id: createId(),
      transactionDate: `${today}T09:10:00`,
      medicineId: "med-003",
      medicineName: "Ashwagandha Churna",
      batchId: "batch-003",
      type: "receipt",
      quantity: 22,
      referenceNumber: "GRN-2026-00002",
      note: "Opening stock received"
    },
    {
      id: createId(),
      transactionDate: `${today}T09:20:00`,
      medicineId: "med-005",
      medicineName: "Nirgundi Taila",
      batchId: "batch-004",
      type: "receipt",
      quantity: 10,
      referenceNumber: "GRN-2026-00003",
      note: "External therapy stock"
    }
  ],
  dispensations: [
    {
      id: meeraDispenseId,
      dispenseNumber: `DSP-${currentYear()}-00001`,
      prescriptionId: meeraPrescriptionId,
      patientId: meeraPatientId,
      patientName: "Meera Sharma",
      visitId: meeraVisitId,
      dispensedBy: demoUsers[0].id,
      dispensedDate: `${today}T11:05:00`,
      status: "completed",
      items: [
        {
          id: createId(),
          medicineId: "med-001",
          medicineName: "Mahayograj Guggulu",
          batchId: "batch-001",
          quantity: 20,
          unitPrice: 18,
          amount: 360
        }
      ]
    }
  ]
};

export function getDoctors() {
  return demoUsers
    .filter((user) => user.role === roles.DOCTOR)
    .map(({ password, ...doctor }) => doctor);
}

export function getDepartments() {
  return departments;
}

export function nextUhid() {
  return `SRAIIMS-${currentYear()}-${createPatientNumber(db.patients.length + 1)}`;
}

export function nextAppointmentNumber() {
  return `APT-${currentYear()}-${String(db.appointments.length + 1).padStart(5, "0")}`;
}

export function nextOpdNumber() {
  return `OPD-${currentYear()}-${String(db.opdVisits.length + 1).padStart(5, "0")}`;
}

export function nextPrescriptionNumber() {
  return `RX-${currentYear()}-${String(db.prescriptions.length + 1).padStart(5, "0")}`;
}

export function nextLabOrderNumber() {
  return `LAB-${currentYear()}-${String(db.labOrders.length + 1).padStart(5, "0")}`;
}

export function nextBillNumber() {
  return `BILL-${currentYear()}-${String(db.bills.length + 1).padStart(5, "0")}`;
}

export function nextReceiptNumber() {
  return `RCT-${currentYear()}-${String(db.payments.length + 1).padStart(5, "0")}`;
}

export function nextGrnNumber() {
  const count = db.stockTransactions.filter((item) => item.type === "receipt").length + 1;
  return `GRN-${currentYear()}-${String(count).padStart(5, "0")}`;
}

export function nextDispenseNumber() {
  return `DSP-${currentYear()}-${String(db.dispensations.length + 1).padStart(5, "0")}`;
}

export function getMedicineMasters() {
  return db.medicineMasters;
}

export function getLabTestMasters() {
  return db.labTestMasters;
}

export function getSuppliers() {
  return db.suppliers;
}
