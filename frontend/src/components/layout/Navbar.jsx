import { useAuth } from "../../hooks/useAuth.js";
import { Button } from "../common/Button.jsx";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div>
        <div className="eyebrow">Foundation Phase</div>
        <div style={{ color: "var(--color-navy)", fontSize: 24, fontWeight: 800 }}>
          SR-AIIMS Hospital Management System
        </div>
      </div>

      <div className="navbar-actions">
        <span className="pill">{user?.role || "guest"}</span>
        <Button variant="secondary" onClick={logout}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
