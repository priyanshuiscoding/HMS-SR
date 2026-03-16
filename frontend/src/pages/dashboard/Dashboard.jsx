import { useEffect, useState } from "react";

import { StatCard } from "../../components/common/StatCard.jsx";
import { DashboardLayout } from "../../components/layout/DashboardLayout.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { getSystemOverview } from "../../services/api.js";

const timeline = [
  {
    time: "08:00",
    title: "Morning OPD preparation",
    copy: "Reception token desk, doctor room readiness, and today's slot visibility will live here."
  },
  {
    time: "10:30",
    title: "Clinical workflow stream",
    copy: "OPD consultation, Ayurvedic assessment, and prescription handoff will anchor this core panel."
  },
  {
    time: "14:00",
    title: "Operational continuity",
    copy: "IPD, therapy, pharmacy, lab, and billing surfaces will plug into this dashboard next."
  }
];

const quickActions = [
  {
    title: "Phase 4 active",
    copy: "Patients, appointments, OPD, lab hooks, and billing hooks are now connected in the HMS shell."
  },
  {
    title: "Brand alignment",
    copy: "The interface now follows the Shanti-Ratnam white, blue, and saffron visual language."
  },
  {
    title: "Next build target",
    copy: "Billing depth, lab workflow detail, and pharmacy linkage are the next operational upgrades."
  }
];

export function DashboardPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    async function loadOverview() {
      try {
        const response = await getSystemOverview();
        setOverview(response);
      } catch {
        setOverview(null);
      }
    }

    loadOverview();
  }, []);

  return (
    <DashboardLayout>
      <section className="hero-panel">
        <div className="eyebrow">Operational Dashboard</div>
        <h2>One Shanti-Ratnam system for reception, clinical care, patient journeys, and hospital operations.</h2>
        <p>
          Welcome back, {user?.fullName || "team member"}. This dashboard is the live working layer of the
          SR-AIIMS HMS and now includes the first real operational modules for patient registry and
          appointment scheduling.
        </p>
      </section>

      <section className="stat-grid">
        <StatCard label="Phase" value="04" note="Lab and billing hooks live" />
        <StatCard label="Role" value={user?.role || "guest"} note="RBAC-aware shell active" />
        <StatCard
          label="Modules Ready"
          value={String(overview?.modulesReady?.length || 7)}
          note="Auth, dashboard, patients, appointments, opd, lab, billing"
        />
        <StatCard label="Next Sprint" value="05" note="Lab detail and pharmacy linkage" />
      </section>

      <section className="content-grid">
        <article className="content-card">
          <h3>Build Timeline</h3>
          {timeline.map((item) => (
            <div className="timeline-item" key={item.time}>
              <div className="timeline-time">{item.time}</div>
              <div>
                <strong>{item.title}</strong>
                <div className="timeline-copy">{item.copy}</div>
              </div>
            </div>
          ))}
        </article>

        <aside className="content-card">
          <h3>Quick Notes</h3>
          <div className="quick-actions">
            {quickActions.map((item) => (
              <div className="quick-action" key={item.title}>
                <strong>{item.title}</strong>
                <div className="timeline-copy">{item.copy}</div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </DashboardLayout>
  );
}
