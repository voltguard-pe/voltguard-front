import HomeDashboardPage from "../pages/dashboard/HomeDashboardPage";
import UserDashboardPage from "../pages/dashboard/user/UserDashboardPage";
import { useAuth } from "../shared/hooks/useAuth";

const DashboardRouter = () => {
  const { auth } = useAuth();

  if (auth?.role === "USER") {
    return <UserDashboardPage />;
  }

  return <HomeDashboardPage />;
};

export default DashboardRouter;