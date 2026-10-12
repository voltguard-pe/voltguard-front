import React, { useEffect, useMemo, useRef, useState } from "react";
import { Coins, Loader2, ReceiptText, UploadCloud } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Label,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface EnergyCostSectionProps {
  rates: { hp: number; fp: number } | null;
  energiaPorDiaData: any[];
  visibleCostSeries: { [key: string]: boolean };
  seriesKeys: string[];
  onToggleCostDay: (key: string) => void;
  isUploadingBill: boolean;
  onBillUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

// ── TOOLTIP ──
const CostTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xl font-sans text-xs min-w-[220px]">
        <div className="border-b border-slate-100 pb-2 mb-2.5 flex items-center justify-between">
          <span className="font-bold text-slate-800 text-xs">{label}</span>
          <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
            Total: S/. {data.costoTotal.toFixed(2)}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-[#ff2e51]">
              <span className="size-2.5 rounded-full bg-[#ff2e51] inline-block" />
              Hora Punta (HP):
            </span>
            <span className="font-black text-slate-900 tabular-nums">S/. {data.costoHP.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-blue-600">
              <span className="size-2.5 rounded-full bg-blue-500 inline-block" />
              Fuera de Punta (FP):
            </span>
            <span className="font-black text-slate-900 tabular-nums">S/. {data.costoFP.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-2.5 border-t border-slate-100 pt-1.5 text-[9px] text-slate-400 flex justify-between font-medium">
          <span>HP: 18:00 a 23:00 hrs</span>
          <span className="font-bold text-blue-600">VoltGuard</span>
        </div>
      </div>
    );
  }
  return null;
};

// Valor dentro de cada barra
const renderSegmentLabel = (props: any, key: "costoFP" | "costoHP", textColor: string) => {
  const { x, y, width, height, index, data } = props;
  const item = data?.[index];
  if (!item || height < 14) return null;

  return (
    <text
      x={x + width / 2}
      y={y + height / 2 + 4}
      fill={textColor}
      textAnchor="middle"
      className="text-[11px] font-black tabular-nums select-none pointer-events-none"
    >
      S/. {item[key].toFixed(2)}
    </text>
  );
};

export const EnergyCostSection: React.FC<EnergyCostSectionProps> = ({
  rates,
  energiaPorDiaData = [],
  visibleCostSeries = {},
  seriesKeys = [],
  onToggleCostDay,
  isUploadingBill,
  onBillUpload
}) => {
  const billFileInputRef = useRef<HTMLInputElement | null>(null);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // Procesamiento de costos + magnificación visual (memoizado)
  const { rawCostoData, costoData } = useMemo(() => {
    if (!rates || !Array.isArray(energiaPorDiaData)) {
      return {
        rawCostoData: [] as any[],
        costoData: [] as any[]
      };
    }

    const raw = energiaPorDiaData
      .filter((d) => d)
      .map((item) => {
        const kwhFP = Number(item.kwhFP) || 0;
        const kwhHP = Number(item.kwhHP) || 0;

        const finalFP = kwhFP > 0 || kwhHP > 0 ? kwhFP : (item.kWh || 0) * (19 / 24);
        const finalHP = kwhFP > 0 || kwhHP > 0 ? kwhHP : (item.kWh || 0) * (5 / 24);

        const costoFP = finalFP * rates.fp;
        const costoHP = finalHP * rates.hp;
        const costoTotal = costoFP + costoHP;

        const name = item.name || "N/A";

        return {
          name,
          costoFP: Number(costoFP.toFixed(2)),
          costoHP: Number(costoHP.toFixed(2)),
          costoTotal: Number(costoTotal.toFixed(2)),
          kWh: item.kWh || 0
        };
      });

    const filteredRaw = raw.filter((d) => visibleCostSeries[d.name] !== false);

    const minTotal = filteredRaw.length > 0 ? Math.min(...filteredRaw.map((d) => d.costoTotal)) : 0;
    const BOOST_FACTOR = 15;

    const boosted = filteredRaw.map((item) => {
      const delta = Math.max(0, item.costoTotal - minTotal);
      return {
        ...item,
        deltaOriginal: delta,
        alturaVisualFP: item.costoFP,
        alturaVisualHP: item.costoHP + delta * BOOST_FACTOR
      };
    });

    return { rawCostoData: filteredRaw, costoData: boosted };
  }, [rates, energiaPorDiaData, visibleCostSeries]);

  // CÁLCULO DE ESTADOS DE SELECCIÓN
  const isAllSelected = useMemo(() => {
    return seriesKeys.length > 0 && seriesKeys.every((key) => visibleCostSeries[key] !== false);
  }, [seriesKeys, visibleCostSeries]);

  // Contar cuántos días están activos actualmente
  const activeDaysCount = useMemo(() => {
    return seriesKeys.filter((key) => visibleCostSeries[key] !== false).length;
  }, [seriesKeys, visibleCostSeries]);

  // Función segura para alternar días (impide que se desmarque el último día)
  const handleSafeToggleDay = (key: string) => {
    const isCurrentlySelected = visibleCostSeries[key] !== false;
    if (isCurrentlySelected && activeDaysCount <= 1) {
      return;
    }
    onToggleCostDay(key);
  };

  const handleSelectAll = () => {
    seriesKeys.forEach((key) => {
      if (visibleCostSeries[key] === false) {
        onToggleCostDay(key);
      }
    });
  };

  // ── ESTADO VACÍO: sin tarifas ──
  if (!rates) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm font-sans mt-6">
        <input
          type="file"
          ref={billFileInputRef}
          onChange={onBillUpload}
          accept="image/*,application/pdf"
          className="hidden"
          disabled={isUploadingBill}
        />
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 px-4 py-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-rose-100 text-blue-600 mb-3">
            <ReceiptText size={28} />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">
            Costo de Energía Estimado (HP / FP)
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-md">
            Adjunta una fotografía o documento de tu recibo de luz para que la Inteligencia Artificial extraiga automáticamente las tarifas de <strong className="text-[#ff2e51]">Hora Punta (HP)</strong> y <strong className="text-blue-600">Fuera de Punta (FP)</strong> y genere la proyección de costos.
          </p>

          <button
            type="button"
            disabled={isUploadingBill}
            onClick={() => billFileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 rounded-xl text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 cursor-pointer border border-blue-500/30"
            style={{ background: "linear-gradient(to right, #3b82f6, #1d4ed8)" }}
          >
            {isUploadingBill ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" />
                <span>Analizando recibo con IA...</span>
              </>
            ) : (
              <>
                <UploadCloud size={16} className="text-white" />
                <span>Adjuntar Recibo de Luz</span>
              </>
            )}
          </button>
        </div>
      </section>
    );
  }

  // Totales y proyecciones reales
  const totalCostoPeriodo = rawCostoData.reduce((acc, curr) => acc + curr.costoTotal, 0);
  const totalCostoHP = rawCostoData.reduce((acc, curr) => acc + curr.costoHP, 0);
  const totalCostoFP = rawCostoData.reduce((acc, curr) => acc + curr.costoFP, 0);

  const promedioCostoDiario = rawCostoData.length > 0 ? totalCostoPeriodo / rawCostoData.length : 0;
  const proyeccionMes30Dias = promedioCostoDiario * 30;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm font-sans mt-6">
      <input
        type="file"
        ref={billFileInputRef}
        onChange={onBillUpload}
        accept="image/*,application/pdf"
        className="hidden"
        disabled={isUploadingBill}
      />

      {/* Encabezado */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-rose-100 text-blue-600 border border-blue-200">
            <Coins size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                Costo de Energía Estimado
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-[#ff2e51] border border-rose-200">
                HP / FP
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Perfil semanal del año. Tarifas del recibo:{" "}
              <span className="text-[#ff2e51] font-semibold">HP = S/. {rates.hp.toFixed(4)}</span> |{" "}
              <span className="text-blue-600 font-semibold">FP = S/. {rates.fp.toFixed(4)}</span> por kWh
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isUploadingBill}
          onClick={() => billFileInputRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 rounded-xl text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 cursor-pointer border border-blue-500/30"
          style={{ background: "linear-gradient(to right, #3b82f6, #1d4ed8)" }}
        >
          {isUploadingBill ? (
            <>
              <Loader2 size={16} className="animate-spin text-white" />
              <span>Extrayendo con IA...</span>
            </>
          ) : (
            <>
              <ReceiptText size={16} className="text-white" />
              <span>Cambiar Recibo de Luz</span>
            </>
          )}
        </button>
      </div>

      {/* Tarjetas KPI */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Periodo */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200">
          <p className="text-[10px] font-black uppercase tracking-wider text-blue-600">Total Periodo Filtrado</p>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            S/. {totalCostoPeriodo.toFixed(2)}
          </p>
          <p className="mt-2 text-[11px] text-slate-500 font-medium">Suma de la semana típica anual</p>
        </div>

        {/* Proyección Mensual */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200">
          <p className="text-[10px] font-black uppercase tracking-wider text-blue-600">Proyección Mensual (30D)</p>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            S/. {proyeccionMes30Dias.toFixed(2)}
          </p>
          <p className="mt-2 text-[11px] text-slate-500 font-medium">
            Promedio: S/. {promedioCostoDiario.toFixed(2)} / día
          </p>
        </div>

        {/* Fuera de Punta (FP) */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-300">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-wider text-blue-600">Fuera de Punta (FP)</p>
            <span className="size-2.5 rounded-full bg-blue-500" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-blue-700 tracking-tight">
            S/. {totalCostoFP.toFixed(2)}
          </p>
          <p className="mt-2 text-[11px] text-blue-600/80 font-medium">Horario base económico (19 horas)</p>
        </div>

        {/* Hora Punta (HP) */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-rose-300">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#ff2e51]">Hora Punta (HP)</p>
            <span className="size-2.5 rounded-full bg-[#ff2e51]" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-[#ff2e51] tracking-tight">
            S/. {totalCostoHP.toFixed(2)}
          </p>
          <p className="mt-2 text-[11px] text-[#ff2e51]/80 font-medium">Horario crítico (18:00 a 23:00 hrs)</p>
        </div>
      </div>

      {/* ── SECCIÓN DE FILTROS ── */}
      <div className="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs font-sans">

        {/* IZQUIERDA */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-black uppercase text-slate-400 mr-1 tracking-wider">Filtros:</span>
        </div>

        {/* CENTRO: Días de la semana (protegidos para no vaciar el gráfico) */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none py-1 justify-start flex-1">
          {seriesKeys.map((key) => {
            const isSelected = visibleCostSeries[key] !== false;
            // Si es el único activo, el botón se muestra bloqueado para evitar un gráfico en blanco
            const isLastActive = isSelected && activeDaysCount === 1;

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSafeToggleDay(key)}
                title={isLastActive ? "Debe mantener al menos un día visible" : undefined}
                className={`flex flex-col items-center justify-center min-w-[78px] px-3.5 py-2 rounded-xl transition-all border cursor-pointer shrink-0 active:scale-95 ${
                  isSelected
                    ? "border-transparent text-white shadow-md shadow-rose-500/10"
                    : "bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300"
                } ${isLastActive ? "cursor-not-allowed opacity-90 ring-2 ring-white/50" : ""}`}
                style={
                  isSelected
                    ? { background: "linear-gradient(to bottom, #f94e6b, #d61a3b)" }
                    : undefined
                }
              >
                <span className="text-xs font-extrabold">{key}</span>
              </button>
            );
          })}
        </div>

        {/* DERECHA: Botón Todos */}
        <div className="flex items-center gap-2 shrink-0 justify-end">
          <button
            type="button"
            onClick={handleSelectAll}
            className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer border active:scale-95 flex items-center gap-1.5 ${
              isAllSelected
                ? "text-white border-blue-500/30 shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/40"
                : "bg-white border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 shadow-xs"
            }`}
            style={
              isAllSelected
                ? { background: "linear-gradient(to right, #3b82f6, #1d4ed8)" }
                : undefined
            }
          >
            {isAllSelected && <span className="size-1.5 rounded-full bg-white animate-pulse" />}
            <span>Todos</span>
          </button>
        </div>

      </div>

      {/* Gráfico Stacked Bar con degradados personalizados */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 sm:p-4 scrollbar-thin">
        <div className="h-80 sm:h-96 md:h-[400px] w-[600px] sm:w-full text-xs font-medium text-slate-500 select-none">
          {costoData.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-slate-400 font-semibold text-sm">
              Selecciona al menos un día para visualizar los datos del gráfico.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={costoData}
                margin={{ top: 25, right: 15, left: 10, bottom: 30 }}
                barCategoryGap="18%"
              >
                <defs>
                  {/* Degradado Azul (Fuera de Punta) */}
                  <linearGradient id="gradFP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>

                  {/* Degradado Rojo (Hora Punta) */}
                  <linearGradient id="gradHP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f94e6b" />
                    <stop offset="100%" stopColor="#d61a3b" />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  stroke="#cbd5e1"
                  dy={8}
                  tick={{ fontSize: "11px", fontWeight: "700", fill: "#334155" }}
                >
                  <Label
                    value="Días de la Semana"
                    position="insideBottom"
                    offset={-20}
                    style={{ textAnchor: "middle", fill: "#334155", fontWeight: "800", fontSize: "10px", letterSpacing: "0.05em" }}
                  />
                </XAxis>
                <YAxis
                  tickLine={false}
                  stroke="#cbd5e1"
                  width={60}
                  tick={{ fontSize: "11px", fontWeight: "600", fill: "#334155" }}
                  tickFormatter={(val) => `S/. ${val}`}
                >
                  <Label
                    value="Costo Relativo"
                    angle={-90}
                    position="insideLeft"
                    offset={-5}
                    style={{ textAnchor: "middle", fill: "#334155", fontWeight: "800", fontSize: "10px", letterSpacing: "0.05em" }}
                  />
                </YAxis>

                <Tooltip content={<CostTooltip />} cursor={{ fill: "#ff2e51", opacity: 0.04 }} />

                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: "16px", fontSize: "12px", fontWeight: 700 }}
                  formatter={(val) => {
                    if (val === "alturaVisualHP" || val === "costoHP") return "Hora Punta (HP)";
                    if (val === "alturaVisualFP" || val === "costoFP") return "Fuera de Punta (FP)";
                    return val;
                  }}
                />

                {/* Inferior: Fuera de Punta (FP) */}
                <Bar
                  dataKey="alturaVisualFP"
                  name="costoFP"
                  stackId="costo"
                  fill="url(#gradFP)"
                  maxBarSize={52}
                  isAnimationActive={animate}
                  animationDuration={900}
                  animationEasing="ease-out"
                >
                  {costoData.map((_, i) => (
                    <Cell
                      key={`fp-${i}`}
                      fill="url(#gradFP)"
                    />
                  ))}
                  <LabelList
                    content={(props) => renderSegmentLabel({ ...props, data: costoData }, "costoFP", "#ffffff")}
                  />
                </Bar>

                {/* Superior: Hora Punta (HP) */}
                <Bar
                  dataKey="alturaVisualHP"
                  name="costoHP"
                  stackId="costo"
                  fill="url(#gradHP)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={52}
                  isAnimationActive={animate}
                  animationDuration={900}
                  animationEasing="ease-out"
                >
                  {costoData.map((_, i) => (
                    <Cell
                      key={`hp-${i}`}
                      fill="url(#gradHP)"
                    />
                  ))}
                  <LabelList
                    content={(props) => renderSegmentLabel({ ...props, data: costoData }, "costoHP", "#ffffff")}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
};