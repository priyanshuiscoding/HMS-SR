import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "../../components/common/Button.jsx";
import { DashboardLayout } from "../../components/layout/DashboardLayout.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { createPatient, getPatients } from "../../services/api.js";

const initialForm = {
  patientType: "new",
  title: "Mr",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "female",
  bloodGroup: "",
  maritalStatus: "",
  occupation: "",
  phone: "",
  altPhone: "",
  email: "",
  houseStreet: "",
  areaVillage: "",
  cityDistrict: "Sagar",
  state: "Madhya Pradesh",
  pincode: "",
  idType: "",
  idNumber: "",
  opdIpdNumber: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  referredBy: "Front Desk"
};

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) {
    return "";
  }

  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) {
    return "";
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

export function PatientsPage() {
  const { user } = useAuth();
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
      fromSagar: patients.filter((patient) => (patient.cityDistrict || patient.city) === "Sagar").length
    };
  }, [patients]);

  const derivedAge = useMemo(() => calculateAge(formState.dateOfBirth), [formState.dateOfBirth]);
  const canRegisterPatient = ["admin", "reception"].includes(user?.role);

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
    if (!canRegisterPatient) {
      setError("Only admin and reception users can register patients.");
      return;
    }
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
        <h2>Reception-ready registration aligned to the hospital patient intake form.</h2>
        <p>
          This module now captures registration details, personal information, contact data, and optional ID proof
          from your hospital registration sheet so front desk staff can register patients in one flow.
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
          <div className="stat-note">Primary city or district count</div>
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

          <div className="empty-state" style={{ marginBottom: 18 }}>
            Registration number, date, and time are generated automatically when the patient is saved.
          </div>

          <form className="form-grid" onSubmit={handleCreatePatient}>
            <div className="field">
              <label>Patient type</label>
              <select name="patientType" value={formState.patientType} onChange={handleInputChange}>
                <option value="new">New</option>
                <option value="follow_up">Follow-up</option>
              </select>
            </div>
            <div className="field">
              <label>OPD / IPD No.</label>
              <input name="opdIpdNumber" value={formState.opdIpdNumber} onChange={handleInputChange} />
            </div>
            <div className="field">
              <label>Title</label>
              <select name="title" value={formState.title} onChange={handleInputChange}>
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Miss">Miss</option>
                <option value="Master">Master</option>
              </select>
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
              <label>Age</label>
              <input value={derivedAge} disabled readOnly placeholder="Auto from DOB" />
            </div>
            <div className="field">
              <label>Blood group</label>
              <input name="bloodGroup" value={formState.bloodGroup} onChange={handleInputChange} />
            </div>
            <div className="field">
              <label>Marital status</label>
              <select name="maritalStatus" value={formState.maritalStatus} onChange={handleInputChange}>
                <option value="">Select</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
              </select>
            </div>
            <div className="field field-span-2">
              <label>Occupation</label>
              <input name="occupation" value={formState.occupation} onChange={handleInputChange} />
            </div>
            <div className="field">
              <label>Mobile no.</label>
              <input name="phone" value={formState.phone} onChange={handleInputChange} />
            </div>
            <div className="field">
              <label>Alternate mobile no.</label>
              <input name="altPhone" value={formState.altPhone} onChange={handleInputChange} />
            </div>
            <div className="field field-span-2">
              <label>Email ID</label>
              <input name="email" type="email" value={formState.email} onChange={handleInputChange} />
            </div>
            <div className="field field-span-2">
              <label>House / Street</label>
              <input name="houseStreet" value={formState.houseStreet} onChange={handleInputChange} />
            </div>
            <div className="field field-span-2">
              <label>Area / Village</label>
              <input name="areaVillage" value={formState.areaVillage} onChange={handleInputChange} />
            </div>
            <div className="field">
              <label>City / District</label>
              <input name="cityDistrict" value={formState.cityDistrict} onChange={handleInputChange} />
            </div>
            <div className="field">
              <label>State</label>
              <input name="state" value={formState.state} onChange={handleInputChange} />
            </div>
            <div className="field">
              <label>PIN code</label>
              <input name="pincode" value={formState.pincode} onChange={handleInputChange} />
            </div>
            <div className="field">
              <label>Referred by</label>
              <input name="referredBy" value={formState.referredBy} onChange={handleInputChange} />
            </div>
            <div className="field">
              <label>ID type</label>
              <select name="idType" value={formState.idType} onChange={handleInputChange}>
                <option value="">Optional</option>
                <option value="aadhaar">Aadhaar</option>
                <option value="voter_id">Voter ID</option>
                <option value="pan">PAN</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="field">
              <label>ID number</label>
              <input name="idNumber" value={formState.idNumber} onChange={handleInputChange} />
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
              <Button type="submit" disabled={submitting || !canRegisterPatient}>
                {submitting ? "Registering..." : "Register Patient"}
              </Button>
            </div>
            {!canRegisterPatient ? (
              <div className="empty-state field-span-2">
                Patient registration is available only to admin and reception roles.
              </div>
            ) : null}
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
              placeholder="Search by reg no., UHID, OPD/IPD no., phone, ID number, or patient name"
            />
            <Button type="submit">Search</Button>
          </form>

          {loading ? <div className="empty-state">Loading patient registry...</div> : null}

          {!loading ? (
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reg No.</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Mobile</th>
                    <th>City / District</th>
                    <th>Registered</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id}>
                      <td>{patient.registrationNumber || patient.uhid}</td>
                      <td>{patient.title ? `${patient.title} ` : ""}{patient.firstName} {patient.lastName}</td>
                      <td>{patient.patientType || "new"}</td>
                      <td>{patient.phone}</td>
                      <td>{patient.cityDistrict || patient.city}</td>
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
