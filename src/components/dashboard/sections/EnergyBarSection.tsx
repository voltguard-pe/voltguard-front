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

const BAR_COLOR = "#2563eb"; // Azul principal

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
    <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all duration-300 hover:border-slate-300 font-sans mt-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-500/10 text-blue-600">
            <Container size={20} className="sm:size-[22px]" />
          </div>
          <div>
            <h2 className="font-bold text-slate-950 text-sm sm:text-base tracking-tight">
              Energía Consumida por Día
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Energía total acumulada diariamente expresada en KiloVatios-Hora (kWh)
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-blue-700">
            Consumo Diario Promedio
          </p>
          <p className="mt-1 text-2xl font-black text-blue-950">
            {promedioKWhDiario.toFixed(1)}{" "}
            <span className="text-xs font-bold text-blue-600">kWh/día</span>
          </p>
          <p className="mt-1 text-[10px] text-blue-500">
            Promedio sobre los días seleccionados
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-blue-700">
            Proyección Mensual (30 días)
          </p>
          <p className="mt-1 text-2xl font-black text-blue-950">
            {proyeccionKWhMes.toFixed(1)}{" "}
            <span className="text-xs font-bold text-blue-600">kWh/mes</span>
          </p>
          <p className="mt-1 text-[10px] text-blue-500">
            Estimación a 30 días de operación
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-blue-700">
            Proyección Anual (365 días)
          </p>
          <p className="mt-1 text-2xl font-black text-blue-950">
            {proyeccionKWhAno.toFixed(0)}{" "}
            <span className="text-xs font-bold text-blue-600">kWh/año</span>
          </p>
          <p className="mt-1 text-[10px] text-blue-500">
            Estimación a 365 días de operación
          </p>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 p-2 rounded-2xl bg-slate-100 border border-slate-200/40 scrollbar-none">
        <span className="text-[10px] font-black uppercase text-slate-400 self-center mr-1">
          Días:
        </span>
        {seriesKeys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onToggleEnergyDay(key)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer shrink-0 ${
              visibleEnergySeries[key] !== false
                ? "bg-blue-700 border-blue-700 text-white shadow-sm"
                : "bg-white border-slate-200 text-slate-400"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

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
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
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
                  tickFormatter={(val) => Number(val).toFixed(1)}
                >
                  <Label
                    value="Energía Activa (kWh)"
                    angle={-90}
                    position="insideLeft"
                    offset={-5}
                    style={{
                      textAnchor: "middle",
                      fill: "#475569",
                      fontWeight: "800",
                      fontSize: "9px",
                      letterSpacing: "0.05em"
                    }}
                  />
                </YAxis>
                <Tooltip
                  cursor={{ fill: "#f1f5f9", opacity: 0.6 }}
                  content={<CustomEnergyTooltip />}
                />
                <Bar
                  dataKey="kWh"
                  fill={BAR_COLOR}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                >
                  <LabelList
                    dataKey="kWh"
                    position="top"
                    formatter={(val: any) => `${Number(val).toFixed(1)}`}
                    style={{
                      fontSize: "11px",
                      fontWeight: "800",
                      fill: "#1e293b"
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