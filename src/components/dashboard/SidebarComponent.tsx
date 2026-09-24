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
  Plus,
  MoreVertical,
  ExternalLink,
  Award,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/hooks/useAuth";
import { getCompanies } from "../../services/company.service";
import { publicGetCompanyBoards } from "../../services/board.service";
import { getDocumentsByCompany } from "../../services/document.service";
import type { CompanyResponseDTO } from "../../shared/types/CompanyProps";
import type { PublicCompanyBoardsItemDTO, DocumentResponseDTO } from "../../shared/types/BoardProps";
import { getCompanyPozosList } from "../../services/spat.service";
import { useSidebar } from "../../contexts/SidebarContext";

interface SidebarComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateBoardModal?: (companyCode: string) => void;
  onOpenCreateGroundingModal?: (companyCode: string) => void;
}

const SidebarComponent = ({
  isOpen,
  onClose,
  onOpenCreateBoardModal,
  onOpenCreateGroundingModal,
}: SidebarComponentProps) => {
  const { auth, handleLogout } = useAuth();
  const { refreshKey, lastUpdatedCompany } = useSidebar();
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
  // const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const SESSION_FOLDERS_KEY = "voltguard_sidebar_session_folders";
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_FOLDERS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Caché de recursos
  const [companyBoards, setCompanyBoards] = useState<Record<string, PublicCompanyBoardsItemDTO[]>>({});
  const [loadingBoards, setLoadingBoards] = useState<Record<string, boolean>>({});

  const [companyGrounding, setCompanyGrounding] = useState<Record<string, { code: string; name: string }[]>>({});
  const [loadingGrounding, setLoadingGrounding] = useState<Record<string, boolean>>({});

  const [companyDocuments, setCompanyDocuments] = useState<Record<string, DocumentResponseDTO[]>>({});
  const [loadingDocuments, setLoadingDocuments] = useState<Record<string, boolean>>({});

  const userCompanyPublicCode =
    typeof auth?.companyPublicCode === "string"
      ? auth.companyPublicCode
      : auth?.companyPublicCode?.publicCode ||
      (typeof auth?.company === "object" && auth?.company !== null
        ? (auth.company as any).publicCode
        : auth?.company);

  // Carga en paralelo todos los recursos de una empresa para disponer de los totales inmediatamente
const loadCompanyFullData = async (publicCode: string, force: boolean = false) => {
    if (!publicCode) return;

    // 1. Tableros
    if (force || !companyBoards[publicCode]) {
      setLoadingBoards((prev) => ({ ...prev, [publicCode]: true }));
      publicGetCompanyBoards(publicCode)
        .then((res) => {
          const list = res?.boards || [];
          setCompanyBoards((prev) => ({ ...prev, [publicCode]: list }));
        })
        .catch((err) => console.error("Error cargando tableros:", err))
        .finally(() => setLoadingBoards((prev) => ({ ...prev, [publicCode]: false })));
    }

    // 2. Pozos a Tierra (SPAT)
    if (force || !companyGrounding[publicCode]) {
      setLoadingGrounding((prev) => ({ ...prev, [publicCode]: true }));
      getCompanyPozosList(publicCode)
        .then((res) => {
          const list = (res?.data || []).map((p: any) => ({
            code: p.pozoCode,
            name: p.name || p.pozoCode,
          }));
          setCompanyGrounding((prev) => ({ ...prev, [publicCode]: list }));
        })
        .catch((err) => console.error("Error cargando SPAT:", err))
        .finally(() => setLoadingGrounding((prev) => ({ ...prev, [publicCode]: false })));
    }

    // 3. Documentos ITSE
    if (force || !companyDocuments[publicCode]) {
      setLoadingDocuments((prev) => ({ ...prev, [publicCode]: true }));
      getDocumentsByCompany(publicCode)
        .then((docs) => {
          setCompanyDocuments((prev) => ({ ...prev, [publicCode]: docs || [] }));
        })
        .catch((err) => console.error("Error cargando documentos:", err))
        .finally(() => setLoadingDocuments((prev) => ({ ...prev, [publicCode]: false })));
    }
  };

// ❌ ELIMINA cualquier: delete next[lastUpdatedCompany];
  // ✅ REEMPLÁZALO POR ESTO:
  useEffect(() => {
    if (refreshKey === 0) return;

    if (lastUpdatedCompany) {
      // Forzar recarga directa pasando true SIN borrar el estado anterior
      loadCompanyFullData(lastUpdatedCompany, true);
    } else {
      // Si no se pasó empresa específica, recargar las que estén abiertas
      Object.keys(expandedFolders).forEach((code) => {
        if (expandedFolders[code]) {
          loadCompanyFullData(code, true);
        }
      });
    }
  }, [refreshKey, lastUpdatedCompany]);

  useEffect(() => {
    const fetchCompaniesData = async () => {
      if (!auth) return;

      try {
        if (isSuperAdmin) {
          const data = await getCompanies();
          setCompanies(data);
        } else if (userCompanyPublicCode) {
          let userCompany: CompanyResponseDTO | null = null;
          try {
            const data = await getCompanies();
            userCompany = data.find((c) => c.publicCode === userCompanyPublicCode) || null;
          } catch {
            // Manejo fallback si no tiene permiso general
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
          // Cargar datos de la empresa asignada
          loadCompanyFullData(userCompanyPublicCode);
        }
      } catch (error) {
        console.error("Error cargando empresas:", error);
      }
    };

    fetchCompaniesData();
  }, [auth, userCompanyPublicCode, isSuperAdmin]);

  // ── AUTO-EXPANSIÓN REACTIVA BASADA EN LA URL ──
  // useEffect(() => {
  //   const path = location.pathname;
  //   const expansionUpdates: Record<string, boolean> = {};

  //   // A. Para SUPERADMIN: detecta la empresa presente en la URL
  //   companies.forEach((c) => {
  //     const code = c.publicCode;
  //     if (path.includes(code)) {
  //       expansionUpdates[code] = true; // Despliega la empresa raíz
  //       expansionUpdates[`${code}-boards`] = path.includes("/boards");
  //       expansionUpdates[`${code}-grounding`] = path.includes("/grounding");
  //       expansionUpdates[`${code}-documents`] = path.includes("/documents");

  //       loadCompanyFullData(code);
  //     }
  //   });

  //   // B. Para otros roles: mantiene desplegados los recursos de su empresa
  //   if (!isSuperAdmin && userCompanyPublicCode) {
  //     expansionUpdates[userCompanyPublicCode] = true;
  //     expansionUpdates[`${userCompanyPublicCode}-boards`] = true;
  //     expansionUpdates[`${userCompanyPublicCode}-grounding`] = path.includes("/grounding");
  //     expansionUpdates[`${userCompanyPublicCode}-documents`] = path.includes("/documents");
  //   }

  //   const timeoutId = window.setTimeout(() => {
  //     setExpandedFolders((prev) => ({ ...prev, ...expansionUpdates }));
  //   }, 0);

  //   return () => window.clearTimeout(timeoutId);
  // }, [location.pathname, companies, isSuperAdmin, userCompanyPublicCode]);

  useEffect(() => {
    const path = location.pathname;

    setExpandedFolders((prev) => {
      const next = { ...prev };

      // Si es Superadmin y la URL contiene una empresa, aseguramos que esa esté abierta
      companies.forEach((c) => {
        const code = c.publicCode;
        if (path.includes(code)) {
          next[code] = true;
          if (path.includes("/boards")) next[`${code}-boards`] = true;
          if (path.includes("/grounding")) next[`${code}-grounding`] = true;
          if (path.includes("/documents")) next[`${code}-documents`] = true;
        }

        // Si la carpeta de la empresa está marcada como abierta (por URL o por sesión), precargar sus datos
        if (next[code]) {
          loadCompanyFullData(code);
        }
      });

      // Si no es Superadmin, mantener siempre disponible la suya
      if (!isSuperAdmin && userCompanyPublicCode) {
        next[userCompanyPublicCode] = true;
        if (next[`${userCompanyPublicCode}-boards`] === undefined) {
          next[`${userCompanyPublicCode}-boards`] = true;
        }
        loadCompanyFullData(userCompanyPublicCode);
      }

      try {
        sessionStorage.setItem(SESSION_FOLDERS_KEY, JSON.stringify(next));
      } catch (e) {
        // silencioso
      }

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

  // const toggleFolder = (folderKey: string) => {
  //   setExpandedFolders((prev) => ({
  //     ...prev,
  //     [folderKey]: !prev[folderKey],
  //   }));
  // };

  const toggleFolder = (folderKey: string) => {
    setExpandedFolders((prev) => {
      const next = {
        ...prev,
        [folderKey]: !prev[folderKey],
      };
      try {
        sessionStorage.setItem(SESSION_FOLDERS_KEY, JSON.stringify(next));
      } catch (e) {
        console.error("Error guardando sesión de carpetas:", e);
      }
      return next;
    });
  };

  // Al desplegar una empresa en Superadmin, carga sus totales inmediatamente
  const handleToggleCompany = (publicCode: string) => {
    const nextState = !expandedFolders[publicCode];
    toggleFolder(publicCode);
    if (nextState) {
      loadCompanyFullData(publicCode);
    }
  };

  const handleOpenPdf = (cloudinaryUrl: string) => {
    if (!cloudinaryUrl) return;
    const cleanUrl = cloudinaryUrl.replace("/fl_attachment", "");
    window.open(cleanUrl, "_blank", "noopener,noreferrer");
  };

  if (!auth) return null;

  // Renderizador de los tres folders de recursos
  const renderResourceFolders = (company: CompanyResponseDTO, isNested: boolean) => {
    const isBoardsOpen = Boolean(expandedFolders[`${company.publicCode}-boards`]);
    const isGroundingOpen = Boolean(expandedFolders[`${company.publicCode}-grounding`]);
    const isDocsOpen = Boolean(expandedFolders[`${company.publicCode}-documents`]);

    const boards = companyBoards[company.publicCode] || [];
    const isLoadingBoards = loadingBoards[company.publicCode];

    const pozos = companyGrounding[company.publicCode] || [];
    const isLoadingGrounding = loadingGrounding[company.publicCode];

    const documents = companyDocuments[company.publicCode] || [];
    const isLoadingDocs = loadingDocuments[company.publicCode];

    return (
      <div className={`${isNested ? "ml-3 border-l border-slate-200 pl-2 my-1" : ""} space-y-1`}>
        {/* ⚡ TABLEROS */}
        <div>
          <div className="group flex items-center justify-between rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100">
            <button
              onClick={() => toggleFolder(`${company.publicCode}-boards`)}
              className="flex flex-1 items-center gap-2 cursor-pointer min-w-0 text-left"
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
              <span className="truncate text-xs font-semibold text-slate-700">Tableros</span>
              <span className="ml-auto mr-1 rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-500 font-mono">
                {isLoadingBoards ? "..." : boards.length}
              </span>
            </button>

            <button
              title="Crear Nuevo Tablero"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenCreateBoardModal) {
                  onOpenCreateBoardModal(company.publicCode);
                } else {
                  navigate(`/dashboard/boards/${company.publicCode}?action=new`);
                }
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-[#0797d5] hover:bg-white rounded transition-all cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>

          {isBoardsOpen && (
            <div className="ml-3 border-l border-slate-200 pl-2 my-0.5 space-y-0.5">
              {isSuperAdmin && (
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
                  <LayoutDashboard size={12} className="shrink-0 text-slate-400" />
                  <span className="truncate italic">Ver todos ({boards.length})</span>
                </NavLink>
              )}

              {isLoadingBoards ? (
                <p className="px-2 py-1 text-[10px] italic text-slate-400">Cargando...</p>
              ) : boards.length === 0 ? (
                <p className="px-2 py-1 text-[10px] italic text-slate-400">Sin tableros</p>
              ) : (
                boards.map((board) => (
                  <div
                    key={board.code}
                    className="group/item flex items-center justify-between rounded-md text-slate-600 hover:bg-slate-100"
                  >
                    <NavLink
                      to={`/dashboard/boards/${company.publicCode}/${board.code}`}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex flex-1 items-center gap-2 px-2 py-1 text-[11px] min-w-0 transition-colors cursor-pointer ${isActive ? "text-[#0797d5] font-bold" : "hover:text-slate-900"
                        }`
                      }
                    >
                      <Zap size={12} className="shrink-0 text-[#0797d5]" />
                      <span className="truncate">{board.boardCode || board.name}</span>
                    </NavLink>

                    <button
                      title="Opciones"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/boards/${company.publicCode}/${board.code}/edit`);
                      }}
                      className="opacity-0 group/item:opacity-100 p-0.5 mr-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <MoreVertical size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 🎯 SPAT */}
        <div>
          <div className="group flex items-center justify-between rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100">
            <button
              onClick={() => toggleFolder(`${company.publicCode}-grounding`)}
              className="flex flex-1 items-center gap-2 cursor-pointer min-w-0 text-left"
            >
              {isGroundingOpen ? (
                <ChevronDown size={13} className="shrink-0 text-slate-400" />
              ) : (
                <ChevronRight size={13} className="shrink-0 text-slate-400" />
              )}
              {isGroundingOpen ? (
                <FolderOpen size={15} className="shrink-0 text-emerald-500" />
              ) : (
                <Folder size={15} className="shrink-0 text-emerald-500" />
              )}
              <span className="truncate text-xs font-semibold text-slate-700">SPAT</span>
              <span className="ml-auto mr-1 rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-500 font-mono">
                {isLoadingGrounding ? "..." : pozos.length}
              </span>
            </button>

            <button
              title="Crear Pozo SPAT"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenCreateGroundingModal) {
                  onOpenCreateGroundingModal(company.publicCode);
                } else {
                  navigate(`/dashboard/companies/${company.publicCode}/grounding?action=new`);
                }
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-emerald-600 hover:bg-white rounded transition-all cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>

          {isGroundingOpen && (
            <div className="ml-3 border-l border-slate-200 pl-2 my-0.5 space-y-0.5">
              {isLoadingGrounding ? (
                <p className="px-2 py-1 text-[10px] italic text-slate-400">Cargando pozos...</p>
              ) : pozos.length === 0 ? (
                <p className="px-2 py-1 text-[10px] italic text-slate-400">Sin pozos registrados</p>
              ) : (
                pozos.map((pozo) => (
                  <NavLink
                    key={pozo.code}
                    to={`/dashboard/companies/${company.publicCode}/grounding/${pozo.code}`}
                    onClick={onClose}
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-md px-2 py-1 text-[11px] transition-colors cursor-pointer ${isActive
                        ? "text-emerald-600 font-bold bg-emerald-50"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`
                    }
                  >
                    <Activity size={12} className="shrink-0 text-emerald-500" />
                    <span className="truncate">{pozo.code}</span>
                  </NavLink>
                ))
              )}
            </div>
          )}
        </div>

        {/* 📄 DOCUMENTOS ITSE */}
        <div>
          <div className="group flex items-center justify-between rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100">
            <button
              onClick={() => toggleFolder(`${company.publicCode}-documents`)}
              className="flex flex-1 items-center gap-2 cursor-pointer min-w-0 text-left"
            >
              {isDocsOpen ? (
                <ChevronDown size={13} className="shrink-0 text-slate-400" />
              ) : (
                <ChevronRight size={13} className="shrink-0 text-slate-400" />
              )}
              {isDocsOpen ? (
                <FolderOpen size={15} className="shrink-0 text-amber-500" />
              ) : (
                <Folder size={15} className="shrink-0 text-amber-500" />
              )}
              <span className="truncate text-xs font-semibold text-slate-700">Documentos ITSE</span>
              <span className="ml-auto mr-1 rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-500 font-mono">
                {isLoadingDocs ? "..." : documents.length}
              </span>
            </button>

            <button
              title="Gestionar Documentos"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dashboard/documents?company=${company.publicCode}`);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-amber-600 hover:bg-white rounded transition-all cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>

          {isDocsOpen && (
            <div className="ml-3 border-l border-slate-200 pl-2 my-0.5 space-y-0.5">
              {isSuperAdmin && (
                <NavLink
                  to={`/dashboard/documents?company=${company.publicCode}`}
                  onClick={onClose}
                  end
                  className="flex items-center gap-2 rounded-md px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                >
                  <LayoutDashboard size={12} className="shrink-0 text-slate-400" />
                  <span className="truncate italic">Ver todos ({documents.length})</span>
                </NavLink>
              )}

              {isLoadingDocs ? (
                <p className="px-2 py-1 text-[10px] italic text-slate-400">Cargando documentos...</p>
              ) : documents.length === 0 ? (
                <p className="px-2 py-1 text-[10px] italic text-slate-400">Sin documentos subidos</p>
              ) : (
                documents.map((doc) => (
                  <button
                    key={doc._id}
                    onClick={() => handleOpenPdf(doc.cloudinaryUrl)}
                    title={`Abrir ${doc.title}`}
                    className="group/item flex w-full items-center justify-between rounded-md px-2 py-1 text-[11px] text-slate-600 hover:bg-amber-50/70 hover:text-amber-900 cursor-pointer text-left transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={12} className="shrink-0 text-amber-500" />
                      <span className="truncate">{doc.title}</span>
                    </div>
                    <ExternalLink size={11} className="shrink-0 opacity-0 group-hover/item:opacity-100 text-slate-400 transition-opacity" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>
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
        className={`fixed left-0 top-0 z-50 h-dvh w-72 shrink-0 border-r border-slate-200 bg-white transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) lg:sticky lg:top-0 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col justify-between">
          <div className="flex flex-col min-h-0 flex-1">
            {/* Header */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-5">
              <Link to={"/"} className="group flex min-w-0 items-center gap-3">
                <img
                  src="/voltguard.png"
                  alt="Voltguard"
                  className="size-9 shrink-0 object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-black tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-[#0797d5]">
                    Voltguard
                  </h1>
                </div>
              </Link>

              <button
                onClick={onClose}
                className="cursor-pointer rounded-xl p-1.5 text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navegación File Tree */}
            <nav className="min-h-0 flex-1 overflow-y-auto p-3 custom-scrollbar text-xs font-medium">
              <div className="space-y-1">
                <NavLink
                  to="/dashboard"
                  end
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all cursor-pointer ${isActive
                      ? "bg-slate-900 text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  <LayoutDashboard size={16} />
                  <span>Inicio</span>
                </NavLink>

                {isSuperAdmin && (
                  <>
                    <NavLink
                      to="/dashboard/users"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all cursor-pointer ${isActive
                          ? "bg-slate-900 text-white font-semibold shadow-xs"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`
                      }
                    >
                      <Users size={16} />
                      <span>Usuarios</span>
                    </NavLink>

                    <NavLink
                      to="/dashboard/admins"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all cursor-pointer ${isActive
                          ? "bg-slate-900 text-white font-semibold shadow-xs"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`
                      }
                    >
                      <ShieldCheck size={16} />
                      <span>Administradores</span>
                    </NavLink>

                    <NavLink
                      to="/dashboard/companies"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all cursor-pointer ${isActive
                          ? "bg-slate-900 text-white font-semibold shadow-xs"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`
                      }
                    >
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

                    // Vista para otros roles: Carpetas directas sin nivel raíz
                    if (!isSuperAdmin) {
                      return (
                        <div key={company.publicCode} className="select-none">
                          {renderResourceFolders(company, false)}
                        </div>
                      );
                    }

                    // Vista para SUPERADMIN: Mantiene el nodo raíz con el nombre de cada empresa
                    return (
                      <div key={company.publicCode} className="select-none">
                        <div className="group flex items-center justify-between rounded-xl px-2 py-1.5 hover:bg-slate-100">
                          <button
                            onClick={() => handleToggleCompany(company.publicCode)}
                            className="flex flex-1 items-center gap-2 text-slate-800 cursor-pointer text-left min-w-0"
                          >
                            {isCompanyOpen ? (
                              <ChevronDown size={14} className="shrink-0 text-slate-400" />
                            ) : (
                              <ChevronRight size={14} className="shrink-0 text-slate-400" />
                            )}
                            <Building2 size={15} className="shrink-0 text-slate-700" />
                            <span className="truncate text-xs font-bold text-slate-800">
                              {company.name}
                            </span>
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

          {/* Sección de Estándares / Normativas (Logos) */}
          {!isSuperAdmin && (
            <div className="border-t border-slate-100 p-3 bg-slate-50/40">
              <div className="flex items-center gap-1.5 mb-2 px-0.5">
                <Award size={13} className="text-[#0797d5]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Estándares Soportados
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {/* Logo IEEE */}
                <div
                  title="Estándares IEEE"
                  className="flex h-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white p-1 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/2/21/IEEE_logo.svg"
                    alt="IEEE"
                    className="h-4 max-w-full object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all"
                  />
                </div>

                {/* Logo CBEMA / ITIC */}
                <div
                  title="Curva CBEMA / ITIC"
                  className="flex h-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white px-1 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs"
                >
                  <span className="text-[10px] font-black tracking-tighter text-slate-500 hover:text-slate-800 transition-colors">
                    CBEMA
                  </span>
                </div>

                {/* Logo IEC */}
                <div
                  title="Normativa IEC"
                  className="flex h-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white p-1 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/d/d8/IEC_logo.svg"
                    alt="IEC"
                    className="h-4 max-w-full object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Menú de Perfil */}
          <div className="relative border-t border-slate-200 bg-slate-50/50 p-3" ref={dropdownRef}>
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={`
                flex w-full items-center gap-3 rounded-2xl border bg-white px-3 py-2 shadow-xs
                transition-all duration-300 cursor-pointer text-left
                ${isMenuOpen
                  ? "border-[#0797d5]/30 ring-4 ring-[#0797d5]/10"
                  : "border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-xs"
                }
              `}
            >
              <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0797d5] to-[#8ccf2f] text-xs font-bold text-white shrink-0">
                {initials}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-900 text-xs">
                  {firstname} {lastname}
                </p>
                <p className="truncate text-[10px] text-slate-500 font-medium">{role}</p>
              </div>

              <ChevronUp
                size={16}
                className={`text-slate-400 transition-transform duration-300 shrink-0 ${isMenuOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {isMenuOpen && (
              <div className="absolute left-3 right-3 bottom-[calc(100%+8px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl z-50">
                <div className="p-1">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/dashboard/profile");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <User2 size={15} />
                    <span>Mi Perfil</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
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