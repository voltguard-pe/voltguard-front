import {
  ChevronDown,
  LogOut,
  Menu,
  UserCircle
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/hooks/useAuth";

type NavbarComponentProps = {
  onOpenSidebar: () => void;
};

const NavbarComponent = ({ onOpenSidebar }: NavbarComponentProps) => {
  const { auth, handleLogout } = useAuth();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 h-20 shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-full min-w-0 items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-slate-950 md:text-2xl">
              Dashboard
            </h2>

            <p className="hidden truncate text-sm text-slate-500 sm:block">
              Sistema de gestión de tableros eléctricos
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 transition hover:bg-slate-50"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] text-white">
                <UserCircle size={21} />
              </div>

              <div className="hidden min-w-0 text-left md:block">
                <p className="max-w-36 truncate text-sm font-semibold text-slate-950">
                  {auth?.firstname || "Usuario"}
                </p>

                <p className="text-xs text-slate-500">
                  {auth?.role || "Sin rol"}
                </p>
              </div>

              <ChevronDown
                size={17}
                className={`hidden text-slate-400 transition md:block ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 p-4">
                  <p className="text-sm font-bold text-slate-950">
                    {auth?.firstname || "Usuario"} {auth?.lastname || ""}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {auth?.email || "Sin correo"}
                  </p>

                  <span className="mt-3 inline-flex rounded-full bg-[#0797d5]/10 px-3 py-1 text-xs font-semibold text-[#0797d5]">
                    {auth?.role || "Sin rol"}
                  </span>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/dashboard/profile");
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    <UserCircle size={18} />
                    Mi perfil
                  </button>

                  {/* <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/dashboard/settings");
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    <Settings size={18} />
                    Configuración
                  </button> */}

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavbarComponent;