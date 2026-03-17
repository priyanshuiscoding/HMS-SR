import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { DashboardLayout } from "../../components/layout/DashboardLayout.jsx";
import { getPatientHistory } from "../../services/api.js";

export function PatientProfilePage() {
  const { id } = useParams();
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await getPatientHistory(id);
        setPayload(response);
      } catch (apiError) {
        setError(apiError.message || "Unable to load patient profile.");
      }
    }

    load();
  }, [id]);

  const patient = payload?.patient;

  return (
    <DashboardLayout>
      {!payload && !error ? <div className="empty-state">Loading patient profile...</div> : null}
      {error ? <div className="error-text">{error}</div> : null}

      {patient ? (
        <>
          <section className="profile-banner">
            <div>
              <div className="eyebrow">Patient Profile</div>
              <h2>{patient.firstName} {patient.lastName}</h2>
              <p>
                UHID {patient.uhid} - {patient.gender} - Registered on {patient.registrationDate}
              </p>
            </div>
            <Link className="inline-link" to="/patients">
              Back to registry
            </Link>
          </section>

          <section className="detail-grid">
            <article className="content-card">
              <h3>Demographics</h3>
              <div className="detail-list">
                <div><strong>Phone:</strong> {patient.phone}</div>
                <div><strong>Email:</strong> {patient.email || "Not provided"}</div>
                <div><strong>Date of birth:</strong> {patient.dateOfBirth}</div>
                <div><strong>Blood group:</strong> {patient.bloodGroup || "Not recorded"}</div>
                <div><strong>Address:</strong> {patient.address}</div>
                <div><strong>City/State:</strong> {patient.city}, {patient.state}</div>
              </div>
            </article>

            <article className="content-card">
              <h3>Emergency and referral</h3>
              <div className="detail-list">
                <div><strong>Emergency contact:</strong> {patient.emergencyContactName || "Not provided"}</div>
                <div><strong>Emergency phone:</strong> {patient.emergencyContactPhone || "Not provided"}</div>
                <div><strong>Alternate phone:</strong> {patient.altPhone || "Not provided"}</div>
                <div><strong>Referred by:</strong> {patient.referredBy || "Not captured"}</div>
                <div><strong>Pincode:</strong> {patient.pincode || "Not recorded"}</div>
              </div>
            </article>
          </section>

          <section className="content-card">
            <div className="section-header">
              <div>
                <div className="eyebrow">Timeline</div>
                <h3>Unified patient timeline</h3>
              </div>
            </div>

            {payload.timeline.length ? (
              <div className="stack-list timeline-stack">
                {payload.timeline.map((item) => (
                  <div key={item.id} className={`timeline-block ${item.type}`}>
                    <div className="timeline-block-date">{item.date}</div>
                    <div>
                      <strong>{item.title}</strong>
                      <div className="timeline-copy">{item.summary}</div>
                      <div className="timeline-copy">{item.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No timeline history has been recorded for this patient yet.</div>
            )}
          </section>

          <section className="content-card">
            <div className="section-header">
              <div>
                <div className="eyebrow">Appointments</div>
                <h3>Appointment history</h3>
              </div>
            </div>

            {payload.appointments.length ? (
              <div className="table-shell">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Appointment</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Complaint</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payload.appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{appointment.appointmentNumber}</td>
                        <td>{appointment.appointmentDate}</td>
                        <td>{appointment.appointmentTime}</td>
                        <td>{appointment.department}</td>
                        <td><span className={`status-pill ${appointment.status}`}>{appointment.status}</span></td>
                        <td>{appointment.chiefComplaint || "General consultation"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">No appointment history has been recorded for this patient yet.</div>
            )}
          </section>

          <section className="detail-grid">
            <article className="content-card">
              <h3>Prescriptions</h3>
              {payload.prescriptions.length ? (
                <div className="stack-list">
                  {payload.prescriptions.map((prescription) => (
                    <div key={prescription.id} className="quick-action">
                      <strong>{prescription.prescriptionNumber}</strong>
                      <div className="timeline-copy">{prescription.diagnosis}</div>
                      <div className="timeline-copy">{prescription.medicines.map((item) => item.medicineName).join(", ")}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No prescriptions recorded yet.</div>
              )}
            </article>

            <article className="content-card">
              <h3>Lab, billing, and pharmacy</h3>
              <div className="stack-list">
                {payload.labOrders.map((order) => (
                  <div key={order.id} className="quick-action">
                    <strong>{order.orderNumber}</strong>
                    <div className="timeline-copy">{order.tests.map((item) => item.testName).join(", ")}</div>
                    <div className="timeline-copy">Status: {order.status}</div>
                  </div>
                ))}
                {payload.bills.map((bill) => (
                  <div key={bill.id} className="quick-action">
                    <strong>{bill.billNumber}</strong>
                    <div className="timeline-copy">Total: Rs. {bill.totalAmount}</div>
                    <div className="timeline-copy">Payment: {bill.paymentStatus}</div>
                  </div>
                ))}
                {payload.dispensations.map((dispense) => (
                  <div key={dispense.id} className="quick-action">
                    <strong>{dispense.dispenseNumber}</strong>
                    <div className="timeline-copy">
                      {dispense.items.map((item) => `${item.medicineName} x${item.quantity}`).join(", ")}
                    </div>
                    <div className="timeline-copy">Dispensed: {dispense.dispensedDate}</div>
                  </div>
                ))}
                {payload.payments.map((payment) => (
                  <div key={payment.id} className="quick-action">
                    <strong>{payment.receiptNumber}</strong>
                    <div className="timeline-copy">Rs. {payment.amount} via {payment.paymentMode}</div>
                    <div className="timeline-copy">Received: {payment.paymentDate}</div>
                  </div>
                ))}
                {!payload.labOrders.length &&
                !payload.bills.length &&
                !payload.dispensations.length &&
                !payload.payments.length ? (
                  <div className="empty-state">No lab, billing, pharmacy, or payment records recorded yet.</div>
                ) : null}
              </div>
            </article>
          </section>
        </>
      ) : null}
    </DashboardLayout>
  );
}
