import { Outlet } from "react-router-dom";
import SidebarComponent from "../components/dashboard/SidebarComponent";
import NavbarComponent from "../components/dashboard/NavbarComponent";
import FooterComponent from "../components/dashboard/FooterComponent";
import { useState } from "react";
import { ToastContainer } from 'react-toastify';

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
          <ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop
  closeOnClick
  pauseOnHover
  draggable
  theme="colored"
/>
          <Outlet />
        </main>

        <FooterComponent />
      </div>
    </section>
  );
};

export default DashboardLayout;
