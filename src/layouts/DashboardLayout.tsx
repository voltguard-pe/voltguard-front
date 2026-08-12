import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import SidebarComponent from "../components/dashboard/SidebarComponent";
// import NavbarComponent from "../components/dashboard/NavbarComponent";
import FooterComponent from "../components/dashboard/FooterComponent";
import { Menu } from "lucide-react";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <section className="min-h-dvh bg-slate-50 lg:flex">
      <SidebarComponent
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        {/* <NavbarComponent onOpenSidebar={() => setIsSidebarOpen(true)} /> */}

        <div className="p-4 pb-0 lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-100 cursor-pointer"
          >
            <Menu size={22} />
          </button>
        </div>

        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">
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

          <div className="mx-auto w-full max-w-[1600px] min-w-0">
            <Outlet />
          </div>
        </main>

        <FooterComponent />
      </div>
    </section>
  );
};

export default DashboardLayout;