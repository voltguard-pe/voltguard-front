import { useEffect, useRef, useState } from "react";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText,
  Folder,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Users,
  X,
  Zap,
  Activity,
  User2,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/hooks/useAuth";
import { getCompanies } from "../../services/company.service";
import { publicGetCompanyBoards } from "../../services/board.service";
import type { CompanyResponseDTO } from "../../shared/types/CompanyProps";
import type { PublicCompanyBoardsItemDTO } from "../../shared/types/BoardProps";

interface SidebarComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarComponent = ({ isOpen, onClose }: SidebarComponentProps) => {
  const { auth, handleLogout } = useAuth();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const firstname = auth?.firstname || "Usuario";
  const lastname = auth?.lastname || "";
  const role = auth?.role || "USER";

  const initials = `${firstname.trim().charAt(0)}${lastname.trim().charAt(0)}`.toUpperCase() || "U";

  const profileRef = useRef<HTMLDivElement | null>(null);

  const [companies, setCompanies] = useState<CompanyResponseDTO[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Caché de tableros
  const [companyBoards, setCompanyBoards] = useState<Record<string, PublicCompanyBoardsItemDTO[]>>({});
  const [loadingBoards, setLoadingBoards] = useState<Record<string, boolean>>({});

  // Caché de Pozos a Tierra (SPAT)
  const [companyGrounding, setCompanyGrounding] = useState<Record<string, { code: string; name: string }[]>>({});
  const [loadingGrounding, setLoadingGrounding] = useState<Record<string, boolean>>({});

  // Extraer el código público de la empresa del usuario (maneja string o tipo objeto)
  // ✅ LECTURA ROBUSTA DEL CÓDIGO PÚBLICO DE LA EMPRESA:
  const userCompanyPublicCode =
    typeof auth?.companyPublicCode === "string"
      ? auth.companyPublicCode
      : auth?.companyPublicCode?.publicCode ||
      (typeof auth?.company === "object" && auth?.company !== null
        ? // cast to any to avoid TS 'never' when company has a broad type
        (auth.company as any).publicCode
        : auth?.company);

  // ✅ REEMPLAZAR ESTE EFFECT EN SidebarComponent.tsx:
  // ✅ CÓDIGO CORREGIDO DEL EFFECT DE EMPRESAS Y TABLEROS EN EL SIDEBAR:
  useEffect(() => {
    const fetchCompaniesData = async () => {
      if (!auth) return;

      try {
        if (auth.role === "SUPERADMIN") {
          const data = await getCompanies();
          setCompanies(data);
        } else if (userCompanyPublicCode) {
          let userCompany: CompanyResponseDTO | null = null;

          try {
            // Intentamos obtener las empresas disponibles
            const data = await getCompanies();
            userCompany = data.find((c) => c.publicCode === userCompanyPublicCode) || null;
          } catch (err) {
            console.warn("getCompanies() no autorizado para rol secundario, construyendo fallback...");
          }

          // Si la API restringió getCompanies, construimos un registro visual para el sidebar
          if (!userCompany) {
            userCompany = {
              _id: userCompanyPublicCode,
              // Safely derive a display name without relying on a non-existent companyName property
              name:
                (auth as any).companyName ||
                (auth.company && typeof auth.company !== "string" ? (auth.company as any).name : auth.company) ||
                "Mi Empresa",
              publicCode: userCompanyPublicCode,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }

          setCompanies([userCompany]);

          // 1. Desplegar automáticamente la carpeta de la empresa y la subcarpeta de tableros
          setExpandedFolders((prev) => ({
            ...prev,
            [userCompanyPublicCode]: true,
            [`${userCompanyPublicCode}-boards`]: true,
          }));

          // 2. Solicitar tableros usando el endpoint público libre de restricciones
          setLoadingBoards((prev) => ({ ...prev, [userCompanyPublicCode]: true }));
          const res = await publicGetCompanyBoards(userCompanyPublicCode);

          setCompanyBoards((prev) => ({
            ...prev,
            [userCompanyPublicCode]: res.boards || [],
          }));
        }
      } catch (error) {
        console.error("Error cargando datos en el sidebar:", error);
      } finally {
        if (userCompanyPublicCode) {
          setLoadingBoards((prev) => ({ ...prev, [userCompanyPublicCode]: false }));
        }
      }
    };

    fetchCompaniesData();
  }, [auth, userCompanyPublicCode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        // Handle click outside profile menu if needed
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFolder = (folderKey: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderKey]: !prev[folderKey],
    }));
  };

  const toggleBoardsSubfolder = async (publicCode: string) => {
    const key = `${publicCode}-boards`;
    const isCurrentlyOpen = !!expandedFolders[key];

    setExpandedFolders((prev) => ({
      ...prev,
      [key]: !isCurrentlyOpen,
    }));

    if (!isCurrentlyOpen && !companyBoards[publicCode]) {
      try {
        setLoadingBoards((prev) => ({ ...prev, [publicCode]: true }));
        const res = await publicGetCompanyBoards(publicCode);
        setCompanyBoards((prev) => ({
          ...prev,
          [publicCode]: res.boards || [],
        }));
      } catch (error) {
        console.error("Error cargando tableros de empresa:", publicCode, error);
        setCompanyBoards((prev) => ({ ...prev, [publicCode]: [] }));
      } finally {
        setLoadingBoards((prev) => ({ ...prev, [publicCode]: false }));
      }
    }
  };

  const toggleGroundingSubfolder = async (publicCode: string) => {
    const key = `${publicCode}-grounding`;
    const isCurrentlyOpen = !!expandedFolders[key];

    setExpandedFolders((prev) => ({
      ...prev,
      [key]: !isCurrentlyOpen,
    }));

    if (!isCurrentlyOpen && !companyGrounding[publicCode]) {
      try {
        setLoadingGrounding((prev) => ({ ...prev, [publicCode]: true }));

        const mockPozos = [
          { code: "SPAT-01", name: "Pozo #01 - Patio Principal" },
          { code: "SPAT-02", name: "Pozo #02 - Cuarto de Máquinas" },
          { code: "SPAT-03", name: "Pozo #03 - Subestación" },
        ];

        setCompanyGrounding((prev) => ({
          ...prev,
          [publicCode]: mockPozos,
        }));
      } catch (error) {
        console.error("Error cargando puestas a tierra:", publicCode, error);
        setCompanyGrounding((prev) => ({ ...prev, [publicCode]: [] }));
      } finally {
        setLoadingGrounding((prev) => ({ ...prev, [publicCode]: false }));
      }
    }
  };

  if (!auth) return null;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
      />

      <aside
        className={`fixed left-0 top-0 z-50 h-dvh w-72 shrink-0 border-r border-slate-200 bg-white transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) lg:sticky lg:top-0 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col justify-between">
          <div className="flex flex-col min-h-0 flex-1">
            {/* Header */}
            <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 px-5">
              <Link to={"/"} className="group flex min-w-0 items-center gap-3">
                <img
                  src="/voltguard.png"
                  alt="Voltguard"
                  className="size-11 shrink-0 object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-black tracking-tight text-slate-950 transition-colors duration-200 group-hover:text-[#0797d5]">
                    Voltguard
                  </h1>
                </div>
              </Link>

              <button
                onClick={onClose}
                className="cursor-pointer rounded-xl p-2 text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-950 lg:hidden"
              >
                <X size={20} />
              </button>
            </div>

            {/* Árbol de Navegación File Tree */}
            <nav className="min-h-0 flex-1 overflow-y-auto p-3 custom-scrollbar text-xs font-semibold">
              {/* Rutas Globales */}
              <div className="space-y-1">
                <NavLink
                  to="/dashboard"
                  end
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all cursor-pointer ${isActive
                      ? "bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] text-white shadow-md shadow-[#0797d5]/15"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`
                  }
                >
                  <LayoutDashboard size={17} />
                  <span>Inicio</span>
                </NavLink>

                {auth.role === "SUPERADMIN" && (
                  <>
                    <NavLink
                      to="/dashboard/users"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all cursor-pointer ${isActive
                          ? "bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] text-white shadow-md shadow-[#0797d5]/15"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                        }`
                      }
                    >
                      <Users size={17} />
                      <span>Usuarios</span>
                    </NavLink>

                    <NavLink
                      to="/dashboard/admins"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all cursor-pointer ${isActive
                          ? "bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] text-white shadow-md shadow-[#0797d5]/15"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                        }`
                      }
                    >
                      <ShieldCheck size={17} />
                      <span>Administradores</span>
                    </NavLink>

                    <NavLink
                      to="/dashboard/companies"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all cursor-pointer ${isActive
                          ? "bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] text-white shadow-md shadow-[#0797d5]/15"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                        }`
                      }
                    >
                      <Building2 size={17} />
                      <span>Empresas</span>
                    </NavLink>

                    <NavLink
                      to="/dashboard/documents"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all cursor-pointer ${isActive
                          ? "bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] text-white shadow-md shadow-[#0797d5]/15"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                        }`
                      }
                    >
                      <FileText size={17} />
                      <span>Documentos</span>
                    </NavLink>
                  </>
                )}
              </div>

              {/* Sección Empresas (Visible para todos los roles) */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Building2 size={15} />
                  <span>{auth.role === "SUPERADMIN" ? "Empresas" : "Empresa"}</span>
                </div>

                <div className="mt-1 space-y-1">
                  {companies.map((company) => {
                    const isCompanyOpen = Boolean(expandedFolders[company.publicCode]);
                    const isBoardsOpen = Boolean(expandedFolders[`${company.publicCode}-boards`]);
                    const isGroundingOpen = Boolean(expandedFolders[`${company.publicCode}-grounding`]);

                    const boards = companyBoards[company.publicCode] || [];
                    const isLoadingBoards = loadingBoards[company.publicCode];

                    const pozos = companyGrounding[company.publicCode] || [];
                    const isLoadingGrounding = loadingGrounding[company.publicCode];

                    return (
                      <div key={company.publicCode} className="select-none">
                        {/* Nivel 1: Carpeta Empresa */}
                        <button
                          onClick={() => toggleFolder(company.publicCode)}
                          className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          {isCompanyOpen ? (
                            <ChevronDown size={14} className="shrink-0 text-slate-400" />
                          ) : (
                            <ChevronRight size={14} className="shrink-0 text-slate-400" />
                          )}
                          {isCompanyOpen ? (
                            <FolderOpen size={16} className="shrink-0 text-amber-500" />
                          ) : (
                            <Folder size={16} className="shrink-0 text-amber-500" />
                          )}
                          <span className="truncate text-xs font-bold text-slate-800">
                            {company.name}
                          </span>
                        </button>

                        {/* Nivel 2: Subcarpetas */}
                        {isCompanyOpen && (
                          <div className="ml-3.5 border-l border-slate-200 pl-2 my-1 space-y-0.5">
                            {/* 📂 /Tableros */}
                            <div>
                              <button
                                onClick={() => toggleBoardsSubfolder(company.publicCode)}
                                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
                              >
                                {isBoardsOpen ? (
                                  <ChevronDown size={13} className="shrink-0 text-slate-400" />
                                ) : (
                                  <ChevronRight size={13} className="shrink-0 text-slate-400" />
                                )}
                                {isBoardsOpen ? (
                                  <FolderOpen size={15} className="shrink-0 text-[#0797d5]" />
                                ) : (
                                  <Folder size={15} className="shrink-0 text-[#0797d5]" />
                                )}
                                <span className="truncate text-[11px] font-semibold">
                                  Tableros
                                </span>
                              </button>

                              {isBoardsOpen && (
                                <div className="ml-3 border-l border-slate-200 pl-2 my-0.5 space-y-0.5">
                                  <NavLink
                                    to={`/dashboard/boards/${company.publicCode}`}
                                    onClick={onClose}
                                    end
                                    className={({ isActive }) =>
                                      `flex items-center gap-2 rounded-md px-2 py-1 text-[11px] transition-colors cursor-pointer ${isActive
                                        ? "bg-[#0797d5]/10 text-[#0797d5] font-bold"
                                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                      }`
                                    }
                                  >
                                    <Zap size={12} className="shrink-0 text-slate-400" />
                                    <span className="truncate italic">Ver todos los tableros</span>
                                  </NavLink>

                                  {isLoadingBoards ? (
                                    <p className="px-2 py-1 text-[10px] italic text-slate-400">
                                      Cargando tableros...
                                    </p>
                                  ) : boards.length === 0 ? (
                                    <p className="px-2 py-1 text-[10px] italic text-slate-400">
                                      Sin tableros registrados
                                    </p>
                                  ) : (
                                    boards.map((board) => (
                                      <NavLink
                                        key={board.code}
                                        to={`/dashboard/boards/${company.publicCode}/${board.code}`}
                                        onClick={onClose}
                                        className={({ isActive }) =>
                                          `flex items-center gap-2 rounded-md px-2 py-1 text-[11px] transition-colors cursor-pointer ${isActive
                                            ? "bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] text-white font-bold"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                          }`
                                        }
                                      >
                                        <Zap size={12} className="shrink-0" />
                                        <span className="truncate">
                                          {board.boardCode ? `${board.boardCode} - ` : ""}
                                          {board.name}
                                        </span>
                                      </NavLink>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>

                            {/* ⚡ /Puestas a tierra */}
                            <div>
                              <button
                                onClick={() => toggleGroundingSubfolder(company.publicCode)}
                                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
                              >
                                {isGroundingOpen ? (
                                  <ChevronDown size={13} className="shrink-0 text-slate-400" />
                                ) : (
                                  <ChevronRight size={13} className="shrink-0 text-slate-400" />
                                )}
                                {isGroundingOpen ? (
                                  <FolderOpen size={15} className="shrink-0 text-rose-500" />
                                ) : (
                                  <Folder size={15} className="shrink-0 text-rose-500" />
                                )}
                                <span className="truncate text-[11px] font-semibold">
                                  Puestas a tierra
                                </span>
                              </button>

                              {isGroundingOpen && (
                                <div className="ml-3 border-l border-slate-200 pl-2 my-0.5 space-y-0.5">
                                  <NavLink
                                    to={`/dashboard/companies/${company.publicCode}/grounding`}
                                    onClick={onClose}
                                    end
                                    className={({ isActive }) =>
                                      `flex items-center gap-2 rounded-md px-2 py-1 text-[11px] transition-colors cursor-pointer ${isActive
                                        ? "bg-[#0797d5]/10 text-[#0797d5] font-bold"
                                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                      }`
                                    }
                                  >
                                    <Activity size={12} className="shrink-0 text-slate-400" />
                                    <span className="truncate italic">Ver resumen SPAT</span>
                                  </NavLink>

                                  {isLoadingGrounding ? (
                                    <p className="px-2 py-1 text-[10px] italic text-slate-400">
                                      Cargando pozos...
                                    </p>
                                  ) : pozos.length === 0 ? (
                                    <p className="px-2 py-1 text-[10px] italic text-slate-400">
                                      Sin pozos registrados
                                    </p>
                                  ) : (
                                    pozos.map((pozo) => (
                                      <NavLink
                                        key={pozo.code}
                                        to={`/dashboard/companies/${company.publicCode}/grounding/${pozo.code}`}
                                        onClick={onClose}
                                        className={({ isActive }) =>
                                          `flex items-center gap-2 rounded-md px-2 py-1 text-[11px] transition-colors cursor-pointer ${isActive
                                            ? "bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] text-white font-bold"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                          }`
                                        }
                                      >
                                        <Activity size={12} className="shrink-0" />
                                        <span className="truncate">
                                          {pozo.code} - {pozo.name}
                                        </span>
                                      </NavLink>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </nav>
          </div>

          {/* MENÚ DE PERFIL INTEGRADO CON DROPDOWN Y FLECHA */}
          <div className="relative border-t border-slate-200 bg-slate-50/50 p-3" ref={dropdownRef}>
            {/* TRIGGER */}
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={`
                flex w-full items-center gap-3 rounded-2xl border bg-white px-3 py-2 shadow-xs
                transition-all duration-300 cursor-pointer text-left
                ${isMenuOpen
                  ? "border-[#0797d5]/30 ring-4 ring-[#0797d5]/10"
                  : "border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md"
                }
              `}
            >
              <div
                className="relative flex size-11 items-center justify-center rounded-2xl
                bg-gradient-to-br from-[#0797d5] to-[#8ccf2f]
                text-sm font-bold text-white shadow-xs overflow-hidden shrink-0"
              >
                {initials}
                {isMenuOpen && (
                  <span
                    className="absolute inset-0 rounded-2xl animate-ping
                    bg-white/20 opacity-75"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-950 text-xs">
                  {firstname} {lastname}
                </p>
                <div
                  className="mt-1 inline-flex rounded-full bg-[#8ccf2f]/15
                  px-2 py-0.5 text-[10px] font-semibold text-[#3aaa35]"
                >
                  {role}
                </div>
              </div>

              {/* FLECHA INDICADORA (ARROW) */}
              <ChevronUp
                size={16}
                className={`text-slate-400 transition-transform duration-300 shrink-0 ${isMenuOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* DROPDOWN */}
            <div
              className={`
                absolute left-3 right-3 bottom-[calc(100%+12px)] overflow-hidden
                rounded-3xl border border-slate-200 bg-white shadow-2xl
                transition-all duration-250 origin-bottom z-50
                ${isMenuOpen
                  ? "opacity-100 translate-y-0 scale-100"
                  : "pointer-events-none opacity-0 translate-y-3 scale-95"
                }
              `}
            >
              {/* HEADER DROPDOWN */}
              <div className="border-b border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-12 items-center justify-center rounded-2xl
                    bg-gradient-to-br from-[#0797d5] to-[#8ccf2f]
                    text-base font-bold text-white shadow-xs shrink-0"
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-950 text-xs">
                      {firstname} {lastname}
                    </p>
                    <div
                      className="mt-1 inline-flex rounded-full bg-[#8ccf2f]/15
                      px-2 py-0.5 text-[10px] font-semibold text-[#3aaa35]"
                    >
                      {role}
                    </div>
                  </div>
                </div>
              </div>

              {/* MENU ITEMS */}
              <div className="p-2">
                {[
                  {
                    icon: LayoutDashboard,
                    label: "Dashboard",
                    path: "/dashboard",
                    delay: "0ms",
                  },
                  {
                    icon: User2,
                    label: "Mi perfil",
                    path: "/dashboard/profile",
                    delay: "40ms",
                  },
                ].map(({ icon: Icon, label, path, delay }) => (
                  <button
                    key={path}
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate(path);
                    }}
                    style={{
                      opacity: isMenuOpen ? 1 : 0,
                      transform: isMenuOpen ? "translateX(0)" : "translateX(-8px)",
                      transition: `opacity 0.25s ease ${delay}, transform 0.25s ease ${delay}`,
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5
                      text-xs font-medium text-slate-700
                      hover:bg-slate-100 hover:text-slate-950
                      hover:pl-4 transition-all duration-200 group cursor-pointer"
                  >
                    <Icon
                      size={16}
                      className="text-slate-400 group-hover:text-[#0797d5] transition-colors duration-200"
                    />
                    {label}
                  </button>
                ))}

                <div className="my-1.5 border-t border-slate-100" />

                <button
                  onClick={handleLogout}
                  style={{
                    opacity: isMenuOpen ? 1 : 0,
                    transform: isMenuOpen ? "translateX(0)" : "translateX(-8px)",
                    transition: "opacity 0.25s ease 80ms, transform 0.25s ease 80ms",
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5
                    text-xs font-medium text-red-500
                    hover:bg-red-50 hover:text-red-600
                    hover:pl-4 transition-all duration-200 group cursor-pointer"
                >
                  <LogOut
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarComponent;