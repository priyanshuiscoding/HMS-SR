import { Navigate, Route, Routes } from "react-router-dom";

import { LoginPage } from "../pages/auth/Login.jsx";
import { AppointmentsPage } from "../pages/appointments/AppointmentsPage.jsx";
import { BillingPage } from "../pages/billing/BillingPage.jsx";
import { DashboardPage } from "../pages/dashboard/Dashboard.jsx";
import { InventoryPage } from "../pages/inventory/InventoryPage.jsx";
import { OpdPage } from "../pages/opd/OpdPage.jsx";
import { PlaceholderPage } from "../pages/placeholders/PlaceholderPage.jsx";
import { PharmacyPage } from "../pages/pharmacy/PharmacyPage.jsx";
import { PatientProfilePage } from "../pages/patients/PatientProfilePage.jsx";
import { PatientsPage } from "../pages/patients/PatientsPage.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patients"
        element={
          <ProtectedRoute>
            <PatientsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patients/:id"
        element={
          <ProtectedRoute>
            <PatientProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <AppointmentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/opd"
        element={
          <ProtectedRoute>
            <OpdPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pharmacy"
        element={
          <ProtectedRoute allowedRoles={["admin", "pharmacy", "doctor", "accounts"]}>
            <PharmacyPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute allowedRoles={["admin", "pharmacy", "accounts"]}>
            <InventoryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/billing"
        element={
          <ProtectedRoute allowedRoles={["admin", "accounts", "reception", "doctor"]}>
            <BillingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <PlaceholderPage
              title="User and staff administration is scaffolded for admin-only access."
              copy="Once database-backed users are ready, this page will manage staff, roles, departments, and activation."
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={["admin", "doctor"]}>
            <PlaceholderPage
              title="Reports will be introduced once transactional data stabilizes."
              copy="Daily OPD, revenue, census, and workload analytics will be layered after core workflows are live."
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <PlaceholderPage
              title="System settings will hold rooms, medicines, SMS, and operational masters."
              copy="This area is intentionally held back until the core data model is live and validated."
            />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
