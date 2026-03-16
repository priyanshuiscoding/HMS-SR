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
      isDispensed: false,
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
  medicineMasters: [
    {
      id: "med-001",
      code: "SRA-MED-001",
      name: "Mahayograj Guggulu",
      formulation: "Tablet",
      category: "Ayurvedic Classical"
    },
    {
      id: "med-002",
      code: "SRA-MED-002",
      name: "Dashmool Kwath",
      formulation: "Kwath",
      category: "Ayurvedic Classical"
    },
    {
      id: "med-003",
      code: "SRA-MED-003",
      name: "Ashwagandha Churna",
      formulation: "Churna",
      category: "Ayurvedic Classical"
    },
    {
      id: "med-004",
      code: "SRA-MED-004",
      name: "Brahmi Vati",
      formulation: "Tablet",
      category: "Ayurvedic Classical"
    },
    {
      id: "med-005",
      code: "SRA-MED-005",
      name: "Nirgundi Taila",
      formulation: "Taila",
      category: "External Therapy"
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

export function getMedicineMasters() {
  return db.medicineMasters;
}

export function getLabTestMasters() {
  return db.labTestMasters;
}
