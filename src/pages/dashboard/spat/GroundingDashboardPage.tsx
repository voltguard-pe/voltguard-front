import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  FileDown,
  ImageIcon,
  Layers,
  Loader2,
  Maximize2,
  RotateCcw,
  ShieldAlert,
  UploadCloud,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../shared/hooks/useAuth";
import { getCompanies } from "../../../services/company.service";
import {
  getCompanyPozosList,
  getPozoDetails,
  type SpatPozoItem,
} from "../../../services/spat.service";
import { ImportSpatZipModal } from "../../../components/dashboard/modals/ImportSpatZipModal";
import type { CompanyResponseDTO } from "../../../shared/types/CompanyProps";
import { generateSpatPDF } from "../../../shared/utils/generateSpatPDF";
import { useSidebar } from "../../../contexts/SidebarContext";

const GroundingDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { triggerRefresh } = useSidebar();
  const { publicCode, pozoCode } = useParams<{ publicCode: string; pozoCode: string }>();

  // Empresas
  const [companies, setCompanies] = useState<CompanyResponseDTO[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyResponseDTO | null>(null);

  // Pozos y detalle
  const [pozosList, setPozosList] = useState<SpatPozoItem[]>([]);
  const [selectedPozoCode, setSelectedPozoCode] = useState<string>("");
  const [spatRecord, setSpatRecord] = useState<SpatPozoItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Modal
  const [showZipModal, setShowZipModal] = useState<boolean>(false);

  // Estados para el visor interactivo tipo Google Drive
  const [activePreview, setActivePreview] = useState<{
    url: string;
    title: string;
    reading?: string;
  } | null>(null);

  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Referencias para interacción
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const touchDistanceRef = useRef<number | null>(null);

  const resetZoom = () => {
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
    touchDistanceRef.current = null;
  };

  // Bloqueo de scroll global, tecla Escape y Zoom nativo no pasivo
  useEffect(() => {
    if (!activePreview) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActivePreview(null);
        resetZoom();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const container = imageContainerRef.current;
    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY < 0 ? 0.2 : -0.2;
      setZoomScale((prev) => Math.min(Math.max(0.5, prev + delta), 4));
    };

    if (container) {
      container.addEventListener("wheel", handleNativeWheel, { passive: false });
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (container) {
        container.removeEventListener("wheel", handleNativeWheel);
      }
    };
  }, [activePreview]);

  // Gestos táctiles en móvil (1 dedo = Pan, 2 dedos = Pinch to Zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistanceRef.current = dist;
    } else if (e.touches.length === 1 && zoomScale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panPosition.x,
        y: e.touches[0].clientY - panPosition.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / touchDistanceRef.current;
      setZoomScale((prev) => Math.min(Math.max(0.5, prev * ratio), 4));
      touchDistanceRef.current = currentDist;
    } else if (e.touches.length === 1 && isDragging && zoomScale > 1) {
      setPanPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistanceRef.current = null;
  };

  const effectivePublicCode =
    auth?.role === "ADMIN"
      ? typeof auth.companyPublicCode === "string"
        ? auth.companyPublicCode
        : auth.companyPublicCode?.publicCode
      : publicCode || selectedCompany?.publicCode;

  // 1. Cargar catálogo de empresas
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getCompanies();
        setCompanies(data);

        if (publicCode) {
          const found = data.find((c) => c.publicCode === publicCode) || null;
          setSelectedCompany(found);
        } else if (data.length > 0 && !selectedCompany) {
          setSelectedCompany(data[0]);
        }
      } catch (error) {
        console.error("Error al cargar catálogo de empresas:", error);
      }
    };

    if (auth?.role === "SUPERADMIN") {
      fetchCompanies();
    }
  }, [auth, publicCode]);

  // 2. Cargar pozos
  const loadPozos = async () => {
    if (!effectivePublicCode) {
      setPozosList([]);
      setSelectedPozoCode("");
      setSpatRecord(null);
      return;
    }

    try {
      const res = await getCompanyPozosList(effectivePublicCode);
      const data = res?.data || [];
      setPozosList(data);

      if (data.length > 0) {
        const targetPozo =
          pozoCode && data.some((p: SpatPozoItem) => p.pozoCode === pozoCode)
            ? pozoCode
            : data[0].pozoCode;

        setSelectedPozoCode(targetPozo);
      } else {
        setSelectedPozoCode("");
        setSpatRecord(null);
      }
    } catch (err) {
      console.error("Error listando pozos a tierra:", err);
      setPozosList([]);
      setSpatRecord(null);
    }
  };

  useEffect(() => {
    if (pozoCode) {
      setSelectedPozoCode(pozoCode);
    }
  }, [pozoCode]);

  useEffect(() => {
    loadPozos();
  }, [effectivePublicCode]);

  // 3. Cargar detalle del pozo seleccionado
  useEffect(() => {
    if (!effectivePublicCode || !selectedPozoCode) {
      setSpatRecord(null);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await getPozoDetails(effectivePublicCode, selectedPozoCode);
        setSpatRecord(res?.data || null);
      } catch (err) {
        console.error("Error al consultar pozo:", err);
        setSpatRecord(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [effectivePublicCode, selectedPozoCode]);

  const measurements = spatRecord?.measurements || [];
  const latestMeasurement = measurements.length > 0 ? measurements[measurements.length - 1] : null;

  const calculateRates = () => {
    if (!measurements || measurements.length < 2) {
      return {
        tasaResistencia: "Sin histórico suficiente",
        tasaFuga: "Sin histórico suficiente",
        tasaDiametro: "Sin histórico suficiente",
        tasaPh: "Sin histórico suficiente",
      };
    }
    try {
      const first = measurements[0];
      const last = measurements[measurements.length - 1];

      const firstYear = parseInt(first?.año) || 0;
      const lastYear = parseInt(last?.año) || 0;
      const diffYears = Math.max(1, lastYear - firstYear);

      const rInit = Number(first?.resistencia) || 1;
      const rFin = Number(last?.resistencia) || 0;
      const varR = (((rFin - rInit) / rInit) * 100) / diffYears;

      const fInit = Number(first?.fuga) || 1;
      const fFin = Number(last?.fuga) || 0;
      const varF = (((fFin - fInit) / fInit) * 100) / diffYears;

      const dInit = Number(first?.diametro) || 16;
      const dFin = Number(last?.diametro) || 16;
      const varD = (dFin - dInit) / diffYears;

      const phInit = Number(first?.ph) || 7;
      const phFin = Number(last?.ph) || 7;
      const varPh = (phFin - phInit) / diffYears;

      return {
        tasaResistencia: `${varR >= 0 ? "+" : ""}${isNaN(varR) ? "0.0" : varR.toFixed(1)} %/año`,
        tasaFuga: `${varF >= 0 ? "+" : ""}${isNaN(varF) ? "0.0" : varF.toFixed(1)} %/año`,
        tasaDiametro: `${isNaN(varD) ? "0.00" : varD.toFixed(2)} mm/año`,
        tasaPh: `${isNaN(varPh) ? "0.00" : varPh.toFixed(2)} /año`,
      };
    } catch {
      return {
        tasaResistencia: "Sin histórico",
        tasaFuga: "Sin histórico",
        tasaDiametro: "Sin histórico",
        tasaPh: "Sin histórico",
      };
    }
  };

  const rates = calculateRates();

  const handleExportPDF = () => {
    if (!spatRecord || !latestMeasurement) return;

    generateSpatPDF({
      certificateCode: spatRecord.certificateCode || "GES-SPAT-CERT-2026-0038",
      revision: "00",
      measurementDate: `${latestMeasurement.año}`,
      issueDate: new Date().toLocaleDateString("es-PE"),
      validityDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString("es-PE"),
      globalResult: latestMeasurement.resistencia <= 5.0 ? "CONFORME · Protocolo IEEE 81" : "OBSERVADO",

      resistanceValue: latestMeasurement.resistencia,
      resistanceLimit: 5.0,
      leakageCurrent: latestMeasurement.fuga,
      leakageLimit: 5.0,
      rodDiameter: latestMeasurement.diametro,
      rodNominal: 16.0,
      healthIndex: latestMeasurement.resistencia <= 5.0 ? 75 : 50,
      healthStatus: latestMeasurement.resistencia <= 5.0 ? "Conforme" : "Observado",

      clientData: {
        businessName: selectedCompany?.name || "CLIENTE PRINCIPAL",
        ruc: "20XXXXXXXXX",
        facility: spatRecord.location || "Sede Principal",
        address: "Instalación Operativa",
        coordinates: "11°58'42.6\"S · 76°53'11.4\"W",
        spatId: `${spatRecord.pozoCode} (Placa de identificación instalada)`,
        systemFunction: "Puesta a tierra de protección",
        configuration: "Electrodo vertical + tratamiento electrolítico",
        electrode: `Varilla Cu puro Ø ${latestMeasurement.diametro} mm × 2.40 m`,
        conductor: "Cu desnudo 25 mm²",
        connectionType: "Conector mecánico tipo AB",
        registerBox: "Concreto Ø 0.30 m",
        installationDate: "Servicio Activo",
        totalSpats: `${pozosList.length} pozos registrados`,
      },

      historicalYears: measurements.map((m) => m.año),
      resistanceHistory: measurements.map((m) => m.resistencia),
      leakageHistory: measurements.map((m) => m.fuga),
      rodHistory: measurements.map((m) => m.diametro),
      phHistory: measurements.map((m) => m.ph),
    });
  };

  return (
    <section className="space-y-6 font-sans pb-16 overflow-x-hidden">
      {/* Cabecera Principal Adaptable */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-3 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
          >
            <ArrowLeft size={15} /> Volver
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight break-words">
              Sistema de Puestas a Tierra (SPAT)
            </h1>
            {selectedCompany && (
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-700 truncate max-w-full">
                {selectedCompany.name}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Monitoreo técnico multianual de pozos a tierra, electrodos y pH del terreno según IEEE 81.
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowZipModal(true)}
            className="inline-flex justify-center items-center gap-2 rounded-2xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <UploadCloud size={16} /> Importar Lote SPAT (.zip)
          </button>

          <button
            type="button"
            disabled={!latestMeasurement}
            onClick={handleExportPDF}
            className="inline-flex justify-center items-center gap-2 rounded-2xl bg-[#0797d5] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0684ba] shadow-sm transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <FileDown size={16} /> Exportar Certificado SPAT
          </button>
        </div>
      </div>

      {/* Selector de Empresa para SUPERADMIN */}
      {auth?.role === "SUPERADMIN" && !publicCode && companies.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 shrink-0">Filtrar por empresa:</span>
          <select
            value={selectedCompany?.publicCode || ""}
            onChange={(e) => {
              const comp = companies.find((c) => c.publicCode === e.target.value) || null;
              setSelectedCompany(comp);
            }}
            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer truncate"
          >
            {companies.map((c) => (
              <option key={c.publicCode} value={c.publicCode}>
                {c.name} ({c.publicCode})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selector de Pozo Activo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <Layers size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pozo Activo</p>
            <p className="text-sm sm:text-base font-black text-slate-950 truncate">
              {selectedPozoCode ? `${selectedPozoCode} - ${spatRecord?.location || "Malla General"}` : "Sin pozos registrados"}
            </p>
          </div>
        </div>

        {pozosList.length > 0 && (
          <select
            value={selectedPozoCode}
            onChange={(e) => {
              const newPozo = e.target.value;
              setSelectedPozoCode(newPozo);
              navigate(`/dashboard/companies/${effectivePublicCode}/grounding/${newPozo}`);
            }}
            className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer truncate"
          >
            {pozosList.map((p) => (
              <option key={p.pozoCode} value={p.pozoCode}>
                {p.pozoCode} - {p.location || "Sede"}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Visualización de Gráficas y Fotos */}
      {loading ? (
        <div className="py-20 text-center text-xs font-bold text-slate-400">
          <Loader2 className="animate-spin inline-block mr-2" size={18} /> Cargando mediciones anuales del pozo...
        </div>
      ) : !spatRecord || measurements.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-8 sm:p-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 mb-3">
            <ShieldAlert size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Sin mediciones registradas para esta empresa
          </h3>
          <p className="mt-1 max-w-md text-xs text-slate-500">
            Utiliza el botón <strong>"Importar Lote SPAT (.zip)"</strong> para registrar las fotografías de las mediciones de cada año.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-6">
          {/* Cabecera del Historial */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-4">
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                Historial de Mediciones Plurianuales
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Puntos registrados: {measurements.map((m) => m.año).join(", ")}
              </p>
            </div>
            <span className="self-start sm:self-auto text-[11px] sm:text-xs font-mono font-bold text-slate-600 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200 shrink-0">
              Certificado: {spatRecord.certificateCode}
            </span>
          </div>

          {/* Grilla de Gráficos (2 columnas en desktop, 1 en mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Resistencia PAT */}
            <div className="rounded-2xl border border-slate-100 p-4 bg-white shadow-xs">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Resistencia de puesta a tierra (Ω)</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Criterio ≤ 5.00 Ω &nbsp;·&nbsp; {rates.tasaResistencia}
                  </p>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${(latestMeasurement?.resistencia ?? 0) <= 5.0 ? "bg-amber-600 text-white" : "bg-rose-600 text-white"
                  }`}>
                  {(Number(latestMeasurement?.resistencia) || 0) <= 5.0 ? "VIGILANCIA" : "CRÍTICO"}
                </span>
              </div>

              <div className="h-56 w-full min-w-0 min-h-[224px]">
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                  <LineChart data={measurements} margin={{ top: 25, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="año" tickLine={false} stroke="#94a3b8" tick={{ fontSize: "11px", fill: "#64748b" }} />
                    <YAxis domain={["auto", "auto"]} tickLine={false} stroke="#94a3b8" tick={{ fontSize: "11px" }} />
                    <Tooltip formatter={(val: any) => [`${val} Ω`, "Resistencia"]} />
                    <ReferenceLine y={5.0} stroke="#dc2626" strokeDasharray="4 4" strokeWidth={1.5}>
                      <Label value="Criterio 5.00 Ω" position="insideTopRight" fill="#dc2626" style={{ fontSize: "10px", fontWeight: "700" }} />
                    </ReferenceLine>
                    <Line type="monotone" dataKey="resistencia" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: "#2563eb" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Corriente de Fuga */}
            <div className="rounded-2xl border border-slate-100 p-4 bg-white shadow-xs">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Corriente de fuga (mA)</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Criterio ≤ 5.00 mA &nbsp;·&nbsp; {rates.tasaFuga}
                  </p>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${(latestMeasurement?.fuga ?? 0) <= 5.0 ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                  }`}>
                  {(Number(latestMeasurement?.fuga) || 0) <= 5.0 ? "NORMAL" : "ALERTA"}
                </span>
              </div>

              <div className="h-56 w-full min-w-0 min-h-[224px]">
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                  <LineChart data={measurements} margin={{ top: 25, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="año" tickLine={false} stroke="#94a3b8" tick={{ fontSize: "11px", fill: "#64748b" }} />
                    <YAxis domain={[0, "auto"]} tickLine={false} stroke="#94a3b8" tick={{ fontSize: "11px" }} />
                    <Tooltip formatter={(val: any) => [`${val} mA`, "Corriente de Fuga"]} />
                    <ReferenceLine y={5.0} stroke="#dc2626" strokeDasharray="4 4" strokeWidth={1.5}>
                      <Label value="Criterio 5.00 mA" position="insideTopRight" fill="#dc2626" style={{ fontSize: "10px", fontWeight: "700" }} />
                    </ReferenceLine>
                    <Line type="monotone" dataKey="fuga" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4, fill: "#16a34a" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. Diámetro de Varilla */}
            <div className="rounded-2xl border border-slate-100 p-4 bg-white shadow-xs">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Diámetro de varilla (mm)</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Nominal 16.0 mm &nbsp;·&nbsp; {rates.tasaDiametro}
                  </p>
                </div>
                <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                  ALERTA
                </span>
              </div>

              <div className="h-56 w-full min-w-0 min-h-[224px]">
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                  <LineChart data={measurements} margin={{ top: 25, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="año" tickLine={false} stroke="#94a3b8" tick={{ fontSize: "11px", fill: "#64748b" }} />
                    <YAxis domain={["auto", "auto"]} tickLine={false} stroke="#94a3b8" tick={{ fontSize: "11px" }} />
                    <Tooltip formatter={(val: any) => [`${val} mm`, "Diámetro"]} />
                    <ReferenceLine y={14.4} stroke="#dc2626" strokeDasharray="4 4" strokeWidth={1.5}>
                      <Label value="Umbral observación 14.40 mm" position="insideBottomRight" fill="#dc2626" style={{ fontSize: "10px", fontWeight: "700" }} />
                    </ReferenceLine>
                    <Line type="monotone" dataKey="diametro" stroke="#d97706" strokeWidth={2.5} dot={{ r: 4, fill: "#d97706" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. pH del Terreno */}
            <div className="rounded-2xl border border-slate-100 p-4 bg-white shadow-xs">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">pH del terreno</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Rango óptimo 6.5 − 8.0 &nbsp;·&nbsp; {rates.tasaPh}
                  </p>
                </div>
                <span className="bg-amber-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                  VIGILANCIA
                </span>
              </div>

              <div className="h-56 w-full min-w-0 min-h-[224px]">
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                  <LineChart data={measurements} margin={{ top: 25, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="año" tickLine={false} stroke="#94a3b8" tick={{ fontSize: "11px", fill: "#64748b" }} />
                    <YAxis domain={["auto", "auto"]} tickLine={false} stroke="#94a3b8" tick={{ fontSize: "11px" }} />
                    <Tooltip formatter={(val: any) => [`${val}`, "pH"]} />
                    <ReferenceLine y={5.5} stroke="#dc2626" strokeDasharray="4 4" strokeWidth={1.5}>
                      <Label value="Crítico 5.50" position="insideTopRight" fill="#dc2626" style={{ fontSize: "10px", fontWeight: "700" }} />
                    </ReferenceLine>
                    <Line type="monotone" dataKey="ph" stroke="#9333ea" strokeWidth={2.5} dot={{ r: 4, fill: "#9333ea" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PANEL FOTOGRÁFICO DE INSPECCIÓN CON VISOR ESTILO GOOGLE DRIVE */}
          {/* ========================================================================= */}
          <div className="border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Camera size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    Panel Fotográfico de Inspección ({latestMeasurement?.año})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Haz clic en cualquier imagen para abrirla en pantalla completa
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 1. Telurómetro */}
              <div
                onClick={() =>
                  latestMeasurement?.images?.telurometro &&
                  setActivePreview({
                    url: latestMeasurement.images.telurometro,
                    title: "Pantalla Telurómetro",
                    reading: `Lectura: ${latestMeasurement.resistencia} Ω`,
                  })
                }
                className={`group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition shadow-xs ${latestMeasurement?.images?.telurometro
                  ? "cursor-pointer hover:border-amber-400 hover:shadow-md"
                  : "cursor-default"
                  }`}
              >
                <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-white">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Pantalla Telurómetro</span>
                    <span className="text-[10px] text-slate-400">Lectura: {latestMeasurement?.resistencia} Ω</span>
                  </div>
                  {latestMeasurement?.images?.telurometro && (
                    <div className="flex size-6 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-amber-50 group-hover:text-amber-600 transition">
                      <Maximize2 size={13} />
                    </div>
                  )}
                </div>
                <div className="relative aspect-4/3 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                  {latestMeasurement?.images?.telurometro ? (
                    <img
                      src={latestMeasurement.images.telurometro}
                      alt="Pantalla Telurómetro"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400 text-xs">
                      <ImageIcon size={22} className="opacity-40" />
                      <span>Sin captura</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Pinza de Fuga */}
              <div
                onClick={() =>
                  latestMeasurement?.images?.fuga &&
                  setActivePreview({
                    url: latestMeasurement.images.fuga,
                    title: "Pinza Amperimétrica",
                    reading: `Lectura: ${latestMeasurement.fuga} mA`,
                  })
                }
                className={`group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition shadow-xs ${latestMeasurement?.images?.fuga
                  ? "cursor-pointer hover:border-amber-400 hover:shadow-md"
                  : "cursor-default"
                  }`}
              >
                <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-white">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Pinza Amperimétrica</span>
                    <span className="text-[10px] text-slate-400">Lectura: {latestMeasurement?.fuga} mA</span>
                  </div>
                  {latestMeasurement?.images?.fuga && (
                    <div className="flex size-6 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-amber-50 group-hover:text-amber-600 transition">
                      <Maximize2 size={13} />
                    </div>
                  )}
                </div>
                <div className="relative aspect-4/3 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                  {latestMeasurement?.images?.fuga ? (
                    <img
                      src={latestMeasurement.images.fuga}
                      alt="Pinza Amperimétrica"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400 text-xs">
                      <ImageIcon size={22} className="opacity-40" />
                      <span>Sin captura</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Caja de Registro */}
              <div
                onClick={() =>
                  latestMeasurement?.images?.caja &&
                  setActivePreview({
                    url: latestMeasurement.images.caja,
                    title: "Caja de Registro / Pozo",
                    reading: "Estado físico e inspección visual",
                  })
                }
                className={`group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition shadow-xs ${latestMeasurement?.images?.caja
                  ? "cursor-pointer hover:border-amber-400 hover:shadow-md"
                  : "cursor-default"
                  }`}
              >
                <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-white">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Caja de Registro / Pozo</span>
                    <span className="text-[10px] text-slate-400">Estado físico e inspección</span>
                  </div>
                  {latestMeasurement?.images?.caja && (
                    <div className="flex size-6 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-amber-50 group-hover:text-amber-600 transition">
                      <Maximize2 size={13} />
                    </div>
                  )}
                </div>
                <div className="relative aspect-4/3 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                  {latestMeasurement?.images?.caja ? (
                    <img
                      src={latestMeasurement.images.caja}
                      alt="Caja de Registro"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400 text-xs">
                      <ImageIcon size={22} className="opacity-40" />
                      <span>Sin captura</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de importación de lote */}
      <ImportSpatZipModal
        isOpen={showZipModal}
        onClose={() => setShowZipModal(false)}
        defaultCompanyCode={effectivePublicCode}
        onSuccess={() => {
          loadPozos();
          triggerRefresh(effectivePublicCode);
        }}
      />

      {/* ========================================================================= */}
      {/* VISOR ESTILO GOOGLE DRIVE (DESKTOP + MOBILE TOUCH & PINCH) */}
      {/* ========================================================================= */}
      {activePreview && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md select-none touch-none animate-fade-in"
          onClick={() => {
            setActivePreview(null);
            resetZoom();
          }}
        >
          {/* Barra Superior */}
          <div
            className="w-full flex items-center justify-between text-white px-4 py-3 sm:px-6 sm:py-4 z-20 bg-gradient-to-b from-black/90 to-transparent gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0 pr-2">
              <p className="text-xs sm:text-sm font-bold tracking-wide truncate">
                {activePreview.title}
              </p>
              {activePreview.reading && (
                <p className="text-[10px] sm:text-xs text-slate-300 font-mono mt-0.5 truncate">
                  {activePreview.reading}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Controles de Zoom */}
              <div className="flex items-center gap-1 sm:gap-2 bg-slate-900/90 border border-slate-700/60 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-1 sm:py-1.5 backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => setZoomScale((s) => Math.max(0.5, s - 0.25))}
                  className="flex size-7 items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Alejar (-)"
                >
                  <ZoomOut size={15} />
                </button>

                <span className="text-[11px] sm:text-xs font-mono font-semibold px-0.5 text-slate-200 min-w-10 text-center">
                  {Math.round(zoomScale * 100)}%
                </span>

                <button
                  type="button"
                  onClick={() => setZoomScale((s) => Math.min(4, s + 0.25))}
                  className="flex size-7 items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Acercar (+)"
                >
                  <ZoomIn size={15} />
                </button>

                <div className="h-3.5 w-px bg-slate-700 mx-0.5" />

                <button
                  type="button"
                  onClick={resetZoom}
                  className="flex size-7 items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Restablecer tamaño original"
                >
                  <RotateCcw size={13} />
                </button>
              </div>

              {/* Botón Cerrar */}
              <button
                type="button"
                onClick={() => {
                  setActivePreview(null);
                  resetZoom();
                }}
                className="flex size-9 sm:size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
                title="Cerrar (Esc)"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Área Central Interactiva (Mouse + Touch) */}
          <div
            ref={imageContainerRef}
            className={`relative flex-1 w-full overflow-hidden flex items-center justify-center ${zoomScale > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
              }`}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => {
              if (zoomScale <= 1) return;
              setIsDragging(true);
              setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
            }}
            onMouseMove={(e) => {
              if (!isDragging || zoomScale <= 1) return;
              setPanPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
              });
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={activePreview.url}
              alt={activePreview.title}
              draggable={false}
              style={{
                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomScale})`,
                transition: isDragging ? "none" : "transform 0.15s ease-out",
              }}
              className="max-h-[82vh] max-w-[92vw] object-contain select-none pointer-events-auto rounded-lg shadow-2xl"
            />
          </div>

          {/* Barra Inferior Informativa */}
          <div
            className="w-full text-center py-2.5 px-4 text-[10px] sm:text-[11px] text-slate-400 bg-gradient-to-t from-black/90 to-transparent z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="hidden sm:inline">
              Rueda del ratón para Zoom &nbsp;•&nbsp; Arrastra para mover &nbsp;•&nbsp; Presiona Esc para salir
            </span>
            <span className="sm:hidden">
              Pellizca con 2 dedos para zoom &nbsp;•&nbsp; Arrastra con 1 dedo para mover
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

export default GroundingDashboardPage;