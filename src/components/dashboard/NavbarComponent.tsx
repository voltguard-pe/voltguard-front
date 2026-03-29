import { Bell, UserCircle } from "lucide-react";
import { NavLink } from 'react-router-dom';
import { useAuth } from "../../shared/hooks/useAuth";
import { getInitials } from "../../shared/utils/initialsName";

const NavbarComponent = () => {

  const { auth } = useAuth();

  if (!auth) return null; // ⛔ evita renders raros

  const fullName = `${auth.firstname} ${auth.lastname}`;

  return (
    <header className="h-16 bg-white flex items-center justify-end px-6">
      {/* <h1 className="text-lg font-semibold text-gray-700">
        Dashboard
      </h1> */}

      <div className="flex items-center gap-4">
        {/* <button className="relative">
          <Bell size={20} className="text-gray-500" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
        </button> */}

        {/* Profile (solo ADMIN) */}
        {auth._id && (
          <NavLink
            to="/dashboard/profile"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-blue-600 bg-blue-100 hover:bg-blue-200 transition"
          >
            <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-semibold">
              {getInitials(auth.firstname, auth.lastname)}
            </div>
            <div className="flex flex-col">
              <span className="font-medium">
                {fullName}
              </span>
              <span className="text-xs">
                {auth.role === "SUPERADMIN" ? "Super Administrador" : "Administrador"}
              </span>
            </div>
          </NavLink>
        )}
      </div>
    </header>
  );
};

export default NavbarComponent;
