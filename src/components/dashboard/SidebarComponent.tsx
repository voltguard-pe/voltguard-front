import { NavLink } from "react-router-dom";
import {
  Home,
  BarChart2,
  Users,
  Settings,
  LogOut,
  Building2,
} from "lucide-react";
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

const SidebarComponent = () => {
  const { auth, handleLogout } = useAuth();

  if (!auth) return null;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
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
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition
                ${isActive
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
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default SidebarComponent;
