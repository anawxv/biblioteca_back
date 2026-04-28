import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "funcionario" ? "/funcionario" : "/catalogo"} replace />;
  }

  return <Outlet />;
}
