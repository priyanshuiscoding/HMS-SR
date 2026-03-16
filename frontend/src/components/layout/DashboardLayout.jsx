import { Navbar } from "./Navbar.jsx";
import { Sidebar } from "./Sidebar.jsx";

export function DashboardLayout({ children }) {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="main-panel">
        <Navbar />
        {children}
      </main>
    </div>
  );
}
