import { ChevronDown, LogOut, Menu, User } from "lucide-react";
import { NavLink } from 'react-router-dom';
import { useAuth } from "../../shared/hooks/useAuth";
import { getInitials } from "../../shared/utils/initialsName";
import { useEffect, useRef, useState } from "react";

const NavbarComponent = ({ onOpenSidebar }: { onOpenSidebar: () => void }) => {
  const { auth, handleLogout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fullName = `${auth?.firstname} ${auth?.lastname}`;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true); // 👈 importante

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

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
        {auth?._id ? (
          <div className="relative" ref={dropdownRef}>

            {/* Botón avatar */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 md:gap-3 px-2 md:px-4 py-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 transition"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs md:text-sm font-semibold">
                {getInitials(auth.firstname, auth.lastname)}
              </div>

              {/* Mobile */}
              <span className="md:hidden text-sm font-medium text-gray-700">
                {auth.firstname}
              </span>

              {/* Desktop */}
              <div className="hidden md:flex flex-col leading-tight text-left">
                <span className="font-medium text-gray-800">
                  {fullName}
                </span>
                <span className="text-xs text-gray-500">
                  {auth.role === "SUPERADMIN"
                    ? "Super Administrador"
                    : auth.role === "ADMIN"
                      ? "Administrador"
                      : "Usuario"}
                </span>
              </div>
              <ChevronDown size={16} />
            </button>

            {/* Dropdown */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-md py-2 z-50">

                <NavLink
                  to="/dashboard/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User size={16} />
                  Perfil
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>

              </div>
            )}
          </div>
        ) : (
          <>
            <NavLink
              to="/public/boards"
              className="hidden sm:inline-block text-blue-600 px-3 md:px-4 py-2 rounded-lg text-sm hover:bg-blue-100 transition"
            >
              Explorar
            </NavLink>

            <NavLink
              to="/auth"
              className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
            >
              Iniciar sesión
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
};

export default NavbarComponent;
