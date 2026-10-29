import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CloudUpload,
  FileText,
  BarChart3,
  Receipt,
  ChevronDown,
  X,
  Building2,
  Hash,
  MapPin,
  CalendarDays,
  FileCheck2,
  Zap,
  Gauge,
  AlertTriangle,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  type LucideIcon,
} from "lucide-react";
import {
  billingStore,
  useBillingComparisons,
  type Comparison,
  type Slot,
} from "./billingComparisonsStore"; // ajusta la ruta según tu proyecto

// ── FORMATO ──
const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });
const pctChange = (from: number, to: number) => (from ? Math.round((to / from - 1) * 100) : 0);
const signed = (n: number) => `${n > 0 ? "+" : ""}${n}%`;
const round2 = (n: number) => Math.round(n * 100) / 100;

// Mide el ancho real del contenedor para que el SVG llene el panel sin deformarse
const useWidth = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(320, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
};

const card = "rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-6";

// ── UTILIDADES: MES vs MES ──
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const norm = (s: string) => s.toLowerCase().replace("set", "sep");

// Semáforo: verde = bajó o igual, amarillo = sube hasta 10%, rojo = sube más de 10%
const semaforoCls = (pct: number) =>
  pct <= 0
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : pct <= 10
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-red-50 text-red-700 ring-red-200";

const semaforoHex = (pct: number) => (pct <= 0 ? "#10b981" : pct <= 10 ? "#f59e0b" : "#ef4444");
const semaforoLabel = (pct: number) =>
  pct <= 0 ? "Bajó o igual" : pct <= 10 ? "Sube hasta 10%" : "Sube más de 10%";
const semaforoText = (pct: number) =>
  pct <= 0 ? "text-emerald-600" : pct <= 10 ? "text-amber-600" : "text-red-600";

type MonthData = { fp: number; hp: number; kw: number; demo?: boolean };

// ── DATOS FICTICIOS (DEMO) ──
// Se usan solo para los meses que no existen en la serie real.
const rnd = (seed: number) => {
  const v = Math.sin(seed * 12.9898) * 43758.5453;
  return v - Math.floor(v);
};

// Año base ficticio: ~6 mil kWh, ~15% en hora punta, ~30 kW
const baseDemo = (mo: number): MonthData => {
  const r = rnd(mo + 1);
  const r2 = rnd(mo * 7 + 3);
  const season = 1 + 0.08 * Math.cos((mo / 12) * 2 * Math.PI); // más consumo en verano
  const total = 6200 * season * (0.94 + r * 0.12);
  const hp = Math.round(total * (0.13 + r2 * 0.04));
  return { fp: Math.round(total) - hp, hp, kw: round2(30 + (r - 0.5) * 8) };
};

// Cuánto cambia cada parte del segundo año frente al primero: [fuera de punta, hora punta, potencia]
//   <= 1.00 → verde · hasta 1.10 → ámbar · > 1.10 → rojo
// Cambia estos números para que un mes se vea más grave o más sano.
const FACTORES: [number, number, number][] = [
  [0.93, 1.06, 1.18], // Ene
  [1.05, 0.97, 1.04], // Feb
  [1.14, 1.08, 0.95], // Mar
  [1.02, 1.22, 1.09], // Abr
  [0.96, 1.03, 1.35], // May
  [1.09, 0.9, 1.12], // Jun
  [1.18, 1.05, 0.98], // Jul
  [1.07, 1.16, 1.01], // Ago
  [0.94, 0.99, 1.25], // Sep
  [1.12, 1.04, 0.92], // Oct
  [1.04, 1.11, 1.06], // Nov
  [1.21, 0.95, 1.15], // Dic
];

// ── ETIQUETAS ──
const Trend = ({ v }: { v: number }) => {
  const Icon = v > 0 ? TrendingUp : v < 0 ? TrendingDown : Minus;
  return <Icon size={11} strokeWidth={3} />;
};

// Etiqueta de variación (▲ +66%) con el color del semáforo
const Delta = ({ v }: { v: number | null }) =>
  v === null ? null : (
    <span
      className={`ml-2 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ring-1 ${semaforoCls(v)}`}
    >
      <Trend v={v} />
      {signed(v)}
    </span>
  );

// ── COMPONENTE: PASTEL DE UN AÑO ──
const PieCard = ({
  year,
  monthName,
  d,
  prev,
  next,
  contractedKw,
}: {
  year: number;
  monthName: string;
  d?: MonthData;
  prev?: MonthData; // mes del año anterior: si viene, se muestran los % de variación
  next?: MonthData; // mes del año siguiente: solo se usa para colorear el año base
  contractedKw: number;
}) => {
  const R = 64;
  const C = 2 * Math.PI * R;
  const GAP = 3;
  const total = d ? d.fp + d.hp : 0;
  const lenFp = d && total ? (d.fp / total) * C : 0;
  const over = d ? d.kw > contractedKw : false;

  // Variación de cada parte frente al año anterior (lo que se muestra en los chips)
  const delta = (a?: number, b?: number) => (a && b !== undefined ? pctChange(a, b) : null);
  const fpD = d ? delta(prev?.fp, d.fp) : null;
  const hpD = d ? delta(prev?.hp, d.hp) : null;
  const kwD = d ? delta(prev?.kw, d.kw) : null;
  const totD = d && prev ? delta(prev.fp + prev.hp, d.fp + d.hp) : null;

  // Estado usado SOLO para colorear: el año base toma el estado del cambio hacia el año siguiente,
  // así ambos pasteles muestran el mismo color (verde, ámbar o rojo).
  const cFp = fpD ?? (d && next ? delta(d.fp, next.fp) : null);
  const cHp = hpD ?? (d && next ? delta(d.hp, next.hp) : null);
  const cKw = kwD ?? (d && next ? delta(d.kw, next.kw) : null);
  const cTot = totD ?? (d && next ? delta(d.fp + d.hp, next.fp + next.hp) : null);

  // Color = estado (semáforo) · Tono = parte (fuerte: fuera de punta, claro: hora punta)
  const BASE = "#64748b"; // gris: solo si no hay con qué comparar
  const fpColor = cFp === null ? BASE : semaforoHex(cFp);
  const hpColor = cHp === null ? BASE : semaforoHex(cHp);
  const kwColor = over ? "#ef4444" : cKw === null ? BASE : semaforoHex(cKw);

  const borderCls =
    cTot === null
      ? "border-slate-200"
      : cTot > 10
        ? "border-red-300"
        : cTot > 0
          ? "border-amber-300"
          : "border-emerald-300";

  // Qué fue lo que más subió (resumen en una línea)
  const peor = [
    { n: "Fuera de punta", v: fpD },
    { n: "Hora punta", v: hpD },
    { n: "Potencia máxima", v: kwD },
  ]
    .filter((p): p is { n: string; v: number } => p.v !== null)
    .sort((a, b) => b.v - a.v)[0];

  const gaugeMax = d ? Math.max(d.kw, contractedKw) * 1.2 || 1 : 1;

  return (
    <div
      className={`flex h-full min-w-0 flex-col items-center rounded-2xl border-2 ${borderCls} bg-white p-4 shadow-xs sm:p-5`}
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        <p className="text-base font-bold text-slate-800">
          {monthName} {year}
        </p>
        {!prev && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-300">
            Año base
          </span>
        )}
        {d?.demo && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200">
            Demo
          </span>
        )}
      </div>

      {d && total && totD !== null && (
        <span
          className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ring-1 ${semaforoCls(totD)}`}
        >
          <Trend v={totD} />
          {signed(totD)} · {semaforoLabel(totD)}
        </span>
      )}

      {d && total ? (
        <>
          <svg
            viewBox="0 0 190 190"
            className="mt-3 h-auto w-full max-w-[190px] drop-shadow-sm"
            role="img"
            aria-label={`${monthName} ${year}: fuera de punta ${fmt(d.fp)} kWh, hora punta ${fmt(d.hp)} kWh`}
          >
            <g transform="rotate(-90 95 95)">
              <circle cx="95" cy="95" r={R} fill="none" stroke="#eef2f7" strokeWidth="26" />
              {/* Fuera de punta: tono fuerte */}
              <circle
                cx="95"
                cy="95"
                r={R}
                fill="none"
                stroke={fpColor}
                strokeWidth="26"
                strokeDasharray={`${Math.max(lenFp - GAP, 0)} ${C}`}
                className="transition-all duration-700"
              />
              {/* Hora punta: tono claro */}
              <circle
                cx="95"
                cy="95"
                r={R}
                fill="none"
                stroke={hpColor}
                strokeOpacity="0.4"
                strokeWidth="26"
                strokeDasharray={`${Math.max(C - lenFp - GAP, 0)} ${C}`}
                strokeDashoffset={-lenFp}
                className="transition-all duration-700"
              />
            </g>
            <text x="95" y="93" textAnchor="middle" fontSize="23" fontWeight="800" fill="#0f172a">
              {fmt(total)}
            </text>
            <text x="95" y="111" textAnchor="middle" fontSize="10.5" fill="#64748b">
              kWh totales
            </text>
          </svg>

          <dl className="mt-4 w-full space-y-2.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="flex items-center gap-2 text-slate-600">
                <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: fpColor }} />
                Fuera de punta
              </dt>
              <dd className="flex flex-wrap items-center justify-end font-semibold tabular-nums text-slate-900">
                {fmt(d.fp)}
                <span className="ml-1 font-normal text-slate-400">({Math.round((d.fp / total) * 100)}%)</span>
                <Delta v={fpD} />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="flex items-center gap-2 text-slate-600">
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: hpColor, opacity: 0.4 }}
                />
                Hora punta
              </dt>
              <dd className="flex flex-wrap items-center justify-end font-semibold tabular-nums text-slate-900">
                {fmt(d.hp)}
                <span className="ml-1 font-normal text-slate-400">({Math.round((d.hp / total) * 100)}%)</span>
                <Delta v={hpD} />
              </dd>
            </div>

            {/* Potencia: barra contra el límite contratado */}
            <div className="border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-600">Potencia máxima</dt>
                <dd className="flex flex-wrap items-center justify-end gap-1 font-semibold tabular-nums text-slate-900">
                  {fmt(d.kw)} kW
                  <Delta v={kwD} />
                </dd>
              </div>
              <div className="relative mt-2.5 h-2.5 rounded-full bg-slate-100">
                <div
                  className="h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((d.kw / gaugeMax) * 100, 100)}%`, backgroundColor: kwColor }}
                />
                <div
                  className="absolute -top-1 h-[18px] w-0.5 rounded bg-slate-800"
                  style={{ left: `${(contractedKw / gaugeMax) * 100}%` }}
                  title={`Contratada: ${contractedKw} kW`}
                />
              </div>
              <p className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                <span>Límite contratado: {contractedKw} kW</span>
                <span className={`font-semibold ${over ? "text-red-600" : "text-emerald-600"}`}>
                  {over ? `Excede en ${(d.kw - contractedKw).toFixed(1)} kW` : "Dentro del límite"}
                </span>
              </p>
            </div>
          </dl>

          {peor && (
            <p
              className={`mt-4 w-full rounded-lg px-3 py-2 text-center text-xs font-medium ring-1 ${semaforoCls(peor.v)}`}
            >
              {peor.v > 0 ? `Lo que más subió: ${peor.n} (${signed(peor.v)})` : "Todo bajó o se mantuvo igual"}
            </p>
          )}
        </>
      ) : (
        <div className="flex h-[240px] items-center text-sm text-slate-400">
          Sin datos de {monthName} {year}
        </div>
      )}
    </div>
  );
};

// ── COMPONENTE: TARJETA DE INDICADOR ──
const Kpi = ({
  icon: Icon,
  label,
  value,
  sub,
  pct,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  pct: number; // define el color según el semáforo
}) => (
  <div className={`${card} flex flex-col gap-3`}>
    <div className="flex items-center gap-2.5">
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ${semaforoCls(pct)}`}
      >
        <Icon size={18} />
      </span>
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
    <p className={`text-3xl font-bold tracking-tight tabular-nums sm:text-4xl ${semaforoText(pct)}`}>{value}</p>
    <p className="text-xs text-slate-500 sm:text-sm">{sub}</p>
  </div>
);

const SectionHead = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div>
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
  </div>
);

// ── COMPONENTE: DETALLE DEL RECIBO DE UN AÑO ──
type CostRow = { name: string; power: boolean; value: number; demo: boolean };
type CostSide = { rows: CostRow[]; total: number };

const CostPanel = ({
  year,
  monthName,
  side,
  prev,
  next,
  maxCost,
}: {
  year: number;
  monthName: string;
  side: CostSide;
  prev?: CostSide; // mismo mes del año anterior: si viene, se muestran los % de variación
  next?: CostSide; // mismo mes del año siguiente: solo colorea el año base
  maxCost: number;
}) => {
  const find = (s: CostSide | undefined, name: string) => s?.rows.find((r) => r.name === name)?.value;
  const sumPower = (s?: CostSide) => (s ? s.rows.filter((r) => r.power).reduce((a, r) => a + r.value, 0) : 0);
  const demo = side.rows.some((r) => r.demo);

  // Variación mostrada (contra el año anterior) y estado usado para colorear (el año base mira al siguiente)
  const totD = prev ? pctChange(prev.total, side.total) : null;
  const cTot = totD ?? (next ? pctChange(side.total, next.total) : null);
  const powD = prev ? pctChange(sumPower(prev), sumPower(side)) : null;
  const cPow = powD ?? (next ? pctChange(sumPower(side), sumPower(next)) : null);
  const powerSum = sumPower(side);
  const powerShare = side.total ? Math.round((powerSum / side.total) * 100) : 0;

  const borderCls =
    cTot === null
      ? "border-slate-200"
      : cTot > 10
        ? "border-red-300"
        : cTot > 0
          ? "border-amber-300"
          : "border-emerald-300";

  return (
    <div className={`flex h-full min-w-0 flex-col rounded-2xl border-2 ${borderCls} bg-white p-4 shadow-xs sm:p-5`}>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <p className="text-base font-bold text-slate-800">
          {monthName} {year}
        </p>
        {!prev && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-300">
            Año base
          </span>
        )}
        {demo && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200">
            Demo
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <span className="text-xs text-slate-500">Total facturado</span>
        <span className="text-lg font-bold tabular-nums text-slate-900">S/ {fmt(side.total)}</span>
        {totD !== null && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${semaforoCls(totD)}`}
          >
            <Trend v={totD} />
            {signed(totD)}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {side.rows.map((r) => {
          const p = prev ? (find(prev, r.name) !== undefined ? pctChange(find(prev, r.name)!, r.value) : null) : null;
          const n = next && find(next, r.name) !== undefined ? pctChange(r.value, find(next, r.name)!) : null;
          const state = p ?? n;
          const color = state === null ? "#64748b" : semaforoHex(state);
          return (
            <div key={r.name}>
              <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                <span className={r.power ? "font-semibold text-red-600" : "text-slate-600"}>{r.name}</span>
                <span className="flex items-center font-semibold tabular-nums text-slate-900">
                  {fmt(r.value)}
                  <Delta v={p} />
                </span>
              </div>
              <div className="mt-1.5 h-2.5 rounded-full bg-slate-100">
                <div
                  className="h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${(r.value / maxCost) * 100}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p
        className={`mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg px-3 py-2 text-xs font-medium ring-1 ${semaforoCls(cPow ?? 0)}`}
      >
        <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: semaforoHex(cPow ?? 0) }} />
        Cargos por potencia: S/ {fmt(powerSum)} ({powerShare}% del recibo)
        <Delta v={powD} />
      </p>
    </div>
  );
};

// ── COMPONENTE: VERSUS ──
const VersusDashboard = ({ data }: { data: Comparison }) => {
  const m = data.metrics;
  const [chartRef, W] = useWidth();
  const last = m.months.length - 1;
  const excess = m.maxKw[last] - m.contractedKw;
  const monthsOver = m.maxKw.filter((v) => v > m.contractedKw).length;
  const totalBase = m.kwhFp[0] + m.kwhHp[0];
  const totalNow = m.kwhFp[last] + m.kwhHp[last];
  const energyPct = pctChange(totalBase, totalNow);
  const kwPct = pctChange(m.maxKw[0], m.maxKw[last]);

  // Año y mes de inicio de la serie (ej. "May-25" -> mayo 2025)
  const startMatch = (m.months[0] ?? data.baseLabel).match(/^([A-Za-zñÑ]{3})\D*(\d{2})/);
  const startMonth = Math.max(
    0,
    MESES.findIndex((n) => norm(n) === norm(startMatch?.[1] ?? "")),
  );
  const startYear = 2000 + Number(startMatch?.[2] ?? 25);
  const year1 = startYear;
  const year2 = startYear + 1;

  // Datos reales indexados por año y mes calendario
  const byKey: Record<string, MonthData> = {};
  m.months.forEach((_, i) => {
    const idx = startMonth + i;
    byKey[`${startYear + Math.floor(idx / 12)}-${idx % 12}`] = {
      fp: m.kwhFp[i] ?? 0,
      hp: m.kwhHp[i] ?? 0,
      kw: m.maxKw[i] ?? 0,
    };
  });

  // Dato real si existe; si no, dato ficticio derivado del otro año
  // para que el semáforo muestre verde, ámbar y rojo en distintos meses.
  const getMonth = (year: number, mo: number): MonthData => {
    const real = byKey[`${year}-${mo}`];
    if (real) return real;
    const [a, b, c] = FACTORES[mo];
    if (year === year1) {
      const r2 = byKey[`${year2}-${mo}`];
      if (r2) return { fp: Math.round(r2.fp / a), hp: Math.round(r2.hp / b), kw: round2(r2.kw / c), demo: true };
      return { ...baseDemo(mo), demo: true };
    }
    const b1 = getMonth(year1, mo);
    return { fp: Math.round(b1.fp * a), hp: Math.round(b1.hp * b), kw: round2(b1.kw * c), demo: true };
  };
  const realCount = (mo: number) =>
    Number(!!byKey[`${year1}-${mo}`]) + Number(!!byKey[`${year2}-${mo}`]);

  const [selMonth, setSelMonth] = useState((startMonth + last) % 12);
  const [chartMonth, setChartMonth] = useState<number | null>(null);

  const d1 = getMonth(year1, selMonth);
  const d2 = getMonth(year2, selMonth);
  const t1 = d1.fp + d1.hp;
  const t2 = d2.fp + d2.hp;
  const varPct = t1 && t2 ? pctChange(t1, t2) : null;
  const usesDemo = !!d1.demo || !!d2.demo;

  // Gráfico de línea en SVG (Ene-Dic, un año contra otro), adaptable al ancho
  const small = W < 480;
  const H = small ? 250 : 320;
  const pl = small ? 30 : 40;
  const pr = 20;
  const pt = 28;
  const pb = 30;
  const series = [year1, year2].map((yr) => ({
    year: yr,
    pts: MESES.map((_, mo) => ({ mo, ...getMonth(yr, mo) })),
  }));
  // Escala vertical dinámica: nunca se corta un valor alto
  const maxSeries = Math.max(...series.flatMap((s) => s.pts.map((p) => p.kw)), m.contractedKw);
  const YMAX = Math.max(70, Math.ceil((maxSeries * 1.1) / 10) * 10);
  const yTicks = Array.from({ length: Math.floor(YMAX / 20) + 1 }, (_, i) => i * 20);
  const x = (i: number) => pl + (i * (W - pl - pr)) / 11;
  const y = (v: number) => pt + (1 - v / YMAX) * (H - pt - pb);
  const lineColors = ["#94a3b8", "#0797d5"];
  const labelMonth = chartMonth ?? (startMonth + last) % 12;
  const labelPts = chartMonth !== null ? series.map((s) => s.pts[chartMonth]) : [series[1].pts[labelMonth]];

  // Cargos por potencia del recibo actual (para la «Lectura clave»)
  const powerTotal = m.costItems.filter((c) => c.power).reduce((s, c) => s + c.value, 0);
  const powerPct = m.totalBill ? Math.round((powerTotal / m.totalBill) * 100) : 0;

  // Detalle del recibo por mes y año (siempre el MISMO mes en ambos años).
  // Real: solo el mes del recibo actual (y el base si el comparativo trae `baseValue`).
  // El resto se genera ficticio (Demo) a partir de la energía y potencia de ese mes.
  const curMo = (startMonth + last) % 12;
  const getCosts = (year: number, mo: number): CostRow[] => {
    if (year === year2) {
      if (mo === curMo) {
        return m.costItems.map((c) => ({ name: c.name, power: !!c.power, value: c.value, demo: false }));
      }
      const dm = getMonth(year2, mo);
      const eRatio = (dm.fp + dm.hp) / (totalNow || 1);
      const kRatio = dm.kw / (m.maxKw[last] || 1);
      return m.costItems.map((c, i) => ({
        name: c.name,
        power: !!c.power,
        value: round2(c.value * (c.power ? kRatio : eRatio) * (0.97 + rnd(i * 3 + mo * 7 + 5) * 0.06)),
        demo: true,
      }));
    }
    const cur = getCosts(year2, mo);
    return m.costItems.map((c, i) => {
      const real = (c as { baseValue?: number }).baseValue;
      if (mo === curMo && real !== undefined) return { name: c.name, power: !!c.power, value: real, demo: false };
      return {
        name: c.name,
        power: !!c.power,
        value: round2(cur[i].value / (0.86 + rnd(i * 5 + mo * 3 + 11) * 0.4)),
        demo: true,
      };
    });
  };
  const sumRows = (rows: CostRow[]) => round2(rows.reduce((s, r) => s + r.value, 0));
  const side1: CostSide = { rows: getCosts(year1, selMonth), total: 0 };
  const side2: CostSide = { rows: getCosts(year2, selMonth), total: 0 };
  side1.total = sumRows(side1.rows);
  side2.total = selMonth === curMo ? m.totalBill : sumRows(side2.rows);
  const costVar = side1.total && side2.total ? pctChange(side1.total, side2.total) : null;
  const costDemo = side1.rows.some((r) => r.demo) || side2.rows.some((r) => r.demo);
  const maxCost = Math.max(...side1.rows.map((r) => r.value), ...side2.rows.map((r) => r.value), 1);

  const titulo =
    energyPct > 10 ? "la factura se disparó" : energyPct > 0 ? "la factura subió" : "la factura bajó";

  const chip = (active: boolean) =>
    `flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
      active
        ? "bg-[#0797d5] text-white shadow-xs"
        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
    }`;
  // En móvil los filtros se desplazan en horizontal; desde sm se acomodan en varias líneas
  const chipRow = "-mx-1 mt-4 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible";

  return (
    <div className="w-full min-w-0 text-slate-900">
      <header>
        <p className="text-xs text-slate-500 sm:text-sm">
          {data.distributor}
          {data.supplyNumber ? ` · Suministro ${data.supplyNumber}` : ""}
          {data.title ? ` · ${data.title}` : ""}
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl xl:text-3xl">
          {data.baseLabel} vs. {data.currentLabel}: {titulo}
        </h2>
      </header>

      {/* Lectura clave para finanzas */}
      {excess > 0 && (
        <div className="mt-4 flex gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-slate-700">
          <Info size={18} className="mt-0.5 shrink-0 text-[#0797d5]" />
          <p>
            <span className="font-semibold text-slate-900">Lectura clave: </span>
            los cargos por potencia suman S/ {fmt(powerTotal)} ({powerPct}% del recibo de{" "}
            {data.currentLabel}) y la demanda máxima supera en {excess.toFixed(2)} kW lo contratado (
            {m.contractedKw} kW), con {monthsOver} meses por encima del límite.
          </p>
        </div>
      )}

      {/* Cifras principales */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
        <Kpi
          icon={Zap}
          label="Energía total"
          value={signed(energyPct)}
          sub={`${fmt(totalBase)} a ${fmt(totalNow)} kWh`}
          pct={energyPct}
        />
        <Kpi
          icon={Gauge}
          label="Potencia máxima"
          value={signed(kwPct)}
          sub={`${fmt(m.maxKw[0])} a ${fmt(m.maxKw[last])} kW`}
          pct={kwPct}
        />
        <Kpi
          icon={AlertTriangle}
          label={excess > 0 ? "Sobre lo contratado" : "Margen disponible"}
          value={`${excess > 0 ? "+" : ""}${excess.toFixed(2)} kW`}
          sub={`Límite ${m.contractedKw} kW · ${monthsOver} meses sobre el límite`}
          pct={excess > 0 ? 100 : 0}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-5 sm:gap-5">
        {/* Pasteles: mes vs mes */}
        <section className={card}>
          <SectionHead
            title={`${MESES[selMonth]} ${year1} vs. ${MESES[selMonth]} ${year2}`}
            subtitle="Distribución de la energía consumida: fuera de punta y hora punta"
          />

          <div className={chipRow}>
            {MESES.map((nombre, i) => (
              <button
                key={nombre}
                type="button"
                onClick={() => setSelMonth(i)}
                aria-pressed={i === selMonth}
                title={
                  realCount(i) === 2
                    ? "Datos reales en ambos años"
                    : realCount(i) === 1
                      ? "Dato real en un solo año (el otro es ficticio)"
                      : "Datos ficticios (demo)"
                }
                className={chip(i === selMonth)}
              >
                {nombre}
                <span
                  className={`size-1.5 rounded-full ${
                    realCount(i) === 2
                      ? "bg-emerald-400"
                      : realCount(i) === 1
                        ? "bg-amber-400"
                        : i === selMonth
                          ? "bg-white/50"
                          : "bg-slate-300"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr] md:gap-4">
            <PieCard
              year={year1}
              monthName={MESES[selMonth]}
              d={d1}
              next={d2}
              contractedKw={m.contractedKw}
            />
            <div className="flex items-center justify-center gap-2 md:flex-col md:self-center">
              {varPct !== null ? (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold tabular-nums ring-1 ${semaforoCls(varPct)}`}
                >
                  <Trend v={varPct} />
                  {signed(varPct)}
                </span>
              ) : (
                <span className="text-xs text-slate-400">—</span>
              )}
              <span className="text-[11px] text-slate-500">energía total</span>
            </div>
            <PieCard year={year2} monthName={MESES[selMonth]} d={d2} prev={d1} contractedKw={m.contractedKw} />
          </div>

          {usesDemo && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200">
              Los pasteles marcados como «Demo» usan datos ficticios y se reemplazarán cuando cargues los
              recibos reales de ese mes.
            </p>
          )}

          {/* Leyenda: color = estado, tono = parte del consumo */}
          <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-xs text-slate-600 sm:grid-cols-2">
            <div>
              <p className="mb-2 font-semibold text-slate-800">
                Color: ¿cómo cambió de {year1} a {year2}?
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-emerald-500" /> Bajó o igual
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-amber-500" /> Sube hasta 10%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-red-500" /> Sube más de 10%
                </span>
              </div>
            </div>
            <div>
              <p className="mb-2 font-semibold text-slate-800">Tono: ¿qué parte del consumo?</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-slate-600" /> Tono fuerte: fuera de punta
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-slate-600/40" /> Tono claro: hora punta
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Potencia máxima Ene-Dic, con filtro por mes */}
        <section className={card}>
          <SectionHead
            title={`Potencia máxima mensual (kW): ${year1} vs. ${year2}`}
            subtitle="La línea roja punteada marca la potencia contratada"
          />

          <div className={chipRow}>
            <button type="button" onClick={() => setChartMonth(null)} className={chip(chartMonth === null)}>
              Todo el año
            </button>
            {MESES.map((nombre, i) => (
              <button
                key={nombre}
                type="button"
                onClick={() => setChartMonth(i)}
                aria-pressed={i === chartMonth}
                className={chip(i === chartMonth)}
              >
                {nombre}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            {series.map((s, k) => (
              <span key={s.year} className="flex items-center gap-1.5">
                <span className="h-1 w-4 rounded" style={{ backgroundColor: lineColors[k] }} />
                {s.year}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full border-2 border-slate-400 bg-white" />
              Dato ficticio (demo)
            </span>
          </div>

          <div ref={chartRef} className="mt-3 w-full overflow-hidden">
            <svg
              width={W}
              height={H}
              className="block"
              role="img"
              aria-label={`Potencia máxima mensual de ${year1} y ${year2}; el límite contratado es ${m.contractedKw} kW`}
            >
              {chartMonth !== null && (
                <rect
                  x={x(chartMonth) - (small ? 12 : 18)}
                  y={pt - 8}
                  width={small ? 24 : 36}
                  height={H - pt - pb + 8}
                  rx="6"
                  fill="#0797d5"
                  fillOpacity="0.08"
                />
              )}
              {yTicks.map((t) => (
                <g key={t}>
                  <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="#e2e8f0" />
                  <text x={pl - 6} y={y(t) + 4} textAnchor="end" fontSize={small ? 10 : 12} fill="#64748b">
                    {t}
                  </text>
                </g>
              ))}
              <line
                x1={pl}
                x2={W - pr}
                y1={y(m.contractedKw)}
                y2={y(m.contractedKw)}
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <text
                x={x(0) + 6}
                y={y(m.contractedKw) - 7}
                fontSize={small ? 10 : 12}
                fontWeight="600"
                fill="#dc2626"
              >
                Contratada {m.contractedKw} kW
              </text>

              {series.map((s, k) => (
                <g key={s.year}>
                  <polyline
                    points={s.pts.map((p) => `${x(p.mo)},${y(p.kw)}`).join(" ")}
                    fill="none"
                    stroke={lineColors[k]}
                    strokeWidth={k === 0 ? 2 : 2.75}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {s.pts.map((p) => {
                    const color = p.kw > m.contractedKw ? "#ef4444" : lineColors[k];
                    return (
                      <circle
                        key={p.mo}
                        cx={x(p.mo)}
                        cy={y(p.kw)}
                        r={p.mo === chartMonth ? 6.5 : small ? 3.5 : 4.5}
                        fill={p.demo ? "#ffffff" : color}
                        stroke={p.demo ? color : "#ffffff"}
                        strokeWidth="2"
                      />
                    );
                  })}
                </g>
              ))}

              {labelPts.map((p, k) => {
                const other = labelPts.length > 1 ? labelPts[1 - k] : null;
                const above = !other || p.kw >= other.kw;
                return (
                  <text
                    key={k}
                    x={x(p.mo)}
                    y={y(p.kw) + (above ? -12 : 22)}
                    textAnchor="middle"
                    fontSize={small ? 12 : 13}
                    fontWeight="700"
                    fill="#0f172a"
                  >
                    {fmt(p.kw)}
                  </text>
                );
              })}

              {MESES.map((mo, i) => (
                <text
                  key={mo}
                  x={x(i)}
                  y={H - 8}
                  textAnchor="middle"
                  fontSize={small ? 10 : 12}
                  fill={i === chartMonth ? "#0f172a" : "#64748b"}
                  fontWeight={i === chartMonth ? 700 : 400}
                >
                  {mo}
                </text>
              ))}
            </svg>
          </div>
        </section>
      </div>

      {/* Detalle del recibo: mismo mes, año contra año */}
      <section className={`${card} mt-4 sm:mt-5`}>
        <SectionHead
          title={`En qué se va el recibo: ${MESES[selMonth]} ${year1} vs. ${MESES[selMonth]} ${year2}`}
          subtitle="Desglose de cada concepto facturado en el mismo mes de ambos años"
        />

        <div className={chipRow}>
          {MESES.map((nombre, i) => (
            <button
              key={nombre}
              type="button"
              onClick={() => setSelMonth(i)}
              aria-pressed={i === selMonth}
              className={chip(i === selMonth)}
            >
              {nombre}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr] md:gap-4">
          <CostPanel year={year1} monthName={MESES[selMonth]} side={side1} next={side2} maxCost={maxCost} />
          <div className="flex items-center justify-center gap-2 md:flex-col md:self-center">
            {costVar !== null ? (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold tabular-nums ring-1 ${semaforoCls(costVar)}`}
              >
                <Trend v={costVar} />
                {signed(costVar)}
              </span>
            ) : (
              <span className="text-xs text-slate-400">—</span>
            )}
            <span className="text-[11px] text-slate-500">total facturado</span>
          </div>
          <CostPanel year={year2} monthName={MESES[selMonth]} side={side2} prev={side1} maxCost={maxCost} />
        </div>

        {costDemo && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200">
            Los recibos marcados como «Demo» usan montos ficticios y se reemplazarán cuando cargues los recibos
            reales de ese mes.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">Color: ¿cómo cambió de {year1} a {year2}?</span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500" /> Bajó o igual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-amber-500" /> Sube hasta 10%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-red-500" /> Sube más de 10%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-red-600">Rojo en el nombre</span> = cargo por potencia
          </span>
        </div>
      </section>
    </div>
  );
};

// ── MODAL: IMPORTAR RECIBOS DE LUZ ──
type ImportPayload = {
  code: string;
  title: string;
  baseLabel: string;
  currentLabel: string;
  fileA: File;
  fileB: File;
};

const isPdf = (f: File) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");

const inputCls =
  "h-11 w-full rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0797d5]";

const FieldLabel = ({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) => (
  <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-slate-800">
    <Icon size={14} className="text-slate-400" />
    {children}
  </label>
);

const PdfPicker = ({
  file,
  placeholder,
  onPick,
}: {
  file: File | null;
  placeholder: string;
  onPick: (f: File) => void;
}) => (
  <label
    className={`flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-3 text-xs transition-colors ${
      file
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-[#0797d5]"
    }`}
  >
    {file ? <FileCheck2 size={16} className="shrink-0" /> : <FileText size={16} className="shrink-0" />}
    <span className="truncate font-medium">{file ? file.name : placeholder}</span>
    <input
      type="file"
      accept="application/pdf,.pdf"
      className="hidden"
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        e.target.value = "";
        if (f && isPdf(f)) onPick(f);
      }}
    />
  </label>
);

const ImportBillsModal = ({
  companyCode,
  existingCodes,
  onClose,
  onSubmit,
}: {
  companyCode?: string;
  existingCodes: string[];
  onClose: () => void;
  onSubmit: (p: ImportPayload) => void;
}) => {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [baseLabel, setBaseLabel] = useState("");
  const [currentLabel, setCurrentLabel] = useState("");
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const trimmed = code.trim();
  const duplicate = existingCodes.some((c) => c.toLowerCase() === trimmed.toLowerCase());
  const valid = !!trimmed && !duplicate && !!fileA && !!fileB;

  const submit = () => {
    if (!valid || !fileA || !fileB) return;
    onSubmit({
      code: trimmed,
      title: title.trim(),
      baseLabel: baseLabel.trim() || "Recibo A",
      currentLabel: currentLabel.trim() || "Recibo B",
      fileA,
      fileB,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-bills-title"
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
              <Receipt size={22} />
            </div>
            <div>
              <h2 id="import-bills-title" className="text-lg font-extrabold text-slate-950">
                Importar Recibos de Luz
              </h2>
              <p className="text-xs text-slate-500">
                Sube el recibo base y el actual para armar el comparativo.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="cursor-pointer rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div>
            <FieldLabel icon={Building2}>Empresa Destino</FieldLabel>
            <div className="relative">
              <select disabled className={`${inputCls} cursor-not-allowed appearance-none bg-slate-50 pr-10`}>
                <option>{companyCode ? `Empresa actual (${companyCode})` : "Empresa actual"}</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel icon={Hash}>Código del Recibo</FieldLabel>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ej: LUZ-SUM-1405305"
                className={`${inputCls} ${duplicate ? "border-red-300 focus:border-red-400" : ""}`}
                autoFocus
              />
            </div>
            <div>
              <FieldLabel icon={MapPin}>Ubicación / Título</FieldLabel>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Agencia Aviación"
                className={inputCls}
              />
            </div>
          </div>
          <p className={`-mt-3 text-[11px] ${duplicate ? "text-red-500" : "text-slate-400"}`}>
            {duplicate
              ? "Ya existe un comparativo con este código."
              : "Este código aparecerá en el menú Facturación > Recibo de Luz."}
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel icon={CalendarDays}>Periodo base</FieldLabel>
              <input
                value={baseLabel}
                onChange={(e) => setBaseLabel(e.target.value)}
                placeholder="Ej: Abr-25"
                className={inputCls}
              />
            </div>
            <div>
              <FieldLabel icon={CalendarDays}>Periodo actual</FieldLabel>
              <input
                value={currentLabel}
                onChange={(e) => setCurrentLabel(e.target.value)}
                placeholder="Ej: Abr-26"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel icon={FileText}>1. Recibo base (PDF)</FieldLabel>
              <PdfPicker file={fileA} placeholder="Subir recibo base..." onPick={setFileA} />
            </div>
            <div>
              <FieldLabel icon={FileText}>2. Recibo actual (PDF)</FieldLabel>
              <PdfPicker file={fileB} placeholder="Subir recibo actual..." onPick={setFileB} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!valid}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-300"
          >
            <CloudUpload size={16} />
            Importar Recibos
          </button>
        </div>
      </div>
    </div>
  );
};

// ── VISTA: LOS DOS PDF (solo lectura, la importación se hace desde el botón de arriba) ──
const PdfViewer = ({ active, slotLabel }: { active: Comparison; slotLabel: Record<Slot, string> }) => (
  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
    {(["a", "b"] as Slot[]).map((slot) => {
      const bill = active.bills[slot];
      return (
        <div
          key={slot}
          className="flex h-[78vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs"
        >
          <div className="border-b border-slate-100 px-4 py-2.5">
            <p className="truncate text-sm font-bold text-slate-900">
              Recibo {slot.toUpperCase()} · {slotLabel[slot]}
            </p>
            {bill && <p className="truncate text-[11px] text-slate-400">{bill.name}</p>}
          </div>

          {bill ? (
            <iframe
              src={`${bill.url}#toolbar=1&navpanes=0`}
              title={`Recibo ${slot.toUpperCase()} ${slotLabel[slot]}`}
              className="h-full w-full flex-1 border-none"
            />
          ) : (
            <div className="m-4 flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-4 text-center">
              <FileText size={28} className="text-slate-300" />
              <p className="mt-2 text-sm font-bold text-slate-700">
                Aún no hay PDF para {slotLabel[slot]}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Usa el botón «Importar Recibos de Luz» para cargarlo.
              </p>
            </div>
          )}
        </div>
      );
    })}
  </div>
);

// ── PÁGINA ──
const comparisonTitle = (c: Comparison) => `${c.baseLabel} vs. ${c.currentLabel}`;

const BillingDashboardPage = () => {
  const { publicCode } = useParams<{ publicCode: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const comparisons = useBillingComparisons();

  const [showPdfs, setShowPdfs] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  // El sidebar enlaza con ?comparison=<id>; si no viene, se usa el primero
  const active = comparisons.find((c) => c.id === searchParams.get("comparison")) ?? comparisons[0];

  const selectComparison = (id: string) => setSearchParams({ comparison: id }, { replace: true });

  const handleImport = (p: ImportPayload) => {
    const created = billingStore.add({ ...p, companyCode: publicCode });
    selectComparison(created.id);
    setShowPdfs(false);
    setImportOpen(false);
  };

  // Sin comparativos aún: evita que la página falle
  if (!active) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-4 bg-slate-50 p-4 sm:p-6">
        {importOpen && (
          <ImportBillsModal
            companyCode={publicCode}
            existingCodes={[]}
            onClose={() => setImportOpen(false)}
            onSubmit={handleImport}
          />
        )}
        <div className="m-auto text-center">
          <Receipt size={32} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-700">Aún no hay comparativos de recibos</p>
          <p className="mt-1 text-xs text-slate-500">Importa dos recibos en PDF para armar el primero.</p>
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
          >
            <CloudUpload size={16} />
            Importar Recibos de Luz
          </button>
        </div>
      </div>
    );
  }

  const slotLabel: Record<Slot, string> = { a: active.baseLabel, b: active.currentLabel };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-4 bg-slate-50 p-4 sm:gap-5 sm:p-6">
      {importOpen && (
        <ImportBillsModal
          companyCode={publicCode}
          existingCodes={comparisons.map((c) => c.code)}
          onClose={() => setImportOpen(false)}
          onSubmit={handleImport}
        />
      )}

      {/* ── CABECERA ── */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50"
        >
          <ArrowLeft size={14} />
          Volver
        </button>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Comparativo de Recibos de Luz
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Versus de consumo, potencia y costo entre dos periodos de facturación.
              {publicCode ? ` Código Empresa: ${publicCode}` : ""}
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700 sm:flex-none"
            >
              <CloudUpload size={16} />
              Importar Recibos de Luz
            </button>
            <button
              type="button"
              onClick={() => setShowPdfs((v) => !v)}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0797d5] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#087fb3] sm:flex-none"
            >
              {showPdfs ? <BarChart3 size={16} /> : <FileText size={16} />}
              {showPdfs ? "Ver comparativo" : "Ver los dos PDF"}
            </button>
          </div>
        </div>
      </div>

      {/* ── TARJETA: COMPARATIVO ACTIVO + LISTA DESPLEGABLE ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
            <Receipt size={22} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Comparativo activo
            </p>
            <p className="text-base font-bold text-slate-900">{active.code}</p>
            <p className="text-xs text-slate-500">
              {active.title ? `${active.title} · ` : ""}
              {comparisonTitle(active)}
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-auto">
          <select
            value={active.id}
            onChange={(e) => selectComparison(e.target.value)}
            aria-label="Seleccionar comparativo de recibos"
            className="w-full cursor-pointer appearance-none rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-5 pr-10 text-xs font-semibold text-slate-700 outline-none transition-colors hover:bg-slate-100 focus:border-[#0797d5] sm:min-w-[280px]"
          >
            {comparisons.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} · {comparisonTitle(c)}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      {showPdfs ? (
        <PdfViewer active={active} slotLabel={slotLabel} />
      ) : (
        <>
          {active.source === "demo" && (
            <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
              <Info size={14} className="mt-0.5 shrink-0" />
              Datos de demostración: los valores del comparativo aún no se leen de los PDF importados.
            </p>
          )}
          {/* key: reinicia el mes seleccionado al cambiar de comparativo */}
          <VersusDashboard key={active.id} data={active} />
        </>
      )}
    </div>
  );
};

export default BillingDashboardPage;
