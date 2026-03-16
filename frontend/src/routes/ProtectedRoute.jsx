import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth.js";

export function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
