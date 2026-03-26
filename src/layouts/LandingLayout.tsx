import { Outlet, NavLink } from "react-router-dom";
import NavbarComponent from "../components/landing/NavbarComponent";
import FooterComponent from "../components/landing/FooterComponent";

const LandingLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">

      {/* Navbar */}
      <NavbarComponent />

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <FooterComponent />
    </div>
  );
};

export default LandingLayout;
