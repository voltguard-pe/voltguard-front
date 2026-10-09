import React from "react";
import { BarChart3, ChartNoAxesCombined, Clock, UploadCloud, Zap } from "lucide-react";
import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const MAIN_COLORS = [
  '#2f5597', '#4caf50', '#9c27b0', '#00bcd4', '#ff9800',
  '#e91e63', '#795548', '#607d8b', '#03a9f4', '#eab308', '#ec4899'
];

interface DemandSectionProps {
  rawChartData: any[];
  seriesKeys: string[];
  visibleDemandSeries: { [key: string]: boolean };
  onToggleDemandDay: (key: string) => void;
  importing: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  horaPicoMaximo: string | null;
  analisisPotencia: {
    maxHP: { valor: number; hora: string; fecha: string } | null;
    maxHFP: { valor: number; hora: string; fecha: string } | null;
    ahorroEstimado: number;
  } | null;
}

const CustomTooltip = ({ active, label, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xl max-w-[280px] sm:max-w-xs font-sans text-xs">
        <div className="mb-2 border-b border-slate-100 pb-1.5 flex justify-between items-center gap-2">
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] sm:text-[10px]">
            Intervalo Diario
          </span>
          <span className="flex items-center gap-x-1 font-black text-slate-900 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded-md border border-slate-200/60 text-[10px] sm:text-[11px] shrink-0">
            <Clock size={12} /> {label} hrs
          </span>
        </div>

        <div className="space-y-2 max-h-40 sm:max-h-52 overflow-y-auto pr-1">
          {[...payload]
            .sort((a, b) => (b.value || 0) - (a.value || 0))
            .map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4 sm:gap-6 font-semibold">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="size-1.5 sm:size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.stroke }}
                  />
                  <span className="truncate text-slate-600 text-[10px] sm:text-[11px]">
                    {item.name}
                  </span>
                </div>
                <span className="text-slate-900 font-black text-right tabular-nums whitespace-nowrap text-[10px] sm:text-[11px]">
                  {item.value !== null && item.value !== undefined ? `${Number(item.value).toFixed(2)} kW` : '-'}
                </span>
              </div>
            ))}
        </div>

        <div className="mt-2.5 border-t border-slate-100 pt-2 text-[9px] sm:text-[10px] text-slate-400 font-medium flex justify-between">
          <span>Analizador: Metrel</span>
          <span className="font-bold text-[#0797d5]">Voltguard</span>
        </div>
      </div>
    );
  }
  return null;
};

export const DemandSection: React.FC<DemandSectionProps> = ({
  rawChartData,
  seriesKeys,
  visibleDemandSeries,
  onToggleDemandDay,
  importing,
  onFileChange,
  horaPicoMaximo,
  analisisPotencia
}) => {
  // 1. Recolección de valores reales visibles para cálculo dinámico
  const allVisibleValues: number[] = [];

  rawChartData.forEach((row) => {
    if (visibleDemandSeries["Promedio_General"] && row["Promedio_General"] !== undefined && row["Promedio_General"] !== null) {
      allVisibleValues.push(Number(row["Promedio_General"]));
    }
    seriesKeys.forEach((key) => {
      if (visibleDemandSeries[key] && row[key] !== undefined && row[key] !== null) {
        allVisibleValues.push(Number(row[key]));
      }
    });
  });

  // 2. Lógica de escala uniforme en el eje Y (cero hardcoding)
  const minVal = allVisibleValues.length > 0 ? Math.min(...allVisibleValues) : 0;
  const maxVal = allVisibleValues.length > 0 ? Math.max(...allVisibleValues) : 10;
  const diff = maxVal - minVal;

  let stepIncrement = 1;
  if (diff > 80) stepIncrement = 20;
  else if (diff > 40) stepIncrement = 10;
  else if (diff > 20) stepIncrement = 5;
  else if (diff > 8) stepIncrement = 2;
  else if (diff > 3) stepIncrement = 1;
  else if (diff > 1) stepIncrement = 0.5;
  else stepIncrement = 0.2;

  // Piso: 1 paso regular debajo del mínimo sin bajar de 0
  const yMin = Math.max(0, Number((Math.floor(minVal / stepIncrement) * stepIncrement - stepIncrement).toFixed(2)));
  // Techo: 1 paso regular por encima del máximo
  const yMax = Number((Math.ceil(maxVal / stepIncrement) * stepIncrement + stepIncrement).toFixed(2));

  // Cuadrícula continua de ticks sin huecos
  const yTicks: number[] = [];
  for (let val = yMin; val <= yMax + 0.0001; val += stepIncrement) {
    yTicks.push(Number(val.toFixed(2)));
  }

  return (
    <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all duration-300 hover:border-slate-300 font-sans">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-600">
            <BarChart3 size={20} className="sm:size-[22px]" />
          </div>
          <div>
            <h2 className="font-bold text-slate-950 text-sm sm:text-base tracking-tight">Cuadro de Demanda</h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Demanda instantánea calculada y expresada en KiloVatios (kW)</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <label
            htmlFor="csv-metrel"
            className="flex sm:inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl px-5 py-2.5 text-xs font-black text-white transition-all duration-300 cursor-pointer shadow-md shadow-orange-500/25 border border-orange-500/30 active:scale-95 h-[38px]"
            style={{ background: "linear-gradient(to right, #f97316, #c2410c)" }}
          >
            <UploadCloud size={16} />
            {importing ? "Importando..." : "Importar .Mediciones.csv"}
          </label>
          <input
            id="csv-metrel"
            type="file"
            accept=".csv"
            onChange={onFileChange}
            className="hidden"
            disabled={importing}
          />
        </div>
      </div>

      {rawChartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
          <BarChart3 size={32} className="text-slate-300 animate-pulse" />
          <p className="mt-3 text-xs font-bold text-slate-500">Sin historial de curvas de demanda cargado</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Selector de Días */}
          <div className="flex items-center gap-2.5 overflow-x-auto p-2.5 rounded-2xl bg-slate-100/80 border border-slate-200/40 scrollbar-thin">
            <span className="text-[10px] font-black uppercase text-slate-400 self-center mr-1 shrink-0">
              DÍAS:
            </span>

            <button
              type="button"
              onClick={() => onToggleDemandDay("Promedio_General")}
              className={`flex shrink-0 items-center gap-x-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all border cursor-pointer ${
                visibleDemandSeries["Promedio_General"]
                  ? 'text-white shadow-sm shadow-orange-500/25 border-orange-500/30 scale-[1.02]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              style={
                visibleDemandSeries["Promedio_General"]
                  ? { background: "linear-gradient(to right, #f97316, #c2410c)" }
                  : undefined
              }
            >
              <ChartNoAxesCombined size={14} /> Promedio General
            </button>

            {seriesKeys.map((key) => {
              const isSelected = !!visibleDemandSeries[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onToggleDemandDay(key)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all border cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>

          <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-0 sm:border-none scrollbar-thin">
            <div className="h-72 sm:h-80 md:h-[420px] w-[850px] sm:w-full text-xs font-medium text-slate-500 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={rawChartData}
                  margin={{ top: 25, right: 15, left: 10, bottom: 25 }}
                >
                  <defs>
                    <linearGradient id="lineGradPromedio" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#c2410c" />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

                  {(() => {
                    const horasVisibles = rawChartData.map(d => d.horaMinuto);
                    const primerHora = horasVisibles[0];
                    const ultimaHora = horasVisibles[horasVisibles.length - 1];

                    const hora18 = horasVisibles.find(h => h >= "18:00") || "18:00";
                    const hora23 = horasVisibles.find(h => h >= "23:00") || "23:00";

                    return (
                      <>
                        <ReferenceArea x1={primerHora} x2={hora18} fill="#f8fafc" fillOpacity={0.55}>
                          <Label value="HORA FUERA DE PUNTA (HFP)" position="top" offset={10} fill="#0284c7" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '0.05em' }} />
                        </ReferenceArea>

                        <ReferenceArea x1={hora18} x2={hora23} fill="#fff1f2" fillOpacity={0.65}>
                          <Label value="HORA PUNTA (HP)" position="top" offset={10} fill="#f43f5e" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '0.05em' }} />
                        </ReferenceArea>

                        <ReferenceArea x1={hora23} x2={ultimaHora} fill="#f8fafc" fillOpacity={0.55} />

                        {horaPicoMaximo && horasVisibles.includes(horaPicoMaximo) && (
                          <ReferenceLine x={horaPicoMaximo} stroke="#be123c" strokeWidth={2} strokeDasharray="4 4">
                            <Label
                              value={`▲ PICO MÁXIMO (${Number(horaPicoMaximo.split(':')[0]) >= 18 && Number(horaPicoMaximo.split(':')[0]) < 23
                                ? 'HP'
                                : 'HFP'
                              })`}
                              position="insideTopLeft"
                              dy={25}
                              dx={4}
                              fill="#be123c"
                              style={{ fontSize: '8px', fontWeight: '900' }}
                            />
                          </ReferenceLine>
                        )}
                      </>
                    );
                  })()}

                  <XAxis
                    dataKey="horaMinuto"
                    tickLine={false}
                    stroke="#94a3b8"
                    allowDuplicatedCategory={false}
                    dy={10}
                    interval={11}
                    tick={{ angle: -45, textAnchor: 'end', fontSize: '9px', fontWeight: '600', fill: '#64748b' }}
                    height={60}
                  >
                    <Label value="Hora del Día" position="insideBottom" offset={-15} style={{ textAnchor: 'middle', fill: '#475569', fontWeight: '800', fontSize: '9px', letterSpacing: '0.05em' }} />
                  </XAxis>

                  <YAxis
                    domain={[yMin, yMax]}
                    ticks={yTicks}
                    interval={0}
                    allowDataOverflow={true}
                    tickLine={false}
                    stroke="#94a3b8"
                    width={55}
                    tick={{ fontSize: '10px' }}
                    tickFormatter={(val) => `${Number(val).toFixed(stepIncrement < 1 ? 1 : 0)}`}
                  >
                    <Label value="Demanda de Potencia Activa (kW)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#475569', fontWeight: '800', fontSize: '9px', letterSpacing: '0.05em' }} />
                  </YAxis>

                  <Tooltip content={<CustomTooltip />} shared={true} />

                  {visibleDemandSeries["Promedio_General"] && (
                    <Line type="monotone" name="Promedio General" dataKey="Promedio_General" stroke="url(#lineGradPromedio)" strokeWidth={3} dot={false} connectNulls animationDuration={150} />
                  )}

                  {seriesKeys.map((key, idx) =>
                    visibleDemandSeries[key] ? (
                      <Line key={key} type="monotone" name={key} dataKey={key} stroke={MAIN_COLORS[idx % MAIN_COLORS.length]} strokeWidth={1.5} dot={false} connectNulls animationDuration={150} />
                    ) : null
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {analisisPotencia && (
            <div className="mt-8 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4 sm:p-5">
                <div className="flex items-center gap-2 text-rose-700">
                  <Clock size={16} className="animate-pulse" />
                  <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-wider">Pico Máximo en Hora Punta (HP)</h3>
                </div>
                <p className="mt-2 text-2xl sm:text-3xl font-black text-rose-950">
                  {analisisPotencia.maxHP?.valor.toFixed(1)} <span className="text-xs sm:text-sm font-bold text-rose-500">kW</span>
                </p>
                <div className="mt-1 text-[11px] sm:text-xs text-slate-500">
                  Registrado el <strong className="text-slate-700">{analisisPotencia.maxHP?.fecha}</strong> a las <strong className="text-slate-700">{analisisPotencia.maxHP?.hora} hrs</strong>.
                </div>
                <span className="mt-2.5 inline-block rounded-lg bg-rose-100 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-rose-700">Horario Crítico: 18:00 a 23:00 hrs</span>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4 sm:p-5">
                <div className="flex items-center gap-2 text-blue-700">
                  <Zap size={16} />
                  <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-wider">Pico Máximo Fuera de Punta (HFP)</h3>
                </div>
                <p className="mt-2 text-2xl sm:text-3xl font-black text-blue-950">
                  {analisisPotencia.maxHFP?.valor.toFixed(1)} <span className="text-xs sm:text-sm font-bold text-blue-500">kW</span>
                </p>
                <div className="mt-1 text-[11px] sm:text-xs text-slate-500">
                  Registrado el <strong className="text-slate-700">{analisisPotencia.maxHFP?.fecha}</strong> a las <strong className="text-slate-700">{analisisPotencia.maxHFP?.hora} hrs</strong>.
                </div>
                <span className="mt-2.5 inline-block rounded-lg bg-blue-100 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-blue-700">Horario Base: 23:00 a 18:00 hrs</span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};