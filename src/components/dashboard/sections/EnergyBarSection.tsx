import React from "react";
import { Container } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
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

export const EnergyBarSection: React.FC<EnergyBarSectionProps> = ({
  energiaPorDiaData,
  visibleEnergySeries,
  seriesKeys,
  onToggleEnergyDay
}) => {
  const barrasVisibles = energiaPorDiaData.filter(
    (d) => visibleEnergySeries[d.name] !== false
  );

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
        <div className="h-72 sm:h-80 md:h-[400px] w-[600px] sm:w-full text-xs font-medium text-slate-500 select-none">
          {barrasVisibles.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-slate-400 font-semibold text-sm">
              Selecciona al menos un día para visualizar los datos del gráfico.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barrasVisibles}
                margin={{ top: 25, right: 15, left: 10, bottom: 30 }}
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
                  formatter={(value: any) => [
                    `${Number(value).toFixed(1)} kWh`,
                    "Consumo Total"
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)"
                  }}
                />
                <Bar
                  dataKey="kWh"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
};