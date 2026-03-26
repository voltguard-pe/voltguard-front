import { Navigate, Outlet } from "react-router-dom";
import { type Role } from "../shared/types/AuthProps";
import { useAuth } from "../shared/hooks/useAuth";

type ProtectedRouteProps = {
  allowedRoles: Role[];
};

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { auth, loading } = useAuth();

  if (loading) {
    return (
          <div className="min-h-screen flex items-center justify-center">
      <span className="text-slate-400">Cargando sesión…</span>
    </div>
    )
  }

  if (!auth) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(auth.role)) {
    // return <Navigate to="/unauthorized" replace />;
    return <Navigate to="404" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
