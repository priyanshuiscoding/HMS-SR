export const roles = {
  ADMIN: "admin",
  RECEPTION: "reception",
  DOCTOR: "doctor",
  PHARMACY: "pharmacy",
  LAB: "lab",
  THERAPIST: "therapist",
  ACCOUNTS: "accounts",
  HR: "hr"
};

export const departments = [
  "Neuro Pain Management",
  "Diabetic Reversal Program",
  "Panchkarma Therapies",
  "Yoga & Wellness",
  "Orthopaedic Department",
  "Oncology Department",
  "Pulmonology Department",
  "Women's Health Department",
  "Gastroenterology Department",
  "Urology Department",
  "Neurology Department",
  "Sexual Health Department",
  "Skin And Hair Department",
  "Diet And Nutrition Department",
  "Yoga And Naturopathy Department",
  "Mental Wellbeing Department"
];

export const demoUsers = [
  {
    id: "f7d2e516-4184-4ad2-ae1c-73018ab4a111",
    employeeId: "SRA-ADM-001",
    fullName: "Aarav Mehta",
    email: "admin@sraiims.in",
    password: "Admin@123",
    role: roles.ADMIN,
    department: "Administration"
  },
  {
    id: "d2e3c8d3-7f7e-45ad-8733-c482336f2001",
    employeeId: "SRA-REC-001",
    fullName: "Sakshi Tiwari",
    email: "reception@sraiims.in",
    password: "Reception@123",
    role: roles.RECEPTION,
    department: "Front Desk"
  },
  {
    id: "4a7be854-48e1-4b5d-b0fd-c79d5cc84001",
    employeeId: "SRA-DR-001",
    fullName: "Dr. Saurabh Bharill",
    email: "doctor@sraiims.in",
    password: "Doctor@123",
    role: roles.DOCTOR,
    department: "Neuro Pain Management",
    title: "Managing Director"
  },
  {
    id: "4f6cc57e-d549-4d08-b763-5d7df0f16002",
    employeeId: "SRA-DR-002",
    fullName: "Dr. M. Senthil Kumar",
    email: "senthil@sraiims.in",
    password: "Doctor@123",
    role: roles.DOCTOR,
    department: "Orthopaedic Department",
    title: "Joint & Spine Specialist"
  },
  {
    id: "ad2db473-1e0f-4ea2-b73d-99791e6d1003",
    employeeId: "SRA-DR-003",
    fullName: "Dr. Sanket Chintewar",
    email: "sanket@sraiims.in",
    password: "Doctor@123",
    role: roles.DOCTOR,
    department: "Yoga And Naturopathy Department",
    title: "Naturopathy & Yoga Specialist"
  },
  {
    id: "cffab39f-5e23-4b13-a1ee-ef98d9001004",
    employeeId: "SRA-DR-004",
    fullName: "Dr. Riya Bhargav",
    email: "riya@sraiims.in",
    password: "Doctor@123",
    role: roles.DOCTOR,
    department: "Ayurvedic OPD",
    title: "Ayurvedic Medical Officer"
  },
  {
    id: "ff2b4859-ccea-4744-b86d-6ee99d190005",
    employeeId: "SRA-DR-005",
    fullName: "Dr. Prasansa Upadhyay",
    email: "prasansa@sraiims.in",
    password: "Doctor@123",
    role: roles.DOCTOR,
    department: "Yoga And Naturopathy Department",
    title: "Naturopathy & Yoga Specialist"
  },
  {
    id: "0e4d489f-7522-4856-bec6-99cf64a30006",
    employeeId: "SRA-HR-001",
    fullName: "Miss Khushboo Nova",
    email: "hr@sraiims.in",
    password: "Hr@12345",
    role: roles.HR,
    department: "Human Resources"
  },
  {
    id: "5dca8ca7-bb37-4dd0-a48d-6aa55de70007",
    employeeId: "SRA-ACC-001",
    fullName: "Nitin Shrivastava",
    email: "accounts@sraiims.in",
    password: "Accounts@123",
    role: roles.ACCOUNTS,
    department: "Accounts"
  }
];
