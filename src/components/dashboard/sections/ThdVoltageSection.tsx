import React from "react";
import { Shield } from "lucide-react";
import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface ThdVoltageSectionProps {
  rawChartData: any[];
  seriesKeys: string[];
  selectedThdUDay: string | null;
  onSelectThdUDay: (day: string) => void;
  visibleThdFases: { [key: string]: boolean };
  onToggleThdFase: (fase: string) => void;
}

const VoltageTooltip = ({
  active,
  label,
  payload,
  activeDay,
  visibleThdFases,
  maxThdV
}: any) => {
  if (active && payload && payload.length) {
    const rowData = payload[0]?.payload || {};
    const u12 = Number(rowData[`thd_u12_${activeDay}`] || 0);
    const u23 = Number(rowData[`thd_u23_${activeDay}`] || 0);
    const u31 = Number(rowData[`thd_u31_${activeDay}`] || 0);

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xl font-sans text-xs min-w-[220px]">
        <div className="mb-2 border-b border-slate-100 pb-1.5 flex justify-between items-center">
          <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">
            Distorsión THD-U
          </span>
          <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">
            {label} hrs
          </span>
        </div>
        <p className="text-[11px] font-bold text-slate-700 mb-2">
          Día: <span className="text-slate-900">{activeDay}</span>
        </p>

        <div className="space-y-1.5 font-semibold">
          {visibleThdFases.u12 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-blue-600 font-bold">
                <span className="size-2 rounded-full bg-blue-600 inline-block"></span>
                THD U12:
              </span>
              <span
                className={`font-black tabular-nums ${
                  u12 > 5.0 ? "text-rose-600" : "text-slate-900"
                }`}
              >
                {u12.toFixed(2)}%
              </span>
            </div>
          )}

          {visibleThdFases.u23 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-red-600 font-bold">
                <span className="size-2 rounded-full bg-red-600 inline-block"></span>
                THD U23:
              </span>
              <span
                className={`font-black tabular-nums ${
                  u23 > 5.0 ? "text-rose-600" : "text-slate-900"
                }`}
              >
                {u23.toFixed(2)}%
              </span>
            </div>
          )}

          {visibleThdFases.u31 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <span className="size-2 rounded-full bg-emerald-600 inline-block"></span>
                THD U31:
              </span>
              <span
                className={`font-black tabular-nums ${
                  u31 > 5.0 ? "text-rose-600" : "text-slate-900"
                }`}
              >
                {u31.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        <div className="mt-2.5 border-t border-slate-100 pt-1.5 text-[9px] flex justify-between text-slate-400">
          <span>
            Límite IEEE 519: <strong>5.00%</strong>
          </span>
          <span
            className={
              maxThdV <= 5.0
                ? "text-emerald-600 font-bold"
                : "text-rose-600 font-bold"
            }
          >
            {maxThdV <= 5.0 ? "Conforme" : "No conforme"}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const ThdVoltageSection: React.FC<ThdVoltageSectionProps> = ({
  rawChartData,
  seriesKeys,
  selectedThdUDay,
  onSelectThdUDay,
  visibleThdFases,
  onToggleThdFase
}) => {
  if (rawChartData.length === 0) return null;

  const activeDay = selectedThdUDay || seriesKeys[0] || "";

  let maxThdV = 0;
  let sumThdV = 0;
  let countThdV = 0;
  let horaPicoThdV = "--:--";

  const allVisibleValues: number[] = [];

  rawChartData.forEach((row) => {
    const u12 = Number(row[`thd_u12_${activeDay}`] || 0);
    const u23 = Number(row[`thd_u23_${activeDay}`] || 0);
    const u31 = Number(row[`thd_u31_${activeDay}`] || 0);
    const avg = Number(row[`thd_v_${activeDay}`] || 0);

    const picoPunto = Math.max(u12, u23, u31);

    if (picoPunto > 0) {
      if (picoPunto > maxThdV) {
        maxThdV = picoPunto;
        horaPicoThdV = row.horaMinuto;
      }
      sumThdV += avg > 0 ? avg : (u12 + u23 + u31) / 3;
      countThdV++;
    }

    if (visibleThdFases.u12 && u12 > 0) allVisibleValues.push(u12);
    if (visibleThdFases.u23 && u23 > 0) allVisibleValues.push(u23);
    if (visibleThdFases.u31 && u31 > 0) allVisibleValues.push(u31);
  });

  const avgThdV = countThdV > 0 ? sumThdV / countThdV : 0;
  const cumpleNorma = maxThdV <= 5.0;

  // ── LÓGICA DINÁMICA DE ESCALA EN EL EJE Y (CERO HARDCODING) ──
  const minVal = allVisibleValues.length > 0 ? Math.min(...allVisibleValues) : 0;
  const maxVal = allVisibleValues.length > 0 ? Math.max(...allVisibleValues, 5.0) : 6.0;

  const diff = maxVal - minVal;

  let stepIncrement = 0.5;
  if (diff > 8) stepIncrement = 2;
  else if (diff > 4) stepIncrement = 1;
  else if (diff > 1.5) stepIncrement = 0.5;
  else stepIncrement = 0.2;

  const yMin = Math.max(0, Number((Math.floor(minVal / stepIncrement) * stepIncrement - stepIncrement).toFixed(2)));
  const yMax = Number((Math.ceil(maxVal / stepIncrement) * stepIncrement + stepIncrement).toFixed(2));

  const yTicks: number[] = [];
  for (let val = yMin; val <= yMax + 0.0001; val += stepIncrement) {
    yTicks.push(Number(val.toFixed(2)));
  }

  return (
    <section className="rounded-2xl sm:rounded-3xl border-2 border-purple-200/80 bg-white p-4 sm:p-6 shadow-sm font-sans mt-6 transition-all">
      {/* Header con Estilo Armónico / Púrpura */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-200">
            <Shield size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-slate-950 text-base sm:text-lg tracking-tight">
                Calidad de Tensión: Distorsión Armónica Total (THD-U)
              </h2>
              <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-black tracking-wide text-purple-700 uppercase border border-purple-200/60">
                Parámetro Crítico
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervisión de salud de la red bajo estándar <strong>IEEE 519 / CNE</strong> (Límite estricto admisible: <strong>5.00%</strong>)[cite: 3]
            </p>
          </div>
        </div>

        <div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black border ${
              cumpleNorma
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
            }`}
          >
            <span
              className={`size-2 rounded-full ${
                cumpleNorma ? "bg-emerald-500" : "bg-rose-600"
              }`}
            ></span>
            {cumpleNorma ? "CONFORME CON IEEE 519" : "SUPERA LÍMITE PERMITIDO (>5%)"}
          </span>
        </div>
      </div>

      {/* Tarjetas KPI de THD-U con paleta unificada de armónicos (Púrpura / Índigo / Violeta) */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Tarjeta 1: Pico Máximo Registrado (Púrpura Vibrante) */}
        <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-purple-700">
            Pico Máximo Registrado
          </p>
          <p className="mt-1 text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {maxThdV.toFixed(2)}{" "}
            <span className="text-sm font-bold">%</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            A las <strong className="text-slate-700">{horaPicoThdV} hrs</strong> en el día filtrado[cite: 3]
          </p>
        </div>

        {/* Tarjeta 2: Promedio THD-U Diario (Índigo Técnico) */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
            Promedio THD-U Diario
          </p>
          <p className="mt-1 text-3xl font-black bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            {avgThdV.toFixed(2)}{" "}
            <span className="text-sm font-bold">%</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Tensión en barras principales[cite: 3]
          </p>
        </div>

        {/* Tarjeta 3: Límite Normativo Máximo (Violeta Oscuro / Neutro Técnico) */}
        <div className="rounded-2xl border border-purple-200/60 bg-slate-50/80 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-600">
            Límite Normativo Máximo
          </p>
          <p className="mt-1 text-3xl font-black text-slate-800">
            5.00 <span className="text-sm font-bold text-slate-500">%</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Redes de baja tensión (V ≤ 1 kV)[cite: 3]
          </p>
        </div>
      </div>

      {/* Selector de Días y Selector de Fases */}
      <div className="space-y-3 mb-5">
        <div className="flex gap-1.5 overflow-x-auto pb-1 p-2 rounded-2xl bg-slate-100/80 border border-slate-200/40 scrollbar-thin">
          <span className="text-[10px] font-black uppercase text-slate-400 self-center mr-2 shrink-0">
            SELECCIONAR DÍA:
          </span>
          {seriesKeys.map((key) => {
            const isSelected = activeDay === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectThdUDay(key)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all border cursor-pointer shrink-0 ${
                  isSelected
                    ? "text-white shadow-md shadow-purple-500/25 border-purple-600"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                style={
                  isSelected
                    ? { background: "linear-gradient(to right, #9333ea, #7e22ce)" }
                    : undefined
                }
              >
                {key}
              </button>
            );
          })}
        </div>

        {/* Botones de Fases con Degradados */}
        <div className="flex gap-2 overflow-x-auto pb-1 p-1.5 bg-slate-50 rounded-xl border border-slate-100">
          <button
            type="button"
            onClick={() => onToggleThdFase("u12")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${
              visibleThdFases.u12
                ? "text-white border-blue-500 shadow-sm shadow-blue-500/25"
                : "bg-white text-slate-600 border-slate-200 hover:bg-blue-50/40"
            }`}
            style={
              visibleThdFases.u12
                ? { background: "linear-gradient(to right, #3b82f6, #2563eb)" }
                : undefined
            }
          >
            <span
              className={`size-2.5 rounded-full inline-block ${
                visibleThdFases.u12 ? "bg-white" : "bg-blue-500"
              }`}
            />
            THD U12 (Fase 1)
          </button>

          <button
            type="button"
            onClick={() => onToggleThdFase("u23")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${
              visibleThdFases.u23
                ? "text-white border-red-500 shadow-sm shadow-red-500/25"
                : "bg-white text-slate-600 border-slate-200 hover:bg-red-50/40"
            }`}
            style={
              visibleThdFases.u23
                ? { background: "linear-gradient(to right, #ef4444, #dc2626)" }
                : undefined
            }
          >
            <span
              className={`size-2.5 rounded-full inline-block ${
                visibleThdFases.u23 ? "bg-white" : "bg-red-500"
              }`}
            />
            THD U23 (Fase 2)
          </button>

          <button
            type="button"
            onClick={() => onToggleThdFase("u31")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${
              visibleThdFases.u31
                ? "text-white border-emerald-500 shadow-sm shadow-emerald-500/25"
                : "bg-white text-slate-600 border-slate-200 hover:bg-emerald-50/40"
            }`}
            style={
              visibleThdFases.u31
                ? { background: "linear-gradient(to right, #22c55e, #16a34a)" }
                : undefined
            }
          >
            <span
              className={`size-2.5 rounded-full inline-block ${
                visibleThdFases.u31 ? "bg-white" : "bg-emerald-600"
              }`}
            />
            THD U31 (Fase 3)
          </button>
        </div>
      </div>

      {/* Gráfico THD-U con Curvas Trifásicas en Colores Sólidos */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-0">
        <div className="h-72 sm:h-80 md:h-[360px] w-[850px] sm:w-full text-xs select-none">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={rawChartData}
              margin={{ top: 20, right: 25, left: 10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="horaMinuto"
                tickLine={false}
                stroke="#94a3b8"
                interval={11}
                dy={5}
                tick={{ fontSize: "9px", fontWeight: "600", fill: "#64748b" }}
              >
                <Label
                  value="Hora del Día"
                  position="insideBottom"
                  offset={-15}
                  style={{
                    textAnchor: "middle",
                    fill: "#475569",
                    fontWeight: "800",
                    fontSize: "9px"
                  }}
                />
              </XAxis>
              <YAxis
                domain={[yMin, yMax]}
                ticks={yTicks}
                interval={0}
                allowDataOverflow={true}
                tickLine={false}
                stroke="#94a3b8"
                width={48}
                tick={{ fontSize: "10px" }}
                tickFormatter={(val) => `${val}%`}
              >
                <Label
                  value="THD-U (%)"
                  angle={-90}
                  position="insideLeft"
                  offset={-5}
                  style={{
                    textAnchor: "middle",
                    fill: "#d97706",
                    fontWeight: "800",
                    fontSize: "9px"
                  }}
                />
              </YAxis>

              <Tooltip
                content={
                  <VoltageTooltip
                    activeDay={activeDay}
                    visibleThdFases={visibleThdFases}
                    maxThdV={maxThdV}
                  />
                }
                shared={true}
              />

              <ReferenceLine y={5.0} stroke="#dc2626" strokeDasharray="4 4" strokeWidth={2}>
                <Label
                  value="LÍMITE MÁXIMO IEEE 519 (5.0%)"
                  position="insideTopRight"
                  fill="#dc2626"
                  style={{ fontSize: "9px", fontWeight: "900" }}
                />
              </ReferenceLine>

              {visibleThdFases.u12 && (
                <Line
                  type="monotone"
                  name="THD U12"
                  dataKey={`thd_u12_${activeDay}`}
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={true}
                  animationDuration={150}
                />
              )}

              {visibleThdFases.u23 && (
                <Line
                  type="monotone"
                  name="THD U23"
                  dataKey={`thd_u23_${activeDay}`}
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={true}
                  animationDuration={150}
                />
              )}

              {visibleThdFases.u31 && (
                <Line
                  type="monotone"
                  name="THD U31"
                  dataKey={`thd_u31_${activeDay}`}
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={true}
                  animationDuration={150}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};