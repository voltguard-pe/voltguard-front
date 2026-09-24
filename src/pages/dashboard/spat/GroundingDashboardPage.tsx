import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  FileDown,
  Layers,
  Loader2,
  ShieldAlert,
  UploadCloud,
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
  // const { publicCode } = useParams<{ publicCode: string }>();
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

  const effectivePublicCode =
    auth?.role === "ADMIN"
      ? typeof auth.companyPublicCode === "string"
        ? auth.companyPublicCode
        : auth.companyPublicCode?.publicCode
      : publicCode || selectedCompany?.publicCode;

  // 1. Cargar empresas para SUPERADMIN o contexto
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

  // 2. Cargar pozos asociados a la empresa seleccionada
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
        // Si la URL trae un pozo (:pozoCode), se selecciona ese; de lo contrario, el primero
        const targetPozo = pozoCode && data.some((p: SpatPozoItem) => p.pozoCode === pozoCode)
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

  // Cuando el usuario hace clic en otro pozo desde el sidebar, actualiza el pozo seleccionado
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

  // Última medición registrada (el año más reciente)
  const measurements = spatRecord?.measurements || [];
  const latestMeasurement = measurements.length > 0 ? measurements[measurements.length - 1] : null;

  // Tasas calculadas dinámicamente si hay más de 1 año registrado
  const calculateRates = () => {
    if (measurements.length < 2) {
      return {
        tasaResistencia: "Sin histórico suficiente",
        tasaFuga: "Sin histórico suficiente",
        tasaDiametro: "Sin histórico suficiente",
        tasaPh: "Sin histórico suficiente",
      };
    }
    const first = measurements[0];
    const last = measurements[measurements.length - 1];
    const diffYears = Math.max(1, parseInt(last.año) - parseInt(first.año));

    const varR = (((last.resistencia - first.resistencia) / first.resistencia) * 100) / diffYears;
    const varF = (((last.fuga - first.fuga) / (first.fuga || 1)) * 100) / diffYears;
    const varD = (last.diametro - first.diametro) / diffYears;
    const varPh = (last.ph - first.ph) / diffYears;

    return {
      tasaResistencia: `${varR >= 0 ? "+" : ""}${varR.toFixed(1)} %/año`,
      tasaFuga: `${varF >= 0 ? "+" : ""}${varF.toFixed(1)} %/año`,
      tasaDiametro: `${varD.toFixed(2)} mm/año`,
      tasaPh: `${varPh.toFixed(2)} /año`,
    };
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
    <section className="space-y-6 font-sans pb-16">
      {/* Cabecera Principal */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-3 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
          >
            <ArrowLeft size={15} /> Volver
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              Sistema de Puestas a Tierra (SPAT)
            </h1>
            {selectedCompany && (
              <span className="rounded-full bg-amber-500/10 px-3 py-0.5 text-xs font-bold text-amber-700">
                {selectedCompany.name}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoreo técnico multianual de pozos a tierra, electrodos y pH del terreno según IEEE 81.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowZipModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <UploadCloud size={16} /> Importar Lote SPAT (.zip)
          </button>

          <button
            type="button"
            disabled={!latestMeasurement}
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0797d5] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0684ba] shadow-sm transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <FileDown size={16} /> Exportar Certificado SPAT
          </button>
        </div>
      </div>

      {/* Selector de Empresa para SUPERADMIN */}
      {auth?.role === "SUPERADMIN" && !publicCode && companies.length > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Filtrar por empresa:</span>
          <select
            value={selectedCompany?.publicCode || ""}
            onChange={(e) => {
              const comp = companies.find((c) => c.publicCode === e.target.value) || null;
              setSelectedCompany(comp);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer"
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
      <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pozo Activo</p>
            <p className="text-base font-black text-slate-950">
              {selectedPozoCode ? `${selectedPozoCode} - ${spatRecord?.location || "Malla General"}` : "Sin pozos registrados"}
            </p>
          </div>
        </div>

        {pozosList.length > 0 && (
          <select
            value={selectedPozoCode}
            // onChange={(e) => setSelectedPozoCode(e.target.value)}
            onChange={(e) => {
              const newPozo = e.target.value;
              setSelectedPozoCode(newPozo);
              navigate(`/dashboard/companies/${effectivePublicCode}/grounding/${newPozo}`);
            }}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            {pozosList.map((p) => (
              <option key={p.pozoCode} value={p.pozoCode}>
                {p.pozoCode} - {p.location || "Sede"}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Visualización de las 4 Gráficas Reales */}
      {loading ? (
        <div className="py-20 text-center text-xs font-bold text-slate-400">
          <Loader2 className="animate-spin inline-block mr-2" size={18} /> Cargando mediciones anuales del pozo...
        </div>
      ) : !spatRecord || measurements.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-12 text-center">
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
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Historial de Mediciones Plurianuales
              </h2>
              <p className="text-xs text-slate-400">
                Puntos registrados: {measurements.map((m) => m.año).join(", ")}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
              Certificado: {spatRecord.certificateCode}
            </span>
          </div>

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
                  {(latestMeasurement?.resistencia ?? 0) <= 5.0 ? "VIGILANCIA" : "CRÍTICO"}
                </span>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={measurements} margin={{ top: 25, right: 35, left: -15, bottom: 5 }}>
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
                  {(latestMeasurement?.fuga ?? 0) <= 5.0 ? "NORMAL" : "ALERTA"}
                </span>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={measurements} margin={{ top: 25, right: 35, left: -15, bottom: 5 }}>
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

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={measurements} margin={{ top: 25, right: 35, left: -15, bottom: 5 }}>
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

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={measurements} margin={{ top: 25, right: 35, left: -15, bottom: 5 }}>
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
        </div>
      )}

      {/* Modal de importación de lote */}
      <ImportSpatZipModal
        isOpen={showZipModal}
        onClose={() => setShowZipModal(false)}
        defaultCompanyCode={effectivePublicCode}
        onSuccess={() => {
          loadPozos();
          triggerRefresh(effectivePublicCode); // <-- Notifica al Sidebar
        }}
      />
    </section>
  );
};

export default GroundingDashboardPage;