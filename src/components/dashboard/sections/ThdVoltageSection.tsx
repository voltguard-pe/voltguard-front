import React from "react";
import { Info, Shield } from "lucide-react";
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
  visibleThdFases
}: any) => {
  if (active && payload && payload.length) {
    const rowData = payload[0]?.payload || {};

    const rawU1 = rowData[`thd_u12_${activeDay}`];
    const rawU2 = rowData[`thd_u23_${activeDay}`];
    const rawU3 = rowData[`thd_u31_${activeDay}`];

    const tieneU1 = rawU1 !== null && rawU1 !== undefined && !isNaN(Number(rawU1));
    const tieneU2 = rawU2 !== null && rawU2 !== undefined && !isNaN(Number(rawU2));
    const tieneU3 = rawU3 !== null && rawU3 !== undefined && !isNaN(Number(rawU3));

    if (!tieneU1 && !tieneU2 && !tieneU3) return null;

    const u12 = tieneU1 ? Number(rawU1) : null;
    const u23 = tieneU2 ? Number(rawU2) : null;
    const u31 = tieneU3 ? Number(rawU3) : null;

    const maxValPunto = Math.max(u12 ?? 0, u23 ?? 0, u31 ?? 0);

    return (
      <div className="pointer-events-none z-50 rounded-2xl border border-slate-200/80 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md font-sans text-xs min-w-[240px]">
        <div className="mb-2 border-b border-slate-100 pb-1.5 flex justify-between items-center">
          <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">
            Distorsión THD Tensión
          </span>
          <span className="font-black text-purple-950 bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded-lg text-[10px]">
            {label} hrs
          </span>
        </div>

        <p className="text-[11px] font-bold text-slate-700 mb-2 border-b border-slate-100 pb-1 flex justify-between">
          <span className="text-slate-400 font-semibold">Día evaluado:</span>
          <span className="text-slate-950 font-black">{activeDay}</span>
        </p>

        <div className="space-y-1.5 font-semibold">
          {visibleThdFases.u12 && tieneU1 && (
            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-1.5 text-blue-600 font-bold">
                <span className="size-2 rounded-full bg-blue-600 inline-block ring-2 ring-white"></span>
                Fase 1 (L1 / U12):
              </span>
              <span
                className={`font-black tabular-nums ${u12! > 5.0 ? "text-rose-600" : "text-slate-900"
                  }`}
              >
                {u12!.toFixed(2)}%
              </span>
            </div>
          )}

          {visibleThdFases.u23 && tieneU2 && (
            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-1.5 text-red-600 font-bold">
                <span className="size-2 rounded-full bg-red-600 inline-block ring-2 ring-white"></span>
                Fase 2 (L2 / U23):
              </span>
              <span
                className={`font-black tabular-nums ${u23! > 5.0 ? "text-rose-600" : "text-slate-900"
                  }`}
              >
                {u23!.toFixed(2)}%
              </span>
            </div>
          )}

          {visibleThdFases.u31 && tieneU3 && (
            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <span className="size-2 rounded-full bg-emerald-600 inline-block ring-2 ring-white"></span>
                Fase 3 (L3 / U31):
              </span>
              <span
                className={`font-black tabular-nums ${u31! > 5.0 ? "text-rose-600" : "text-slate-900"
                  }`}
              >
                {u31!.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        <div className="mt-2.5 border-t border-slate-100 pt-1.5 text-[9px] flex justify-between text-slate-400 font-semibold items-center">
          <span>Límite IEEE 519: <strong>5.00%</strong></span>
          <span
            className={
              maxValPunto <= 5.0
                ? "text-emerald-600 font-black"
                : "text-rose-600 font-black"
            }
          >
            {maxValPunto <= 5.0 ? "Conforme" : "Supera 5%"}
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
    const rawU1 = row[`thd_u12_${activeDay}`];
    const rawU2 = row[`thd_u23_${activeDay}`];
    const rawU3 = row[`thd_u31_${activeDay}`];
    const rawAvg = row[`thd_v_${activeDay}`];

    const u12 = rawU1 !== null && rawU1 !== undefined ? Number(rawU1) : null;
    const u23 = rawU2 !== null && rawU2 !== undefined ? Number(rawU2) : null;
    const u31 = rawU3 !== null && rawU3 !== undefined ? Number(rawU3) : null;

    const valoresPunto = [u12, u23, u31].filter((v): v is number => v !== null && !isNaN(v));

    if (valoresPunto.length > 0) {
      const picoPunto = Math.max(...valoresPunto);
      if (picoPunto > maxThdV) {
        maxThdV = picoPunto;
        horaPicoThdV = row.horaMinuto;
      }

      const avgPunto = rawAvg !== null && rawAvg !== undefined && Number(rawAvg) > 0
        ? Number(rawAvg)
        : valoresPunto.reduce((a, b) => a + b, 0) / valoresPunto.length;

      sumThdV += avgPunto;
      countThdV++;
    }

    if (visibleThdFases.u12 && u12 !== null && u12 > 0) allVisibleValues.push(u12);
    if (visibleThdFases.u23 && u23 !== null && u23 > 0) allVisibleValues.push(u23);
    if (visibleThdFases.u31 && u31 !== null && u31 > 0) allVisibleValues.push(u31);
  });

  const avgThdV = countThdV > 0 ? sumThdV / countThdV : 0;
  const cumpleNorma = maxThdV <= 5.0;

  // ── ESCALA DINÁMICA DEL EJE Y (Soporta desde 3% hasta picos de 45% sin romper los ticks) ──
  const minVal = allVisibleValues.length > 0 ? Math.min(...allVisibleValues) : 0;
  const maxVal = allVisibleValues.length > 0 ? Math.max(...allVisibleValues, 5.0) : 6.0;

  const diff = maxVal - minVal;

  let stepIncrement = 0.5;
  if (diff > 30) stepIncrement = 10;
  else if (diff > 15) stepIncrement = 5;
  else if (diff > 8) stepIncrement = 2;
  else if (diff > 4) stepIncrement = 1;
  else if (diff > 1.5) stepIncrement = 0.5;
  else stepIncrement = 0.2;

  const yMin = Math.max(0, Number((Math.floor(minVal / stepIncrement) * stepIncrement - stepIncrement).toFixed(2)));
  const yMax = Number((Math.ceil(maxVal / stepIncrement) * stepIncrement + stepIncrement).toFixed(2));

  const yTicks: number[] = [];
  for (let val = yMin; val <= yMax + 0.0001; val += stepIncrement) {
    yTicks.push(Number(val.toFixed(2)));
  }

  const mostrarDots = rawChartData.length <= 96;

  return (
    <section className="rounded-2xl sm:rounded-3xl border-2 border-purple-200/80 bg-white p-4 sm:p-6 shadow-sm font-sans mt-6 transition-all duration-300 hover:border-purple-300">
      {/* Header */}
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
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-black tracking-wide text-purple-700 uppercase border border-purple-200/60">
                <Info size={11} /> Estándar IEEE 519
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervisión de salud de la red bajo estándar <strong>IEEE 519 / CNE</strong> (Límite estricto admisible: <strong>5.00%</strong>)[cite: 3]
            </p>
          </div>
        </div>

        <div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black border ${cumpleNorma
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
              }`}
          >
            <span
              className={`size-2 rounded-full ${cumpleNorma ? "bg-emerald-500" : "bg-rose-600"
                }`}
            ></span>
            {cumpleNorma ? "CONFORME CON IEEE 519" : "SUPERA LÍMITE PERMITIDO (>5%)"}
          </span>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
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

      {/* Selectores */}
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
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all border cursor-pointer shrink-0 ${isSelected
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

        {/* Botones de Fases Universales */}
        <div className="flex gap-2 overflow-x-auto pb-1 p-1.5 bg-slate-50 rounded-xl border border-slate-100">
          <button
            type="button"
            onClick={() => onToggleThdFase("u12")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${visibleThdFases.u12
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
              className={`size-2.5 rounded-full inline-block ${visibleThdFases.u12 ? "bg-white" : "bg-blue-500"
                }`}
            />
            Fase 1 (L1 / U12)
          </button>

          <button
            type="button"
            onClick={() => onToggleThdFase("u23")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${visibleThdFases.u23
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
              className={`size-2.5 rounded-full inline-block ${visibleThdFases.u23 ? "bg-white" : "bg-red-500"
                }`}
            />
            Fase 2 (L2 / U23)
          </button>

          <button
            type="button"
            onClick={() => onToggleThdFase("u31")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${visibleThdFases.u31
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
              className={`size-2.5 rounded-full inline-block ${visibleThdFases.u31 ? "bg-white" : "bg-emerald-600"
                }`}
            />
            Fase 3 (L3 / U31)
          </button>
        </div>
      </div>

      {/* Gráfico */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-0">
        <div className="h-72 sm:h-80 md:h-[380px] w-[850px] sm:w-full text-xs select-none [&_*]:focus:outline-none">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart
              data={rawChartData}
              margin={{ top: 20, right: 25, left: 10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

              <XAxis
                dataKey="horaMinuto"
                tickLine={false}
                stroke="#94a3b8"
                interval="preserveStartEnd"
                minTickGap={35}
                dy={8}
                tick={{ angle: -45, textAnchor: 'end', fontSize: "9px", fontWeight: "600", fill: "#64748b" }}
                height={60}
              >
                <Label
                  value="Hora del Día"
                  position="insideBottom"
                  offset={-10}
                  style={{
                    textAnchor: "middle",
                    fill: "#475569",
                    fontWeight: "800",
                    fontSize: "13px"
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
                width={50}
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
                    fill: "#475569",
                    fontWeight: "800",
                    fontSize: "13px"
                  }}
                />
              </YAxis>

              {/* Cursor magnético vertical que guía el hover */}
              <Tooltip
                content={
                  <VoltageTooltip
                    activeDay={activeDay}
                    visibleThdFases={visibleThdFases}
                  />
                }
                cursor={{
                  stroke: "#9333ea",
                  strokeWidth: 1.5,
                  strokeDasharray: "4 4",
                  strokeOpacity: 0.7
                }}
                isAnimationActive={true}
              />

              {/* Línea normativa IEEE 519 al 5% */}
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
                  type="linear"
                  name="Fase 1 (L1 / U12)"
                  dataKey={`thd_u12_${activeDay}`}
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={mostrarDots ? { r: 2.5, fill: "#2563eb", strokeWidth: 0 } : false}
                  activeDot={{
                    r: 6,
                    fill: "#2563eb",
                    stroke: "#ffffff",
                    strokeWidth: 2
                  }}
                  connectNulls={true}
                  animationDuration={200}
                />
              )}

              {visibleThdFases.u23 && (
                <Line
                  type="linear"
                  name="Fase 2 (L2 / U23)"
                  dataKey={`thd_u23_${activeDay}`}
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={mostrarDots ? { r: 2.5, fill: "#dc2626", strokeWidth: 0 } : false}
                  activeDot={{
                    r: 6,
                    fill: "#dc2626",
                    stroke: "#ffffff",
                    strokeWidth: 2
                  }}
                  connectNulls={true}
                  animationDuration={200}
                />
              )}

              {visibleThdFases.u31 && (
                <Line
                  type="linear"
                  name="Fase 3 (L3 / U31)"
                  dataKey={`thd_u31_${activeDay}`}
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={mostrarDots ? { r: 2.5, fill: "#16a34a", strokeWidth: 0 } : false}
                  activeDot={{
                    r: 6,
                    fill: "#16a34a",
                    stroke: "#ffffff",
                    strokeWidth: 2
                  }}
                  connectNulls={true}
                  animationDuration={200}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};