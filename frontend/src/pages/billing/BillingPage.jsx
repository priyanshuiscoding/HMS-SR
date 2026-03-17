import { useEffect, useMemo, useState } from "react";

import { Button } from "../../components/common/Button.jsx";
import { DashboardLayout } from "../../components/layout/DashboardLayout.jsx";
import {
  collectBillPayment,
  getBill,
  getBillingSummary,
  getBills
} from "../../services/api.js";

const initialPaymentForm = {
  amount: "",
  paymentMode: "cash",
  referenceNumber: "",
  note: ""
};

export function BillingPage() {
  const [summary, setSummary] = useState(null);
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [filters, setFilters] = useState({ paymentStatus: "" });
  const [paymentForm, setPaymentForm] = useState(initialPaymentForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadAll(nextFilters = filters, selectedId = selectedBill?.item?.id) {
    try {
      const [summaryResponse, billsResponse] = await Promise.all([
        getBillingSummary(),
        getBills(nextFilters)
      ]);

      setSummary(summaryResponse);
      setBills(billsResponse.items);

      const activeId = selectedId || billsResponse.items[0]?.id;

      if (activeId) {
        const detail = await getBill(activeId);
        setSelectedBill(detail);
        setPaymentForm((current) => ({
          ...current,
          amount: detail.item.balanceAmount > 0 ? String(detail.item.balanceAmount) : ""
        }));
      } else {
        setSelectedBill(null);
      }

      setError("");
    } catch (apiError) {
      setError(apiError.message || "Unable to load billing desk.");
    }
  }

  useEffect(() => {
    loadAll({ paymentStatus: "" });
  }, []);

  const handleFilterChange = async (event) => {
    const nextFilters = { ...filters, [event.target.name]: event.target.value };
    setFilters(nextFilters);
    await loadAll(nextFilters);
  };

  const handleBillSelect = async (billId) => {
    try {
      const detail = await getBill(billId);
      setSelectedBill(detail);
      setPaymentForm((current) => ({
        ...current,
        amount: detail.item.balanceAmount > 0 ? String(detail.item.balanceAmount) : ""
      }));
      setError("");
    } catch (apiError) {
      setError(apiError.message || "Unable to load bill detail.");
    }
  };

  const handlePaymentFormChange = (event) => {
    setPaymentForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleCollectPayment = async (event) => {
    event.preventDefault();

    if (!selectedBill?.item?.id) {
      return;
    }

    try {
      const response = await collectBillPayment(selectedBill.item.id, paymentForm);
      setMessage(response.message);
      setPaymentForm(initialPaymentForm);
      await loadAll(filters, selectedBill.item.id);
    } catch (apiError) {
      setError(apiError.message || "Unable to collect payment.");
    }
  };

  const invoiceTotals = useMemo(() => {
    if (!selectedBill?.item) {
      return null;
    }

    return {
      subtotal: selectedBill.item.subtotal,
      discountAmount: selectedBill.item.discountAmount,
      taxAmount: selectedBill.item.taxAmount,
      totalAmount: selectedBill.item.totalAmount,
      paidAmount: selectedBill.item.paidAmount,
      balanceAmount: selectedBill.item.balanceAmount
    };
  }, [selectedBill]);

  return (
    <DashboardLayout>
      <section className="hero-panel logo-hero">
        <div className="eyebrow">Billing Desk</div>
        <h2>Invoice review, payment collection, and print-ready billing inside the HMS.</h2>
        <p>
          This phase turns the earlier billing hooks into a real accounts workflow with bill summaries,
          outstanding tracking, payment receipts, and an invoice panel that is ready to print for patients.
        </p>
      </section>

      <section className="stat-grid">
        <article className="stat-card">
          <div className="stat-label">Bills</div>
          <div className="stat-value">{summary?.totalBills || 0}</div>
          <div className="stat-note">Registered invoices</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Revenue</div>
          <div className="stat-value">Rs. {summary?.totalRevenue || 0}</div>
          <div className="stat-note">Collected till now</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Outstanding</div>
          <div className="stat-value">Rs. {summary?.outstanding || 0}</div>
          <div className="stat-note">Pending collections</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Unpaid Bills</div>
          <div className="stat-value">{summary?.unpaidBills || 0}</div>
          <div className="stat-note">Needs billing desk action</div>
        </article>
      </section>

      <section className="opd-grid">
        <aside className="content-card">
          <div className="section-header">
            <div>
              <div className="eyebrow">Invoices</div>
              <h3>Bill register</h3>
            </div>
          </div>

          <div className="toolbar">
            <select name="paymentStatus" value={filters.paymentStatus} onChange={handleFilterChange}>
              <option value="">All statuses</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          <div className="queue-list">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className={`queue-item selectable-card${selectedBill?.item?.id === bill.id ? " selected-card" : ""}`}
                onClick={() => handleBillSelect(bill.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    handleBillSelect(bill.id);
                  }
                }}
              >
                <div>
                  <strong>{bill.billNumber}</strong>
                  <div className="timeline-copy">{bill.patientName}</div>
                  <div className="timeline-copy">Rs. {bill.totalAmount}</div>
                  <div className="timeline-copy">{bill.billDate}</div>
                </div>
                <div className="queue-actions">
                  <span className={`status-pill ${bill.paymentStatus === "partial" ? "in_progress" : bill.paymentStatus}`}>
                    {bill.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
            {!bills.length ? <div className="empty-state">No bills found for the selected filter.</div> : null}
          </div>
        </aside>

        <section className="consultation-column">
          <article className="content-card printable-area">
            <div className="section-header no-print">
              <div>
                <div className="eyebrow">Invoice Detail</div>
                <h3>{selectedBill?.item?.billNumber || "Select a bill"}</h3>
              </div>
              <Button variant="secondary" onClick={() => window.print()} disabled={!selectedBill?.item}>
                Print Invoice
              </Button>
            </div>

            {error ? <div className="error-text no-print">{error}</div> : null}
            {message ? <div className="success-text no-print">{message}</div> : null}

            {selectedBill?.item ? (
              <div className="invoice-sheet">
                <div className="invoice-header">
                  <div>
                    <div className="eyebrow">Shanti-Ratnam</div>
                    <h3>SR-AIIMS Billing Invoice</h3>
                    <div className="timeline-copy">Healing With Happiness</div>
                  </div>
                  <div className="detail-list compact-detail">
                    <div><strong>Bill:</strong> {selectedBill.item.billNumber}</div>
                    <div><strong>Date:</strong> {selectedBill.item.billDate}</div>
                    <div><strong>Status:</strong> {selectedBill.item.paymentStatus}</div>
                  </div>
                </div>

                <div className="detail-grid">
                  <article className="content-card inset-card">
                    <h3>Patient</h3>
                    <div className="detail-list">
                      <div><strong>Name:</strong> {selectedBill.patient?.firstName} {selectedBill.patient?.lastName}</div>
                      <div><strong>UHID:</strong> {selectedBill.patient?.uhid || "N/A"}</div>
                      <div><strong>Phone:</strong> {selectedBill.patient?.phone || "N/A"}</div>
                    </div>
                  </article>

                  <article className="content-card inset-card">
                    <h3>Visit</h3>
                    <div className="detail-list">
                      <div><strong>Visit:</strong> {selectedBill.visit?.opdNumber || "N/A"}</div>
                      <div><strong>Type:</strong> {selectedBill.item.billType}</div>
                      <div><strong>Notes:</strong> {selectedBill.item.notes || "No billing notes"}</div>
                    </div>
                  </article>
                </div>

                <div className="table-shell">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBill.item.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.description}</td>
                          <td>{item.category}</td>
                          <td>{item.quantity}</td>
                          <td>Rs. {item.unitPrice}</td>
                          <td>Rs. {item.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="invoice-summary">
                  <div><strong>Subtotal:</strong> Rs. {invoiceTotals?.subtotal || 0}</div>
                  <div><strong>Discount:</strong> Rs. {invoiceTotals?.discountAmount || 0}</div>
                  <div><strong>Tax:</strong> Rs. {invoiceTotals?.taxAmount || 0}</div>
                  <div><strong>Total:</strong> Rs. {invoiceTotals?.totalAmount || 0}</div>
                  <div><strong>Paid:</strong> Rs. {invoiceTotals?.paidAmount || 0}</div>
                  <div><strong>Balance:</strong> Rs. {invoiceTotals?.balanceAmount || 0}</div>
                </div>
              </div>
            ) : (
              <div className="empty-state">Choose a bill from the register to open its invoice.</div>
            )}
          </article>

          <article className="content-card">
            <div className="section-header">
              <div>
                <div className="eyebrow">Collect Payment</div>
                <h3>Receipt entry</h3>
              </div>
            </div>

            <form className="form-grid" onSubmit={handleCollectPayment}>
              <div className="field">
                <label>Amount</label>
                <input name="amount" value={paymentForm.amount} onChange={handlePaymentFormChange} />
              </div>
              <div className="field">
                <label>Payment mode</label>
                <select name="paymentMode" value={paymentForm.paymentMode} onChange={handlePaymentFormChange}>
                  <option value="cash">cash</option>
                  <option value="upi">upi</option>
                  <option value="card">card</option>
                  <option value="bank_transfer">bank transfer</option>
                </select>
              </div>
              <div className="field">
                <label>Reference number</label>
                <input name="referenceNumber" value={paymentForm.referenceNumber} onChange={handlePaymentFormChange} />
              </div>
              <div className="field field-span-2">
                <label>Note</label>
                <input name="note" value={paymentForm.note} onChange={handlePaymentFormChange} />
              </div>
              <div className="field field-span-2">
                <Button type="submit" disabled={!selectedBill?.item || selectedBill.item.balanceAmount <= 0}>
                  Collect Payment
                </Button>
              </div>
            </form>

            {selectedBill?.item?.payments?.length ? (
              <div className="stack-list" style={{ marginTop: 18 }}>
                {selectedBill.item.payments.map((payment) => (
                  <div key={payment.id} className="quick-action">
                    <strong>{payment.receiptNumber}</strong>
                    <div className="timeline-copy">
                      Rs. {payment.amount} via {payment.paymentMode}
                    </div>
                    <div className="timeline-copy">{payment.referenceNumber || "No reference"}</div>
                    <div className="timeline-copy">{payment.paymentDate}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ marginTop: 18 }}>
                No payments recorded for this bill yet.
              </div>
            )}
          </article>
        </section>
      </section>
    </DashboardLayout>
  );
}
