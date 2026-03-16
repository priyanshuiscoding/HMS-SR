export function AuthLayout({ children }) {
  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <div className="auth-hero-badge">SR-AIIMS - Ayurvedic HMS</div>
        <h1>Hospital operations with clinical calm and administrative control.</h1>
        <p>
          The SR-AIIMS HMS foundation is designed to support reception, doctors, pharmacy,
          lab, accounts, and therapy workflows in one secure operating layer.
        </p>

        <div className="auth-hero-grid">
          <div className="auth-hero-card">
            <strong>Operational focus</strong>
            <p>Patients, appointments, OPD, IPD, billing, inventory, and Panchkarma in one flow.</p>
          </div>
          <div className="auth-hero-card">
            <strong>Clinical clarity</strong>
            <p>Ayurvedic assessment, prescriptions, patient timeline, and role-aware access.</p>
          </div>
          <div className="auth-hero-card">
            <strong>Audit-ready</strong>
            <p>Security-first platform foundation with protected routing and backend auth skeleton.</p>
          </div>
          <div className="auth-hero-card">
            <strong>Launch direction</strong>
            <p>Built to scale from MVP operations to hospital-wide adoption without redesigning later.</p>
          </div>
        </div>
      </section>

      <section className="auth-panel">{children}</section>
    </div>
  );
}
