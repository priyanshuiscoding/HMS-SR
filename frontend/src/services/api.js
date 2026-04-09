const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

function getAccessToken() {
  try {
    const raw = window.localStorage.getItem("hms-auth");
    return raw ? JSON.parse(raw).accessToken : null;
  } catch {
    return null;
  }
}

function createHeaders(extraHeaders = {}) {
  const accessToken = getAccessToken();

  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...extraHeaders
  };
}

async function parseResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

export async function loginRequest(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function getSystemOverview() {
  const response = await fetch(`${API_BASE_URL}/system/overview`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getPatients(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const response = await fetch(`${API_BASE_URL}/patients${query}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function createPatient(payload) {
  const response = await fetch(`${API_BASE_URL}/patients`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function getPatient(id) {
  const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getPatientHistory(id) {
  const response = await fetch(`${API_BASE_URL}/patients/${id}/history`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getAppointmentMasters() {
  const response = await fetch(`${API_BASE_URL}/appointments/masters`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getAppointments(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const response = await fetch(`${API_BASE_URL}/appointments${queryString}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function createAppointment(payload) {
  const response = await fetch(`${API_BASE_URL}/appointments`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function getTodayAppointments() {
  const response = await fetch(`${API_BASE_URL}/appointments/today`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getAvailableSlots(date, doctorId) {
  const query = new URLSearchParams({ date, doctorId });
  const response = await fetch(`${API_BASE_URL}/appointments/available-slots?${query.toString()}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getUsers() {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getUsersSummary() {
  const response = await fetch(`${API_BASE_URL}/users/summary`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function cancelAppointment(id) {
  const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
    method: "DELETE",
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getOpdQueue(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const response = await fetch(`${API_BASE_URL}/opd/queue${queryString}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getOpdMasters() {
  const response = await fetch(`${API_BASE_URL}/opd/masters`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function createOpdVisit(payload) {
  const response = await fetch(`${API_BASE_URL}/opd/visits`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function getOpdVisit(id) {
  const response = await fetch(`${API_BASE_URL}/opd/visits/${id}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function saveOpdVitals(id, payload) {
  const response = await fetch(`${API_BASE_URL}/opd/visits/${id}/vitals`, {
    method: "PUT",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function saveAyurvedaAssessment(id, payload) {
  const response = await fetch(`${API_BASE_URL}/opd/visits/${id}/ayurveda`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function savePrescription(id, payload) {
  const response = await fetch(`${API_BASE_URL}/opd/visits/${id}/prescriptions`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function completeOpdVisit(id) {
  const response = await fetch(`${API_BASE_URL}/opd/visits/${id}/complete`, {
    method: "PUT",
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getLabTests() {
  const response = await fetch(`${API_BASE_URL}/lab/tests`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function createLabOrder(payload) {
  const response = await fetch(`${API_BASE_URL}/lab/orders`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function getLabSummary() {
  const response = await fetch(`${API_BASE_URL}/lab/summary`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getLabOrders(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  const response = await fetch(`${API_BASE_URL}/lab/orders${query.toString() ? `?${query.toString()}` : ""}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getLabOrder(id) {
  const response = await fetch(`${API_BASE_URL}/lab/orders/${id}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function collectLabSample(id, payload) {
  const response = await fetch(`${API_BASE_URL}/lab/orders/${id}/sample-collection`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function saveLabResults(id, payload) {
  const response = await fetch(`${API_BASE_URL}/lab/orders/${id}/results`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function createLabBill(id, payload = {}) {
  const response = await fetch(`${API_BASE_URL}/lab/orders/${id}/bill`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function getBills(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const response = await fetch(`${API_BASE_URL}/billing/bills${query.toString() ? `?${query.toString()}` : ""}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function createBill(payload) {
  const response = await fetch(`${API_BASE_URL}/billing/bills`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function getBillingSummary() {
  const response = await fetch(`${API_BASE_URL}/billing/summary`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getBillingMasters() {
  const response = await fetch(`${API_BASE_URL}/billing/masters`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getPayments(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const response = await fetch(`${API_BASE_URL}/billing/payments${query.toString() ? `?${query.toString()}` : ""}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getBill(id) {
  const response = await fetch(`${API_BASE_URL}/billing/bills/${id}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function collectBillPayment(id, payload) {
  const response = await fetch(`${API_BASE_URL}/billing/bills/${id}/payments`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function getPanchkarmaTherapies() {
  const response = await fetch(`${API_BASE_URL}/panchkarma/therapies`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getPanchkarmaMasters() {
  const response = await fetch(`${API_BASE_URL}/panchkarma/masters`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getPanchkarmaSummary() {
  const response = await fetch(`${API_BASE_URL}/panchkarma/summary`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getPanchkarmaSchedules(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  const response = await fetch(`${API_BASE_URL}/panchkarma/schedule${query.toString() ? `?${query.toString()}` : ""}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getPanchkarmaSchedule(id) {
  const response = await fetch(`${API_BASE_URL}/panchkarma/schedule/${id}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function createPanchkarmaSchedule(payload) {
  const response = await fetch(`${API_BASE_URL}/panchkarma/schedule`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function startPanchkarmaSession(id, payload = {}) {
  const response = await fetch(`${API_BASE_URL}/panchkarma/schedule/${id}/start`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function completePanchkarmaSession(id, payload) {
  const response = await fetch(`${API_BASE_URL}/panchkarma/schedule/${id}/complete`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function getPharmacyMasters() {
  const response = await fetch(`${API_BASE_URL}/pharmacy/masters`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getPharmacyStock() {
  const response = await fetch(`${API_BASE_URL}/pharmacy/stock`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getPharmacyPrescriptions(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const response = await fetch(`${API_BASE_URL}/pharmacy/prescriptions${query.toString() ? `?${query.toString()}` : ""}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getDispensations(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const response = await fetch(`${API_BASE_URL}/pharmacy/dispensations${query.toString() ? `?${query.toString()}` : ""}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function dispensePrescription(prescriptionId, payload) {
  const response = await fetch(`${API_BASE_URL}/pharmacy/prescriptions/${prescriptionId}/dispense`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function getInventoryMasters() {
  const response = await fetch(`${API_BASE_URL}/inventory/masters`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getInventoryBatches(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const response = await fetch(`${API_BASE_URL}/inventory/batches${query.toString() ? `?${query.toString()}` : ""}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getInventoryTransactions(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const response = await fetch(`${API_BASE_URL}/inventory/transactions${query.toString() ? `?${query.toString()}` : ""}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function receiveInventoryStock(payload) {
  const response = await fetch(`${API_BASE_URL}/inventory/receive`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}


export async function getIpdSummary() {
  const response = await fetch(`${API_BASE_URL}/ipd/summary`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getIpdMasters() {
  const response = await fetch(`${API_BASE_URL}/ipd/masters`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getIpdAdmissions(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  const response = await fetch(`${API_BASE_URL}/ipd/admissions${query.toString() ? `?${query.toString()}` : ""}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getIpdAdmission(id) {
  const response = await fetch(`${API_BASE_URL}/ipd/admissions/${id}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function createIpdAdmission(payload) {
  const response = await fetch(`${API_BASE_URL}/ipd/admissions`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function addIpdNote(id, payload) {
  const response = await fetch(`${API_BASE_URL}/ipd/admissions/${id}/notes`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function addIpdVitals(id, payload) {
  const response = await fetch(`${API_BASE_URL}/ipd/admissions/${id}/vitals`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function dischargeIpdAdmission(id, payload) {
  const response = await fetch(`${API_BASE_URL}/ipd/admissions/${id}/discharge`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function getRoomMasters() {
  const response = await fetch(`${API_BASE_URL}/rooms/masters`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getRooms(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const response = await fetch(`${API_BASE_URL}/rooms${query.toString() ? `?${query.toString()}` : ""}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getRoomsAvailability() {
  const response = await fetch(`${API_BASE_URL}/rooms/availability`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getRoom(id) {
  const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function createRoom(payload) {
  const response = await fetch(`${API_BASE_URL}/rooms`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function assignRoomBed(roomId, bedId, payload) {
  const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/beds/${bedId}/assign`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function dischargeRoomBed(roomId, bedId, payload) {
  const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/beds/${bedId}/discharge`, {
    method: "POST",
    headers: createHeaders(),
    credentials: "include",
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function getReportsOverview(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const response = await fetch(`${API_BASE_URL}/reports/overview${query.toString() ? `?${query.toString()}` : ""}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getDailyOpdReport(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const response = await fetch(`${API_BASE_URL}/reports/daily-opd${query.toString() ? `?${query.toString()}` : ""}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getIpdCensusReport(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const response = await fetch(`${API_BASE_URL}/reports/ipd-census${query.toString() ? `?${query.toString()}` : ""}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getRevenueReport(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const response = await fetch(`${API_BASE_URL}/reports/revenue${query.toString() ? `?${query.toString()}` : ""}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getPharmacySalesReport(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const response = await fetch(`${API_BASE_URL}/reports/pharmacy-sales${query.toString() ? `?${query.toString()}` : ""}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getLabWorkloadReport(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const response = await fetch(`${API_BASE_URL}/reports/lab-workload${query.toString() ? `?${query.toString()}` : ""}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

export async function getPanchkarmaStatsReport(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const response = await fetch(`${API_BASE_URL}/reports/panchkarma-stats${query.toString() ? `?${query.toString()}` : ""}`, {
    headers: createHeaders(),
    credentials: "include"
  });

  return parseResponse(response);
}

