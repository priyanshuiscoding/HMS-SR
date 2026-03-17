import { useEffect, useMemo, useState } from "react";

import { Button } from "../../components/common/Button.jsx";
import { DashboardLayout } from "../../components/layout/DashboardLayout.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
  dispensePrescription,
  getDispensations,
  getPharmacyMasters,
  getPharmacyPrescriptions,
  getPharmacyStock
} from "../../services/api.js";

export function PharmacyPage() {
  const { user } = useAuth();
  const [stockPayload, setStockPayload] = useState({ items: [], alerts: { lowStock: [], expiringSoon: [], outOfStock: [] } });
  const [prescriptions, setPrescriptions] = useState([]);
  const [dispensations, setDispensations] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadAll(filter = statusFilter) {
    try {
      const [masters, stock, queue, dispensed] = await Promise.all([
        getPharmacyMasters(),
        getPharmacyStock(),
        getPharmacyPrescriptions({ status: filter }),
        getDispensations()
      ]);

      setStockPayload(stock);
      setPrescriptions(queue.items);
      setDispensations(dispensed.items);
      setSelectedPrescription((current) =>
        queue.items.find((item) => item.id === current?.id) || queue.items[0] || null
      );
      setError("");
      setMessage(masters.alerts.lowStock.length ? "Low-stock alerts are active in sample pharmacy data." : "");
    } catch (apiError) {
      setError(apiError.message || "Unable to load pharmacy workspace.");
    }
  }

  useEffect(() => {
    loadAll("pending");
  }, []);

  const pharmacyStats = useMemo(() => {
    return {
      lowStock: stockPayload.alerts.lowStock.length,
      expiringSoon: stockPayload.alerts.expiringSoon.length,
      outOfStock: stockPayload.alerts.outOfStock.length,
      pendingRx: prescriptions.filter((item) => !item.isDispensed).length
    };
  }, [prescriptions, stockPayload]);

  const handleFilterChange = async (event) => {
    const nextFilter = event.target.value;
    setStatusFilter(nextFilter);
    await loadAll(nextFilter);
  };

  const handleDispense = async () => {
    if (!selectedPrescription) {
      return;
    }

    try {
      await dispensePrescription(selectedPrescription.id, {
        items: selectedPrescription.medicines.map((item) => ({
          medicineId: item.medicineId,
          quantity: item.quantityDispensed
        }))
      });

      await loadAll(statusFilter);
      setMessage("Prescription dispensed and stock updated.");
      setError("");
    } catch (apiError) {
      setError(apiError.message || "Unable to dispense prescription.");
    }
  };

  return (
    <DashboardLayout>
      <section className="hero-panel logo-hero">
        <div className="eyebrow">Pharmacy Workspace</div>
        <h2>Prescription dispensing, stock alerts, and medicine movement in one operational view.</h2>
        <p>
          This phase links OPD prescriptions to pharmacy execution, so the team can review pending
          prescriptions, dispense against stock batches, and monitor medicine availability before go-live.
        </p>
      </section>

      <section className="stat-grid">
        <article className="stat-card">
          <div className="stat-label">Pending Rx</div>
          <div className="stat-value">{pharmacyStats.pendingRx}</div>
          <div className="stat-note">Prescription queue ready</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Low Stock</div>
          <div className="stat-value">{pharmacyStats.lowStock}</div>
          <div className="stat-note">Needs replenishment soon</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Expiring Soon</div>
          <div className="stat-value">{pharmacyStats.expiringSoon}</div>
          <div className="stat-note">Batch attention required</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Out Of Stock</div>
          <div className="stat-value">{pharmacyStats.outOfStock}</div>
          <div className="stat-note">Cannot dispense directly</div>
        </article>
      </section>

      <section className="opd-grid">
        <aside className="content-card">
          <div className="section-header">
            <div>
              <div className="eyebrow">Prescription Queue</div>
              <h3>Pending and completed prescriptions</h3>
            </div>
          </div>

          <div className="toolbar">
            <select value={statusFilter} onChange={handleFilterChange}>
              <option value="pending">Pending dispensing</option>
              <option value="completed">Completed dispensing</option>
              <option value="">All prescriptions</option>
            </select>
          </div>

          <div className="queue-list">
            {prescriptions.map((item) => (
              <div
                key={item.id}
                className={`queue-item selectable-card${selectedPrescription?.id === item.id ? " selected-card" : ""}`}
                onClick={() => setSelectedPrescription(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    setSelectedPrescription(item);
                  }
                }}
              >
                <div>
                  <strong>{item.prescriptionNumber}</strong>
                  <div className="timeline-copy">{item.patientName}</div>
                  <div className="timeline-copy">{item.diagnosis}</div>
                  <div className="timeline-copy">{item.prescriptionDate}</div>
                </div>
                <div className="queue-actions">
                  <span className={`status-pill ${item.isDispensed ? "completed" : "waiting"}`}>
                    {item.isDispensed ? "dispensed" : "pending"}
                  </span>
                </div>
              </div>
            ))}

            {!prescriptions.length ? <div className="empty-state">No prescriptions found for this filter.</div> : null}
          </div>
        </aside>

        <section className="consultation-column">
          <article className="content-card">
            <div className="section-header">
              <div>
                <div className="eyebrow">Dispensing Desk</div>
                <h3>{selectedPrescription?.patientName || "Select a prescription"}</h3>
              </div>
              <Button
                onClick={handleDispense}
                disabled={
                  !selectedPrescription ||
                  selectedPrescription.isDispensed ||
                  !["admin", "pharmacy"].includes(user?.role)
                }
              >
                {selectedPrescription?.isDispensed ? "Already Dispensed" : "Dispense Prescription"}
              </Button>
            </div>

            {error ? <div className="error-text">{error}</div> : null}
            {message ? <div className="success-text">{message}</div> : null}

            {selectedPrescription ? (
              <div className="detail-grid">
                <article className="content-card inset-card">
                  <h3>Prescription detail</h3>
                  <div className="detail-list">
                    <div><strong>Prescription:</strong> {selectedPrescription.prescriptionNumber}</div>
                    <div><strong>Diagnosis:</strong> {selectedPrescription.diagnosis}</div>
                    <div><strong>Dispense status:</strong> {selectedPrescription.isDispensed ? "Completed" : "Pending"}</div>
                    <div><strong>Visit:</strong> {selectedPrescription.visit?.opdNumber || "Linked OPD visit"}</div>
                    {!["admin", "pharmacy"].includes(user?.role) ? (
                      <div><strong>Access:</strong> View only</div>
                    ) : null}
                  </div>
                </article>

                <article className="content-card inset-card">
                  <h3>Medicine lines</h3>
                  <div className="stack-list">
                    {selectedPrescription.medicines.map((item) => (
                      <div key={item.id} className="quick-action">
                        <strong>{item.medicineName}</strong>
                        <div className="timeline-copy">
                          {item.dose} - {item.frequency} - {item.timing || "As advised"}
                        </div>
                        <div className="timeline-copy">Requested qty: {item.quantityDispensed}</div>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            ) : (
              <div className="empty-state">Choose a prescription from the queue to see its dispense detail.</div>
            )}
          </article>

          <article className="content-card">
            <div className="section-header">
              <div>
                <div className="eyebrow">Stock Alerts</div>
                <h3>Live sample medicine availability</h3>
              </div>
            </div>

            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Available</th>
                    <th>Reorder</th>
                    <th>Nearest expiry</th>
                    <th>Flags</th>
                  </tr>
                </thead>
                <tbody>
                  {stockPayload.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.name}</strong>
                        <div className="muted-text">{item.formulation} - {item.category}</div>
                      </td>
                      <td>{item.totalAvailable} {item.unit}</td>
                      <td>{item.reorderLevel}</td>
                      <td>{item.nearestExpiry || "No batch"}</td>
                      <td>
                        <div className="badge-row">
                          {item.lowStock ? <span className="alert-badge warning">Low stock</span> : null}
                          {item.expiringSoon ? <span className="alert-badge">Expiring</span> : null}
                          {!item.totalAvailable ? <span className="alert-badge danger">Out</span> : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="content-card">
            <div className="section-header">
              <div>
                <div className="eyebrow">Recent Dispensing</div>
                <h3>Pharmacy completion history</h3>
              </div>
            </div>

            <div className="stack-list">
              {dispensations.map((item) => (
                <div key={item.id} className="quick-action">
                  <strong>{item.dispenseNumber}</strong>
                  <div className="timeline-copy">{item.patientName}</div>
                  <div className="timeline-copy">
                    {item.items.map((line) => `${line.medicineName} x${line.quantity}`).join(", ")}
                  </div>
                  <div className="timeline-copy">{item.dispensedDate}</div>
                </div>
              ))}
              {!dispensations.length ? <div className="empty-state">No dispensing activity recorded yet.</div> : null}
            </div>
          </article>
        </section>
      </section>
    </DashboardLayout>
  );
}
