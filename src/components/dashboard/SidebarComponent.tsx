import { useEffect, useState } from "react";
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
  { label: "Documentos", path: "/dashboard/documents", icon: FileText, roles: ["SUPERADMIN"] },
];

interface SidebarComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarComponent = ({ isOpen, onClose }: SidebarComponentProps) => {
  const { auth } = useAuth();
  const [animateItems, setAnimateItems] = useState(false);

  // Disparar la entrada rápida en cascada de los elementos al montar el componente
  useEffect(() => {
    const t = setTimeout(() => setAnimateItems(true), 40);
    return () => clearTimeout(t);
  }, []);

  if (!auth) return null;

  const visibleItems = items.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(auth.role);
  });

  return (
    <>
      {/* Fondo oscuro móvil con transición suavizada */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Contenedor principal Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-dvh w-72 shrink-0 border-r border-slate-200 bg-white transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) lg:sticky lg:top-0 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          
          {/* Header del Sidebar */}
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 px-5">
            <Link to={"/"} className="group flex min-w-0 items-center gap-3">
              <img
                src="/voltguard.png"
                alt="Voltguard"
                className="size-11 shrink-0 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="min-w-0">
                <h1 className="truncate text-xl font-black text-slate-950 tracking-tight transition-colors duration-200 group-hover:text-[#0797d5]">
                  Voltguard
                </h1>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-950 lg:hidden cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navegación y Links */}
          <nav className="min-h-0 flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="space-y-1.5">
              {visibleItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/dashboard"}
                    onClick={onClose}
                    style={{
                      opacity: animateItems ? 1 : 0,
                      transform: animateItems ? "translateX(0)" : "translateX(-12px)",
                      transition: `opacity 0.35s ease ${index * 40}ms, transform 0.35s ease ${index * 40}ms`,
                    }}
                    className={({ isActive }) =>
                      `flex min-w-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold relative overflow-hidden group transition-all duration-200 cursor-pointer
                      ${
                        isActive
                          ? "text-white shadow-md shadow-[#0797d5]/15"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 hover:pl-5"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Capa de fondo para el gradiente activo (Permite transición suave) */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] transition-opacity duration-300 -z-10 ${
                            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-0"
                          }`}
                        />

                        {/* Icono animado al hacer hover */}
                        <Icon 
                          size={19} 
                          className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                            isActive ? "text-white" : "text-slate-400 group-hover:text-[#0797d5]"
                          }`} 
                        />

                        <span className="truncate">
                          {item.label}
                        </span>
                      </>
                    )}
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