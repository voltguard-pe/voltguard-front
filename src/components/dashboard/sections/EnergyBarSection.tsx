import React, { useMemo, useState } from "react";
import { Container } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export interface EnergyMonthItem {
  name: string; // "Abr 26"
  kWh: number;
  kwhHP: number;
  kwhFP: number;
  dias: number;
}

// Las props de filtro por semana ya no se usan (el recibo no trae datos diarios).
// Se dejan opcionales para no romper BoardDetailPage; puedes quitarlas cuando quieras.
interface EnergyBarSectionProps {
  energiaPorMesData: EnergyMonthItem[];
  visibleEnergySeries?: { [key: string]: boolean };
  onToggleEnergyDay?: (key: string) => void;
}

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"];
const GROWTH_OPTIONS = [0, 5, 10];

const fmt = (n: number, decimals = 0) =>
  Number(n).toLocaleString("es-PE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

// "Abr 26" -> { year: 2026, month: 3 }
const parsePeriod = (name: string) => {
  const m = String(name || "").match(/^([A-Za-zñÑ]{3})\s+(\d{2})$/);
  if (!m) return null;
  const idx = MESES.findIndex((x) => x.toLowerCase() === m[1].toLowerCase());
  return idx < 0 ? null : { year: 2000 + Number(m[2]), month: idx };
};

// Recharts 3 tipa el formatter de LabelList como (label: RenderableText) => RenderableText,
// por eso recibe "unknown" y se convierte a número aquí.
const fmtK = (v: unknown) => {
  const n = Number(v);
  return n > 0 ? `${(n / 1000).toFixed(1)}k` : "";
};

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

interface ChartRow {
  name: string;
  esProyeccion: boolean;
  kwhFP: number;
  kwhHP: number;
  proyFP: number;
  proyHP: number;
  total: number;
  totalReal?: number; // solo en meses facturados (para la etiqueta superior)
  totalProy?: number; // solo en meses proyectados
}

const EnergyTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const r: ChartRow = payload[0].payload;
  const hp = r.esProyeccion ? r.proyHP : r.kwhHP;
  const fp = r.esProyeccion ? r.proyFP : r.kwhFP;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 p-3.5 shadow-xl font-sans text-xs min-w-[220px] backdrop-blur-sm">
      <div className="border-b border-slate-100 pb-2 mb-2 flex items-center justify-between gap-3">
        <span className="font-bold text-slate-800">
          {r.name}
          {r.esProyeccion && <span className="ml-1.5 font-semibold text-slate-400">(proyección)</span>}
        </span>
        <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 text-[11px]">
          {fmt(r.total)} kWh
        </span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <span className="size-2 rounded-full bg-rose-500" /> Hora Punta (HP):
          </span>
          <span className="font-extrabold text-slate-900 tabular-nums">{fmt(hp)} kWh</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <span className="size-2 rounded-full bg-blue-500" /> Fuera de Punta (FP):
          </span>
          <span className="font-extrabold text-slate-900 tabular-nums">{fmt(fp)} kWh</span>
        </div>
      </div>
    </div>
  );
};

export const EnergyBarSection: React.FC<EnergyBarSectionProps> = ({ energiaPorMesData }) => {
  const [growth, setGrowth] = useState(0); // crecimiento anual esperado (%)

  const model = useMemo(() => {
    const real = energiaPorMesData ?? [];
    if (real.length === 0) return null;

    const last12 = real.slice(-12);
    const completo = real.length >= 12;
    const avgHP = sum(last12.map((m) => m.kwhHP)) / last12.length;
    const avgFP = sum(last12.map((m) => m.kwhFP)) / last12.length;
    const factor = 1 + growth / 100;

    // Filas reales
    const rows: ChartRow[] = real.map((m) => ({
      name: m.name,
      esProyeccion: false,
      kwhFP: m.kwhFP,
      kwhHP: m.kwhHP,
      proyFP: 0,
      proyHP: 0,
      total: m.kWh,
      totalReal: m.kWh
    }));

    // Filas proyectadas: mismo mes del año anterior × (1 + crecimiento).
    // Si el recibo no trajo 12 meses, se usa el promedio mensual disponible.
    const lastP = parsePeriod(real[real.length - 1].name);
    const proj: ChartRow[] = Array.from({ length: 12 }, (_, i) => {
      const base = completo ? last12[i] : { kwhHP: avgHP, kwhFP: avgFP };
      let name = `Proy. ${i + 1}`;
      if (lastP) {
        const t = lastP.year * 12 + lastP.month + i + 1;
        name = `${MESES[t % 12]} ${String(Math.floor(t / 12)).slice(-2)}`;
      }
      const hp = base.kwhHP * factor;
      const fp = base.kwhFP * factor;
      return { name, esProyeccion: true, kwhFP: 0, kwhHP: 0, proyFP: fp, proyHP: hp, total: hp + fp, totalProy: hp + fp };
    });

    const anualReal = completo ? sum(last12.map((m) => m.kWh)) : (sum(last12.map((m) => m.kWh)) / last12.length) * 12;
    const anualProy = sum(proj.map((p) => p.total));
    const hpAnual = completo ? sum(last12.map((m) => m.kwhHP)) : avgHP * 12;
    const ultimo = real[real.length - 1];

    return {
      data: [...rows, ...proj],
      ultimo,
      completo,
      mesesReales: real.length,
      anualReal,
      anualProy,
      pctHP: anualReal > 0 ? (hpAnual / anualReal) * 100 : 0,
      variacion: anualReal > 0 ? (anualProy / anualReal - 1) * 100 : 0
    };
  }, [energiaPorMesData, growth]);

  if (!model) {
    return (
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 font-sans mt-6">
        <div className="flex h-48 w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-slate-400 font-semibold text-sm">
          Sube tu recibo de luz con “Cambiar Recibo de Luz” (sección Costo de Energía) para ver el consumo.
        </div>
      </section>
    );
  }

  const { data, ultimo, completo, mesesReales, anualReal, anualProy, pctHP, variacion } = model;

  // Eje Y desde 0 con pasos redondos
  const maxVal = Math.max(0, ...data.map((d) => d.total));
  const niceStep = (max: number) => {
    const raw = (max || 1) / 5;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / mag;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
  };
  const step = niceStep(maxVal);
  const yMax = Math.ceil((maxVal * 1.1) / step) * step || step;
  const yTicks: number[] = [];
  for (let v = 0; v <= yMax + 0.0001; v += step) yTicks.push(Number(v.toFixed(2)));

  const notaAnual = completo
    ? "Suma de los 12 meses facturados en el recibo"
    : `Promedio de ${mesesReales} mes${mesesReales > 1 ? "es" : ""} del recibo × 12 (el recibo no trajo los 12 meses)`;

  const metricCard = "relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/60 to-white p-5 shadow-sm";

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 transition-all duration-300 hover:border-slate-300 font-sans mt-6">
      {/* Cabecera */}
      <div className="mb-8 flex items-center gap-4 border-b border-slate-100 pb-6">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-500/10 text-blue-600 shadow-inner border border-blue-500/20">
          <Container size={24} />
        </div>
        <div>
          <h2 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
            Consumo de Energía y Proyección Anual
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Historial facturado en tu recibo de luz y proyección a 12 meses, en kiloVatios-hora (kWh)
          </p>
        </div>
      </div>

      {/* Métricas */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={metricCard}>
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Último mes facturado</p>
          <p className="mt-2 text-3xl font-black text-slate-900 tracking-tight">
            {fmt(ultimo.kWh)} <span className="text-sm font-bold text-blue-600">kWh</span>
          </p>
          <p className="mt-2 text-xs text-slate-500 font-medium">
            {ultimo.name} · {fmt(ultimo.kWh / (ultimo.dias || 30), 0)} kWh/día
          </p>
        </div>

        <div className={metricCard}>
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Consumo anual real</p>
          <p className="mt-2 text-3xl font-black text-slate-900 tracking-tight">
            {fmt(anualReal)} <span className="text-sm font-bold text-blue-600">kWh/año</span>
          </p>
          <p className="mt-2 text-xs text-slate-500 font-medium">{notaAnual}</p>
        </div>

        <div className={metricCard}>
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Proyección próx. 12 meses</p>
          <p className="mt-2 text-3xl font-black text-slate-900 tracking-tight">
            {fmt(anualProy)} <span className="text-sm font-bold text-blue-600">kWh/año</span>
          </p>
          <p className="mt-2 text-xs text-slate-500 font-medium">
            {growth === 0
              ? "Mismo patrón estacional, sin crecimiento"
              : `${variacion >= 0 ? "+" : ""}${fmt(variacion, 1)}% vs. el año real`}
          </p>
        </div>

        <div className={metricCard}>
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Hora Punta del año</p>
          <p className="mt-2 text-3xl font-black text-slate-900 tracking-tight">
            {fmt(pctHP, 1)} <span className="text-sm font-bold text-blue-600">%</span>
          </p>
          <p className="mt-2 text-xs text-slate-500 font-medium">Parte del consumo anual en HP</p>
        </div>
      </div>

      {/* Escenario de crecimiento + leyenda */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-slate-400 tracking-wider mr-1">Crecimiento anual:</span>
          {GROWTH_OPTIONS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGrowth(g)}
              className={`px-3.5 py-1.5 text-xs font-black rounded-xl border transition-all cursor-pointer active:scale-95 ${
                growth === g
                  ? "text-white border-transparent shadow-md shadow-blue-500/20"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
              style={growth === g ? { background: "linear-gradient(to bottom, #3b82f6, #1d4ed8)" } : undefined}
            >
              {g === 0 ? "Sin crecimiento" : `+${g}%`}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-blue-500" /> Fuera de Punta (FP)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-500" /> Hora Punta (HP)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full border border-dashed border-slate-400 bg-slate-200" /> Proyección
          </span>
        </div>
      </div>

      {/* Gráfico */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-0 sm:border-none scrollbar-thin">
        <div className="h-80 sm:h-96 md:h-[420px] w-[900px] lg:w-full text-xs font-medium text-slate-500 select-none">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 35, right: 15, left: 30, bottom: 30 }} style={{ outline: "none", border: "none" }}>
              <defs>
                <linearGradient id="fpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="hpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb7185" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                stroke="#94a3b8"
                interval={0}
                dy={8}
                tick={{ fontSize: "10px", fontWeight: "700", fill: "#334155" }}
              >
                <Label
                  value="Meses (izquierda: facturado · derecha: proyección)"
                  position="insideBottom"
                  offset={-20}
                  style={{ textAnchor: "middle", fill: "#64748b", fontWeight: "800", fontSize: "10px", letterSpacing: "0.05em" }}
                />
              </XAxis>
              <YAxis
                domain={[0, yMax]}
                ticks={yTicks}
                interval={0}
                allowDataOverflow
                tickLine={false}
                stroke="#94a3b8"
                width={65}
                tick={{ fontSize: "11px", fill: "#64748b" }}
                tickFormatter={(v) => Number(v).toLocaleString("es-PE")}
              >
                <Label
                  value="Energía Activa (kWh)"
                  angle={-90}
                  position="insideLeft"
                  offset={-5}
                  style={{ textAnchor: "middle", fill: "#64748b", fontWeight: "800", fontSize: "10px", letterSpacing: "0.05em" }}
                />
              </YAxis>
              <Tooltip cursor={{ fill: "rgba(59, 130, 246, 0.05)" }} content={<EnergyTooltip />} />

              {/* Real */}
              <Bar dataKey="kwhFP" stackId="e" fill="url(#fpGradient)" maxBarSize={28} />
              <Bar dataKey="kwhHP" stackId="e" fill="url(#hpGradient)" maxBarSize={28}>
                <LabelList
                  dataKey="totalReal"
                  position="top"
                  formatter={fmtK}
                  style={{ fontSize: 10, fontWeight: 800, fill: "#0f172a" }}
                />
              </Bar>

              {/* Proyección: mismos colores, más claros y con borde punteado */}
              <Bar dataKey="proyFP" stackId="e" fill="#3b82f6" fillOpacity={0.35} stroke="#3b82f6" strokeDasharray="3 2" maxBarSize={28} />
              <Bar dataKey="proyHP" stackId="e" fill="#e11d48" fillOpacity={0.35} stroke="#e11d48" strokeDasharray="3 2" maxBarSize={28}>
                <LabelList
                  dataKey="totalProy"
                  position="top"
                  formatter={fmtK}
                  style={{ fontSize: 10, fontWeight: 800, fill: "#64748b" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};
