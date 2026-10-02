import React, { useState } from "react";
import { UploadCloud, X, Zap } from "lucide-react";
import {
  CartesianGrid,
  Label,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { VoltageEventItem } from "../../../services/voltageEvent.service";

// ── LÍNEA INFERIOR ESCALONADA (HUECOS Y CAÍDAS) ──
const ITIC_LOWER_LINE = [
  { x: 0.00001, y: 0 },
  { x: 0.02, y: 0 },
  { x: 0.02, y: 70 },
  { x: 0.5, y: 70 },
  { x: 0.5, y: 80 },
  { x: 10, y: 80 },
  { x: 10, y: 90 },
  { x: 100000, y: 90 },
];

// DÉCADAS EXACTAS DEL EJE X DE METREL
const ITIC_TICKS_X = [0.00001, 0.0001, 0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000, 100000];

interface IticCurveSectionProps {
  iticEvents: VoltageEventItem[];
  tensionNominal?: number | string | null;
  uploadingItic: boolean;
  onIticFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const IticCurveSection: React.FC<IticCurveSectionProps> = ({
  iticEvents,
  tensionNominal,
  uploadingItic,
  onIticFileUpload
}) => {
  const [selectedIticPoint, setSelectedIticPoint] = useState<any | null>(null);

  if (!iticEvents || iticEvents.length === 0) {
    return (
      <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-6 shadow-sm font-sans mt-6">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
          <Zap size={32} className="text-slate-300 animate-pulse" />
          <p className="mt-3 text-xs font-bold text-slate-500">Sin historial de eventos ITIC cargado</p>
          <label
            htmlFor="csv-itic-empty"
            className={`mt-4 flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-black text-white shadow-md ${
              uploadingItic ? "bg-amber-400 cursor-not-allowed" : "cursor-pointer bg-amber-600 hover:bg-amber-700"
            }`}
          >
            <UploadCloud size={15} /> {uploadingItic ? "Procesando..." : "Importar Eventos (.csv)"}
          </label>
          <input
            id="csv-itic-empty"
            type="file"
            accept=".csv"
            onChange={onIticFileUpload}
            className="hidden"
            disabled={uploadingItic}
          />
        </div>
      </section>
    );
  }

  const dataFase1: any[] = [];
  const dataFase2: any[] = [];
  const dataFase3: any[] = [];

  const vBase = Number(tensionNominal) || 220;

  iticEvents.forEach((ev: any, idx: number) => {
    let t = Number(ev.duracionSegundos);
    if (isNaN(t) || t <= 0) t = 0.00001;
    t = Math.max(0.00001, Math.min(100000, t));

    const rawResidual = Number(ev.tensionResidual) || 0;
    const vPercent = rawResidual > 50 ? (rawResidual / vBase) * 100 : rawResidual;
    const v = Math.max(0, Math.min(400, vPercent));

    const duracionMs =
      t < 1
        ? `${Math.round(t * 1000).toString().padStart(3, "0")} ms`
        : `${t.toFixed(3)} s`;

    const item = {
      id: idx + 1,
      x: t,
      y: v,
      duracionTexto: duracionMs,
      tipoEvento: ev.tipoEvento,
      horaInicio: ev.horaInicio,
      horaFinalizacion: ev.horaFinalizacion || ev.horaInicio,
      fase: ev.fase,
      voltiosReales: rawResidual
    };

    const f = String(ev.fase || "").toUpperCase().trim();

    if (f.includes("L12") || f === "L1" || f.includes("FASE 1")) {
      dataFase1.push({ ...item, faseExacta: "L12" });
    }
    if (f.includes("L23") || f === "L2" || f.includes("FASE 2")) {
      dataFase2.push({ ...item, faseExacta: "L23" });
    }
    if (f.includes("L31") || f.includes("L3") || f.includes("FASE 3")) {
      dataFase3.push({ ...item, faseExacta: "L31" });
    }
  });

  const todosLosPuntosY = [
    ...dataFase1.map((d) => d.y),
    ...dataFase2.map((d) => d.y),
    ...dataFase3.map((d) => d.y)
  ];

  const maxRegistrado = todosLosPuntosY.length > 0 ? Math.max(...todosLosPuntosY) : 100;
  const yAxisMax = Math.min(400, Math.max(200, Math.ceil((maxRegistrado * 1.15) / 50) * 50));

  const upperCurveLine = [
    { x: 0.0002, y: yAxisMax },
    { x: 0.0002, y: Math.min(200, yAxisMax) },
    { x: 0.003, y: Math.min(200, yAxisMax) },
    { x: 0.003, y: 120 },
    { x: 0.5, y: 120 },
    { x: 0.5, y: 110 },
    { x: 100000, y: 110 }
  ];

  const MetrelTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const itemActivo = payload[0]?.payload;
      if (!itemActivo || itemActivo.tipoEvento === undefined) return null;

      const todosLosEventos = [...dataFase1, ...dataFase2, ...dataFase3];
      const eventosCoincidentes = todosLosEventos.filter(
        (ev) =>
          ev.horaInicio === itemActivo.horaInicio ||
          (Math.abs(ev.x - itemActivo.x) < 0.0001 && Math.abs(ev.y - itemActivo.y) < 0.5)
      );

      const eventosAMostrar = eventosCoincidentes.length > 0 ? eventosCoincidentes : [itemActivo];

      return (
        <div className="rounded-xl border border-slate-300 bg-white/95 p-3 shadow-2xl font-sans text-xs leading-snug min-w-[230px] z-50 text-slate-800 backdrop-blur-sm">
          <div className="border-b border-slate-200 pb-1.5 mb-2 flex items-center justify-between">
            <span className="font-bold text-slate-900 text-sm">
              {itemActivo.tipoEvento} de Tensión
            </span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
              {itemActivo.duracionTexto}
            </span>
          </div>

          <div className="space-y-1 text-slate-600 text-[11px] mb-2">
            <p>
              Iniciado en: <strong className="text-slate-800">{itemActivo.horaInicio}</strong>
            </p>
            <p>
              Finalizado en: <strong className="text-slate-800">{itemActivo.horaFinalizacion}</strong>
            </p>
          </div>

          <div className="border-t border-slate-100 pt-2 space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Fases Afectadas:
            </p>
            {eventosAMostrar.map((ev, idx) => {
              const colorFase =
                ev.faseExacta === "L12"
                  ? "#dc2626"
                  : ev.faseExacta === "L23"
                  ? "#16a34a"
                  : "#2563eb";

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-50 px-2 py-1 rounded border border-slate-100"
                >
                  <span className="flex items-center gap-1.5 font-bold" style={{ color: colorFase }}>
                    <span className="size-2 rounded-full inline-block" style={{ backgroundColor: colorFase }} />
                    {ev.faseExacta || ev.fase}
                  </span>
                  <span className="text-slate-900 font-extrabold tabular-nums">
                    {ev.voltiosReales.toFixed(2)} V{" "}
                    <span className="font-semibold text-slate-500">({ev.y.toFixed(1)}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm font-sans mt-6 transition-all">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
            <Zap size={22} />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-950 text-base tracking-tight">
              Curva de Tolerancia ITIC
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sensibilidad a perturbaciones transitorias por fase según estándar IEEE 446
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 bg-[#dc2626] inline-block rounded-full" /> Línea 12
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 bg-[#16a34a] inline-block rounded-full" /> Línea 23
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#2563eb] inline-block" /> Línea 31
            </span>
          </div>

          <label
            htmlFor="csv-itic-btn"
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-black text-white cursor-pointer bg-amber-600 hover:bg-amber-700 shadow-sm"
          >
            <UploadCloud size={15} /> Recargar CSV
          </label>
          <input
            id="csv-itic-btn"
            type="file"
            accept=".csv"
            onChange={onIticFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {selectedIticPoint && (() => {
        const todosLosEventos = [...dataFase1, ...dataFase2, ...dataFase3];
        const eventosRelacionados = todosLosEventos.filter(
          (ev) => ev.horaInicio === selectedIticPoint.horaInicio
        );
        const lista = eventosRelacionados.length > 0 ? eventosRelacionados : [selectedIticPoint];

        return (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50/80 p-3.5 shadow-sm text-xs animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 w-full">
              <div>
                <p className="text-[10px] font-bold text-amber-700 uppercase">Evento</p>
                <p className="font-black text-slate-900">{selectedIticPoint.tipoEvento}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-700 uppercase">Duración</p>
                <p className="font-black text-slate-900">{selectedIticPoint.duracionTexto}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-700 uppercase">Fases y Valores</p>
                <div className="flex flex-wrap gap-2 mt-0.5">
                  {lista.map((item, i) => (
                    <span
                      key={i}
                      className="font-bold text-slate-900 bg-white/80 px-1.5 py-0.5 rounded border border-amber-200"
                    >
                      {item.faseExacta || item.fase}: {item.voltiosReales.toFixed(1)} V
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-700 uppercase">Hora Inicio</p>
                <p className="font-medium text-slate-700 truncate">{selectedIticPoint.horaInicio}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedIticPoint(null)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-100 hover:text-slate-700 shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        );
      })()}

      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">
        <div className="h-[480px] w-[950px] sm:w-full text-xs select-none">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 35 }}>
              <CartesianGrid strokeDasharray="1 1" stroke="#cbd5e1" />

              <ReferenceArea
                x1={0.0002}
                x2={0.003}
                y1={Math.min(200, yAxisMax)}
                y2={yAxisMax}
                fill="#fed7aa"
                fillOpacity={0.65}
              />
              <ReferenceArea x1={0.003} x2={0.5} y1={120} y2={yAxisMax} fill="#fed7aa" fillOpacity={0.65} />
              <ReferenceArea x1={0.5} x2={100000} y1={110} y2={yAxisMax} fill="#fed7aa" fillOpacity={0.65} />

              <ReferenceArea x1={0.02} x2={0.5} y1={0} y2={70} fill="#fef08a" fillOpacity={0.7} />
              <ReferenceArea x1={0.5} x2={10} y1={0} y2={80} fill="#fef08a" fillOpacity={0.7} />
              <ReferenceArea x1={10} x2={100000} y1={0} y2={90} fill="#fef08a" fillOpacity={0.7} />

              <XAxis
                type="number"
                dataKey="x"
                domain={[0.00001, 100000]}
                scale="log"
                allowDataOverflow
                ticks={ITIC_TICKS_X}
                tickFormatter={(val) => {
                  if (val === 0.00001) return "10 µs";
                  if (val === 0.0001) return "100 µs";
                  if (val === 0.001) return "1 ms";
                  if (val === 0.01) return "10 ms";
                  if (val === 0.1) return "100 ms";
                  if (val === 1) return "1 s";
                  if (val === 10) return "10 s";
                  if (val === 100) return "10² s";
                  if (val === 1000) return "10³ s";
                  if (val === 10000) return "10⁴ s";
                  if (val === 100000) return "10⁵ s";
                  return "";
                }}
                stroke="#475569"
                tick={{ fontSize: "10px", fill: "#1e293b", fontWeight: 600 }}
              >
                <Label
                  value="Duración del evento (segundos)"
                  position="insideBottom"
                  offset={-20}
                  style={{ textAnchor: "middle", fill: "#0f172a", fontWeight: "800", fontSize: "11px" }}
                />
              </XAxis>

              <YAxis
                type="number"
                dataKey="y"
                domain={[0, yAxisMax]}
                allowDataOverflow={true}
                ticks={
                  yAxisMax === 200
                    ? [0, 50, 100, 150, 200]
                    : yAxisMax === 300
                    ? [0, 100, 200, 300]
                    : [0, 100, 200, 300, 400]
                }
                stroke="#475569"
                width={55}
                tickFormatter={(val) => `${val.toFixed(1)}%`}
                tick={{ fontSize: "10px", fill: "#1e293b", fontWeight: 600 }}
              >
                <Label
                  value="% de la nominal"
                  angle={-90}
                  position="insideLeft"
                  offset={-5}
                  style={{ textAnchor: "middle", fill: "#0f172a", fontWeight: "800", fontSize: "11px" }}
                />
              </YAxis>

              <Tooltip content={<MetrelTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "#94a3b8" }} />

              <ReferenceLine y={100} stroke="#475569" strokeDasharray="3 3" strokeWidth={1} />

              <Scatter
                name="Límite Superior"
                data={upperCurveLine}
                line={{ stroke: "#0f172a", strokeWidth: 2 }}
                shape={() => null}
                legendType="none"
                isAnimationActive={false}
              />
              <Scatter
                name="Límite Inferior"
                data={ITIC_LOWER_LINE}
                line={{ stroke: "#0f172a", strokeWidth: 2 }}
                shape={() => null}
                legendType="none"
                isAnimationActive={false}
              />

              {/* 1. Línea 12 (Rojo) */}
              <Scatter
                name="Línea 12"
                data={dataFase1}
                fill="#dc2626"
                onClick={(node: any) => setSelectedIticPoint(node?.payload)}
                shape={(props: any) => (
                  <g style={{ cursor: "pointer" }}>
                    <circle cx={props.cx} cy={props.cy} r={12} fill="transparent" />
                    <line
                      x1={props.cx - 3.5}
                      y1={props.cy + 1.5}
                      x2={props.cx + 3.5}
                      y2={props.cy + 1.5}
                      stroke="#dc2626"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </g>
                )}
                isAnimationActive={false}
              />

              {/* 2. Línea 23 (Verde) */}
              <Scatter
                name="Línea 23"
                data={dataFase2}
                fill="#16a34a"
                onClick={(node: any) => setSelectedIticPoint(node?.payload)}
                shape={(props: any) => (
                  <g style={{ cursor: "pointer" }}>
                    <circle cx={props.cx} cy={props.cy} r={12} fill="transparent" />
                    <line
                      x1={props.cx - 3.5}
                      y1={props.cy - 1.5}
                      x2={props.cx + 3.5}
                      y2={props.cy - 1.5}
                      stroke="#16a34a"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </g>
                )}
                isAnimationActive={false}
              />

              {/* 3. Línea 31 (Azul) */}
              <Scatter
                name="Línea 31"
                data={dataFase3}
                fill="#2563eb"
                onClick={(node: any) => setSelectedIticPoint(node?.payload)}
                shape={(props: any) => (
                  <g style={{ cursor: "pointer" }}>
                    <circle cx={props.cx} cy={props.cy} r={12} fill="transparent" />
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={3.2}
                      fill="#2563eb"
                      stroke="#1d4ed8"
                      strokeWidth={0.5}
                    />
                  </g>
                )}
                isAnimationActive={false}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};