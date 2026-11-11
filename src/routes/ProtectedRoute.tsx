import { Navigate, Outlet, useLocation } from "react-router-dom";
import { type Role } from "../shared/types/AuthProps";
import { useAuth } from "../shared/hooks/useAuth";
import VoltGuardLoader from "../assets/svg/VoltGuardLoader";

type ProtectedRouteProps = {
  allowedRoles: Role[];
};

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { auth, loading, isLoggingOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <VoltGuardLoader />
      </div>
    );
  }

  if (isLoggingOut) {
    return null;
  }

  if (!auth) {
    // Si estamos deslogueando, no capturar la ruta previa
    const redirectTo = location.pathname + location.search;

    // Evitar redirigir de vuelta a rutas raíz oauth
    const isAuthOrRoot = location.pathname === "/" || location.pathname.startsWith("/auth");
    const target = isAuthOrRoot ? "/auth" : `/auth?redirect=${encodeURIComponent(redirectTo)}`;

    return <Navigate to={target} replace />;
  }

  if (!allowedRoles.includes(auth.role)) {
    return <Navigate to="/404" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;