import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";

const PublicRoute = () => {
  const { auth, loading } = useAuth();

  if (loading) {
    return (
            <div className="min-h-screen flex items-center justify-center">
      <span className="text-slate-400">Cargando sesión…</span>
    </div>
    )
  };

  if (auth) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
