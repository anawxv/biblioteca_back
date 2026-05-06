import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function normalizeRole(role) {
  return String(role || "").toLowerCase();
}

export function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page page-centered">
        <div className="loader-card">
          <div className="loader-dot" />
          <p>Carregando sua biblioteca...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const userRole = normalizeRole(user.role);
  const allowed = allowedRoles.map(normalizeRole);

  if (!allowed.includes(userRole)) {
    return (
      <Navigate
        to={userRole === "funcionario" ? "/funcionario/painel" : "/cliente/catalogo"}
        replace
      />
    );
  }

  return <Outlet />;
}
