import { Outlet } from "react-router-dom";
import SidebarComponent from "../components/dashboard/SidebarComponent";
import NavbarComponent from "../components/dashboard/NavbarComponent";
import FooterComponent from "../components/dashboard/FooterComponent";
import { useState } from "react";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <section className="h-screen flex bg-slate-100">
      {/* Sidebar */}
      <SidebarComponent
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Content */}
      <div className="flex flex-col flex-1 w-full">
        <NavbarComponent onOpenSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 overflow-y-scroll md:p-6">
          <Outlet />
        </main>

        <FooterComponent />
      </div>
    </section>
  );
};

export default DashboardLayout;
