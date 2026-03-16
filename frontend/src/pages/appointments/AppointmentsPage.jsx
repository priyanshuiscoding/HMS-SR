import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "../../components/common/Button.jsx";
import { DashboardLayout } from "../../components/layout/DashboardLayout.jsx";
import {
  cancelAppointment,
  createAppointment,
  getAppointmentMasters,
  getAppointments,
  getAvailableSlots,
  getPatients,
  getTodayAppointments
} from "../../services/api.js";

const initialForm = {
  patientId: "",
  patientName: "",
  doctorId: "",
  appointmentDate: new Date().toISOString().slice(0, 10),
  appointmentTime: "",
  type: "new",
  department: "",
  status: "scheduled",
  chiefComplaint: "",
  source: "Reception"
};

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [todayQueue, setTodayQueue] = useState([]);
  const [patients, setPatients] = useState([]);
  const [masters, setMasters] = useState({ doctors: [], departments: [], types: [], statuses: [], sources: [] });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [filters, setFilters] = useState({ date: "", status: "" });
  const [formState, setFormState] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData(nextFilters = filters) {
    try {
      const [appointmentsResponse, queueResponse] = await Promise.all([
        getAppointments(nextFilters),
        getTodayAppointments()
      ]);
      setAppointments(appointmentsResponse.items);
      setTodayQueue(queueResponse.items);
    } catch (apiError) {
      setError(apiError.message || "Unable to load appointments.");
    }
  }

  useEffect(() => {
    async function bootstrap() {
      try {
        const [patientsResponse, mastersResponse] = await Promise.all([
          getPatients(),
          getAppointmentMasters()
        ]);
        setPatients(patientsResponse.items);
        setMasters(mastersResponse);
        setFormState((current) => ({
          ...current,
          doctorId: mastersResponse.doctors[0]?.id || "",
          department: mastersResponse.departments[0] || ""
        }));
      } catch (apiError) {
        setError(apiError.message || "Unable to initialize appointment masters.");
      }
    }

    bootstrap();
    loadData({ date: "", status: "" });
  }, []);

  useEffect(() => {
    async function loadSlots() {
      if (!formState.appointmentDate || !formState.doctorId) {
        return;
      }

      try {
        const response = await getAvailableSlots(formState.appointmentDate, formState.doctorId);
        setAvailableSlots(response.items);
      } catch (apiError) {
        setError(apiError.message || "Unable to load doctor slots.");
      }
    }

    loadSlots();
  }, [formState.appointmentDate, formState.doctorId]);

  const stats = useMemo(() => {
    const confirmed = appointments.filter((appointment) => appointment.status === "confirmed").length;
    const scheduled = appointments.filter((appointment) => appointment.status === "scheduled").length;
    return {
      total: appointments.length,
      confirmed,
      scheduled,
      queue: todayQueue.length
    };
  }, [appointments, todayQueue]);

  const handleFilterChange = (event) => {
    const nextFilters = {
      ...filters,
      [event.target.name]: event.target.value
    };
    setFilters(nextFilters);
  };

  const applyFilters = async (event) => {
    event.preventDefault();
    setError("");
    await loadData(filters);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    if (name === "patientId") {
      const selectedPatient = patients.find((patient) => patient.id === value);
      setFormState((current) => ({
        ...current,
        patientId: value,
        patientName: selectedPatient ? "" : current.patientName
      }));
      return;
    }

    if (name === "doctorId") {
      const selectedDoctor = masters.doctors.find((doctor) => doctor.id === value);
      setFormState((current) => ({
        ...current,
        doctorId: value,
        department: selectedDoctor?.department || current.department
      }));
      return;
    }

    setFormState((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleBookAppointment = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await createAppointment(formState);
      setSuccess(response.message);
      setFormState((current) => ({
        ...initialForm,
        appointmentDate: current.appointmentDate,
        doctorId: masters.doctors[0]?.id || "",
        department: masters.doctors[0]?.department || masters.departments[0] || ""
      }));
      await loadData(filters);
      const refreshedSlots = await getAvailableSlots(formState.appointmentDate, formState.doctorId);
      setAvailableSlots(refreshedSlots.items);
    } catch (apiError) {
      setError(apiError.message || "Unable to book appointment.");
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);
      await loadData(filters);
    } catch (apiError) {
      setError(apiError.message || "Unable to cancel appointment.");
    }
  };

  return (
    <DashboardLayout>
      <section className="hero-panel">
        <div className="eyebrow">Appointments</div>
        <h2>Doctor scheduling, department mapping, and front-desk queue control for Shanti-Ratnam.</h2>
        <p>
          This phase supports patient-linked booking, department-aware doctor mapping, available slots,
          token generation, and same-day queue visibility for reception and doctors.
        </p>
      </section>

      <section className="stat-grid">
        <article className="stat-card">
          <div className="stat-label">Appointments</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-note">Current filtered list</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Confirmed</div>
          <div className="stat-value">{stats.confirmed}</div>
          <div className="stat-note">Ready for queue flow</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Scheduled</div>
          <div className="stat-value">{stats.scheduled}</div>
          <div className="stat-note">Upcoming bookings</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Today Queue</div>
          <div className="stat-value">{stats.queue}</div>
          <div className="stat-note">Live front-desk overview</div>
        </article>
      </section>

      <section className="workspace-grid">
        <article className="content-card">
          <div className="section-header">
            <div>
              <div className="eyebrow">Book</div>
              <h3>New appointment</h3>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleBookAppointment}>
            <div className="field field-span-2">
              <label>Existing patient</label>
              <select name="patientId" value={formState.patientId} onChange={handleFormChange}>
                <option value="">Select patient or leave blank for a new lead</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.uhid} - {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
            </div>

            {!formState.patientId ? (
              <div className="field field-span-2">
                <label>Lead / patient name</label>
                <input name="patientName" value={formState.patientName} onChange={handleFormChange} />
              </div>
            ) : null}

            <div className="field">
              <label>Doctor</label>
              <select name="doctorId" value={formState.doctorId} onChange={handleFormChange}>
                {masters.doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Department</label>
              <select name="department" value={formState.department} onChange={handleFormChange}>
                {masters.departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Date</label>
              <input
                name="appointmentDate"
                type="date"
                value={formState.appointmentDate}
                onChange={handleFormChange}
              />
            </div>

            <div className="field">
              <label>Time slot</label>
              <select name="appointmentTime" value={formState.appointmentTime} onChange={handleFormChange}>
                <option value="">Choose slot</option>
                {availableSlots.map((slot) => (
                  <option key={slot.time} value={slot.time} disabled={slot.isBooked}>
                    {slot.time} {slot.isBooked ? "- Booked" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Type</label>
              <select name="type" value={formState.type} onChange={handleFormChange}>
                {masters.types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Source</label>
              <select name="source" value={formState.source} onChange={handleFormChange}>
                {masters.sources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>

            <div className="field field-span-2">
              <label>Chief complaint</label>
              <input name="chiefComplaint" value={formState.chiefComplaint} onChange={handleFormChange} />
            </div>

            {error ? <div className="error-text field-span-2">{error}</div> : null}
            {success ? <div className="success-text field-span-2">{success}</div> : null}

            <div className="field-span-2 action-row">
              <Button type="submit">Book Appointment</Button>
            </div>
          </form>
        </article>

        <aside className="content-card">
          <div className="section-header">
            <div>
              <div className="eyebrow">Today</div>
              <h3>Reception queue board</h3>
            </div>
          </div>

          <div className="queue-list">
            {todayQueue.map((appointment) => (
              <div className="queue-item" key={appointment.id}>
                <div>
                  <strong>Token {appointment.tokenNumber}</strong>
                  <div className="timeline-copy">{appointment.patientName}</div>
                  <div className="timeline-copy">{appointment.department}</div>
                </div>
                <span className={`status-pill ${appointment.status}`}>{appointment.status}</span>
              </div>
            ))}

            {!todayQueue.length ? <div className="empty-state">No queue items scheduled for today yet.</div> : null}
          </div>
        </aside>
      </section>

      <section className="content-card">
        <div className="section-header">
          <div>
            <div className="eyebrow">Manage</div>
            <h3>Appointment list</h3>
          </div>
        </div>

        <form className="toolbar" onSubmit={applyFilters}>
          <input name="date" type="date" value={filters.date} onChange={handleFilterChange} />
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All statuses</option>
            {masters.statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <Button type="submit">Apply filters</Button>
        </form>

        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Appointment</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => {
                const linkedPatient = patients.find((patient) => patient.id === appointment.patientId);
                const doctor = masters.doctors.find((entry) => entry.id === appointment.doctorId);

                return (
                  <tr key={appointment.id}>
                    <td>{appointment.appointmentNumber}</td>
                    <td>
                      {linkedPatient ? (
                        <Link className="table-link" to={`/patients/${linkedPatient.id}`}>
                          {appointment.patientName}
                        </Link>
                      ) : (
                        appointment.patientName
                      )}
                    </td>
                    <td>{doctor?.fullName || "Unassigned"}</td>
                    <td>{appointment.appointmentDate}</td>
                    <td>{appointment.appointmentTime}</td>
                    <td><span className={`status-pill ${appointment.status}`}>{appointment.status}</span></td>
                    <td>
                      {appointment.status !== "cancelled" ? (
                        <button className="table-link button-link" type="button" onClick={() => handleCancel(appointment.id)}>
                          Cancel
                        </button>
                      ) : (
                        <span className="muted-text">Closed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!appointments.length ? <div className="empty-state">No appointments found for the selected filters.</div> : null}
        </div>
      </section>
    </DashboardLayout>
  );
}
