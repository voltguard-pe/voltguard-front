import React, { useEffect, useMemo, useRef, useState } from "react";
import { Container, Upload, Loader2, ReceiptText } from "lucide-react";
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
  onBillUpload?: (file: File) => Promise<void>;
  // kWh del mes facturado según el detalle del recibo (lo devuelve el backend). Sirve para detectar datos viejos.
  kwhFacturadoRecibo?: number | null;
}

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"];
const AHORRO_DEFAULT = 5;
// Por debajo de este consumo mensual máximo (kWh) no se ofrece ampliar el eje
const UMBRAL_AMPLIAR = 20000;

// Medidas de las barras (px). Con pocas barras se fijan para que queden juntas y centradas.
const BAR = 48;
const GAP = 6;
const POCAS_BARRAS = 4;

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

// El total del mes se calcula SIEMPRE como HP + FP; "kWh" solo es respaldo si no hay desglose.
const kwhDe = (m: EnergyMonthItem) => {
  const t = (Number(m.kwhHP) || 0) + (Number(m.kwhFP) || 0);
  return t > 0 ? t : Number(m.kWh) || 0;
};

// Paso "bonito" (1, 2, 5 × 10^n) para dividir un rango en ~5 intervalos
const niceStep = (range: number) => {
  const raw = Math.max(range, 1) / 5;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
};

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
  onBillUpload,
  kwhFacturadoRecibo = null
}) => {
  const [ahorroLocal, setAhorroLocal] = useState<number>(ahorroMeta);
  const [visibleSeries, setVisibleSeries] = useState<{ [key: string]: boolean }>({});
  const [ejeDesdeCero, setEjeDesdeCero] = useState<boolean>(true);
  const billFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setAhorroLocal(ahorroMeta);
  }, [ahorroMeta]);

  const seriesKeys = useMemo(() => {
    return (energiaPorMesData ?? []).map((m) => m.name);
  }, [energiaPorMesData]);

  // Cada vez que cambian los meses disponibles (p. ej. se sube otro recibo) se muestran todos
  // de nuevo, para no arrastrar filtros de una subida anterior.
  const seriesSignature = seriesKeys.join("|");
  useEffect(() => {
    const initial: { [key: string]: boolean } = {};
    seriesKeys.forEach((key) => {
      initial[key] = true;
    });
    setVisibleSeries(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesSignature]);

  const activeCount = useMemo(
    () => seriesKeys.filter((key) => visibleSeries[key] !== false).length,
    [seriesKeys, visibleSeries]
  );

  const isAllSelected = useMemo(
    () => seriesKeys.length > 0 && seriesKeys.every((key) => visibleSeries[key] !== false),
    [seriesKeys, visibleSeries]
  );

  // Chips fijos Ene → Dic. Cada uno apunta a los periodos del recibo que caen en ese mes.
  const chipsMeses = useMemo(() => {
    const chips: { label: string; keys: string[] }[] = MESES.map((label, idx) => ({
      label,
      keys: seriesKeys.filter((k) => parsePeriod(k)?.month === idx)
    }));
    seriesKeys
      .filter((k) => !parsePeriod(k))
      .forEach((k) => chips.push({ label: k, keys: [k] }));
    return chips;
  }, [seriesKeys]);

  const handleToggleMes = (keys: string[]) => {
    if (keys.length === 0) return;
    const isSelected = keys.every((k) => visibleSeries[k] !== false);
    if (isSelected && activeCount - keys.length <= 0) return; // al menos un mes visible
    setVisibleSeries((prev) => {
      const next = { ...prev };
      keys.forEach((k) => {
        next[k] = !isSelected;
      });
      return next;
    });
  };

  const handleSelectAll = () => {
    const updated: { [key: string]: boolean } = {};
    seriesKeys.forEach((key) => {
      updated[key] = true;
    });
    setVisibleSeries(updated);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (onBillUpload) {
      await onBillUpload(file);
    }
    if (e.target) {
      e.target.value = "";
    }
  };

  const ahorroPct = ahorroLocal;

  const model = useMemo(() => {
    const real = (energiaPorMesData ?? []).filter(
      (m) => visibleSeries[m.name] !== false && kwhDe(m) > 0
    );
    if (real.length === 0) return null;

    const last12 = real;
    const completo = real.length >= 12;
    const factor = 1 - ahorroPct / 100;

    const lastP = parsePeriod(real[real.length - 1].name);
    const firstP = parsePeriod(last12[0].name);

    const rows: ChartRow[] = last12.map((match) => {
      const realName = match.name;
      let proyName = `Proy. ${match.name}`;

      const parsed = parsePeriod(match.name);
      if (parsed) {
        proyName = `${MESES[parsed.month]} ${yy(parsed.year + 1)}`;
      }

      const baseTotal = kwhDe(match);
      return {
        name: realName,
        realName,
        proyName,
        hasReal: true,
        realTotal: baseTotal,
        proyTotal: baseTotal * factor
      };
    });

    const anualReal = sum(last12.map((m) => kwhDe(m)));
    const anualProy = sum(rows.map((p) => p.proyTotal));
    const hpAnual = sum(last12.map((m) => Number(m.kwhHP) || 0));
    const ultimo = real[real.length - 1];

    let labelReal = "actual";
    let labelProy = "próx. año";
    if (lastP && firstP) {
      labelReal =
        firstP.year === lastP.year ? yy(firstP.year) : `${yy(firstP.year)}/${yy(lastP.year)}`;
      labelProy =
        firstP.year === lastP.year
          ? yy(firstP.year + 1)
          : `${yy(firstP.year + 1)}/${yy(lastP.year + 1)}`;
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

  const ultimoKwh = ultimo ? kwhDe(ultimo) : 0;

  // Si el último mes pintado no coincide con el del recibo, los datos guardados son viejos o erróneos
  const datosDesactualizados =
    kwhFacturadoRecibo != null &&
    kwhFacturadoRecibo > 0 &&
    Math.abs(ultimoKwh - kwhFacturadoRecibo) / kwhFacturadoRecibo > 0.02;

  /* ── Escala del eje Y dinámica ── */
  const maxVal = Math.max(0, ...data.map((d) => Math.max(d.realTotal, d.proyTotal)));
  const minVal = Math.min(...data.flatMap((d) => [d.realTotal, d.proyTotal]));

  const topRaw = Math.max(maxVal * 1.1, 1);
  const zoomBase = Math.max(0, minVal * 0.85);

  const stepZoom = niceStep(topRaw - zoomBase);
  const puedeAmpliar =
    maxVal > UMBRAL_AMPLIAR && Math.floor(zoomBase / stepZoom) * stepZoom > 0;
  const usarZoom = puedeAmpliar && !ejeDesdeCero;

  const bottomRaw = usarZoom ? zoomBase : 0;

  const step = niceStep(topRaw - bottomRaw);
  const yMin = Math.floor(bottomRaw / step) * step;
  const yMax = Math.ceil(topRaw / step) * step;

  const yTicks: number[] = [];
  for (let v = yMin; v <= yMax + step / 2; v += step) {
    yTicks.push(Math.round(v * 100) / 100);
  }

  // Con pocas barras: se fija su ancho y se dejan juntas (si no, Recharts las separa cientos de px)
  const pocasBarras = data.length <= POCAS_BARRAS;
  const off = (BAR + GAP) / 2; // la etiqueta de cada barra se centra bajo ella

  const notaAnual = completo
    ? `Suma de los ${mesesReales} meses seleccionados`
    : `Suma de ${mesesReales} mes(es) seleccionado(s)`;

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

      {datosDesactualizados && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs font-bold text-amber-800">
          ⚠ El último mes de la gráfica ({fmt(ultimoKwh)} kWh) no coincide con el del recibo ({fmt(kwhFacturadoRecibo ?? 0)} kWh).
          Vuelve a subir el recibo para reemplazar los datos guardados.
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={metricCard}>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Último mes facturado</p>
          <p className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {fmt(ultimoKwh)} <span className="text-base font-bold text-blue-600">kWh</span>
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

      {/* ── FILTROS DE MESES ── */}
      <div className="mb-6 flex flex-col gap-3 p-3 rounded-2xl bg-slate-50/90 border border-slate-200/90 font-sans sm:flex-row sm:items-center">
        <span className="pl-2 text-xs font-black uppercase text-slate-400 tracking-widest shrink-0">Meses:</span>

        <div className="flex flex-1 flex-wrap items-center gap-2">
          {chipsMeses.map(({ label, keys }) => {
            const hasData = keys.length > 0;
            const isSelected = hasData && keys.every((k) => visibleSeries[k] !== false);
            const isLastActive = isSelected && activeCount === keys.length;

            return (
              <button
                key={label}
                type="button"
                disabled={!hasData}
                onClick={() => handleToggleMes(keys)}
                title={
                  !hasData
                    ? "Este mes no figura en el recibo"
                    : isLastActive
                      ? "Debe mantener al menos un mes visible"
                      : keys.join(", ")
                }
                className={`min-w-[56px] px-3.5 py-1.5 rounded-full text-xs font-bold border text-center transition-all ${
                  !hasData
                    ? "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed"
                    : isSelected
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-xs cursor-pointer"
                      : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
                } ${isLastActive ? "cursor-not-allowed opacity-80" : ""}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="shrink-0 sm:pl-3 sm:border-l border-slate-200">
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

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {puedeAmpliar && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEjeDesdeCero((v) => !v)}
                className="px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
              >
                {ejeDesdeCero ? "Ampliar diferencias" : "Eje desde 0"}
              </button>
              {usarZoom && (
                <span className="text-[11px] font-bold text-amber-600">⚠ El eje no inicia en 0</span>
              )}
            </div>
          )}

          <div className="inline-flex items-center gap-3 rounded-2xl border-2 border-emerald-400 bg-emerald-50 px-6 py-2.5 shadow-sm">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-600">Ahorro</span>
            <span className="text-2xl sm:text-3xl font-black tabular-nums text-emerald-600">{fmt(ahorro, 1)}%</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-3 scrollbar-thin">
        {/* Añadimos las clases para eliminar el outline en elementos internos como rectángulos y textos */}
        <div className="h-[600px] md:h-[680px] w-[1000px] lg:w-full text-xs font-semibold text-slate-600 select-none focus:outline-none [&_*]:focus:outline-none [&_path]:focus:outline-none [&_rect]:focus:outline-none">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart
              data={data}
              margin={{ top: 75, right: 30, left: 30, bottom: 65 }}
              barCategoryGap={pocasBarras ? "30%" : "12%"}
              barGap={GAP}
              style={{ outline: "none", border: "none", boxShadow: "none" }}
            >
              <defs>
                <linearGradient id="realBlueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>
                <linearGradient id="proyRedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#be123c" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />

              <XAxis
                dataKey="realName"
                tickLine={false}
                stroke="#64748b"
                interval={0}
                height={75}
                tick={({ x, y, payload }: any) => {
                  const row = data.find((d) => d.realName === payload.value);
                  // Con muchas barras las dos etiquetas van en el mismo punto; con pocas, cada una bajo su barra
                  const dx = pocasBarras ? off : 18;
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={-dx}
                        y={18}
                        textAnchor="end"
                        fill="#1d4ed8"
                        fontSize={14}
                        fontWeight={900}
                        transform={`rotate(-35, ${-dx}, 18)`}
                      >
                        {row?.realName}
                      </text>
                      <text
                        x={dx}
                        y={18}
                        textAnchor="end"
                        fill="#e11d48"
                        fontSize={14}
                        fontWeight={900}
                        transform={`rotate(-35, ${dx}, 18)`}
                      >
                        {row?.proyName}
                      </text>
                    </g>
                  );
                }}
              >
                <Label
                  value={`Azul: consumo real (${labelReal}) · Rojo: proyección con ahorro (${labelProy})`}
                  position="insideBottom"
                  offset={-40}
                  style={{
                    textAnchor: "middle",
                    fill: "#334155",
                    fontWeight: "900",
                    fontSize: "14px",
                    letterSpacing: "0.05em"
                  }}
                />
              </XAxis>

              <YAxis
                domain={[yMin, yMax]}
                ticks={yTicks}
                interval={0}
                tickLine={false}
                stroke="#64748b"
                width={80}
                tick={{ fontSize: "13px", fontWeight: "800", fill: "#475569" }}
                tickFormatter={(v) => Number(v).toLocaleString("es-PE")}
              >
                <Label
                  value="Energía Activa (kWh)"
                  angle={-90}
                  position="insideLeft"
                  offset={-10}
                  style={{
                    textAnchor: "middle",
                    fill: "#334155",
                    fontWeight: "900",
                    fontSize: "14px"
                  }}
                />
              </YAxis>

              <Tooltip
                cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
                content={<EnergyTooltip ahorroPct={ahorroPct} />}
              />

              <Bar
                dataKey="realTotal"
                fill="url(#realBlueGradient)"
                barSize={pocasBarras ? BAR : undefined}
                maxBarSize={BAR}
                radius={[6, 6, 0, 0]}
              >
                <LabelList
                  dataKey="realTotal"
                  position="top"
                  formatter={fmtK}
                  style={{ fontSize: 14, fontWeight: 900, fill: "#1e40af" }}
                  offset={8}
                />
              </Bar>

              <Bar
                dataKey="proyTotal"
                fill="url(#proyRedGradient)"
                fillOpacity={0.85}
                stroke="#be123c"
                strokeWidth={1.5}
                barSize={pocasBarras ? BAR : undefined}
                maxBarSize={BAR}
                radius={[6, 6, 0, 0]}
              >
                <LabelList
                  dataKey="proyTotal"
                  position="top"
                  formatter={fmtK}
                  style={{ fontSize: 14, fontWeight: 900, fill: "#be123c" }}
                  offset={8}
                />

                <LabelList
                  dataKey="proyTotal"
                  content={(p: any) => {
                    if (!ahorroPct || !p?.value) return null;
                    const barHeight = Number(p.height);
                    if (barHeight < 40) return null;

                    return (
                      <g transform={`translate(${Number(p.x) + Number(p.width) / 2}, ${Number(p.y) + 20})`}>
                        <rect x={-21} y={-10} width={42} height={20} rx={5} fill="#ffffff" opacity={0.95} />
                        <text
                          x={0}
                          y={1}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={11}
                          fontWeight={900}
                          fill="#047857"
                        >
                          -{fmt(ahorroPct, 1)}%
                        </text>
                      </g>
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
