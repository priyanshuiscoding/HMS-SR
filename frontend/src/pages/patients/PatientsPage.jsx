import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "../../components/common/Button.jsx";
import { DashboardLayout } from "../../components/layout/DashboardLayout.jsx";
import { createPatient, getPatients } from "../../services/api.js";

const initialForm = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "female",
  bloodGroup: "",
  phone: "",
  altPhone: "",
  email: "",
  address: "",
  city: "Sagar",
  state: "Madhya Pradesh",
  pincode: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  referredBy: "Front Desk"
};

export function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [formState, setFormState] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadPatients(searchValue = "") {
    setLoading(true);
    try {
      const response = await getPatients(searchValue);
      setPatients(response.items);
    } catch (apiError) {
      setError(apiError.message || "Unable to load patients.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatients();
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: patients.length,
      today: patients.filter((patient) => patient.registrationDate === today).length,
      fromSagar: patients.filter((patient) => patient.city === "Sagar").length
    };
  }, [patients]);

  const handleInputChange = (event) => {
    setFormState((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    setError("");
    await loadPatients(search);
  };

  const handleCreatePatient = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await createPatient(formState);
      setSuccess(response.message);
      setFormState(initialForm);
      await loadPatients(search);
    } catch (apiError) {
      setError(apiError.message || "Unable to register patient.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <section className="hero-panel">
        <div className="eyebrow">Patient Registry</div>
        <h2>Reception-ready registration built around the Shanti-Ratnam patient intake flow.</h2>
        <p>
          This module handles UHID-led registration, search by phone or name, emergency contact capture,
          and a clean path into appointments, OPD, and later IPD.
        </p>
      </section>

      <section className="stat-grid">
        <article className="stat-card">
          <div className="stat-label">Registered Patients</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-note">Current in-memory registry</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Today</div>
          <div className="stat-value">{stats.today}</div>
          <div className="stat-note">New registrations today</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Sagar Base</div>
          <div className="stat-value">{stats.fromSagar}</div>
          <div className="stat-note">Primary city count</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Phase 2</div>
          <div className="stat-value">Live</div>
          <div className="stat-note">Patients module is active</div>
        </article>
      </section>

      <section className="workspace-grid">
        <article className="content-card">
          <div className="section-header">
            <div>
              <div className="eyebrow">Register</div>
              <h3>New patient registration</h3>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleCreatePatient}>
            <div className="field">
              <label>First name</label>
              <input name="firstName" value={formState.firstName} onChange={handleInputChange} />
            </div>
            <div className="field">
              <label>Last name</label>
              <input name="lastName" value={formState.lastName} onChange={handleInputChange} />
            </div>
            <div className="field">
              <label>Date of birth</label>
              <input name="dateOfBirth" type="date" value={formState.dateOfBirth} onChange={handleInputChange} />
            </div>
            <div className="field">
              <label>Gender</label>
              <select name="gender" value={formState.gender} onChange={handleInputChange}>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="field">
              <label>Phone</label>
              <input name="phone" value={formState.phone} onChange={handleInputChange} />
            </div>
            <div className="field">
              <label>Alternate phone</label>
              <input name="altPhone" value={formState.altPhone} onChange={handleInputChange} />
            </div>
            <div className="field">
              <label>Email</label>
              <input name="email" type="email" value={formState.email} onChange={handleInputChange} />
            </div>
            <div className="field">
              <label>Blood group</label>
              <input name="bloodGroup" value={formState.bloodGroup} onChange={handleInputChange} />
            </div>
            <div className="field field-span-2">
              <label>Address</label>
              <input name="address" value={formState.address} onChange={handleInputChange} />
            </div>
            <div className="field">
              <label>City</label>
              <input name="city" value={formState.city} onChange={handleInputChange} />
            </div>
            <div className="field">
              <label>State</label>
              <input name="state" value={formState.state} onChange={handleInputChange} />
            </div>
            <div className="field">
              <label>Pincode</label>
              <input name="pincode" value={formState.pincode} onChange={handleInputChange} />
            </div>
            <div className="field">
              <label>Referred by</label>
              <input name="referredBy" value={formState.referredBy} onChange={handleInputChange} />
            </div>
            <div className="field">
              <label>Emergency contact</label>
              <input
                name="emergencyContactName"
                value={formState.emergencyContactName}
                onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <label>Emergency phone</label>
              <input
                name="emergencyContactPhone"
                value={formState.emergencyContactPhone}
                onChange={handleInputChange}
              />
            </div>

            {error ? <div className="error-text field-span-2">{error}</div> : null}
            {success ? <div className="success-text field-span-2">{success}</div> : null}

            <div className="field-span-2 action-row">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Registering..." : "Register Patient"}
              </Button>
            </div>
          </form>
        </article>

        <article className="content-card">
          <div className="section-header">
            <div>
              <div className="eyebrow">Find Patient</div>
              <h3>Search and review registry</h3>
            </div>
          </div>

          <form className="toolbar" onSubmit={handleSearchSubmit}>
            <input
              className="search-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by UHID, phone, or patient name"
            />
            <Button type="submit">Search</Button>
          </form>

          {loading ? <div className="empty-state">Loading patient registry...</div> : null}

          {!loading ? (
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>UHID</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>Registered</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id}>
                      <td>{patient.uhid}</td>
                      <td>{patient.firstName} {patient.lastName}</td>
                      <td>{patient.phone}</td>
                      <td>{patient.city}</td>
                      <td>{patient.registrationDate}</td>
                      <td>
                        <Link className="table-link" to={`/patients/${patient.id}`}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!patients.length ? <div className="empty-state">No patients found for the current search.</div> : null}
            </div>
          ) : null}
        </article>
      </section>
    </DashboardLayout>
  );
}
