import React from "react";
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

interface EnergyBarSectionProps {
  energiaPorDiaData: any[];
  visibleEnergySeries: { [key: string]: boolean };
  seriesKeys: string[];
  onToggleEnergyDay: (key: string) => void;
}

// Tooltip con consumo exacto
const CustomEnergyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const kWh = Number(data.kWh) || 0;

    return (
      <div className="rounded-2xl border border-slate-200 bg-white/95 p-3.5 shadow-xl font-sans text-xs min-w-[200px] backdrop-blur-sm">
        <div className="border-b border-slate-100 pb-2 mb-2 flex items-center justify-between">
          <span className="font-bold text-slate-800 text-xs">{label}</span>
          <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 text-[11px]">
            {kWh.toFixed(2)} kWh
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-semibold">Consumo diario:</span>
          <span className="font-extrabold text-slate-900 tabular-nums">
            {kWh.toFixed(2)} kWh
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const EnergyBarSection: React.FC<EnergyBarSectionProps> = ({
  energiaPorDiaData,
  visibleEnergySeries,
  seriesKeys,
  onToggleEnergyDay
}) => {
  // 1. Filtrado de series visibles
  const barrasVisibles = energiaPorDiaData
    .filter((d) => visibleEnergySeries[d.name] !== false)
    .map((item) => ({
      name: item.name,
      kWh: Number(Number(item.kWh || 0).toFixed(2))
    }));

  // 2. LÓGICA DE ESCALA GRADUADA Y UNIFORME EN EL EJE Y
  const rawValues = barrasVisibles.map((d) => d.kWh);
  const minVal = rawValues.length > 0 ? Math.min(...rawValues) : 0;
  const maxVal = rawValues.length > 0 ? Math.max(...rawValues) : 10;

  const diff = maxVal - minVal;

  // Calculamos un incremento de paso regular coherente con los decimales
  let stepIncrement = 0.1;
  if (diff > 5) stepIncrement = 1;
  else if (diff > 2) stepIncrement = 0.5;
  else if (diff > 0.8) stepIncrement = 0.2;
  else stepIncrement = 0.1;

  // Piso: 1 o 2 pasos regulares debajo del mínimo
  const yMin = Math.max(0, Number((Math.floor(minVal / stepIncrement) * stepIncrement - stepIncrement).toFixed(2)));
  // Techo: 1 paso regular por encima del máximo para acomodar la etiqueta
  const yMax = Number((Math.ceil(maxVal / stepIncrement) * stepIncrement + stepIncrement).toFixed(2));

  // Generamos una cuadrícula continua de ticks para rellenar todo el espacio
  const yTicks: number[] = [];
  for (let val = yMin; val <= yMax + 0.0001; val += stepIncrement) {
    yTicks.push(Number(val.toFixed(2)));
  }

  // 3. Totales y Proyecciones reales
  const totalKWhSemana = barrasVisibles.reduce(
    (acc, curr) => acc + (curr.kWh || 0),
    0
  );
  const promedioKWhDiario =
    barrasVisibles.length > 0 ? totalKWhSemana / barrasVisibles.length : 0;
  const proyeccionKWhMes = promedioKWhDiario * 30;
  const proyeccionKWhAno = promedioKWhDiario * 365;

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 transition-all duration-300 hover:border-slate-300 font-sans mt-6">
      {/* Cabecera Principal */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-500/10 text-blue-600 shadow-inner border border-blue-500/20">
            <Container size={24} />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
              Energía Consumida por Día
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Energía total acumulada diariamente expresada en KiloVatios-Hora (kWh)
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas Premium */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1 */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/60 to-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-300">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            Consumo Diario Promedio
          </p>
          <p className="mt-2 text-3xl font-black text-slate-900 tracking-tight">
            {promedioKWhDiario.toFixed(1)}{" "}
            <span className="text-sm font-bold text-blue-600">kWh/día</span>
          </p>
          <p className="mt-2 text-xs text-slate-500 font-medium">
            Promedio sobre los días seleccionados
          </p>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/60 to-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-300">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            Proyección Mensual (30 días)
          </p>
          <p className="mt-2 text-3xl font-black text-slate-900 tracking-tight">
            {proyeccionKWhMes.toFixed(1)}{" "}
            <span className="text-sm font-bold text-blue-600">kWh/mes</span>
          </p>
          <p className="mt-2 text-xs text-slate-500 font-medium">
            Estimación a 30 días de operación
          </p>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/60 to-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-300">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            Proyección Anual (365 días)
          </p>
          <p className="mt-2 text-3xl font-black text-slate-900 tracking-tight">
            {proyeccionKWhAno.toFixed(0)}{" "}
            <span className="text-sm font-bold text-blue-600">kWh/año</span>
          </p>
          <p className="mt-2 text-xs text-slate-500 font-medium">
            Estimación a 365 días de operación
          </p>
        </div>
      </div>

      {/* Selector de Días Estilizado */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 p-2 rounded-2xl bg-slate-50 border border-slate-200/60 scrollbar-none items-center">
        <span className="text-xs font-bold uppercase text-slate-400 self-center px-2">
          Días:
        </span>
        {seriesKeys.map((key) => {
          const isActive = visibleEnergySeries[key] !== false;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggleEnergyDay(key)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 shadow-sm ${isActive
                  ? "text-white shadow-blue-500/25 border border-blue-500/30 scale-[1.02]"
                  : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              style={
                isActive
                  ? { background: "linear-gradient(to right, #3b82f6, #1d4ed8)" }
                  : undefined
              }
            >
              {key}
            </button>
          );
        })}
      </div>

      {/* Gráfico */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-0 sm:border-none scrollbar-thin">
        <div className="h-80 sm:h-96 md:h-[400px] w-[600px] sm:w-full text-xs font-medium text-slate-500 select-none">
          {barrasVisibles.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-slate-400 font-semibold text-sm">
              Selecciona al menos un día para visualizar los datos del gráfico.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barrasVisibles}
                margin={{ top: 35, right: 15, left: 10, bottom: 30 }}
                style={{ outline: "none", border: "none" }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  stroke="#94a3b8"
                  dy={8}
                  tick={{ fontSize: "11px", fontWeight: "700", fill: "#334155" }}
                >
                  <Label
                    value="Días del Periodo"
                    position="insideBottom"
                    offset={-20}
                    style={{
                      textAnchor: "middle",
                      fill: "#64748b",
                      fontWeight: "800",
                      fontSize: "10px",
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
                  tick={{ fontSize: "11px", fill: "#64748b" }}
                  tickFormatter={(val) => Number(val).toFixed(1)}
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
                      fontSize: "10px",
                      letterSpacing: "0.05em"
                    }}
                  />
                </YAxis>
                <Tooltip
                  cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
                  content={<CustomEnergyTooltip />}
                />
                <Bar
                  dataKey="kWh"
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={45}
                >
                  <LabelList
                    dataKey="kWh"
                    position="top"
                    formatter={(val: any) => `${Number(val).toFixed(1)}`}
                    style={{
                      fontSize: "11px",
                      fontWeight: "800",
                      fill: "#0f172a"
                    }}
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