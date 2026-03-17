import { useEffect, useMemo, useState } from "react";

import { Button } from "../../components/common/Button.jsx";
import { DashboardLayout } from "../../components/layout/DashboardLayout.jsx";
import {
  getInventoryBatches,
  getInventoryMasters,
  getInventoryTransactions,
  receiveInventoryStock
} from "../../services/api.js";

const initialForm = {
  medicineId: "",
  supplierId: "",
  batchNumber: "",
  expiryDate: "",
  quantityReceived: "",
  purchasePrice: "",
  sellingPrice: "",
  note: ""
};

export function InventoryPage() {
  const [masters, setMasters] = useState({ medicines: [], suppliers: [] });
  const [batches, setBatches] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadAll() {
    try {
      const [mastersResponse, batchesResponse, transactionsResponse] = await Promise.all([
        getInventoryMasters(),
        getInventoryBatches(),
        getInventoryTransactions()
      ]);

      setMasters(mastersResponse);
      setBatches(batchesResponse.items);
      setTransactions(transactionsResponse.items);
      setError("");
    } catch (apiError) {
      setError(apiError.message || "Unable to load inventory workspace.");
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const stats = useMemo(() => {
    return {
      batches: batches.length,
      suppliers: masters.suppliers.length,
      receipts: transactions.filter((item) => item.type === "receipt").length,
      issues: transactions.filter((item) => item.type === "issue").length
    };
  }, [batches, masters.suppliers.length, transactions]);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await receiveInventoryStock(form);
      setForm(initialForm);
      setMessage("Stock received and inventory updated.");
      setError("");
      await loadAll();
    } catch (apiError) {
      setError(apiError.message || "Unable to receive stock.");
    }
  };

  return (
    <DashboardLayout>
      <section className="hero-panel logo-hero">
        <div className="eyebrow">Inventory Control</div>
        <h2>Batch receipt, supplier-linked stock intake, and movement history for the pharmacy store.</h2>
        <p>
          This phase gives the HMS its first stock-control layer, so medicines can be received into inventory
          before being dispensed through the pharmacy workflow.
        </p>
      </section>

      <section className="stat-grid">
        <article className="stat-card">
          <div className="stat-label">Batches</div>
          <div className="stat-value">{stats.batches}</div>
          <div className="stat-note">Tracked inventory lots</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Suppliers</div>
          <div className="stat-value">{stats.suppliers}</div>
          <div className="stat-note">Sample master list</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Receipts</div>
          <div className="stat-value">{stats.receipts}</div>
          <div className="stat-note">Inbound stock events</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Issues</div>
          <div className="stat-value">{stats.issues}</div>
          <div className="stat-note">Dispense-linked stock outs</div>
        </article>
      </section>

      <section className="content-grid">
        <article className="content-card">
          <div className="section-header">
            <div>
              <div className="eyebrow">Receive Stock</div>
              <h3>Add a new medicine batch</h3>
            </div>
          </div>

          {error ? <div className="error-text">{error}</div> : null}
          {message ? <div className="success-text">{message}</div> : null}

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field">
              <label>Medicine</label>
              <select name="medicineId" value={form.medicineId} onChange={handleChange}>
                <option value="">Select medicine</option>
                {masters.medicines.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Supplier</label>
              <select name="supplierId" value={form.supplierId} onChange={handleChange}>
                <option value="">Select supplier</option>
                {masters.suppliers.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Batch number</label>
              <input name="batchNumber" value={form.batchNumber} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Expiry date</label>
              <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Quantity received</label>
              <input name="quantityReceived" value={form.quantityReceived} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Purchase price</label>
              <input name="purchasePrice" value={form.purchasePrice} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Selling price</label>
              <input name="sellingPrice" value={form.sellingPrice} onChange={handleChange} />
            </div>
            <div className="field field-span-2">
              <label>Note</label>
              <input name="note" value={form.note} onChange={handleChange} />
            </div>
            <div className="field field-span-2">
              <Button type="submit">Receive Batch</Button>
            </div>
          </form>
        </article>

        <aside className="content-card">
          <div className="section-header">
            <div>
              <div className="eyebrow">Store Notes</div>
              <h3>What this phase gives us</h3>
            </div>
          </div>

          <div className="quick-actions">
            <div className="quick-action">
              <strong>Batch-level tracking</strong>
              <div className="timeline-copy">Each medicine lot can now be received with expiry, supplier, and pricing.</div>
            </div>
            <div className="quick-action">
              <strong>Issue visibility</strong>
              <div className="timeline-copy">Dispensing from pharmacy writes stock movement history automatically.</div>
            </div>
            <div className="quick-action">
              <strong>Easy replacement later</strong>
              <div className="timeline-copy">All values here are sample masters and can be replaced once hospital data arrives.</div>
            </div>
          </div>
        </aside>
      </section>

      <section className="content-grid">
        <article className="content-card">
          <div className="section-header">
            <div>
              <div className="eyebrow">Inventory Batches</div>
              <h3>Current medicine lots</h3>
            </div>
          </div>

          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Batch</th>
                  <th>Expiry</th>
                  <th>Received</th>
                  <th>Available</th>
                  <th>Prices</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((item) => (
                  <tr key={item.id}>
                    <td>{item.medicineName}</td>
                    <td>{item.batchNumber}</td>
                    <td>{item.expiryDate}</td>
                    <td>{item.quantityReceived}</td>
                    <td>{item.quantityAvailable}</td>
                    <td>Rs. {item.purchasePrice} / Rs. {item.sellingPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="content-card">
          <div className="section-header">
            <div>
              <div className="eyebrow">Stock Movement</div>
              <h3>Receipts and issues</h3>
            </div>
          </div>

          <div className="stack-list">
            {transactions.map((item) => (
              <div key={item.id} className="quick-action">
                <strong>{item.referenceNumber}</strong>
                <div className="timeline-copy">{item.medicineName}</div>
                <div className="timeline-copy">
                  {item.type} - {item.quantity > 0 ? `+${item.quantity}` : item.quantity}
                </div>
                <div className="timeline-copy">{item.transactionDate}</div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </DashboardLayout>
  );
}
