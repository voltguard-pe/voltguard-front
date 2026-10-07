import React from "react";
import { Container } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

const BASE_BAR_COLOR = "#2563eb"; // Azul principal
const HIGHER_BAR_COLOR = "#1d4ed8"; // Azul más intenso para días con mayor consumo

// Tooltip con consumo exacto y delta respecto al día más bajo
const CustomEnergyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const kWh = data.kWh;
    const delta = data.deltaOriginal;

    return (
      <div className="rounded-2xl border border-slate-200 bg-white/95 p-3.5 shadow-xl font-sans text-xs min-w-[210px] backdrop-blur-sm">
        <div className="border-b border-slate-100 pb-2 mb-2 flex items-center justify-between">
          <span className="font-bold text-slate-800 text-xs">{label}</span>
          <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 text-[11px]">
            {kWh.toFixed(2)} kWh
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-semibold">Consumo diario:</span>
          <span className="font-extrabold text-slate-900 tabular-nums">
            {kWh.toFixed(1)} kWh
          </span>
        </div>
        {delta > 0 && (
          <div className="mt-1 flex items-center justify-between text-red-600 font-bold text-[10px]">
            <span>Variación vs mínimo:</span>
            <span>+{delta.toFixed(2)} kWh</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Renderizado de etiqueta con el valor real y el delta visual
const renderCustomLabel = (props: any) => {
  const { x, y, width, index, data } = props;
  const item = data?.[index];
  if (!item) return null;

  return (
    <g>
      <text
        x={x + width / 2}
        y={y - 8}
        fill="#1e293b"
        textAnchor="middle"
        className="text-[10px] font-black tabular-nums select-none"
      >
        {item.kWh.toFixed(1)}
      </text>
      {item.deltaOriginal > 0 && (
        <text
          x={x + width / 2}
          y={y - 20}
          fill="#dc2626"
          textAnchor="middle"
          className="text-[9px] font-black tabular-nums select-none"
        >
          +{item.deltaOriginal.toFixed(1)}
        </text>
      )}
    </g>
  );
};

export const EnergyBarSection: React.FC<EnergyBarSectionProps> = ({
  energiaPorDiaData,
  visibleEnergySeries,
  seriesKeys,
  onToggleEnergyDay
}) => {
  // 1. Filtrado de series visibles
  const rawBarrasVisibles = energiaPorDiaData.filter(
    (d) => visibleEnergySeries[d.name] !== false
  );

  // 2. Magnificación visual de las diferencias de decimales
  const minVal =
    rawBarrasVisibles.length > 0
      ? Math.min(...rawBarrasVisibles.map((d) => d.kWh || 0))
      : 0;

  // Factor multiplicador para que variaciones de ~0.2 a 0.8 kWh marquen diferencia de altura
  const BOOST_FACTOR = 14;

  const barrasVisibles = rawBarrasVisibles.map((item) => {
    const valKWh = Number(item.kWh) || 0;
    const delta = Math.max(0, valKWh - minVal);
    const visualBoost = delta * BOOST_FACTOR;

    return {
      ...item,
      kWh: valKWh,
      deltaOriginal: delta,
      alturaVisual: valKWh + visualBoost
    };
  });

  // 3. Cálculos de Totales y Proyecciones reales
  const totalKWhSemana = rawBarrasVisibles.reduce(
    (acc, curr) => acc + (curr.kWh || 0),
    0
  );
  const promedioKWhDiario =
    rawBarrasVisibles.length > 0 ? totalKWhSemana / rawBarrasVisibles.length : 0;
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
                  tickLine={false}
                  stroke="#94a3b8"
                  width={55}
                  tick={{ fontSize: "10px" }}
                  tickFormatter={(val) => Math.round(val).toString()}
                >
                  <Label
                    value="Energía Activa Relativa"
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
                  dataKey="alturaVisual"
                  name="kWh"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                >
                  {barrasVisibles.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.deltaOriginal > 0 ? HIGHER_BAR_COLOR : BASE_BAR_COLOR}
                    />
                  ))}
                  <LabelList
                    content={(props) => renderCustomLabel({ ...props, data: barrasVisibles })}
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