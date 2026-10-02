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
  });

  const avgThdV = countThdV > 0 ? sumThdV / countThdV : 0;
  const cumpleNorma = maxThdV <= 5.0;

  return (
    <section className="rounded-2xl sm:rounded-3xl border-2 border-purple-200/70 bg-white p-4 sm:p-6 shadow-sm font-sans mt-6 transition-all">
      {/* Header con Badge de Estado */}
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
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-black tracking-wide text-purple-800 uppercase">
                Parámetro Crítico
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervisión de salud de la red bajo estándar <strong>IEEE 519 / CNE</strong> (Límite estricto admisible: <strong>5.00%</strong>)
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

      {/* Tarjetas KPI de THD-U */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-purple-700">
            Pico Máximo Registrado
          </p>
          <p
            className={`mt-1 text-3xl font-black ${
              maxThdV > 5.0 ? "text-rose-600" : "text-purple-950"
            }`}
          >
            {maxThdV.toFixed(2)}{" "}
            <span className="text-sm font-bold text-purple-600">%</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            A las <strong className="text-slate-700">{horaPicoThdV} hrs</strong> en el día filtrado
          </p>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-purple-700">
            Promedio THD-U Diario
          </p>
          <p className="mt-1 text-3xl font-black text-purple-950">
            {avgThdV.toFixed(2)}{" "}
            <span className="text-sm font-bold text-purple-600">%</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Tensión en barras principales
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            Límite Normativo Máximo
          </p>
          <p className="mt-1 text-3xl font-black text-slate-800">
            5.00 <span className="text-sm font-bold text-slate-400">%</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Redes de baja tensión (V ≤ 1 kV)
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
                    ? "bg-purple-700 border-purple-700 text-white shadow-md"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {key}
              </button>
            );
          })}
        </div>

        {/* Botones de Fases tipo Metrel (Azul, Rojo, Verde) */}
        <div className="flex gap-2 overflow-x-auto pb-1 p-1.5 bg-slate-50 rounded-xl border border-slate-100">
          <button
            type="button"
            onClick={() => onToggleThdFase("u12")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${
              visibleThdFases.u12
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            <span
              className={`size-2.5 rounded-full inline-block ${
                visibleThdFases.u12 ? "bg-white" : "bg-blue-600"
              }`}
            />
            THD U12 (Fase 1)
          </button>

          <button
            type="button"
            onClick={() => onToggleThdFase("u23")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${
              visibleThdFases.u23
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            <span
              className={`size-2.5 rounded-full inline-block ${
                visibleThdFases.u23 ? "bg-white" : "bg-red-600"
              }`}
            />
            THD U23 (Fase 2)
          </button>

          <button
            type="button"
            onClick={() => onToggleThdFase("u31")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${
              visibleThdFases.u31
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-slate-600 border-slate-200"
            }`}
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

      {/* Gráfico THD-U con Curvas Trifásicas */}
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
                tickLine={false}
                stroke="#94a3b8"
                width={45}
                domain={[0, (dataMax: number) => Math.max(6, Math.ceil(dataMax + 1))]}
                tickFormatter={(val) => `${val}%`}
              >
                <Label
                  value="THD-U (%)"
                  angle={-90}
                  position="insideLeft"
                  style={{
                    textAnchor: "middle",
                    fill: "#7e22ce",
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

              {/* Línea normativa IEEE 519 (5.0%) */}
              <ReferenceLine y={5.0} stroke="#dc2626" strokeDasharray="4 4" strokeWidth={2}>
                <Label
                  value="LÍMITE MÁXIMO IEEE 519 (5.0%)"
                  position="insideTopRight"
                  fill="#dc2626"
                  style={{ fontSize: "9px", fontWeight: "900" }}
                />
              </ReferenceLine>

              {/* Curva Fase 12 (Azul) */}
              {visibleThdFases.u12 && (
                <Line
                  type="monotone"
                  name="THD U12"
                  dataKey={`thd_u12_${activeDay}`}
                  stroke="#2563eb"
                  strokeWidth={1.8}
                  dot={false}
                  connectNulls={true}
                  animationDuration={150}
                />
              )}

              {/* Curva Fase 23 (Rojo) */}
              {visibleThdFases.u23 && (
                <Line
                  type="monotone"
                  name="THD U23"
                  dataKey={`thd_u23_${activeDay}`}
                  stroke="#dc2626"
                  strokeWidth={1.8}
                  dot={false}
                  connectNulls={true}
                  animationDuration={150}
                />
              )}

              {/* Curva Fase 31 (Verde) */}
              {visibleThdFases.u31 && (
                <Line
                  type="monotone"
                  name="THD U31"
                  dataKey={`thd_u31_${activeDay}`}
                  stroke="#16a34a"
                  strokeWidth={1.8}
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