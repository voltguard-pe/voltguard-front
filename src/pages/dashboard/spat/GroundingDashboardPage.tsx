import { useState } from "react";
import {
  ShieldAlert,
  ArrowLeft,
  FileDown,
  Layers,
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
import { useNavigate } from "react-router-dom";

// Datos históricos quinquenales (SPAT)
const SPAT_HISTORICAL_DATA = [
  { año: "2022", resistencia: 2.12, fuga: 0.80, diametro: 15.80, ph: 7.40 },
  { año: "2023", resistencia: 2.35, fuga: 0.90, diametro: 15.60, ph: 7.10 },
  { año: "2024", resistencia: 2.58, fuga: 1.10, diametro: 15.30, ph: 6.80 },
  { año: "2025", resistencia: 2.71, fuga: 1.20, diametro: 15.00, ph: 6.50 },
  { año: "2026", resistencia: 2.98, fuga: 1.40, diametro: 14.60, ph: 6.10 },
];

const GroundingDashboardPage = () => {
  const navigate = useNavigate();

  const [selectedPozo, setSelectedPozo] = useState("SPAT-01");

  return (
    <section className="space-y-6 animate-fade-up">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 cursor-pointer"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      {/* Encabezado General */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Sistema de Puestas a Tierra (SPAT)
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Monitoreo técnico de pozos a tierra, resistencia eléctrica y deterioro estructural.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Descargando informe consolidado SPAT...")}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#087fb3] cursor-pointer shadow-sm"
        >
          <FileDown size={16} /> Exportar Reporte SPAT
        </button>
      </div>

      {/* Selector de Pozo a Tierra */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pozo Seleccionado</p>
            <p className="text-base font-black text-slate-950">{selectedPozo} - Malla Principal</p>
          </div>
        </div>

        <select
          value={selectedPozo}
          onChange={(e) => setSelectedPozo(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 outline-none transition focus:border-[#0797d5] cursor-pointer"
        >
          <option value="SPAT-01">Pozo #01 - Patio Principal</option>
          <option value="SPAT-02">Pozo #02 - Cuarto de Máquinas</option>
          <option value="SPAT-03">Pozo #03 - Subestación</option>
        </select>
      </div>

      {/* Módulo Quinquenal SPAT */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm font-sans">
        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h2 className="font-bold text-slate-950 text-base tracking-tight">
              Tendencia Histórica Quinquenal y Alerta Temprana (SPAT)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Evolución multianual de resistencia, corriente de fuga, deterioro y pH del terreno
            </p>
          </div>
        </div>

        {/* Grid de 2x2 para gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Resistencia (Ω) */}
          <div className="rounded-2xl border border-slate-100 p-4 bg-white">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Resistencia de puesta a tierra (Ω)</h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Criterio ≤ 5.00 Ω &nbsp;·&nbsp; Tasa media +8.9 %/año
                </p>
              </div>
              <span className="bg-[#d97706] text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                VIGILANCIA
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SPAT_HISTORICAL_DATA} margin={{ top: 25, right: 35, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="año" tickLine={false} stroke="#94a3b8" tick={{ fontSize: "11px", fill: "#64748b" }} />
                  <YAxis domain={[1.8, 5.2]} ticks={[2, 3, 4, 5]} tickLine={false} stroke="#94a3b8" tick={{ fontSize: "11px" }} />
                  <Tooltip formatter={(val: any) => [`${val} Ω`, "Resistencia"]} />
                  <ReferenceLine y={5.0} stroke="#dc2626" strokeDasharray="4 4" strokeWidth={1.5}>
                    <Label value="Criterio 5.00 Ω" position="insideTopRight" fill="#dc2626" style={{ fontSize: "10px", fontWeight: "700" }} />
                  </ReferenceLine>
                  <Line type="monotone" dataKey="resistencia" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: "#2563eb" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Corriente de Fuga (mA) */}
          <div className="rounded-2xl border border-slate-100 p-4 bg-white">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Corriente de fuga (mA)</h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Criterio ≤ 5.00 mA &nbsp;·&nbsp; Tasa media +15.0 %/año
                </p>
              </div>
              <span className="bg-[#16a34a] text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                NORMAL
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SPAT_HISTORICAL_DATA} margin={{ top: 25, right: 35, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="año" tickLine={false} stroke="#94a3b8" tick={{ fontSize: "11px", fill: "#64748b" }} />
                  <YAxis domain={[0, 5.2]} ticks={[1, 2, 3, 4, 5]} tickLine={false} stroke="#94a3b8" tick={{ fontSize: "11px" }} />
                  <Tooltip formatter={(val: any) => [`${val} mA`, "Corriente de Fuga"]} />
                  <ReferenceLine y={5.0} stroke="#dc2626" strokeDasharray="4 4" strokeWidth={1.5}>
                    <Label value="Criterio 5.00 mA" position="insideTopRight" fill="#dc2626" style={{ fontSize: "10px", fontWeight: "700" }} />
                  </ReferenceLine>
                  <Line type="monotone" dataKey="fuga" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: "#2563eb" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Diámetro de Varilla (mm) */}
          <div className="rounded-2xl border border-slate-100 p-4 bg-white">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Diámetro de varilla (mm)</h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Nominal 16.0 mm &nbsp;·&nbsp; Corrosión −0.40 mm/año
                </p>
              </div>
              <span className="bg-[#dc2626] text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                ALERTA
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SPAT_HISTORICAL_DATA} margin={{ top: 25, right: 35, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="año" tickLine={false} stroke="#94a3b8" tick={{ fontSize: "11px", fill: "#64748b" }} />
                  <YAxis domain={[14.0, 16.2]} ticks={[14.0, 14.5, 15.0, 15.5, 16.0]} tickLine={false} stroke="#94a3b8" tick={{ fontSize: "11px" }} />
                  <Tooltip formatter={(val: any) => [`${val} mm`, "Diámetro"]} />
                  <ReferenceLine y={14.4} stroke="#dc2626" strokeDasharray="4 4" strokeWidth={1.5}>
                    <Label value="Umbral observación 14.40 mm" position="insideBottomRight" fill="#dc2626" style={{ fontSize: "10px", fontWeight: "700" }} />
                  </ReferenceLine>
                  <Line type="monotone" dataKey="diametro" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: "#2563eb" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. pH del Terreno */}
          <div className="rounded-2xl border border-slate-100 p-4 bg-white">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">pH del terreno</h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Rango óptimo 6.5 − 8.0 &nbsp;·&nbsp; −0.33 /año
                </p>
              </div>
              <span className="bg-[#d97706] text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                VIGILANCIA
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SPAT_HISTORICAL_DATA} margin={{ top: 25, right: 35, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="año" tickLine={false} stroke="#94a3b8" tick={{ fontSize: "11px", fill: "#64748b" }} />
                  <YAxis domain={[5.0, 7.8]} ticks={[5.5, 6.0, 6.5, 7.0, 7.5]} tickLine={false} stroke="#94a3b8" tick={{ fontSize: "11px" }} />
                  <Tooltip formatter={(val: any) => [`${val}`, "pH"]} />
                  <ReferenceLine y={5.5} stroke="#dc2626" strokeDasharray="4 4" strokeWidth={1.5}>
                    <Label value="Crítico 5.50" position="insideTopRight" fill="#dc2626" style={{ fontSize: "10px", fontWeight: "700" }} />
                  </ReferenceLine>
                  <Line type="monotone" dataKey="ph" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: "#2563eb" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Leyenda Inferior */}
        <div className="mt-6 border-t border-slate-100 pt-3.5">
          <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2 text-xs font-semibold text-slate-600">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
              Criterios:
            </span>
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100">
              <span className="size-2 rounded-full bg-emerald-600 inline-block"></span>
              <span><strong>Verde:</strong> dentro de criterio</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-100">
              <span className="size-2 rounded-full bg-amber-600 inline-block"></span>
              <span><strong>Ámbar:</strong> vigilancia por tendencia</span>
            </div>
            <div className="flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg border border-rose-100">
              <span className="size-2 rounded-full bg-rose-600 inline-block"></span>
              <span><strong>Rojo:</strong> alerta temprana</span>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default GroundingDashboardPage;