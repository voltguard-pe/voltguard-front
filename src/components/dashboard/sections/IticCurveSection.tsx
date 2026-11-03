import React, { useEffect, useRef, useState } from "react";
import { UploadCloud, Zap, Info } from "lucide-react";
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
import { useAuth } from "../../../shared/hooks/useAuth";

// ── LÍNEA INFERIOR ESCALONADA (HUECOS / SAGS) ──
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

const ITIC_TICKS_X = [0.00001, 0.0001, 0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000, 100000];

interface IticCurveSectionProps {
  iticEvents: VoltageEventItem[];
  tensionNominal?: number | string | null;
  uploadingItic: boolean;
  onIticFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface MetrelTooltipProps {
  active?: boolean;
  payload?: any[];
  esTactil: boolean;
  renderTarjeta: (itemActivo: any) => React.ReactNode;
}

// Helper: Parsear duración sin importar si viene en s, ms o ciclos
const parsearDuracionSegundos = (duracionRaw: any): number => {
  if (duracionRaw === null || duracionRaw === undefined) return 0.00001;
  const str = String(duracionRaw).toLowerCase().replace(/,/g, '.');
  const num = parseFloat(str.replace(/[^\d.-]/g, ''));
  if (isNaN(num) || num <= 0) return 0.00001;

  if (str.includes("ms")) return num / 1000;
  if (str.includes("ciclo") || str.includes("cycle")) return num / 60; // 60 Hz base
  return num; // ya en segundos
};

// Helper: Detección universal de fase (Metrel, Circutor, Fluke)
const clasificarFaseUniversal = (faseRaw: any): 1 | 2 | 3 => {
  const f = String(faseRaw || "").toUpperCase().trim();
  if (
    f.includes("L12") || f.includes("U12") || f.includes("V12") ||
    f === "L1" || f.includes("L1-") || f.includes("L1N") ||
    f.includes("FASE 1") || f.includes("PHASE A") || f.endsWith(" A") || f === "A"
  ) {
    return 1;
  }
  if (
    f.includes("L23") || f.includes("U23") || f.includes("V23") ||
    f === "L2" || f.includes("L2-") || f.includes("L2N") ||
    f.includes("FASE 2") || f.includes("PHASE B") || f.endsWith(" B") || f === "B"
  ) {
    return 2;
  }
  return 3; // L3, L31, Phase C, etc.
};

const MetrelTooltip: React.FC<MetrelTooltipProps> = ({
  active,
  payload,
  esTactil,
  renderTarjeta
}) => {
  if (esTactil || !active || !payload?.length) return null;
  return renderTarjeta(payload[0]?.payload);
};

export const IticCurveSection: React.FC<IticCurveSectionProps> = ({
  iticEvents,
  tensionNominal,
  uploadingItic,
  onIticFileUpload
}) => {
  const { auth } = useAuth();
  const isAdmin = auth?.role === "ADMIN";

  const [selectedIticPoint, setSelectedIticPoint] = useState<any | null>(null);
  const [anchor, setAnchor] = useState<{ cx: number; cy: number } | null>(null);
  const [mobileCardPosition, setMobileCardPosition] = useState<{
    left: number;
    top: number;
    above: boolean;
  } | null>(null);

  const chartWrapRef = useRef<HTMLDivElement | null>(null);

  const esTactil =
    typeof window !== "undefined" && !!window.matchMedia?.("(hover: none)").matches;

  const seleccionar = (node: any) => {
    setSelectedIticPoint(node?.payload ?? node);
    if (node?.cx != null && node?.cy != null) {
      setAnchor({ cx: Number(node.cx), cy: Number(node.cy) });
    }
  };

  const cerrarDetalle = () => {
    setSelectedIticPoint(null);
    setAnchor(null);
  };

  useEffect(() => {
    if (!selectedIticPoint) return;
    const onOutside = (e: PointerEvent) => {
      const target = e.target as Node;
      const dentroGrafico = chartWrapRef.current?.contains(target);
      if (!dentroGrafico) {
        cerrarDetalle();
      }
    };
    document.addEventListener("pointerdown", onOutside);
    return () => document.removeEventListener("pointerdown", onOutside);
  }, [selectedIticPoint]);

  useEffect(() => {
    if (!esTactil || !selectedIticPoint) {
      setMobileCardPosition(null);
      return;
    }

    const CARD_W = 230;
    const GAP = 12;
    const scroller = chartWrapRef.current?.parentElement;

    const actualizarPosicion = () => {
      const sl = scroller?.scrollLeft ?? 0;
      const vw = scroller?.clientWidth ?? 350;
      const pos = anchor ?? { cx: sl + vw / 2, cy: 120 };

      let left = pos.cx + GAP;
      if (left - sl + CARD_W > vw - 4) left = pos.cx - GAP - CARD_W;
      left = Math.max(sl + 4, Math.min(left, sl + vw - CARD_W - 4));

      const above = pos.cy > 240;
      setMobileCardPosition({
        left,
        top: above ? pos.cy - GAP : pos.cy + GAP,
        above
      });
    };

    actualizarPosicion();
    window.addEventListener("resize", actualizarPosicion);
    scroller?.addEventListener("scroll", actualizarPosicion);

    return () => {
      window.removeEventListener("resize", actualizarPosicion);
      scroller?.removeEventListener("scroll", actualizarPosicion);
    };
  }, [anchor, esTactil, selectedIticPoint]);

  if (!iticEvents || iticEvents.length === 0) {
    return (
      <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-6 shadow-sm font-sans mt-6">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
          <Zap size={32} className="text-slate-300 animate-pulse" />
          <p className="mt-3 text-xs font-bold text-slate-500">Sin historial de eventos ITIC cargado</p>
          <label
            htmlFor="csv-itic-empty"
            className={`mt-4 flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-black text-white shadow-md ${uploadingItic ? "bg-amber-400 cursor-not-allowed" : "cursor-pointer bg-amber-600 hover:bg-amber-700"
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
    let t = parsearDuracionSegundos(ev.duracionSegundos);
    t = Math.max(0.00001, Math.min(100000, t));

    // Conversión inteligente de tensión residual (% vs Voltios)
    const rawVal = parseFloat(String(ev.tensionResidual || "0").replace(/,/g, '.').replace(/[^\d.-]/g, '')) || 0;
    const textoResidual = String(ev.tensionResidual || "");

    let vPercent = 100;
    let vReales = rawVal;

    if (textoResidual.includes("%")) {
      vPercent = rawVal;
      vReales = (rawVal / 100) * vBase;
    } else if (rawVal > (vBase * 0.4)) {
      // Es un valor en voltios reales (ej: 154V en red de 220V)
      vReales = rawVal;
      vPercent = (rawVal / vBase) * 100;
    } else {
      // Es un valor que ya vino como porcentaje (ej: 70% o 115%)
      vPercent = rawVal;
      vReales = (rawVal / 100) * vBase;
    }

    const vFinal = Math.max(0, Math.min(400, vPercent));

    const duracionMs =
      t < 1
        ? `${Math.round(t * 1000).toString().padStart(3, "0")} ms`
        : `${t.toFixed(3)} s`;

    const item = {
      id: idx + 1,
      x: t,
      y: vFinal,
      duracionTexto: duracionMs,
      tipoEvento: ev.tipoEvento || (vFinal < 90 ? "Hueco (Sag)" : vFinal > 110 ? "Sobretensión (Swell)" : "Evento"),
      horaInicio: ev.horaInicio || "--:--",
      horaFinalizacion: ev.horaFinalizacion || ev.horaInicio || "--:--",
      fase: ev.fase,
      voltiosReales: vReales
    };

    const numFase = clasificarFaseUniversal(ev.fase);

    if (numFase === 1) {
      dataFase1.push({ ...item, faseExacta: "Fase 1 (L1 / L12)" });
    } else if (numFase === 2) {
      dataFase2.push({ ...item, faseExacta: "Fase 2 (L2 / L23)" });
    } else {
      dataFase3.push({ ...item, faseExacta: "Fase 3 (L3 / L31)" });
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

  const TarjetaEvento = (itemActivo: any) => {
    if (!itemActivo || itemActivo.tipoEvento === undefined) return null;

    const todosLosEventos = [...dataFase1, ...dataFase2, ...dataFase3];
    const eventosCoincidentes = todosLosEventos.filter(
      (ev) =>
        ev.horaInicio === itemActivo.horaInicio ||
        (Math.abs(ev.x - itemActivo.x) < 0.0001 && Math.abs(ev.y - itemActivo.y) < 0.5)
    );

    const eventosAMostrar = eventosCoincidentes.length > 0 ? eventosCoincidentes : [itemActivo];

    return (
      <div className="rounded-xl border border-slate-300 bg-white/95 p-3.5 shadow-2xl font-sans text-xs leading-snug min-w-[220px] max-w-[250px] text-slate-800 backdrop-blur-md">
        <div className="border-b border-slate-200 pb-1.5 mb-2 flex items-center justify-between">
          <span className="font-bold text-slate-900 text-sm">
            {itemActivo.tipoEvento}
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
              ev.faseExacta.includes("Fase 1")
                ? "#dc2626"
                : ev.faseExacta.includes("Fase 2")
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
                  {ev.voltiosReales.toFixed(1)} V{" "}
                  <span className="font-semibold text-slate-500">({ev.y.toFixed(1)}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm font-sans mt-6 transition-all duration-300 hover:border-slate-300">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
            <Zap size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-slate-950 text-base tracking-tight">
                Curva de Tolerancia ITIC / CBEMA
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/60">
                <Info size={11} /> Estándar IEEE 446
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Sensibilidad a perturbaciones transitorias por fase según curva ITIC (Tensión Base: <strong>{vBase}V</strong>)
            </p>
          </div>
        </div>

        {/* Leyenda Universal de Fases */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <span className="size-2 bg-[#dc2626] inline-block rounded-full" /> Fase 1 (L1)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 bg-[#16a34a] inline-block rounded-full" /> Fase 2 (L2)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 bg-[#2563eb] inline-block rounded-full" /> Fase 3 (L3)
            </span>
          </div>

          {!isAdmin && (
            <>
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
            </>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">
          <div
            ref={chartWrapRef}
            onPointerDown={(e) => {
              if (selectedIticPoint && !(e.target as Element).closest("[data-itic-point]")) {
                cerrarDetalle();
              }
            }}
            className="relative h-[480px] w-[950px] sm:w-full text-xs select-none [&_*]:focus:outline-none"
          >
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 35 }}>
                <defs>
                  <linearGradient id="gradOvervoltage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#eea342" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#fed7aa" stopOpacity={0.4} />
                  </linearGradient>

                  <linearGradient id="gradUndervoltage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fef08a" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#fef9c3" stopOpacity={0.3} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="1 1" stroke="#cbd5e1" />

                {/* Zonas de Sobretensión (Swell) */}
                <ReferenceArea x1={0.0002} x2={0.003} y1={Math.min(200, yAxisMax)} y2={yAxisMax} fill="url(#gradOvervoltage)" />
                <ReferenceArea x1={0.003} x2={0.5} y1={120} y2={yAxisMax} fill="url(#gradOvervoltage)" />
                <ReferenceArea x1={0.5} x2={100000} y1={110} y2={yAxisMax} fill="url(#gradOvervoltage)" />

                {/* Zonas de Hueco de Tensión (Sag) */}
                <ReferenceArea x1={0.02} x2={0.5} y1={0} y2={70} fill="url(#gradUndervoltage)" />
                <ReferenceArea x1={0.5} x2={10} y1={0} y2={80} fill="url(#gradUndervoltage)" />
                <ReferenceArea x1={10} x2={100000} y1={0} y2={90} fill="url(#gradUndervoltage)" />

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
                    style={{ textAnchor: "middle", fill: "#0f172a", fontWeight: "800", fontSize: "13px" }}
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
                  tickFormatter={(val) => `${val.toFixed(0)}%`}
                  tick={{ fontSize: "10px", fill: "#1e293b", fontWeight: 600 }}
                >
                  <Label
                    value="% de la Tensión Nominal"
                    angle={-90}
                    position="insideLeft"
                    offset={-5}
                    style={{ textAnchor: "middle", fill: "#0f172a", fontWeight: "800", fontSize: "13px" }}
                  />
                </YAxis>

                <Tooltip
                  content={<MetrelTooltip esTactil={esTactil} renderTarjeta={TarjetaEvento} />}
                  cursor={esTactil ? false : { strokeDasharray: "3 3", stroke: "#94a3b8" }}
                  wrapperStyle={{ zIndex: 50, maxWidth: 250 }}
                />

                <ReferenceLine y={100} stroke="#475569" strokeDasharray="3 3" strokeWidth={1} />

                {/* Límites de la Norma ITIC */}
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

                {/* 1. Fase 1 (Rojo) */}
                <Scatter
                  name="Fase 1 (L1)"
                  data={dataFase1}
                  fill="#dc2626"
                  onClick={seleccionar}
                  shape={(props: any) => (
                    <g
                      data-itic-point
                      style={{ cursor: "pointer" }}
                      onClick={() => seleccionar(props)}
                    >
                      <circle cx={props.cx} cy={props.cy} r={12} fill="transparent" />
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={4}
                        fill="#dc2626"
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />
                    </g>
                  )}
                  isAnimationActive={false}
                />

                {/* 2. Fase 2 (Verde) */}
                <Scatter
                  name="Fase 2 (L2)"
                  data={dataFase2}
                  fill="#16a34a"
                  onClick={seleccionar}
                  shape={(props: any) => (
                    <g
                      data-itic-point
                      style={{ cursor: "pointer" }}
                      onClick={() => seleccionar(props)}
                    >
                      <circle cx={props.cx} cy={props.cy} r={12} fill="transparent" />
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={4}
                        fill="#16a34a"
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />
                    </g>
                  )}
                  isAnimationActive={false}
                />

                {/* 3. Fase 3 (Azul) */}
                <Scatter
                  name="Fase 3 (L3)"
                  data={dataFase3}
                  fill="#2563eb"
                  onClick={seleccionar}
                  shape={(props: any) => (
                    <g
                      data-itic-point
                      style={{ cursor: "pointer" }}
                      onClick={() => seleccionar(props)}
                    >
                      <circle cx={props.cx} cy={props.cy} r={12} fill="transparent" />
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={4}
                        fill="#2563eb"
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />
                    </g>
                  )}
                  isAnimationActive={false}
                />
              </ScatterChart>
            </ResponsiveContainer>

            {/* Celular: tarjeta flotante en pantalla táctil */}
            {esTactil && selectedIticPoint && mobileCardPosition && (
              <div
                className="pointer-events-none absolute z-50"
                style={{
                  left: mobileCardPosition.left,
                  top: mobileCardPosition.top,
                  width: 230,
                  transform: mobileCardPosition.above ? "translateY(-100%)" : undefined
                }}
              >
                {TarjetaEvento(selectedIticPoint)}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};