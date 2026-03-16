import { DashboardLayout } from "../../components/layout/DashboardLayout.jsx";

export function PlaceholderPage({ title, copy }) {
  return (
    <DashboardLayout>
      <section className="hero-panel">
        <div className="eyebrow">Coming In Next Sprint</div>
        <h2>{title}</h2>
        <p>{copy}</p>
      </section>
    </DashboardLayout>
  );
}
