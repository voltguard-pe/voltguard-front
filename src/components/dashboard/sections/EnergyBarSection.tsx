import React, { useEffect, useMemo, useRef, useState } from "react";
import { Container, ChevronLeft, ChevronRight, Upload, Loader2, ReceiptText } from "lucide-react";
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
  name: string; // "May 25"
  kWh: number;
  kwhHP: number;
  kwhFP: number;
  dias: number;
}

interface EnergyBarSectionProps {
  energiaPorMesData: EnergyMonthItem[];
  ahorroMeta?: number;
  onAhorroChange?: (pct: number) => void;
  visibleEnergySeries?: { [key: string]: boolean };
  onToggleEnergyDay?: (key: string) => void;
  isUploadingBill?: boolean;
  // Modificamos para aceptar el archivo directamente o manejar el fetch
  onBillUpload?: (file: File) => Promise<void>;
}

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"];
const AHORRO_DEFAULT = 5;

const fmt = (n: number, decimals = 0) =>
  Number(n).toLocaleString("es-PE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

const parsePeriod = (name: string) => {
  const m = String(name || "").match(/^([A-Za-zñÑ]{3})\s+(\d{2})$/);
  if (!m) return null;
  const idx = MESES.findIndex((x) => x.toLowerCase() === m[1].toLowerCase());
  return idx < 0 ? null : { year: 2000 + Number(m[2]), month: idx };
};

const fmtK = (v: unknown) => {
  const n = Number(v);
  return n > 0 ? `${(n / 1000).toFixed(1)}k` : "";
};

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
const yy = (y: number) => String(y).slice(-2);

interface ChartRow {
  name: string;
  realName: string;
  proyName: string;
  hasReal: boolean;
  realTotal: number;
  proyTotal: number;
}

/* ── TOOLTIP / CARTILLA ── */
const EnergyTooltip = ({ active, payload, ahorroPct }: any) => {
  if (!active || !payload?.length) return null;
  const r: ChartRow = payload[0].payload;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl font-sans text-xs min-w-[250px] backdrop-blur-sm z-50 space-y-3">
      {r.hasReal && (
        <>
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="font-extrabold text-slate-800 text-sm">{r.realName}</span>
              <span className="font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 text-xs">
                {fmt(r.realTotal)} kWh
              </span>
            </div>
          </div>
          <div className="border-t border-slate-100" />
        </>
      )}

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <span className="font-extrabold text-rose-600 text-sm">{r.proyName}</span>
          <span className="font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 text-xs">
            {fmt(r.proyTotal)} kWh
          </span>
        </div>

        {ahorroPct > 0 && (
          <div className="mb-1.5 text-[11px] font-black text-emerald-600">
            Meta: -{fmt(ahorroPct, 1)}% de consumo
          </div>
        )}
      </div>
    </div>
  );
};

export const EnergyBarSection: React.FC<EnergyBarSectionProps> = ({
  energiaPorMesData,
  ahorroMeta = AHORRO_DEFAULT,
  isUploadingBill = false,
  onBillUpload
}) => {
  const [ahorroLocal, setAhorroLocal] = useState<number>(ahorroMeta);
  const [visibleSeries, setVisibleSeries] = useState<{ [key: string]: boolean }>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const billFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setAhorroLocal(ahorroMeta);
  }, [ahorroMeta]);

  const seriesKeys = useMemo(() => {
    return (energiaPorMesData ?? []).map((m) => m.name);
  }, [energiaPorMesData]);

  useEffect(() => {
    if (seriesKeys.length > 0 && Object.keys(visibleSeries).length === 0) {
      const initial: { [key: string]: boolean } = {};
      seriesKeys.forEach((key) => {
        initial[key] = true;
      });
      setVisibleSeries(initial);
    }
  }, [seriesKeys]);

  const activeCount = useMemo(
    () => seriesKeys.filter((key) => visibleSeries[key] !== false).length,
    [seriesKeys, visibleSeries]
  );

  const isAllSelected = useMemo(
    () => seriesKeys.length > 0 && seriesKeys.every((key) => visibleSeries[key] !== false),
    [seriesKeys, visibleSeries]
  );

  const handleToggleSeries = (key: string) => {
    const isSelected = visibleSeries[key] !== false;
    if (isSelected && activeCount <= 1) return;
    setVisibleSeries((prev) => ({ ...prev, [key]: !isSelected }));
  };

  const handleSelectAll = () => {
    const updated: { [key: string]: boolean } = {};
    seriesKeys.forEach((key) => {
      updated[key] = true;
    });
    setVisibleSeries(updated);
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -180 : 180;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (onBillUpload) {
      await onBillUpload(file); // Pasamos el File limpio
    }
    if (e.target) {
      e.target.value = ""; 
    }
  };

  const ahorroPct = ahorroLocal;

  const model = useMemo(() => {
    const real = (energiaPorMesData ?? []).filter((m) => visibleSeries[m.name] !== false);
    if (real.length === 0) return null;

    const last12 = real;
    const completo = real.length >= 12;
    const factor = 1 - ahorroPct / 100;

    const lastP = parsePeriod(real[real.length - 1].name);
    const firstP = parsePeriod(last12[0].name);

    const rows: ChartRow[] = last12.map((match) => {
      let realName = match.name;
      let proyName = `Proy. 1`;

      const parsed = parsePeriod(match.name);
      if (parsed) {
        proyName = `${MESES[parsed.month]} ${yy(parsed.year + 1)}`;
      }

      const baseTotal = match.kWh;
      const proyTotal = baseTotal * factor;

      return {
        name: realName,
        realName,
        proyName,
        hasReal: true,
        realTotal: match.kWh,
        proyTotal
      };
    });

    const anualReal = sum(last12.map((m) => m.kWh));
    const anualProy = sum(rows.map((p) => p.proyTotal));
    const hpAnual = sum(last12.map((m) => m.kwhHP));
    const ultimo = real[real.length - 1];

    let labelReal = "26";
    let labelProy = "27";
    if (lastP && firstP) {
      labelReal =
        firstP.year === lastP.year ? yy(firstP.year) : `${yy(firstP.year)}/${yy(lastP.year)}`;
      labelProy =
        firstP.year === lastP.year
          ? yy(firstP.year + 1)
          : `${yy(firstP.year)}/${yy(firstP.year + 1)}`;
    }

    const ahorro = anualReal > 0 ? (1 - anualProy / anualReal) * 100 : 0;
    const ahorroKwh = anualReal - anualProy;

    return {
      data: rows,
      ultimo,
      completo,
      mesesReales: real.length,
      anualReal,
      anualProy,
      pctHP: anualReal > 0 ? (hpAnual / anualReal) * 100 : 0,
      ahorro,
      ahorroKwh,
      labelReal,
      labelProy
    };
  }, [energiaPorMesData, visibleSeries, ahorroPct]);

  const fileInput = (
    <input
      type="file"
      ref={billFileInputRef}
      onChange={handleFileChange}
      accept="image/*,application/pdf"
      className="hidden"
      disabled={isUploadingBill}
    />
  );

  if (!model) {
    return (
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl font-sans mt-6">
        {fileInput}
        <div className="flex flex-col items-center justify-center h-48 w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-slate-400 font-semibold text-sm gap-3">
          <p>Sube tu recibo de luz para ver el consumo.</p>
          <button
            type="button"
            disabled={isUploadingBill}
            onClick={() => billFileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isUploadingBill ? (
              <>
                <Loader2 size={14} className="animate-spin text-white" />
                <span>Analizando recibo...</span>
              </>
            ) : (
              <>
                <Upload size={14} /> Subir recibo de luz
              </>
            )}
          </button>
        </div>
      </section>
    );
  }

  const {
    data,
    ultimo,
    completo,
    mesesReales,
    anualReal,
    anualProy,
    pctHP,
    ahorro,
    ahorroKwh,
    labelReal,
    labelProy
  } = model;

  const maxVal = Math.max(0, ...data.map((d) => Math.max(d.realTotal, d.proyTotal)));
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
    ? `Suma de los ${mesesReales} meses seleccionados`
    : `Promedio de ${mesesReales} mes(es) seleccionados`;

  const metricCard =
    "relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/60 to-white p-5 shadow-sm";

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl font-sans mt-6">
      {fileInput}

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-500/10 text-blue-600 border border-blue-500/20">
            <Container size={24} />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
              Consumo de Energía y Meta de Ahorro
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Comparación mes a mes del año facturado vs. la proyección con ahorro, en kiloVatios-hora (kWh)
            </p>
          </div>
        </div>

        {/* Botón para subir recibo de luz con estado de carga */}
        <button
          type="button"
          disabled={isUploadingBill}
          onClick={() => billFileInputRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs sm:text-sm hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer shadow-md shrink-0 disabled:opacity-50"
        >
          {isUploadingBill ? (
            <>
              <Loader2 size={16} className="animate-spin text-white" />
              <span>Analizando recibo...</span>
            </>
          ) : (
            <>
              <ReceiptText size={16} className="text-white" />
              <span>Subir recibo de luz</span>
            </>
          )}
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={metricCard}>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Último mes facturado</p>
          <p className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {fmt(ultimo?.kWh || 0)} <span className="text-base font-bold text-blue-600">kWh</span>
          </p>
          <p className="mt-2 text-xs text-slate-500 font-medium">{ultimo?.name || "—"}</p>
        </div>

        <div className={metricCard}>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Consumo filtrado</p>
          <p className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {fmt(anualReal)} <span className="text-base font-bold text-blue-600">kWh</span>
          </p>
          <p className="mt-2 text-xs text-slate-500 font-medium">{notaAnual}</p>
        </div>

        <div className={metricCard}>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Proyección con ahorro</p>
          <p className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {fmt(anualProy)} <span className="text-base font-bold text-blue-600">kWh</span>
          </p>
          <p className="mt-2 text-xs text-slate-500 font-medium">
            {ahorroPct === 0
              ? "Sin ahorro"
              : `${fmt(ahorro, 1)}% menos (${fmt(ahorroKwh)} kWh)`}
          </p>
        </div>

        <div className={metricCard}>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Hora Punta del periodo</p>
          <p className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {fmt(pctHP, 1)} <span className="text-base font-bold text-blue-600">%</span>
          </p>
          <p className="mt-2 text-xs text-slate-500 font-medium">Parte del consumo en HP</p>
        </div>
      </div>

      {/* ── BARRA DE FILTROS DE MESES ── */}
      <div className="mb-6 flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50/90 border border-slate-200/90 font-sans">
        <div className="flex items-center gap-1.5 pl-2 shrink-0">
          <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Meses:</span>
        </div>

        <div className="relative flex items-center flex-1 min-w-0">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="hidden sm:flex items-center justify-center size-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 shrink-0 mr-1.5 cursor-pointer shadow-2xs"
          >
            <ChevronLeft size={16} />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-0.5 scroll-smooth flex-1"
          >
            {seriesKeys.map((key) => {
              const isSelected = visibleSeries[key] !== false;
              const isLastActive = isSelected && activeCount === 1;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleToggleSeries(key)}
                  title={isLastActive ? "Debe mantener al menos un mes visible" : undefined}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border shrink-0 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-xs"
                      : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"
                  } ${isLastActive ? "cursor-not-allowed opacity-80" : ""}`}
                >
                  {key}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scroll("right")}
            className="hidden sm:flex items-center justify-center size-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 shrink-0 ml-1.5 cursor-pointer shadow-2xs"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="pl-2 border-l border-slate-200 shrink-0">
          <button
            type="button"
            onClick={handleSelectAll}
            className={`px-4 py-1.5 text-xs font-black rounded-full border cursor-pointer transition-all ${
              isAllSelected
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white border-slate-200 text-blue-600 hover:bg-blue-50"
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* ── LEYENDA SUPERIOR ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center gap-8 text-sm sm:text-base font-extrabold text-slate-800">
          <span className="flex items-center gap-2.5">
            <span className="size-4 rounded-full bg-blue-500 shadow-sm shrink-0" />
            <span>Barra Azul: Mes Real ({labelReal})</span>
          </span>
          <span className="flex items-center gap-2.5">
            <span className="size-4 rounded-full bg-rose-500 shadow-sm shrink-0" />
            <span>Barra Roja: Mismo Mes Próx. Año ({labelProy})</span>
          </span>
        </div>

        <div className="inline-flex items-center gap-3 self-start sm:self-auto rounded-2xl border-2 border-emerald-400 bg-emerald-50 px-6 py-2.5 shadow-sm">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-600">Ahorro</span>
          <span className="text-2xl sm:text-3xl font-black tabular-nums text-emerald-600">{fmt(ahorro, 1)}%</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-3 scrollbar-thin">
        <div className="h-[600px] md:h-[680px] w-[1000px] lg:w-full text-xs font-semibold text-slate-600 select-none">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart
              data={data}
              margin={{ top: 60, right: 20, left: 20, bottom: 65 }}
              barCategoryGap="16%"
              barGap={10}
              style={{ outline: "none", border: "none" }}
            >
              <defs>
                <linearGradient id="realBlueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="proyRedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb7185" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

              <XAxis
                dataKey="realName"
                tickLine={false}
                stroke="#94a3b8"
                interval={0}
                height={70}
                tick={({ x, y, payload }) => {
                  const row = data.find((d) => d.realName === payload.value);
                  const count = data.length;
                  const dynamicOffset = count <= 2 ? 110 : count <= 4 ? 60 : count <= 6 ? 40 : 25;

                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={-dynamicOffset}
                        y={14}
                        textAnchor="end"
                        fill="#1d4ed8"
                        fontSize={12}
                        fontWeight={900}
                        transform={`rotate(-35, ${-dynamicOffset}, 14)`}
                      >
                        {row?.realName}
                      </text>
                      <text
                        x={dynamicOffset}
                        y={14}
                        textAnchor="end"
                        fill="#e11d48"
                        fontSize={12}
                        fontWeight={900}
                        transform={`rotate(-35, ${dynamicOffset}, 14)`}
                      >
                        {row?.proyName}
                      </text>
                    </g>
                  );
                }}
              >
                <Label
                  value={`Meses facturados (Azul: ${labelReal} · Rojo: ${labelProy})`}
                  position="insideBottom"
                  offset={-38}
                  style={{
                    textAnchor: "middle",
                    fill: "#64748b",
                    fontWeight: "800",
                    fontSize: "12px",
                    letterSpacing: "0.05em"
                  }}
                />
              </XAxis>

              <YAxis
                domain={[0, yMax]}
                ticks={yTicks}
                interval={0}
                allowDataOverflow
                tickLine={false}
                stroke="#94a3b8"
                width={75}
                tick={{ fontSize: "12px", fontWeight: "700", fill: "#64748b" }}
                tickFormatter={(v) => Number(v).toLocaleString("es-PE")}
              >
                <Label
                  value="Energía Activa (kWh)"
                  angle={-90}
                  position="insideLeft"
                  offset={-5}
                  style={{
                    textAnchor: "middle",
                    fill: "#64748b",
                    fontWeight: "800",
                    fontSize: "12px",
                    letterSpacing: "0.05em"
                  }}
                />
              </YAxis>

              <Tooltip
                cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
                content={<EnergyTooltip ahorroPct={ahorroPct} />}
              />

              <Bar dataKey="realTotal" fill="url(#realBlueGradient)" maxBarSize={38}>
                <LabelList
                  dataKey="realTotal"
                  position="top"
                  formatter={fmtK}
                  style={{ fontSize: 13, fontWeight: 900, fill: "#0f172a" }}
                />
              </Bar>

              <Bar
                dataKey="proyTotal"
                fill="url(#proyRedGradient)"
                fillOpacity={0.4}
                stroke="#e11d48"
                strokeDasharray="3 2"
                maxBarSize={38}
              >
                <LabelList
                  dataKey="proyTotal"
                  position="top"
                  formatter={fmtK}
                  style={{ fontSize: 13, fontWeight: 900, fill: "#475569" }}
                />
                <LabelList
                  dataKey="proyTotal"
                  content={(p: any) => {
                    if (!ahorroPct || !p?.value) return null;
                    return (
                      <text
                        x={Number(p.x) + Number(p.width) / 2}
                        y={Number(p.y) - 24}
                        textAnchor="middle"
                        fontSize={13}
                        fontWeight={900}
                        fill="#059669"
                      >
                        -{fmt(ahorroPct, 1)}%
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};