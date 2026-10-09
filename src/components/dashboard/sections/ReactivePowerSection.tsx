import React from "react";
import { Activity } from "lucide-react";
import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const REACTIVE_COLOR_CAPACITIVE = "#dc2626";
const REACTIVE_COLOR_INDUCTIVE = "#1d4ed8";

interface ReactivePowerSectionProps {
  rawChartData: any[];
  seriesKeys: string[];
  selectedReactiveDay: string | null;
  onSelectReactiveDay: (day: string) => void;
  visibleReactiveSeries: { [key: string]: boolean };
  onToggleReactiveDay: (key: string) => void;
}

const ReactiveTooltip = ({
  active,
  label,
  payload,
  activeDay,
  visibleReactiveSeries
}: any) => {
  if (active && payload && payload.length) {
    const rowData = payload[0]?.payload || {};

    const valCap = rowData[`capacitiva_${activeDay}`];
    const valInd = rowData[`inductiva_${activeDay}`];

    const mostrarCapacitiva = visibleReactiveSeries["kvar_capacitivo"] !== false;
    const mostrarInductiva = visibleReactiveSeries["kvar_inductivo"] !== false;

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xl font-sans text-xs min-w-[220px]">
        <div className="mb-2 border-b border-slate-100 pb-2 flex justify-between items-center">
          <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
            Potencia Reactiva
          </span>
          <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
            {label} hrs
          </span>
        </div>

        <p className="text-[11px] font-bold text-slate-700 mb-2 border-b border-slate-100 pb-1">
          Día: <span className="text-slate-900">{activeDay}</span>
        </p>

        <div className="space-y-2 font-semibold text-[11px]">
          {mostrarCapacitiva && valCap !== undefined && (
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-red-600 font-bold">
                <span className="size-2 rounded-full bg-red-500 inline-block"></span>
                kvar c (Capacitiva):
              </span>
              <span className="text-slate-900 font-black tabular-nums">
                {`${Number(valCap).toFixed(2)} kvar`}
              </span>
            </div>
          )}

          {mostrarInductiva && valInd !== undefined && (
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-blue-600 font-bold">
                <span className="size-2 rounded-full bg-blue-600 inline-block"></span>
                kvar i (Inductiva):
              </span>
              <span className="text-slate-900 font-black tabular-nums">
                {`${Number(valInd).toFixed(2)} kvar`}
              </span>
            </div>
          )}
        </div>

        <div className="mt-2.5 border-t border-slate-100 pt-1.5 text-[9px] text-slate-400 font-medium flex justify-between">
          <span>
            Valores en <strong>kvar</strong>
          </span>
          <span className="font-bold text-[#0797d5]">Voltguard</span>
        </div>
      </div>
    );
  }
  return null;
};

export const ReactivePowerSection: React.FC<ReactivePowerSectionProps> = ({
  rawChartData,
  seriesKeys,
  selectedReactiveDay,
  onSelectReactiveDay,
  visibleReactiveSeries,
  onToggleReactiveDay
}) => {
  if (rawChartData.length === 0) return null;

  const activeDay = selectedReactiveDay || seriesKeys[0] || "";

  // 1. Recolección dinámica de valores visibles activos
  const allValues: number[] = [];
  const mostrarCap = visibleReactiveSeries["kvar_capacitivo"] !== false;
  const mostrarInd = visibleReactiveSeries["kvar_inductivo"] !== false;

  rawChartData.forEach((row) => {
    const valCap = row[`capacitiva_${activeDay}`];
    const valInd = row[`inductiva_${activeDay}`];

    if (mostrarCap && valCap !== null && valCap !== undefined && !isNaN(Number(valCap))) {
      allValues.push(Number(valCap));
    }
    if (mostrarInd && valInd !== null && valInd !== undefined && !isNaN(Number(valInd))) {
      allValues.push(Number(valInd));
    }
  });

  // 2. LÓGICA DE ESCALA GRADUADA Y UNIFORME EN EL EJE Y (CERO HARDCODING)
  const minVal = allValues.length > 0 ? Math.min(...allValues) : 0;
  const maxVal = allValues.length > 0 ? Math.max(...allValues) : 10;
  const diff = maxVal - minVal;

  // Paso regular coherente según la magnitud de los valores
  let stepIncrement = 1;
  if (diff > 50) stepIncrement = 10;
  else if (diff > 20) stepIncrement = 5;
  else if (diff > 8) stepIncrement = 2;
  else if (diff > 3) stepIncrement = 1;
  else if (diff > 1) stepIncrement = 0.5;
  else stepIncrement = 0.2;

  // Piso: 1 paso regular por debajo del mínimo (sin volverse negativo si la reactiva parte de cero o positivo)
  const yMin = Math.max(0, Number((Math.floor(minVal / stepIncrement) * stepIncrement - stepIncrement).toFixed(2)));
  // Techo: 1 paso regular por encima del máximo
  const yMax = Number((Math.ceil(maxVal / stepIncrement) * stepIncrement + stepIncrement).toFixed(2));

  // Generamos una cuadrícula continua de ticks sin huecos
  const yTicks: number[] = [];
  for (let val = yMin; val <= yMax + 0.0001; val += stepIncrement) {
    yTicks.push(Number(val.toFixed(2)));
  }

  return (
    <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm font-sans mt-6">
      <div className="mb-5 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
            <Activity size={22} />
          </div>
          <div>
            <h2 className="font-bold text-slate-950 text-base">
              Análisis de Potencia Reactiva (Capacitiva e Inductiva)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualización detallada por día de las curvas de potencia reactiva (kvar)
            </p>
          </div>
        </div>
      </div>

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
                onClick={() => onSelectReactiveDay(key)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all border cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-slate-900 border-slate-900 text-white shadow-md scale-105"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {key}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 p-1.5 bg-slate-50 rounded-xl border border-slate-100">
          <button
            type="button"
            onClick={() => onToggleReactiveDay("kvar_capacitivo")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${
              visibleReactiveSeries["kvar_capacitivo"] !== false
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            <span
              className={`size-2.5 rounded-full inline-block ${
                visibleReactiveSeries["kvar_capacitivo"] !== false
                  ? "bg-white"
                  : "bg-red-600"
              }`}
            ></span>
            kvar c (Capacitiva)
          </button>
          <button
            type="button"
            onClick={() => onToggleReactiveDay("kvar_inductivo")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${
              visibleReactiveSeries["kvar_inductivo"] !== false
                ? "bg-blue-700 text-white border-blue-700"
                : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            <span
              className={`size-2.5 rounded-full inline-block ${
                visibleReactiveSeries["kvar_inductivo"] !== false
                  ? "bg-white"
                  : "bg-blue-700"
              }`}
            ></span>
            kvar i (Inductiva)
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-0">
        <div className="h-72 sm:h-80 md:h-[380px] w-[850px] sm:w-full text-xs select-none">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={rawChartData}
              margin={{ top: 15, right: 15, left: 10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="horaMinuto"
                tickLine={false}
                interval={11}
                stroke="#94a3b8"
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
                    fontSize: "9px",
                    letterSpacing: "0.05em"
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
                width={55}
                tick={{ fontSize: "10px" }}
                tickFormatter={(val) => `${Number(val).toFixed(stepIncrement < 1 ? 1 : 0)}`}
              >
                <Label
                  value="N [kvar]"
                  angle={-90}
                  position="insideLeft"
                  offset={-5}
                  style={{
                    textAnchor: "middle",
                    fill: "#475569",
                    fontWeight: "800",
                    fontSize: "9px"
                  }}
                />
              </YAxis>
              <Tooltip
                content={
                  <ReactiveTooltip
                    activeDay={activeDay}
                    visibleReactiveSeries={visibleReactiveSeries}
                  />
                }
                shared={true}
              />

              {mostrarCap && activeDay && (
                <Line
                  type="linear"
                  name={`Ntotcap+ - ${activeDay}`}
                  dataKey={`capacitiva_${activeDay}`}
                  stroke={REACTIVE_COLOR_CAPACITIVE}
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls={true}
                  isAnimationActive={false}
                />
              )}

              {mostrarInd && activeDay && (
                <Line
                  type="linear"
                  name={`Ntotind+ - ${activeDay}`}
                  dataKey={`inductiva_${activeDay}`}
                  stroke={REACTIVE_COLOR_INDUCTIVE}
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls={true}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};