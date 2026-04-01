import {
  BarChart2,
  Building2,
  Home,
  LogOut,
  Users
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../shared/hooks/useAuth";
import type { Role } from "../../shared/types/AuthProps";

type NavItem = {
  label: string;
  path: string;
  icon: React.ElementType;
  roles?: Role[];
};

const navItems: NavItem[] = [
  {
    label: "Inicio",
    path: "/dashboard",
    icon: Home,
  },
  {
    label: "Usuarios",
    path: "/dashboard/users",
    icon: Users,
    roles: ["SUPERADMIN"], // 👈 solo admin
  },
  {
    label: "Empresas",
    path: "/dashboard/company",
    icon: Building2,
    roles: ["SUPERADMIN"], // 👈 solo admin
  },
  {
    label: "Tableros",
    path: "/dashboard/boards",
    icon: BarChart2,
    roles: ["SUPERADMIN", "ADMIN"],
  },
  // {
  //   label: "Configuración",
  //   path: "/dashboard/settings",
  //   icon: Settings,
  // },
];

interface SidebarComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarComponent = ({ isOpen, onClose }: SidebarComponentProps) => {
  const { auth, handleLogout } = useAuth();

  if (!auth) return null;

  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:static top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center">
          <NavLink to={"/"} className="text-xl font-bold text-blue-600">
            PanelQR
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems
            .filter(
              (item) =>
                !item.roles || item.roles.includes(auth?.role)
            )
            .map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/dashboard"}
                onClick={onClose} // 👈 cierra en mobile
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition
                  ${
                    isActive
                      ? "bg-indigo-100 text-indigo-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
        </nav>

        {/* Logout */}
        <div className="p-4">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarComponent;
