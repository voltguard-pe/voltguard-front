// src/pages/dashboard/PermissionsView.tsx
import {
    Building2,
    Check,
    KeyRound,
    Layers,
    RotateCcw,
    Save,
    Search,
    Unlock,
    UserCheck
} from "lucide-react";
import { useState } from "react";

// ── Tipos y Configuraciones ──
const MODULES = [
  { id: "boards", name: "Tableros Eléctricos", desc: "Monitoreo, creación y mantenimiento de tableros" },
  { id: "grounding", name: "Puesta a Tierra (SPAT)", desc: "Gestión técnica y mediciones de pozos a tierra" },
  { id: "documents", name: "Documentos ITSE", desc: "Subida y consulta de informes de inspección técnica" },
  { id: "billing", name: "Facturación y Recibos", desc: "Gestión de recibos de luz y costos energéticos" },
  { id: "medical-reports", name: "Reportes Médicos", desc: "Certificados de salud y aptitud de operarios" },
  { id: "substations", name: "Subestaciones y Celdas", desc: "Configuraciones de media y alta tensión" },
  { id: "solar", name: "Paneles Solares", desc: "Instalaciones fotovoltaicas registradas" },
];

const ACTIONS = [
  { id: "read", label: "Lectura" },
  { id: "write", label: "Crear / Editar" },
  { id: "delete", label: "Eliminar" },
] as const;

type ActionKey = (typeof ACTIONS)[number]["id"];
type ModulePermissions = Record<ActionKey, boolean>;
type RolePermissionsMap = Record<string, Record<string, ModulePermissions>>;

// Roles disponibles en la plataforma
const ROLES = [
  { id: "WORKER", name: "Trabajador / Cuadrilla", desc: "Personal técnico de campo o mantenimiento operativo", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "AUDITOR", name: "Auditor / Inspector", desc: "Revisores de cumplimiento técnico y normativas ITSE", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "COMPANY_ADMIN", name: "Admin de Empresa", desc: "Administrador general de la cuenta de cliente", badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
];

const MOCK_WORKERS = [
  { id: "w-1", name: "Carlos Mendoza", email: "carlos.m@empresa.com", companyName: "Industrial Norte SAC", role: "WORKER" },
  { id: "w-2", name: "Ana Lucía Torres", email: "atorres@minera.pe", companyName: "Consorcio Minero", role: "WORKER" },
  { id: "w-3", name: "Roberto Gómez", email: "rgomez@redes.com", companyName: "Servicios Eléctricos Sur", role: "WORKER" },
  { id: "w-4", name: "Elena Vargas", email: "evargas@inspector.pe", companyName: "Certificadora Global", role: "AUDITOR" },
];

export const PermissionsView = () => {
  // Pestaña activa: "roles" o "users"
  const [activeTab, setActiveTab] = useState<"roles" | "users">("roles");

  // Selección activa
  const [selectedRole, setSelectedRole] = useState<string>("WORKER");
  const [selectedUserId, setSelectedUserId] = useState<string>(MOCK_WORKERS[0].id);
  const [userSearch, setUserSearch] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // 1. Matriz de permisos globales por ROL
  const [rolePermissions, setRolePermissions] = useState<RolePermissionsMap>({
    WORKER: {
      boards: { read: true, write: true, delete: false },
      grounding: { read: true, write: true, delete: false },
      documents: { read: true, write: false, delete: false },
      billing: { read: false, write: false, delete: false },
      "medical-reports": { read: false, write: false, delete: false },
      substations: { read: true, write: false, delete: false },
      solar: { read: true, write: true, delete: false },
    },
    AUDITOR: {
      boards: { read: true, write: false, delete: false },
      grounding: { read: true, write: false, delete: false },
      documents: { read: true, write: true, delete: false },
    },
    COMPANY_ADMIN: {
      boards: { read: true, write: true, delete: true },
      grounding: { read: true, write: true, delete: true },
      documents: { read: true, write: true, delete: true },
      billing: { read: true, write: true, delete: true },
    },
  });

  // 2. Excepciones puntuales por usuario
  const [userCustomPermissions, setUserCustomPermissions] = useState<RolePermissionsMap>({});

  const currentTargetId = activeTab === "roles" ? selectedRole : selectedUserId;
  const currentPermsSource = activeTab === "roles" ? rolePermissions : userCustomPermissions;
  const currentPerms = currentPermsSource[currentTargetId] || {};

  const togglePermission = (moduleId: string, action: ActionKey) => {
    const updateState = activeTab === "roles" ? setRolePermissions : setUserCustomPermissions;

    updateState((prev) => {
      const targetPrev = prev[currentTargetId] || {};
      const modulePrev = targetPrev[moduleId] || { read: false, write: false, delete: false };

      return {
        ...prev,
        [currentTargetId]: {
          ...targetPrev,
          [moduleId]: {
            ...modulePrev,
            [action]: !modulePrev[action],
          },
        },
      };
    });
    setSavedSuccess(false);
  };

  const toggleFullModule = (moduleId: string) => {
    const isFull = ACTIONS.every((a) => currentPerms[moduleId]?.[a.id]);
    const updateState = activeTab === "roles" ? setRolePermissions : setUserCustomPermissions;

    updateState((prev) => ({
      ...prev,
      [currentTargetId]: {
        ...(prev[currentTargetId] || {}),
        [moduleId]: { read: !isFull, write: !isFull, delete: !isFull },
      },
    }));
    setSavedSuccess(false);
  };

  const grantAll = () => {
    const updateState = activeTab === "roles" ? setRolePermissions : setUserCustomPermissions;
    const all: Record<string, ModulePermissions> = {};
    MODULES.forEach((m) => {
      all[m.id] = { read: true, write: true, delete: true };
    });
    updateState((prev) => ({ ...prev, [currentTargetId]: all }));
  };

  const resetAll = () => {
    const updateState = activeTab === "roles" ? setRolePermissions : setUserCustomPermissions;
    updateState((prev) => ({ ...prev, [currentTargetId]: {} }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredWorkers = MOCK_WORKERS.filter(
    (w) =>
      w.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      w.companyName.toLowerCase().includes(userSearch.toLowerCase()) ||
      w.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8 animate-fade-in">
      
      {/* ── Header Estilizado con Gradiente ── */}
      <div className="sticky top-0 z-20 rounded-2xl border border-slate-200/80 bg-white/90 shadow-md backdrop-blur-md">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] p-4 px-6 text-white">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 to-transparent" />
          
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm shadow-sm">
                <KeyRound size={22} />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight md:text-xl">Control de Accesos y Roles</h1>
                <p className="text-xs font-medium text-white/90">Configura qué acciones tiene permitidas cada rol o miembro</p>
              </div>
            </div>

            {/* Botón Guardar */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold text-white transition-all shadow-md cursor-pointer ${
                savedSuccess ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/10" : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/20"
              } disabled:opacity-50`}
            >
              {savedSuccess ? <Check size={16} /> : <Save size={16} />}
              <span>{isSaving ? "Guardando..." : savedSuccess ? "Permisos actualizados" : "Guardar Cambios"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200/60 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab("roles")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "roles" ? "bg-white text-[#0797d5] shadow-sm font-bold" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Layers size={15} />
          <span>Configuración por Roles (Recomendado)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "users" ? "bg-white text-[#0797d5] shadow-sm font-bold" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <UserCheck size={15} />
          <span>Excepciones por Usuario</span>
        </button>
      </div>

      {/* ── Cuerpo Principal Grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Columna Izquierda: Selección */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-4 flex flex-col h-[650px]">
          {activeTab === "roles" ? (
            <div className="space-y-3">
              <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Selecciona un Rol
              </p>
              {ROLES.map((role) => {
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full rounded-2xl p-4 text-left transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-gradient-to-r from-[#0797d5] to-[#0680b5] text-white border-transparent shadow-md shadow-[#0797d5]/25"
                        : "bg-white border-slate-200/80 hover:border-[#0797d5]/40 hover:bg-[#0797d5]/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-800"}`}>
                        {role.name}
                      </p>
                      <span
                        className={`text-[9px] font-mono px-2.5 py-0.5 rounded-lg border ${
                          isSelected ? "bg-white/25 text-white border-white/20" : role.badge
                        }`}
                      >
                        {role.id}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1.5 leading-relaxed ${isSelected ? "text-white/90" : "text-slate-500"}`}>
                      {role.desc}
                    </p>
                  </button>
                );
              })}

              <div className="mt-4 rounded-2xl border border-[#0797d5]/20 bg-[#0797d5]/5 p-4 text-[11px] text-slate-700 leading-relaxed">
                <p className="font-bold text-[#0797d5] mb-1 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-[#0797d5]" />
                  Nota importante:
                </p>
                Todos los usuarios con este rol asignado heredarán automáticamente estos permisos en tiempo real.
              </div>
            </div>
          ) : (
            <>
              {/* Buscador de Usuarios */}
              <div className="relative mb-3.5">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, correo o rol..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-3 text-xs outline-none focus:border-[#0797d5] focus:ring-2 focus:ring-[#0797d5]/10 focus:bg-white font-medium text-slate-800 transition-all"
                />
              </div>

              <div className="space-y-2 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                {filteredWorkers.map((u) => {
                  const isSelected = selectedUserId === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedUserId(u.id)}
                      className={`w-full rounded-2xl p-3.5 text-left transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-gradient-to-r from-[#0797d5] to-[#0680b5] text-white border-transparent shadow-md shadow-[#0797d5]/25"
                          : "hover:bg-[#0797d5]/5 border-slate-200/80 hover:border-[#0797d5]/30 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-slate-800"}`}>
                          {u.name}
                        </p>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md ${isSelected ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"}`}>
                          {u.role}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isSelected ? "text-white/80" : "text-slate-500"}`}>
                        {u.email}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 text-[10px]">
                        <Building2 size={11} className={isSelected ? "text-white/80" : "text-[#0797d5]"} />
                        <span className={`truncate ${isSelected ? "text-white/90" : "text-slate-600 font-medium"}`}>
                          {u.companyName}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Columna Derecha: Matriz de Permisos */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-8 flex flex-col h-[650px]">
          
          {/* Header del target activo */}
          <div className="mb-4 flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800">
                  {activeTab === "roles"
                    ? `Permisos para el Rol: ${selectedRole}`
                    : `Excepción para: ${MOCK_WORKERS.find((w) => w.id === selectedUserId)?.name}`}
                </h2>
                <span className="rounded-full bg-[#0797d5]/10 px-3 py-0.5 text-[10px] font-bold text-[#0797d5]">
                  {activeTab === "roles" ? "Aplica a todos" : "Personalizado"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {activeTab === "roles"
                  ? "Define las acciones permitidas por defecto a cualquier cuenta con este perfil."
                  : "Sobrescribe la configuración del rol solo para esta persona."}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={grantAll}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#0797d5] hover:text-[#0680b5] cursor-pointer bg-[#0797d5]/5 hover:bg-[#0797d5]/10 px-3 py-2 rounded-xl transition-all"
              >
                <Unlock size={13} />
                <span>Marcar todo</span>
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-rose-600 cursor-pointer bg-slate-50 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all"
              >
                <RotateCcw size={13} />
                <span>Desmarcar todo</span>
              </button>
            </div>
          </div>

          {/* Lista de Módulos */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {MODULES.map((module) => {
              const moduleState = currentPerms[module.id] || { read: false, write: false, delete: false };
              const isFull = ACTIONS.every((a) => moduleState[a.id]);

              return (
                <div
                  key={module.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 sm:flex-row sm:items-center sm:justify-between transition-all hover:border-[#0797d5]/30 hover:bg-white hover:shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <p className="text-xs font-bold text-slate-800">{module.name}</p>
                      <button
                        type="button"
                        onClick={() => toggleFullModule(module.id)}
                        className={`cursor-pointer rounded-lg px-2.5 py-1 text-[10px] font-bold border transition-all ${
                          isFull
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-2xs"
                            : "bg-white border-slate-200 text-slate-500 hover:border-[#0797d5]/40 hover:text-[#0797d5]"
                        }`}
                      >
                        {isFull ? "Acceso Total" : "Dar todo"}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{module.desc}</p>
                  </div>

                  {/* Acciones: Lectura, Crear/Editar, Eliminar */}
                  <div className="flex items-center gap-2 shrink-0">
                    {ACTIONS.map((action) => {
                      const isActive = Boolean(moduleState[action.id]);
                      return (
                        <button
                          key={action.id}
                          type="button"
                          onClick={() => togglePermission(module.id, action.id)}
                          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold border transition-all cursor-pointer ${
                            isActive
                              ? "bg-[#0797d5] border-[#0797d5] text-white shadow-sm shadow-[#0797d5]/20"
                              : "bg-white border-slate-200 text-slate-600 hover:border-[#0797d5]/40 hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className={`size-3.5 rounded-md flex items-center justify-center border transition-all ${
                              isActive ? "bg-white border-white text-[#0797d5]" : "border-slate-300 bg-slate-50"
                            }`}
                          >
                            {isActive && <Check size={11} strokeWidth={3} />}
                          </div>
                          <span>{action.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsView;