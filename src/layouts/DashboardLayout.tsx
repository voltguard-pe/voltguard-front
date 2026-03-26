import { Outlet } from "react-router-dom";
import SidebarComponent from "../components/dashboard/SidebarComponent";
import NavbarComponent from "../components/dashboard/NavbarComponent";
import FooterComponent from "../components/dashboard/FooterComponent";

const DashboardLayout = () => {
  return (
    <section className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <SidebarComponent />

      {/* Content */}
      <div className="flex flex-col flex-1">
        <NavbarComponent />

        <main className="flex-1 p-6">
          <Outlet />
        </main>

        <FooterComponent />
      </div>
    </section>
  );
};

export default DashboardLayout;
