import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";

const PublicRoute = () => {
  const { auth, loading } = useAuth();
  const [searchParams] = useSearchParams();

  const redirectParam = searchParams.get("redirect");

  const redirect =
    redirectParam && redirectParam.startsWith("/")
      ? redirectParam
      : "/dashboard";

  if (loading) return null;

  if (auth) {
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;