import { Bell, Menu, UserCircle } from "lucide-react";
import { NavLink } from 'react-router-dom';
import { useAuth } from "../../shared/hooks/useAuth";
import { getInitials } from "../../shared/utils/initialsName";

const NavbarComponent = ({ onOpenSidebar }: { onOpenSidebar: () => void }) => {
  const { auth } = useAuth();

  if (!auth) return null;

  const fullName = `${auth.firstname} ${auth.lastname}`;

  return (
    <header className="h-16 bg-white flex items-center  px-4 md:px-6">

      <button
        className="md:hidden"
        onClick={onOpenSidebar}
      >
        <Menu size={22} />
      </button>

      <div className="flex items-center gap-3 md:gap-4 ml-auto">

        {/* Profile */}
        {auth._id && (
          <NavLink
            to="/dashboard/profile"
            className="flex items-center gap-2 md:gap-3 px-2 md:px-4 py-2 rounded-lg text-sm text-blue-600 bg-blue-100 hover:bg-blue-200 transition"
          >
            {/* Avatar */}
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs md:text-sm font-semibold">
              {getInitials(auth.firstname, auth.lastname)}
            </div>

            <span className="md:hidden text-sm font-medium text-gray-700">
              {auth.firstname}
            </span>

            {/* 👇 Oculto en mobile */}
            <div className="hidden md:flex flex-col leading-tight">
              <span className="font-medium text-gray-800">
                {fullName}
              </span>
              <span className="text-xs text-gray-500">
                {auth.role === "SUPERADMIN"
                  ? "Super Administrador"
                  : "Administrador"}
              </span>
            </div>
          </NavLink>
        )}
      </div>
    </header>
  );
};

export default NavbarComponent;
