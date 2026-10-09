import React from "react";
import { Zap } from "lucide-react";
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

interface CarbonEmissionsSectionProps {
  energiaPorDiaData: any[];
  visibleCarbonSeries: { [key: string]: boolean };
  seriesKeys: string[];
  onToggleCarbonDay: (key: string) => void;
}

const FACTOR_EMISION_PERU = 0.00021;
const BAR_COLOR = "#475569"; // Pizarra elegante

// Tooltip con los valores reales en tCO2 y kg CO2
const CustomCarbonTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const tCO2 = Number(data.tCO2) || 0;
    const kgCO2 = Number(data.kgCO2) || 0;

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
      </div>
    );
  }
  return null;
};

export const CarbonEmissionsSection: React.FC<CarbonEmissionsSectionProps> = ({
  energiaPorDiaData,
  visibleCarbonSeries,
  seriesKeys,
  onToggleCarbonDay
}) => {
  // 1. Datos reales directos calculados desde la data visible
  const emisionesData = energiaPorDiaData
    .filter((d) => visibleCarbonSeries[d.name] !== false)
    .map((item) => {
      const tCO2_dia = (item.kWh || 0) * FACTOR_EMISION_PERU;
      return {
        name: item.name,
        tCO2: Number(tCO2_dia.toFixed(4)),
        kgCO2: Number((tCO2_dia * 1000).toFixed(2))
      };
    });

  // 2. LÓGICA DINÁMICA DE RANGO Y ALINEACIÓN (CERO HARDCODING)
  const rawValues = emisionesData.map((d) => d.tCO2);
  const minVal = rawValues.length > 0 ? Math.min(...rawValues) : 0;
  const maxVal = rawValues.length > 0 ? Math.max(...rawValues) : 0;

  // Calculamos la diferencia real dinámica
  const rawDelta = maxVal - minVal;
  // Si todos los valores son iguales, tomamos el 2% del valor como salto por defecto
  const step = rawDelta > 0 ? rawDelta : (minVal > 0 ? minVal * 0.02 : 0.0001);

  // Piso: exactamente 1 step antes del mínimo (hace que la barra menor arranque bajita)
  const yMin = Math.max(0, Number((minVal - step).toFixed(4)));
  
  // Techo del contenedor: un pequeño margen para que la etiqueta numérica no choque arriba
  const yMax = Number((maxVal + step * 0.3).toFixed(4));

  // Los 3 ticks exactos que coinciden con las alturas reales:
  // 1) Piso donde nacen las barras
  // 2) Nivel exacto de la barra mínima
  // 3) Nivel exacto de la barra máxima
  const yTicks = Array.from(new Set([yMin, minVal, maxVal])).sort((a, b) => a - b);

  // 3. Cálculos de Totales y Proyecciones reales
  const totalTCO2Semana = emisionesData.reduce((acc, curr) => acc + curr.tCO2, 0);
  const promedioTCO2Diario =
    emisionesData.length > 0 ? totalTCO2Semana / emisionesData.length : 0;
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
                  domain={[yMin, yMax]}
                  ticks={yTicks}
                  interval={0}
                  allowDataOverflow={true}
                  tickLine={false}
                  stroke="#94a3b8"
                  width={68}
                  tick={{ fontSize: "10px" }}
                  tickFormatter={(val) => Number(val).toFixed(4)}
                >
                  <Label
                    value="Emisiones (tCO₂)"
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
                  dataKey="tCO2"
                  fill={BAR_COLOR}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                >
                  <LabelList
                    dataKey="tCO2"
                    position="top"
                    formatter={(val: any) => `${Number(val).toFixed(4)}`}
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