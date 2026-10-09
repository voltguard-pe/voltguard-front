import React, { useRef } from "react";
import { Coins, Loader2, ReceiptText, UploadCloud } from "lucide-react";
import {
  Bar,
  BarChart,
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

// ── PALETA MONOCROMÁTICA: ROJO CARMESÍ / RUBÍ ──
const COST_COLOR_HP = "#be123c"; // Rubí carmesí intenso (Hora Punta)
const COST_COLOR_FP = "#fb7185"; // Rubí claro / Rosa coral (Fuera de Punta)

// ── COMPONENTE TOOLTIP PERSONALIZADO PARA COSTO DE ENERGÍA ──
const CostTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const costHP = data.costoHP;
    const costFP = data.costoFP;
    const totalDia = data.costoTotal;

    return (
      <div className="rounded-2xl border border-rose-200 bg-white/95 p-3.5 shadow-xl font-sans text-xs min-w-[220px] backdrop-blur-sm">
        <div className="border-b border-rose-100 pb-2 mb-2.5 flex items-center justify-between">
          <span className="font-bold text-slate-800 text-xs">{label}</span>
          <span className="font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 text-[11px]">
            Total: S/. {totalDia.toFixed(2)}
          </span>
        </div>

        <div className="space-y-2">
          {/* Superior: Hora Punta (HP) en Carmesí Profundo */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-rose-950">
              <span className="size-2.5 rounded-full bg-[#be123c] inline-block shadow-sm" />
              Hora Punta (HP):
            </span>
            <span className="font-black text-slate-900 tabular-nums">
              S/. {costHP.toFixed(2)}
            </span>
          </div>

          {/* Inferior: Fuera de Punta (FP) en Rubí Claro */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-rose-800">
              <span className="size-2.5 rounded-full bg-[#fb7185] inline-block shadow-sm" />
              Fuera de Punta (FP):
            </span>
            <span className="font-black text-slate-900 tabular-nums">
              S/. {costFP.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mt-2.5 border-t border-rose-100 pt-1.5 text-[9px] text-slate-400 flex justify-between font-medium">
          <span>HP: 18:00 a 23:00 hrs</span>
          <span className="font-bold text-rose-700">Voltguard</span>
        </div>
      </div>
    );
  }
  return null;
};

// Renderizado del valor dentro de cada barra
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
      className="text-[10px] font-black tabular-nums select-none"
    >
      S/. {item[key].toFixed(2)}
    </text>
  );
};

export const EnergyCostSection: React.FC<EnergyCostSectionProps> = ({
  rates,
  energiaPorDiaData,
  visibleCostSeries,
  seriesKeys,
  onToggleCostDay,
  isUploadingBill,
  onBillUpload
}) => {
  const billFileInputRef = useRef<HTMLInputElement | null>(null);

  if (!rates) {
    return (
      <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-6 shadow-sm font-sans mt-6">
        <input
          type="file"
          ref={billFileInputRef}
          onChange={onBillUpload}
          accept="image/*,application/pdf"
          className="hidden"
          disabled={isUploadingBill}
        />
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50/30 px-4 py-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 mb-3">
            <ReceiptText size={28} />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">
            Costo de Energía Estimado (HP / FP)
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-md">
            Adjunta una fotografía o documento de tu recibo de luz para que la Inteligencia Artificial extraiga automáticamente las tarifas de <strong>Hora Punta (HP)</strong> y <strong>Fuera de Punta (FP)</strong> y genere la proyección de costos.
          </p>
          <button
            type="button"
            disabled={isUploadingBill}
            onClick={() => billFileInputRef.current?.click()}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-black transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isUploadingBill ? (
              <>
                <Loader2 size={16} className="animate-spin text-rose-400" />
                <span>Analizando recibo con IA...</span>
              </>
            ) : (
              <>
                <UploadCloud size={16} className="text-rose-400" />
                <span>Adjuntar Recibo de Luz</span>
              </>
            )}
          </button>
        </div>
      </section>
    );
  }

  // 1. Procesamiento de costos
  const rawCostoData = energiaPorDiaData
    .filter((d) => visibleCostSeries[d.name] !== false)
    .map((item) => {
      const kwhFP = Number(item.kwhFP) || 0;
      const kwhHP = Number(item.kwhHP) || 0;

      const finalFP = (kwhFP > 0 || kwhHP > 0) ? kwhFP : (item.kWh || 0) * (19 / 24);
      const finalHP = (kwhFP > 0 || kwhHP > 0) ? kwhHP : (item.kWh || 0) * (5 / 24);

      const costoFP = finalFP * rates.fp;
      const costoHP = finalHP * rates.hp;
      const costoTotal = costoFP + costoHP;

      return {
        name: item.name,
        costoFP: Number(costoFP.toFixed(2)),
        costoHP: Number(costoHP.toFixed(2)),
        costoTotal: Number(costoTotal.toFixed(2)),
        kWh: item.kWh || 0
      };
    });

  // 2. Magnificación multiplicadora
  const minTotal = rawCostoData.length > 0 ? Math.min(...rawCostoData.map((d) => d.costoTotal)) : 0;
  const BOOST_FACTOR = 15;

  const costoData = rawCostoData.map((item) => {
    const delta = Math.max(0, item.costoTotal - minTotal);
    const visualBoost = delta * BOOST_FACTOR;

    return {
      ...item,
      deltaOriginal: delta,
      alturaVisualFP: item.costoFP,
      alturaVisualHP: item.costoHP + visualBoost
    };
  });

  // 3. Cálculos de Totales y Proyecciones reales
  const totalCostoPeriodo = rawCostoData.reduce((acc, curr) => acc + curr.costoTotal, 0);
  const totalCostoHP = rawCostoData.reduce((acc, curr) => acc + curr.costoHP, 0);
  const totalCostoFP = rawCostoData.reduce((acc, curr) => acc + curr.costoFP, 0);

  const promedioCostoDiario = rawCostoData.length > 0 ? totalCostoPeriodo / rawCostoData.length : 0;
  const proyeccionMes30Dias = promedioCostoDiario * 30;

  return (
    <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all duration-300 hover:border-slate-300 font-sans mt-6">
      <input
        type="file"
        ref={billFileInputRef}
        onChange={onBillUpload}
        accept="image/*,application/pdf"
        className="hidden"
        disabled={isUploadingBill}
      />

      {/* Encabezado */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-rose-500/10 text-rose-700">
            <Coins size={20} className="sm:size-[22px]" />
          </div>
          <div>
            <h2 className="font-bold text-slate-950 text-sm sm:text-base tracking-tight">
              Costo de Energía Estimado (HP / FP)
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Tarifas aplicadas del recibo: HP = <strong className="text-rose-900">S/. {rates.hp.toFixed(4)}</strong> | FP = <strong className="text-rose-700">S/. {rates.fp.toFixed(4)}</strong> por kWh
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isUploadingBill}
          onClick={() => billFileInputRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isUploadingBill ? (
            <>
              <Loader2 size={16} className="animate-spin text-rose-400" />
              <span>Extrayendo con IA...</span>
            </>
          ) : (
            <>
              <ReceiptText size={16} className="text-rose-400" />
              <span>Cambiar Recibo de Luz</span>
            </>
          )}
        </button>
      </div>

      {/* 4 TARJETAS KPI EN TONOS RUBÍ Y CARMESÍ */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Periodo */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-rose-800">Total Periodo Filtrado</p>
          <p className="mt-1 text-2xl font-black text-rose-950">
            S/. {totalCostoPeriodo.toFixed(2)}
          </p>
          <p className="mt-1 text-[10px] text-rose-700/90">Suma total de días seleccionados</p>
        </div>

        {/* Proyección Mensual */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">Proyección Mensual (30d)</p>
          <p className="mt-1 text-2xl font-black text-slate-950">
            S/. {proyeccionMes30Dias.toFixed(2)}
          </p>
          <p className="mt-1 text-[10px] text-slate-600 font-semibold">Promedio: S/. {promedioCostoDiario.toFixed(2)} / día</p>
        </div>

        {/* Fuera de Punta (FP) - Rubí claro */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-4">
          <div className="flex items-center gap-1.5 text-rose-800">
            <span className="size-2 rounded-full bg-[#fb7185] inline-block shadow-sm" />
            <p className="text-[10px] font-black uppercase tracking-wider text-rose-800">Fuera de Punta (FP)</p>
          </div>
          <p className="mt-1 text-2xl font-black text-slate-900">
            S/. {totalCostoFP.toFixed(2)}
          </p>
          <p className="mt-1 text-[10px] text-rose-700/90">Horario base económico (19 horas)</p>
        </div>

        {/* Hora Punta (HP) - Rubí carmesí profundo */}
        <div className="rounded-2xl border border-rose-300 bg-rose-100/50 p-4">
          <div className="flex items-center gap-1.5 text-rose-950">
            <span className="size-2 rounded-full bg-[#be123c] inline-block shadow-sm" />
            <p className="text-[10px] font-black uppercase tracking-wider text-rose-950">Hora Punta (HP)</p>
          </div>
          <p className="mt-1 text-2xl font-black text-slate-900">
            S/. {totalCostoHP.toFixed(2)}
          </p>
          <p className="mt-1 text-[10px] text-rose-800 font-semibold">Horario crítico (18:00 a 23:00 hrs)</p>
        </div>
      </div>

      {/* Selector de Días */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 p-2 rounded-2xl bg-slate-100 border border-slate-200/40 scrollbar-none">
        <span className="text-[10px] font-black uppercase text-slate-400 self-center mr-1">Días:</span>
        {seriesKeys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onToggleCostDay(key)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer shrink-0 ${
              visibleCostSeries[key] !== false
                ? "bg-rose-700 border-rose-700 text-white shadow-sm"
                : "bg-white border-slate-200 text-slate-400"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Gráfico Stacked Bar Chart */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-0 sm:border-none scrollbar-thin">
        <div className="h-80 sm:h-96 md:h-[400px] w-[600px] sm:w-full text-xs font-medium text-slate-500 select-none">
          {costoData.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-slate-400 font-semibold text-sm">
              Selecciona al menos un día para visualizar los datos del gráfico.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costoData} margin={{ top: 25, right: 15, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  stroke="#94a3b8"
                  dy={8}
                  tick={{ fontSize: "10px", fontWeight: "700", fill: "#475569" }}
                >
                  <Label
                    value="Días del Periodo"
                    position="insideBottom"
                    offset={-20}
                    style={{ textAnchor: "middle", fill: "#475569", fontWeight: "800", fontSize: "9px", letterSpacing: "0.05em" }}
                  />
                </XAxis>
                <YAxis
                  tickLine={false}
                  stroke="#94a3b8"
                  width={60}
                  tick={{ fontSize: "10px" }}
                  tickFormatter={(val) => `S/. ${val}`}
                >
                  <Label
                    value="Costo Relativo"
                    angle={-90}
                    position="insideLeft"
                    offset={-5}
                    style={{ textAnchor: "middle", fill: "#475569", fontWeight: "800", fontSize: "9px", letterSpacing: "0.05em" }}
                  />
                </YAxis>

                <Tooltip content={<CostTooltip />} cursor={{ fill: "#f1f5f9", opacity: 0.6 }} />

                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: "16px", fontSize: "11px", fontWeight: 600 }}
                  formatter={(val) => {
                    if (val === "alturaVisualHP" || val === "costoHP") return "Hora Punta (HP)";
                    if (val === "alturaVisualFP" || val === "costoFP") return "Fuera de Punta (FP)";
                    return val;
                  }}
                />

                {/* Segmento Inferior: Fuera de Punta (FP) - Rubí Claro */}
                <Bar
                  dataKey="alturaVisualFP"
                  name="costoFP"
                  stackId="costo"
                  fill={COST_COLOR_FP}
                  maxBarSize={48}
                >
                  <LabelList
                    content={(props) => renderSegmentLabel({ ...props, data: costoData }, "costoFP", "#881337")}
                  />
                </Bar>

                {/* Segmento Superior: Hora Punta (HP) - Carmesí / Rubí Oscuro */}
                <Bar
                  dataKey="alturaVisualHP"
                  name="costoHP"
                  stackId="costo"
                  fill={COST_COLOR_HP}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                >
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