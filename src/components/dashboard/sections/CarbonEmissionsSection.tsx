import React from "react";
import { Zap } from "lucide-react";
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

interface CarbonEmissionsSectionProps {
  energiaPorDiaData: any[];
  visibleCarbonSeries: { [key: string]: boolean };
  seriesKeys: string[];
  onToggleCarbonDay: (key: string) => void;
}

const FACTOR_EMISION_PERU = 0.00021;
const BASE_BAR_COLOR = "#64748b"; // Pizarra base
const HIGHER_BAR_COLOR = "#334155"; // Pizarra más oscuro para los picos

// Tooltip con los valores reales en tCO2 y kg CO2
const CustomCarbonTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const tCO2 = data.tCO2;
    const kgCO2 = data.kgCO2;
    const delta = data.deltaOriginal;

    return (
      <div className="rounded-2xl border border-slate-200 bg-white/95 p-3.5 shadow-xl font-sans text-xs min-w-[210px] backdrop-blur-sm">
        <div className="border-b border-slate-100 pb-2 mb-2 flex items-center justify-between">
          <span className="font-bold text-slate-800 text-xs">{label}</span>
          <span className="font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
            {tCO2.toFixed(4)} tCO₂
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-semibold">Equivalente:</span>
          <span className="font-extrabold text-slate-900 tabular-nums">
            {kgCO2.toFixed(2)} kg CO₂
          </span>
        </div>
        {delta > 0 && (
          <div className="mt-1 flex items-center justify-between text-red-600 font-bold text-[10px]">
            <span>Variación vs mínimo:</span>
            <span>+{delta.toFixed(4)} tCO₂</span>
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
        {item.tCO2.toFixed(4)}
      </text>
      {item.deltaOriginal > 0 && (
        <text
          x={x + width / 2}
          y={y - 20}
          fill="#dc2626"
          textAnchor="middle"
          className="text-[9px] font-black tabular-nums select-none"
        >
          +{(item.deltaOriginal * 1000).toFixed(1)}kg
        </text>
      )}
    </g>
  );
};

export const CarbonEmissionsSection: React.FC<CarbonEmissionsSectionProps> = ({
  energiaPorDiaData,
  visibleCarbonSeries,
  seriesKeys,
  onToggleCarbonDay
}) => {
  // 1. Datos reales
  const rawEmisionesData = energiaPorDiaData
    .filter((d) => visibleCarbonSeries[d.name] !== false)
    .map((item) => {
      const tCO2_dia = (item.kWh || 0) * FACTOR_EMISION_PERU;
      return {
        name: item.name,
        tCO2: Number(tCO2_dia.toFixed(4)),
        kgCO2: Number((tCO2_dia * 1000).toFixed(2))
      };
    });

  // 2. Magnificación visual de las diferencias de decimales
  const minVal =
    rawEmisionesData.length > 0
      ? Math.min(...rawEmisionesData.map((d) => d.tCO2))
      : 0;

  // Multiplicador visual para acentuar los cambios de altura
  const BOOST_FACTOR = 18;

  const emisionesData = rawEmisionesData.map((item) => {
    const delta = Math.max(0, item.tCO2 - minVal);
    const visualBoost = delta * BOOST_FACTOR;

    return {
      ...item,
      deltaOriginal: delta,
      alturaVisual: item.tCO2 + visualBoost
    };
  });

  // 3. Cálculos de Totales y Proyecciones reales
  const totalTCO2Semana = rawEmisionesData.reduce((acc, curr) => acc + curr.tCO2, 0);
  const promedioTCO2Diario =
    rawEmisionesData.length > 0 ? totalTCO2Semana / rawEmisionesData.length : 0;
  const proyeccionTCO2Mes = promedioTCO2Diario * 30;
  const proyeccionTCO2Ano = promedioTCO2Diario * 365;

  return (
    <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all duration-300 hover:border-slate-300 font-sans mt-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-slate-500/10 text-slate-600">
            <Zap size={20} className="sm:size-[22px]" />
          </div>
          <div>
            <h2 className="font-bold text-slate-950 text-sm sm:text-base tracking-tight">
              Emisiones de CO₂ por Día (Huella de Carbono)
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Dióxido de Carbono equivalente emitido por el consumo eléctrico (tCO₂eq - SEIN Perú)
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">
            Emisión Diaria Promedio
          </p>
          <p className="mt-1 text-2xl font-black text-slate-950">
            {promedioTCO2Diario < 0.01
              ? (promedioTCO2Diario * 1000).toFixed(2)
              : promedioTCO2Diario.toFixed(3)}
            <span className="text-xs font-bold text-slate-600 ml-1">
              {promedioTCO2Diario < 0.01 ? "kg CO₂/día" : "tCO₂/día"}
            </span>
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            Equivalencia del periodo filtrado
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">
            Proyección Mensual (30 días)
          </p>
          <p className="mt-1 text-2xl font-black text-slate-950">
            {proyeccionTCO2Mes.toFixed(3)}{" "}
            <span className="text-xs font-bold text-slate-600">tCO₂/mes</span>
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            Estimación a 30 días de operación
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">
            Proyección Anual (365 días)
          </p>
          <p className="mt-1 text-2xl font-black text-slate-950">
            {proyeccionTCO2Ano.toFixed(2)}{" "}
            <span className="text-xs font-bold text-slate-600">tCO₂/año</span>
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
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
            onClick={() => onToggleCarbonDay(key)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer shrink-0 ${
              visibleCarbonSeries[key] !== false
                ? "bg-slate-700 border-slate-700 text-white shadow-sm"
                : "bg-white border-slate-200 text-slate-400"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-0 sm:border-none scrollbar-thin">
        <div className="h-80 sm:h-96 md:h-[400px] w-[600px] sm:w-full text-xs font-medium text-slate-500 select-none">
          {emisionesData.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-slate-400 font-semibold text-sm">
              Selecciona al menos un día para visualizar los datos del gráfico.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={emisionesData}
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
                  width={65}
                  tick={{ fontSize: "10px" }}
                  tickFormatter={(val) => val.toFixed(3)}
                >
                  <Label
                    value="Emisiones Relativas"
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
                  content={<CustomCarbonTooltip />}
                />
                <Bar
                  dataKey="alturaVisual"
                  name="tCO2"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                >
                  {emisionesData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.deltaOriginal > 0 ? HIGHER_BAR_COLOR : BASE_BAR_COLOR}
                    />
                  ))}
                  <LabelList
                    content={(props) => renderCustomLabel({ ...props, data: emisionesData })}
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