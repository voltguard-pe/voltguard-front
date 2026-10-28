import {
  Activity,
  BatteryCharging,
  Box,
  Building2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Cpu,
  FileCheck2,
  FileHeart,
  FileText,
  Folder,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  MoreVertical,
  Plus,
  Receipt,
  ShieldCheck,
  Sun,
  User2,
  Users,
  X,
  Zap,
  KeyRound,
  Sparkles,
  type LucideIcon
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../../contexts/SidebarContext";
import { publicGetCompanyBoards } from "../../services/board.service";
import { getCompanies } from "../../services/company.service";
import { getDocumentsByCompany } from "../../services/document.service";
import { getCompanyPozosList } from "../../services/spat.service";
import { useAuth } from "../../shared/hooks/useAuth";
import type { DocumentResponseDTO, PublicCompanyBoardsItemDTO } from "../../shared/types/BoardProps";
import type { CompanyResponseDTO } from "../../shared/types/CompanyProps";
import { solarThermographyService } from "../../services/solarThermography.service";

interface SidebarComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateBoardModal?: (companyCode: string) => void;
  onOpenCreateGroundingModal?: (companyCode: string) => void;
}

const SESSION_FOLDERS_KEY = "voltguard_sidebar_session_folders";

const STATIC_MODULES: {
  id: string;
  name: string;
  color: string;
  createTitle: string;
  newPath: (code: string) => string;
  viewPath: (code: string) => string;
  viewText: string;
  icon: LucideIcon;
  activeColor: string;
  hasExtraNewBtn?: boolean;
}[] = [
    { id: "billing", name: "Facturación", color: "text-amber-500", createTitle: "Subir Recibo de Luz", newPath: (c) => `/dashboard/companies/${c}/billing`, viewPath: (c) => `/dashboard/companies/${c}/billing`, viewText: "Recibo de Luz", icon: Receipt, activeColor: "text-amber-600 bg-amber-50" },
    { id: "medical-reports", name: "Reporte Médico", color: "text-rose-500", createTitle: "Nuevo Reporte Médico", newPath: (c) => `/dashboard/companies/${c}/medical-reports/new`, viewPath: (c) => `/dashboard/companies/${c}/medical-reports`, viewText: "Ver reportes médicos", icon: FileHeart, activeColor: "text-rose-600 bg-rose-50" },
    // { id: "solar-panels", name: "Paneles Solares", color: "text-amber-600", createTitle: "Nuevo Panel Solar", newPath: (c) => `/dashboard/companies/${c}/solar/new`, viewPath: (c) => `/dashboard/companies/${c}/solar`, viewText: "Instalaciones solares", icon: Sun, activeColor: "text-amber-600 bg-amber-50" },
    { id: "substations", name: "Subestación", color: "text-indigo-500", createTitle: "Nueva Subestación", newPath: (c) => `/dashboard/companies/${c}/substations/new`, viewPath: (c) => `/dashboard/companies/${c}/substations`, viewText: "Subestaciones", icon: Cpu, activeColor: "text-indigo-600 bg-indigo-50" },
    { id: "cells", name: "Celdas", color: "text-cyan-600", createTitle: "Nueva Celda", newPath: (c) => `/dashboard/companies/${c}/cells/new`, viewPath: (c) => `/dashboard/companies/${c}/cells`, viewText: "Celdas de media tensión", icon: Box, activeColor: "text-cyan-600 bg-cyan-50" },
    { id: "capacitor-banks", name: "Banco de Condensadores", color: "text-violet-500", createTitle: "Nuevo Banco de Condensadores", newPath: (c) => `/dashboard/companies/${c}/capacitors/new`, viewPath: (c) => `/dashboard/companies/${c}/capacitors`, viewText: "Bancos registrados", icon: FileCheck2, activeColor: "text-violet-600 bg-violet-50" },
    { id: "ups", name: "UPS", color: "text-teal-600", createTitle: "Nuevo Sistema UPS", newPath: (c) => `/dashboard/companies/${c}/ups/new`, viewPath: (c) => `/dashboard/companies/${c}/ups`, viewText: "Equipos UPS", icon: BatteryCharging, activeColor: "text-teal-600 bg-teal-50", hasExtraNewBtn: true },
  ];

const NORMATIVAS = [
  { title: "NFPA 70E", desc: "Seguridad eléctrica", tooltip: "Normativa NFPA 70E - Seguridad Eléctrica", logo: "/logos/nfpa-70e.png", fallback: "NFPA 70E", hover: "hover:border-amber-300 hover:bg-amber-50/40", accent: "text-amber-700" },
  { title: "NFPA 70B", desc: "Mantenimiento eléctrico", tooltip: "Normativa NFPA 70B - Mantenimiento Eléctrico", logo: "/logos/nfpa-70b.png", fallback: "NFPA 70B", hover: "hover:border-rose-300 hover:bg-rose-50/40", accent: "text-rose-700" },
  { title: "IEEE", desc: "Power Quality", tooltip: "Estándares IEEE - Power Quality", logo: "https://upload.wikimedia.org/wikipedia/commons/2/21/IEEE_logo.svg", fallback: "IEEE", hover: "hover:border-[#0797d5]/40 hover:bg-[#0797d5]/5", accent: "text-[#0797d5]" },
];

const URL_MODULE_KEYS: [string, string][] = [
  ["/boards", "boards"],
  ["/grounding", "grounding"],
  ["/documents", "documents"],
  ["/medical-reports", "medical-reports"],
  ["/solar", "solar-panels"],
  ["/substations", "substations"],
  ["/cells", "cells"],
  ["/capacitors", "capacitor-banks"],
  ["/ups", "ups"],
];

const navItemClass = (isActive: boolean) =>
  `flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all cursor-pointer focus:outline-none ${isActive ? "bg-slate-900 text-white font-semibold shadow-xs" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

const SidebarComponent = ({
  isOpen,
  onClose,
  onOpenCreateBoardModal,
  onOpenCreateGroundingModal,
}: SidebarComponentProps) => {
  const { auth, handleLogout } = useAuth();
  const { refreshKey, lastUpdatedCompanies } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const firstname = auth?.firstname || "Usuario";
  const lastname = auth?.lastname || "";
  const role = auth?.role || "USER";
  const isSuperAdmin = role === "SUPERADMIN";
  const initials = `${firstname.trim().charAt(0)}${lastname.trim().charAt(0)}`.toUpperCase() || "U";

  const [companies, setCompanies] = useState<CompanyResponseDTO[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_FOLDERS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [companyBoards, setCompanyBoards] = useState<Record<string, PublicCompanyBoardsItemDTO[]>>({});
  const [loadingBoards, setLoadingBoards] = useState<Record<string, boolean>>({});
  const [companyGrounding, setCompanyGrounding] = useState<Record<string, { code: string; name: string }[]>>({});
  const [loadingGrounding, setLoadingGrounding] = useState<Record<string, boolean>>({});
  const [companySolar, setCompanySolar] = useState<Record<string, { code: string; name: string }[]>>({});
  const [loadingSolar, setLoadingSolar] = useState<Record<string, boolean>>({});
  const [companyDocuments, setCompanyDocuments] = useState<Record<string, DocumentResponseDTO[]>>({});
  const [loadingDocuments, setLoadingDocuments] = useState<Record<string, boolean>>({});

  const userCompanyPublicCode =
    typeof auth?.companyPublicCode === "string"
      ? auth.companyPublicCode
      : auth?.companyPublicCode?.publicCode ||
      (typeof auth?.company === "object" && auth?.company !== null
        ? (auth.company as any).publicCode
        : auth?.company);

  const loadCompanyFullData = async (publicCode: string, force: boolean = false) => {
    if (!publicCode) return;

    if (force || !companyBoards[publicCode]) {
      setLoadingBoards((prev) => ({ ...prev, [publicCode]: true }));
      publicGetCompanyBoards(publicCode)
        .then((res) => setCompanyBoards((prev) => ({ ...prev, [publicCode]: res?.boards || [] })))
        .catch((err) => console.error("Error cargando tableros:", err))
        .finally(() => setLoadingBoards((prev) => ({ ...prev, [publicCode]: false })));
    }

    if (force || !companyGrounding[publicCode]) {
      setLoadingGrounding((prev) => ({ ...prev, [publicCode]: true }));
      getCompanyPozosList(publicCode)
        .then((res) => {
          const list = (res?.data || []).map((p: any) => ({ code: p.pozoCode, name: p.name || p.pozoCode }));
          setCompanyGrounding((prev) => ({ ...prev, [publicCode]: list }));
        })
        .catch((err) => console.error("Error cargando SPAT:", err))
        .finally(() => setLoadingGrounding((prev) => ({ ...prev, [publicCode]: false })));
    }

    if (force || !companySolar[publicCode]) {
      setLoadingSolar((prev) => ({ ...prev, [publicCode]: true }));
      solarThermographyService.getCompanySolarList(publicCode)
        .then((res: any) => {
          // res puede venir como { data: [...] } o [...] según tu servicio
          const rawList = Array.isArray(res) ? res : res?.data || [];
          const list = rawList.map((s: any) => ({
            code: s.solarCode || s.code || s._id,
          }));
          setCompanySolar((prev) => ({ ...prev, [publicCode]: list }));
        })
        .catch((err) => console.error("Error cargando Paneles Solares:", err))
        .finally(() => setLoadingSolar((prev) => ({ ...prev, [publicCode]: false })));
    }

    if (force || !companyDocuments[publicCode]) {
      setLoadingDocuments((prev) => ({ ...prev, [publicCode]: true }));
      getDocumentsByCompany(publicCode)
        .then((docs) => setCompanyDocuments((prev) => ({ ...prev, [publicCode]: docs || [] })))
        .catch((err) => console.error("Error cargando documentos:", err))
        .finally(() => setLoadingDocuments((prev) => ({ ...prev, [publicCode]: false })));
    }
  };

  useEffect(() => {
    if (refreshKey === 0) return;
    const targetCodes = lastUpdatedCompanies && lastUpdatedCompanies.length > 0
      ? lastUpdatedCompanies
      : Object.keys(expandedFolders).filter((k) => expandedFolders[k]);

    targetCodes.forEach((code) => loadCompanyFullData(code, true));
  }, [refreshKey, lastUpdatedCompanies]);

  useEffect(() => {
    const fetchCompaniesData = async () => {
      if (!auth) return;
      try {
        if (isSuperAdmin) {
          setCompanies(await getCompanies());
        } else if (userCompanyPublicCode) {
          let userCompany: CompanyResponseDTO | null = null;
          try {
            const data = await getCompanies();
            userCompany = data.find((c) => c.publicCode === userCompanyPublicCode) || null;
          } catch {
            // fallback
          }

          if (!userCompany) {
            userCompany = {
              _id: userCompanyPublicCode,
              name: (auth as any).companyName || "Mi Empresa",
              publicCode: userCompanyPublicCode,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
          setCompanies([userCompany]);
          loadCompanyFullData(userCompanyPublicCode);
        }
      } catch (error) {
        console.error("Error cargando empresas:", error);
      }
    };
    fetchCompaniesData();
  }, [auth, userCompanyPublicCode, isSuperAdmin]);

  useEffect(() => {
    const path = location.pathname;
    setExpandedFolders((prev) => {
      const next = { ...prev };

      companies.forEach((c) => {
        const code = c.publicCode;
        if (path.includes(code)) {
          next[code] = true;
          URL_MODULE_KEYS.forEach(([urlFragment, key]) => {
            if (path.includes(urlFragment)) next[`${code}-${key}`] = true;
          });
        }
        if (next[code]) loadCompanyFullData(code);
      });

      if (!isSuperAdmin && userCompanyPublicCode) {
        next[userCompanyPublicCode] = true;
        if (next[`${userCompanyPublicCode}-boards`] === undefined) {
          next[`${userCompanyPublicCode}-boards`] = true;
        }
        loadCompanyFullData(userCompanyPublicCode);
      }

      try {
        sessionStorage.setItem(SESSION_FOLDERS_KEY, JSON.stringify(next));
      } catch { }
      return next;
    });
  }, [location.pathname, companies, isSuperAdmin, userCompanyPublicCode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFolder = (folderKey: string) => {
    setExpandedFolders((prev) => {
      const next = { ...prev, [folderKey]: !prev[folderKey] };
      try {
        sessionStorage.setItem(SESSION_FOLDERS_KEY, JSON.stringify(next));
      } catch (e) {
        console.error("Error guardando sesión de carpetas:", e);
      }
      return next;
    });
  };

  const handleToggleCompany = (publicCode: string) => {
    const nextState = !expandedFolders[publicCode];
    toggleFolder(publicCode);
    if (nextState) loadCompanyFullData(publicCode);
  };

  if (!auth) return null;

  const renderResourceFolders = (company: CompanyResponseDTO, isNested: boolean) => {
    const code = company.publicCode;
    const boards = companyBoards[code] || [];
    const pozos = companyGrounding[code] || [];
    const solarInstallations = companySolar[code] || [];
    const documents = companyDocuments[code] || [];

    const moduleFolders = [
      {
        id: "boards",
        name: "Tableros Eléctricos",
        color: "text-[#0797d5]",
        count: boards.length,
        loading: loadingBoards[code],
        createTitle: "Crear Nuevo Tablero",
        onCreate: () => onOpenCreateBoardModal ? onOpenCreateBoardModal(code) : navigate(`/dashboard/boards/${code}?action=new`),
        children: (
          <div className="ml-3 border-l border-slate-200 pl-2 my-0.5 space-y-0.5">
            {isSuperAdmin && (
              <NavLink
                to={`/dashboard/boards/${code}`}
                onClick={onClose}
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-2 py-1 text-[11px] transition-colors cursor-pointer focus:outline-none ${isActive ? "bg-[#0797d5]/10 text-[#0797d5] font-bold" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <LayoutDashboard size={12} className="shrink-0 text-slate-400" />
                <span className="truncate italic">Ver todos ({boards.length})</span>
              </NavLink>
            )}
            {loadingBoards[code] ? (
              <p className="px-2 py-1 text-[10px] italic text-slate-400">Cargando...</p>
            ) : boards.length === 0 ? (
              <p className="px-2 py-1 text-[10px] italic text-slate-400">Sin tableros</p>
            ) : (
              boards.map((b) => (
                <div key={b.code} className="group/item flex items-center justify-between rounded-md text-slate-600 hover:bg-slate-100">
                  <NavLink
                    to={`/dashboard/boards/${code}/${b.code}`}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex flex-1 items-center gap-2 px-2 py-1 text-[11px] min-w-0 transition-colors cursor-pointer focus:outline-none ${isActive ? "text-[#0797d5] font-bold" : "hover:text-slate-900"
                      }`
                    }
                  >
                    <Zap size={12} className="shrink-0 text-[#0797d5]" />
                    <span className="truncate">{b.boardCode || b.name}</span>
                  </NavLink>
                  <button
                    title="Opciones"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/boards/${code}/${b.code}/edit`);
                    }}
                    className="opacity-0 group/item:opacity-100 p-0.5 mr-1 text-slate-400 hover:text-slate-700 cursor-pointer focus:outline-none"
                  >
                    <MoreVertical size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        ),
      },
      {
        id: "grounding",
        name: "Puesta a Tierra",
        color: "text-emerald-500",
        count: pozos.length,
        loading: loadingGrounding[code],
        createTitle: "Crear Pozo SPAT",
        onCreate: () => onOpenCreateGroundingModal ? onOpenCreateGroundingModal(code) : navigate(`/dashboard/companies/${code}/grounding?action=new`),
        children: (
          <div className="ml-3 border-l border-slate-200 pl-2 my-0.5 space-y-0.5">
            {loadingGrounding[code] ? (
              <p className="px-2 py-1 text-[10px] italic text-slate-400">Cargando pozos...</p>
            ) : pozos.length === 0 ? (
              <p className="px-2 py-1 text-[10px] italic text-slate-400">Sin pozos registrados</p>
            ) : (
              pozos.map((p) => (
                <NavLink
                  key={p.code}
                  to={`/dashboard/companies/${code}/grounding/${p.code}`}
                  onClick={onClose}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-md px-2 py-1 text-[11px] transition-colors cursor-pointer focus:outline-none ${isActive ? "text-emerald-600 font-bold bg-emerald-50" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  <Activity size={12} className="shrink-0 text-emerald-500" />
                  <span className="truncate">{p.code}</span>
                </NavLink>
              ))
            )}
          </div>
        ),
      },
      {
        id: "solar",
        name: "Paneles Solares",
        color: "text-amber-500",
        count: solarInstallations.length,
        loading: loadingSolar[code],
        createTitle: "Nueva Inspección Solar",
        onCreate: () => navigate(`/dashboard/companies/${code}/solar/new`),
        children: (
          <div className="ml-3 border-l border-slate-200 pl-2 my-0.5 space-y-0.5">
            {loadingSolar[code] ? (
              <p className="px-2 py-1 text-[10px] italic text-slate-400">Cargando instalaciones...</p>
            ) : solarInstallations.length === 0 ? (
              <p className="px-2 py-1 text-[10px] italic text-slate-400">Sin auditorías registradas</p>
            ) : (
              solarInstallations.map((item) => (
                <NavLink
                  key={item.code}
                  to={`/dashboard/companies/${code}/solar/${item.code}`}
                  onClick={onClose}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-md px-2 py-1 text-[11px] transition-colors cursor-pointer ${isActive ? "text-amber-600 font-bold bg-amber-50" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  <Sun size={12} className="shrink-0 text-amber-500" />
                  <span className="truncate">{item.code}</span>
                </NavLink>
              ))
            )}
          </div>
        ),
      },
      {
        id: "documents",
        name: "Documentos ITSE",
        color: "text-amber-500",
        count: documents.length,
        loading: loadingDocuments[code],
        createTitle: "Gestionar Documentos",
        onCreate: () => navigate(`/dashboard/documents?company=${code}`),
        children: (
          <div className="ml-3 border-l border-slate-200 pl-2 my-0.5 space-y-0.5">
            {isSuperAdmin && (
              <NavLink
                to={`/dashboard/documents?company=${code}`}
                onClick={onClose}
                end
                className="flex items-center gap-2 rounded-md px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer focus:outline-none"
              >
                <LayoutDashboard size={12} className="shrink-0 text-slate-400" />
                <span className="truncate italic">Ver todos ({documents.length})</span>
              </NavLink>
            )}
            {loadingDocuments[code] ? (
              <p className="px-2 py-1 text-[10px] italic text-slate-400">Cargando documentos...</p>
            ) : documents.length === 0 ? (
              <p className="px-2 py-1 text-[10px] italic text-slate-400">Sin documentos subidos</p>
            ) : (
              documents.map((d) => (
                <NavLink
                  key={d._id}
                  to={`/dashboard/documents/view/${d._id}`}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-md px-2 py-1 text-[11px] transition-colors cursor-pointer focus:outline-none ${isActive ? "text-amber-600 font-bold bg-amber-50" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  <FileText size={12} className="shrink-0 text-amber-500" />
                  <span className="truncate">{d.title}</span>
                </NavLink>
              ))
            )}
          </div>
        ),
      },
      ...STATIC_MODULES.map((m) => {
        const IconComponent = m.icon;
        return {
          id: m.id,
          name: m.name,
          color: m.color,
          count: 0,
          loading: false,
          createTitle: m.createTitle,
          onCreate: () => navigate(m.newPath(code)),
          children: (
            <div className="ml-3 border-l border-slate-200 pl-2 my-0.5 space-y-0.5">
              <NavLink
                to={m.viewPath(code)}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-2 py-1 text-[11px] transition-colors cursor-pointer focus:outline-none ${isActive ? `${m.activeColor} font-bold` : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <IconComponent size={12} className={`shrink-0 ${m.color}`} />
                <span className="truncate">{m.viewText}</span>
              </NavLink>
              {m.hasExtraNewBtn && (
                <NavLink
                  to={m.newPath(code)}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-md px-2 py-1 text-[11px] transition-colors cursor-pointer focus:outline-none ${isActive ? "bg-teal-50 text-teal-700 font-bold" : "text-slate-500 hover:bg-slate-100 italic"
                    }`
                  }
                >
                  <Plus size={12} className="shrink-0 text-slate-400" />
                  <span className="truncate">Agregar equipo UPS</span>
                </NavLink>
              )}
            </div>
          ),
        };
      }),
    ];

    return (
      <div className={`${isNested ? "ml-3 border-l border-slate-200 pl-2 my-1" : ""} space-y-1`}>
        {moduleFolders.map((folder) => {
          const folderKey = `${code}-${folder.id}`;
          const isOpen = Boolean(expandedFolders[folderKey]);

          return (
            <div key={folder.id}>
              <div className="group flex items-center justify-between rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100">
                <button
                  onClick={() => toggleFolder(folderKey)}
                  className="flex flex-1 items-center gap-2 cursor-pointer min-w-0 text-left focus:outline-none"
                >
                  {isOpen ? <ChevronDown size={13} className="shrink-0 text-slate-400" /> : <ChevronRight size={13} className="shrink-0 text-slate-400" />}
                  {isOpen ? <FolderOpen size={15} className={`shrink-0 ${folder.color}`} /> : <Folder size={15} className={`shrink-0 ${folder.color}`} />}
                  <span className="truncate text-xs font-semibold text-slate-700">{folder.name}</span>
                  <span className="ml-auto mr-1 rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-500 font-mono">
                    {folder.loading ? "..." : folder.count}
                  </span>
                </button>

                <button
                  title={folder.createTitle}
                  onClick={(e) => {
                    e.stopPropagation();
                    folder.onCreate();
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:${folder.color} hover:bg-white rounded transition-all cursor-pointer focus:outline-none`}
                >
                  <Plus size={14} />
                </button>
              </div>
              {isOpen && folder.children}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
      />

      <aside
        style={{ minWidth: 0 }}
        className={`fixed left-0 top-0 z-50 h-dvh w-72 shrink-0 border-r border-slate-200 bg-white transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) lg:sticky lg:top-0 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          } [&_*]:focus:outline-none [&_path]:focus:outline-none [&_rect]:focus:outline-none focus:outline-none`}
      >
        <div className="flex h-full flex-col justify-between" style={{ minWidth: 0 }}>
          <div className="flex flex-col min-h-0 flex-1">
            {/* Header */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-5 [&_*]:focus:outline-none [&_path]:focus:outline-none [&_rect]:focus:outline-none">
              <Link to="/" className="group flex min-w-0 items-center gap-3 focus:outline-none" style={{ minWidth: 0 }}>
                <img
                  src="/voltguard.png"
                  alt="Voltguard"
                  className="size-9 shrink-0 object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <h1 className="truncate text-lg font-black tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-[#0797d5]">
                  VoltGuard
                </h1>
              </Link>
              <button
                onClick={onClose}
                className="cursor-pointer rounded-xl p-1.5 text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-800 lg:hidden focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navegación File Tree */}
            <nav className="min-h-0 flex-1 overflow-y-auto p-3 custom-scrollbar text-xs font-medium [&_*]:focus:outline-none [&_path]:focus:outline-none [&_rect]:focus:outline-none" style={{ minWidth: 0 }}>
              <div className="space-y-1" style={{ minWidth: 0 }}>
                <NavLink to="/dashboard" end onClick={onClose} className={({ isActive }) => navItemClass(isActive)}>
                  <LayoutDashboard size={16} />
                  <span>Inicio</span>
                </NavLink>

                {!isSuperAdmin && (
                  <NavLink
                    to="/dashboard/subscription"
                    onClick={onClose}
                    className={({ isActive }) => navItemClass(isActive)}
                  >
                    <Sparkles size={16} className="text-[#0797d5]" />
                    <span>Mi Suscripción</span>
                  </NavLink>
                )}

                {isSuperAdmin && (
                  <>
                    <NavLink to="/dashboard/users" onClick={onClose} className={({ isActive }) => navItemClass(isActive)}>
                      <Users size={16} />
                      <span>Usuarios</span>
                    </NavLink>
                    <NavLink to="/dashboard/admins" onClick={onClose} className={({ isActive }) => navItemClass(isActive)}>
                      <ShieldCheck size={16} />
                      <span>Administradores</span>
                    </NavLink>
                    <NavLink
                      to="/dashboard/permissions"
                      onClick={onClose}
                      className={({ isActive }) => navItemClass(isActive)}
                    >
                      <KeyRound size={16} />
                      <span>Roles y Permisos</span>
                    </NavLink>
                    <NavLink
                      to="/dashboard/licenses"
                      onClick={onClose}
                      className={({ isActive }) => navItemClass(isActive)}
                    >
                      <KeyRound size={16} />
                      <span>Emisión de Licencias</span>
                    </NavLink>
                    <NavLink to="/dashboard/companies" onClick={onClose} className={({ isActive }) => navItemClass(isActive)}>
                      <Building2 size={16} />
                      <span>Empresas</span>
                    </NavLink>
                  </>
                )}
              </div>

              {/* Sección Estructura / Empresas */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span>{isSuperAdmin ? "Empresas" : "Estructura"}</span>
                </div>

                <div className="mt-1 space-y-1">
                  {companies.map((company) => {
                    const isCompanyOpen = Boolean(expandedFolders[company.publicCode]);

                    if (!isSuperAdmin) {
                      return (
                        <div key={company.publicCode} className="select-none">
                          {renderResourceFolders(company, false)}
                        </div>
                      );
                    }

                    return (
                      <div key={company.publicCode} className="select-none">
                        <div className="group flex items-center justify-between rounded-xl px-2 py-1.5 hover:bg-slate-100">
                          <button
                            onClick={() => handleToggleCompany(company.publicCode)}
                            className="flex flex-1 items-center gap-2 text-slate-800 cursor-pointer text-left min-w-0 focus:outline-none"
                          >
                            {isCompanyOpen ? <ChevronDown size={14} className="shrink-0 text-slate-400" /> : <ChevronRight size={14} className="shrink-0 text-slate-400" />}
                            <Building2 size={15} className="shrink-0 text-slate-700" />
                            <span className="truncate text-xs font-bold text-slate-800">{company.name}</span>
                          </button>
                        </div>
                        {isCompanyOpen && renderResourceFolders(company, true)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </nav>
          </div>

          {/* Normativas */}
          {!isSuperAdmin && (
            <div className="mx-2.5 my-2 rounded-xl border border-slate-200/80 bg-slate-50/50 p-2">
              <div className="mb-1.5 flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-[#0797d5]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Normativas</span>
                </div>
                <span className="text-[9px] font-medium text-slate-400">Estándares aplicados</span>
              </div>

              <ul className="space-y-1">
                {NORMATIVAS.map((n) => (
                  <li
                    key={n.title}
                    title={n.tooltip}
                    className={`flex items-center gap-2.5 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 transition-all duration-150 cursor-default select-none shadow-2xs ${n.hover}`}
                  >
                    <div className="relative flex h-6 w-14 shrink-0 items-center justify-center rounded bg-slate-50/80 px-1">
                      <img
                        src={n.logo}
                        alt={n.title}
                        className="max-h-5 max-w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                      <span className={`hidden whitespace-nowrap text-[10px] font-black leading-none text-center ${n.accent}`}>
                        {n.fallback}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium text-slate-700 leading-tight">{n.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Menú de Perfil */}
          <div className="relative border-t border-slate-200 bg-slate-50/50 p-3" ref={dropdownRef}>
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={`flex w-full items-center gap-3 rounded-2xl border bg-white px-3 py-2 shadow-xs transition-all duration-300 cursor-pointer text-left focus:outline-none ${isMenuOpen ? "border-[#0797d5]/30 ring-4 ring-[#0797d5]/10" : "border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-xs"
                }`}
            >
              <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0797d5] to-[#8ccf2f] text-xs font-bold text-white shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-900 text-xs">{firstname} {lastname}</p>
                <p className="truncate text-[10px] text-slate-500 font-medium">{role}</p>
              </div>
              <ChevronUp size={16} className={`text-slate-400 transition-transform duration-300 shrink-0 ${isMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {isMenuOpen && (
              <div className="absolute left-3 right-3 bottom-[calc(100%+8px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl z-50">
                <div className="p-1">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/dashboard/profile");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer focus:outline-none"
                  >
                    <User2 size={15} />
                    <span>Mi Perfil</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 cursor-pointer focus:outline-none"
                  >
                    <LogOut size={15} />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarComponent;