import {
  Building2,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../shared/hooks/useAuth";
import type { Role } from "../../shared/types/AuthProps";

type NavItem = {
  label: string;
  path: string;
  icon: React.ElementType;
  roles?: Role[];
};

const items: NavItem[] = [
  { label: "Inicio", path: "/dashboard", icon: LayoutDashboard },
  { label: "Usuarios", path: "/dashboard/users", icon: Users, roles: ["SUPERADMIN"] },
  { label: "Administradores", path: "/dashboard/admins", icon: ShieldCheck, roles: ["SUPERADMIN"] },
  { label: "Empresas", path: "/dashboard/companies", icon: Building2, roles: ["SUPERADMIN"] },
  { label: "Tableros", path: "/dashboard/boards", icon: Zap, roles: ["SUPERADMIN", "ADMIN", "USER"] },
  { label: "Documentos", path: "/dashboard/documents", icon: FileText },
];

interface SidebarComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarComponent = ({ isOpen, onClose }: SidebarComponentProps) => {
  const { auth } = useAuth();

  if (!auth) return null;

  const visibleItems = items.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(auth.role);
  });

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-50 h-dvh w-72 shrink-0 border-r border-slate-200 bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 px-5">
            <Link to={"/"} className="flex min-w-0 items-center gap-3">
              <img
                src="/voltguard.png"
                alt="Voltguard"
                className="size-12 shrink-0 object-contain"
              />

              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-slate-950">
                  Voltguard
                </h1>
                <p className="truncate text-xs text-slate-500">
                  Gestión eléctrica
                </p>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="rounded-xl p-2 transition hover:bg-slate-100 lg:hidden"
            >
              <X size={22} />
            </button>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {visibleItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/dashboard"}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex min-w-0 items-center gap-3 rounded-2xl px-4 py-3 transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] text-white shadow-lg"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      }`
                    }
                  >
                    <Icon size={21} className="shrink-0" />

                    <span className="truncate text-sm font-semibold">
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default SidebarComponent;