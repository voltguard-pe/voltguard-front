import { Outlet } from "react-router-dom";

import FooterComponent from "../components/landing/FooterComponent";
import NavbarComponent from "../components/landing/NavbarComponent";

const LandingLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <NavbarComponent />

      <main className="flex-1">
        <Outlet />
      </main>

      <FooterComponent />
    </div>
  );
};

export default LandingLayout;