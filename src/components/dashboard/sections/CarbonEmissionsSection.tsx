import React from "react";
import { Zap, Trees, Award, Info } from "lucide-react";
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

const FACTOR_EMISION_G_KWH = 210; // Factor del Sistema Eléctrico Interconectado Nacional (SEIN)

const formatGramos = (g: number) => Math.round(g).toLocaleString("es-PE");

const CustomCarbonTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const gCO2 = Number(data.gCO2) || 0;
    const kgCO2 = gCO2 / 1000;

    return (
      <div className="pointer-events-none z-50 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-2xl font-sans text-xs min-w-[220px] backdrop-blur-md">
        <div className="border-b border-slate-100 pb-2 mb-2 flex items-center justify-between">
          <span className="font-bold text-slate-900 text-sm">{label}</span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-600">
            Día Completo
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Emisión Diaria:</span>
            <span className="font-black text-slate-900 tabular-nums">{formatGramos(gCO2)} g CO₂</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Equivalente Masa:</span>
            <span className="font-black text-slate-800 tabular-nums">{kgCO2.toFixed(2)} kg CO₂</span>
          </div>
        </div>

        <div className="mt-2.5 border-t border-slate-100 pt-1.5 text-[9px] text-slate-400 font-semibold flex justify-between items-center">
          <span>Factor: {FACTOR_EMISION_G_KWH} g/kWh</span>
          <span className="font-black text-slate-800 tracking-wider">VoltGuard</span>
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
  const emisionesData = energiaPorDiaData
    .filter((d) => visibleCarbonSeries[d.name] !== false)
    .map((item) => ({
      name: item.name,
      gCO2: Math.round((item.kWh || 0) * FACTOR_EMISION_G_KWH)
    }));

  const isAllSelected =
    seriesKeys.length > 0 &&
    seriesKeys.every((key) => visibleCarbonSeries[key] !== false);

  const activeDaysCount = seriesKeys.filter(
    (key) => visibleCarbonSeries[key] !== false
  ).length;

  const handleSafeToggleDay = (key: string) => {
    const isCurrentlySelected = visibleCarbonSeries[key] !== false;
    if (isCurrentlySelected && activeDaysCount <= 1) return;
    onToggleCarbonDay(key);
  };

  const handleSelectAll = () => {
    seriesKeys.forEach((key) => {
      if (visibleCarbonSeries[key] === false) onToggleCarbonDay(key);
    });
  };

  const totalG = emisionesData.reduce((acc, curr) => acc + curr.gCO2, 0);
  const promedioGDiario = emisionesData.length > 0 ? totalG / emisionesData.length : 0;

  // En gráficos de barras, la línea base debe ser SIEMPRE 0 para evitar distorsión visual
  const rawValues = emisionesData.map((d) => d.gCO2);
  const maxVal = rawValues.length > 0 ? Math.max(...rawValues) : 1000;

  // Calculamos el tope del eje Y con 20% de holgura para que quepan las etiquetas superiores
  const yMax = Math.ceil((maxVal * 1.2) / 100) * 100;
  const yMid = Math.round(yMax / 2);
  const yTicks = [0, yMid, yMax];

  return (
    <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm font-sans mt-6 transition-all duration-300 hover:border-slate-300">
      {/* Cabecera */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-sm">
            <Zap size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-slate-950 text-base sm:text-lg tracking-tight">
                Emisiones de CO₂ por Día de la Semana
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                <Info size={11} /> Huella de Carbono
              </span>
            </div>
            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800 border border-slate-200 shadow-2xs">
              <span className="inline-block size-2 rounded-full bg-slate-700 animate-pulse"></span>
              <span>
                Cálculo basado en el consumo activo medido · Factor SEIN: <b>{FACTOR_EMISION_G_KWH} g CO₂/kWh</b>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-600">
              EMISIÓN DIARIA PROMEDIO
            </p>
            <p className="mt-1.5 text-3xl font-black text-slate-950 tracking-tight">
              {formatGramos(promedioGDiario)}
              <span className="text-sm font-black text-slate-700 ml-1.5">g CO₂/día</span>
            </p>
            <p className="mt-1.5 text-xs font-medium text-slate-500">
              ≈ {(promedioGDiario / 1000).toFixed(2)} kg CO₂/día en promedio
            </p>
          </div>
          <div className="size-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
            <Award size={22} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-600">
              TOTAL EMISIONES DEL PERÍODO
            </p>
            <p className="mt-1.5 text-3xl font-black text-slate-950 tracking-tight">
              {formatGramos(totalG)}{" "}
              <span className="text-sm font-black text-slate-700 ml-1">g CO₂</span>
            </p>
            <p className="mt-1.5 text-xs font-medium text-slate-500">
              ≈ <span className="font-bold text-slate-700">{(totalG / 1000).toFixed(2)} kg CO₂</span> acumulados en la muestra
            </p>
          </div>
          <div className="size-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
            <Trees size={22} />
          </div>
        </div>
      </div>

      {/* Filtros de Días */}
      <div className="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Filtros Días:</span>
        </div>
        <div className="flex gap-2 overflow-x-auto py-1 justify-start flex-1">
          {seriesKeys.map((key) => {
            const isSelected = visibleCarbonSeries[key] !== false;
            const isLastActive = isSelected && activeDaysCount === 1;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSafeToggleDay(key)}
                className={`flex flex-col items-center justify-center min-w-[78px] px-3.5 py-2 rounded-xl transition-all border ${isSelected
                    ? "border-transparent text-white shadow-md shadow-slate-600/10"
                    : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                  } ${isLastActive ? "cursor-not-allowed opacity-90" : ""}`}
                style={isSelected ? { background: "linear-gradient(to bottom, #475569, #1e293b)" } : undefined}
              >
                <span className="text-xs font-extrabold">{key}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 shrink-0 justify-end">
          <button
            type="button"
            onClick={handleSelectAll}
            className={`px-4 py-2.5 text-xs font-black rounded-xl border cursor-pointer ${isAllSelected
                ? "text-white border-slate-600/30 shadow-lg ring-2 ring-slate-400/40"
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            style={isAllSelected ? { background: "linear-gradient(to right, #475569, #1e293b)" } : undefined}
          >
            <span>Todos</span>
          </button>
        </div>
      </div>

      {/* Gráfico Recharts */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-0 sm:border-none">
        <div className="h-80 sm:h-96 md:h-[400px] w-[600px] sm:w-full text-xs font-medium text-slate-500 select-none [&_*]:focus:outline-none">
          {emisionesData.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-slate-400 font-semibold text-sm">
              Selecciona al menos un día para visualizar los datos del gráfico.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart
                data={emisionesData}
                margin={{ top: 35, right: 15, left: 10, bottom: 30 }}
              >
                <defs>
                  <linearGradient id="gradCarbon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#64748b" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

                <XAxis
                  dataKey="name"
                  tickLine={false}
                  stroke="#94a3b8"
                  dy={8}
                  tick={{ fontSize: "10px", fontWeight: "700", fill: "#475569" }}
                >
                  <Label
                    value="Días de la Semana"
                    position="insideBottom"
                    offset={-20}
                    style={{ textAnchor: "middle", fill: "#475569", fontWeight: "800", fontSize: "13px" }}
                  />
                </XAxis>

                <YAxis
                  domain={[0, yMax]}
                  ticks={yTicks}
                  interval={0}
                  tickLine={false}
                  stroke="#94a3b8"
                  width={68}
                  tick={{ fontSize: "10px" }}
                  tickFormatter={(val) => formatGramos(Number(val))}
                >
                  <Label
                    value="Emisiones (g CO₂ / día)"
                    angle={-90}
                    position="insideLeft"
                    offset={-5}
                    style={{ textAnchor: "middle", fill: "#475569", fontWeight: "800", fontSize: "13px" }}
                  />
                </YAxis>

                <Tooltip
                  cursor={{ fill: "#f1f5f9", opacity: 0.6 }}
                  content={<CustomCarbonTooltip />}
                />

                <Bar
                  dataKey="gCO2"
                  fill="url(#gradCarbon)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={50}
                >
                  <LabelList
                    dataKey="gCO2"
                    position="top"
                    formatter={(val: any) => formatGramos(Number(val))}
                    style={{ fontSize: "11px", fontWeight: "800", fill: "#1e293b" }}
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