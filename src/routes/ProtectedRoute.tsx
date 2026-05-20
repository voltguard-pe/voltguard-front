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
    const redirectTo = location.pathname + location.search;

    return (
      <Navigate
        to={`/auth?redirect=${encodeURIComponent(redirectTo)}`}
        replace
      />
    );
  }

  if (!allowedRoles.includes(auth.role)) {
    return <Navigate to="/404" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;