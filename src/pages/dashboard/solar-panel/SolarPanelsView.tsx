import {
  AlertOctagon,
  AlertTriangle,
  Calendar,
  Camera,
  Download,
  MapPin,
  ShieldAlert,
  Thermometer
} from "lucide-react";
import { useState } from "react";

// Metadatos de la auditoría técnica
const INSPECTION_METADATA = {
  facility: "Sistema Fotovoltaico en Azotea — Edificio MAPFRE, Miraflores",
  date: "06 de octubre de 2026",
  engineer: "Ing. César Augusto Inga Zapata (CIP 99496)",
  operatingPower: "10.0 kW (66% de capacidad instalada)",
  ambientTemp: 19.0,
  replacementModel: "Trina Solar 455 Wp (Imp: 11.06 A / Vmp: 41.2 V ±2%)",
};

// Celdas calientes mapeadas sobre el encuadre cenital (DJI_0149_R / DJI_0150)
// Regla IEC 62446-3: Las celdas individuales no se reemplazan en campo; 
// si la celda supera el umbral térmico irreversible, se ordena el cambio integral del panel.
const HOTSPOTS_DATA = [
  {
    id: "HS-01",
    panelId: "A2-06",
    cellLocation: "Fila 2, Celda 4 (Sub-cadena media)",
    x: 48.2, // % horizontal
    y: 28.5, // % vertical
    tSpot: 49.0,
    tNormal: 30.3,
    deltaT: 18.7,
    status: "CRITICAL",
    visualCause: "Mancha densa de excremento de paloma / Celda polarizada en inversa disipando energía",
    action: "CAMBIO INTEGRAL DEL PANEL A2-06",
    actionDescription: "Degradación térmica irreversible en celda. Sustitución obligatoria del módulo completo para evitar daño en la serie.",
  },
  {
    id: "HS-02",
    panelId: "A1-03",
    cellLocation: "Fila 1, Celda 2 (Extremo superior)",
    x: 69.4,
    y: 19.8,
    tSpot: 49.1,
    tNormal: 32.2,
    deltaT: 16.9,
    status: "CRITICAL",
    visualCause: "Sobrecalentamiento focal severo por depósito opaco calcificado",
    action: "CAMBIO INTEGRAL DEL PANEL A1-03",
    actionDescription: "Sobrepasa los 15 °C de gradiente térmico. Módulo no apto para operación continua.",
  },
  {
    id: "HS-03",
    panelId: "A1-02",
    cellLocation: "Fila 1, Celda 6 (Junto al marco inferior)",
    x: 71.8,
    y: 35.2,
    tSpot: 46.0,
    tNormal: 30.4,
    deltaT: 15.6,
    status: "CRITICAL",
    visualCause: "Punto caliente en interconexión de celda con riesgo de delaminación",
    action: "CAMBIO INTEGRAL DEL PANEL A1-02",
    actionDescription: "Daño permanente en celdas de la subcadena. Requiere reemplazo del módulo completo.",
  },
  {
    id: "HS-04",
    panelId: "A1-04",
    cellLocation: "Fila 3, Celda 1 (Borde interno)",
    x: 68.1,
    y: 47.6,
    tSpot: 45.0,
    tNormal: 30.4,
    deltaT: 14.6,
    status: "WARNING",
    visualCause: "Depósito de polución concentrada sobre cuadrante de celda",
    action: "LIMPIEZA Y REVALUACIÓN (PRE-CAMBIO)",
    actionDescription: "Limpieza química inmediata. Si post-lavado ΔT ≥ 15 °C, ejecutar cambio integral del módulo.",
  },
  {
    id: "HS-05",
    panelId: "A1-07",
    cellLocation: "Fila 4, Celda 3 (Centro de panel)",
    x: 73.5,
    y: 63.4,
    tSpot: 45.3,
    tNormal: 30.5,
    deltaT: 14.8,
    status: "WARNING",
    visualCause: "Calentamiento anómalo en borde de celda",
    action: "LIMPIEZA Y REVALUACIÓN (PRE-CAMBIO)",
    actionDescription: "Monitoreo termográfico post-lavado para descartar sustitución del módulo completo.",
  },
  {
    id: "HS-06",
    panelId: "A2-10",
    cellLocation: "Fila 5, Celda 2 (Línea pasillo interior)",
    x: 37.0,
    y: 74.2,
    tSpot: 45.5,
    tNormal: 31.2,
    deltaT: 14.3,
    status: "WARNING",
    visualCause: "Sombreado térmico recurrente por ducto de ventilación",
    action: "LIMPIEZA Y REVALUACIÓN (PRE-CAMBIO)",
    actionDescription: "Verificar si la degradación de la celda es reversible o requiere retiro del módulo.",
  },
  {
    id: "HS-07",
    panelId: "A2-04",
    cellLocation: "Fila 2, Celda 5",
    x: 44.5,
    y: 42.1,
    tSpot: 44.5,
    tNormal: 30.2,
    deltaT: 14.3,
    status: "WARNING",
    visualCause: "Sedimento acumulado en canal de drenaje del marco",
    action: "LIMPIEZA Y REVALUACIÓN (PRE-CAMBIO)",
    actionDescription: "Limpieza especializada y termografía con dron en próxima pasada.",
  },
  {
    id: "HS-08",
    panelId: "A1-08",
    cellLocation: "Fila 4, Celda 6",
    x: 75.1,
    y: 78.5,
    tSpot: 44.6,
    tNormal: 30.6,
    deltaT: 14.0,
    status: "WARNING",
    visualCause: "Ensuciamiento focal moderado",
    action: "LIMPIEZA Y REVALUACIÓN (PRE-CAMBIO)",
    actionDescription: "Observación técnica. En caso de persistir, sustituir el panel entero.",
  },
];

export const SolarInspectionReportView = () => {
  const [selectedHotspot, setSelectedHotspot] = useState<typeof HOTSPOTS_DATA[0]>(HOTSPOTS_DATA[0]);
  const [hoveredHotspot, setHoveredHotspot] = useState<typeof HOTSPOTS_DATA[0] | null>(null);

  // Paneles que obligatoriamente deben comprarse/cambiarse enteros
  const panelsToReplace = Array.from(
    new Set(HOTSPOTS_DATA.filter((h) => h.status === "CRITICAL").map((h) => h.panelId))
  );

  const renderCellPins = (showTooltip: boolean = true) => {
    return HOTSPOTS_DATA.map((spot) => {
      const isSelected = selectedHotspot?.id === spot.id;
      const isHovered = hoveredHotspot?.id === spot.id;
      const isCritical = spot.status === "CRITICAL";

      return (
        <div
          key={spot.id}
          style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
          onClick={() => setSelectedHotspot(spot)}
          onMouseEnter={() => setHoveredHotspot(spot)}
          onMouseLeave={() => setHoveredHotspot(null)}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center">
            {isCritical && (
              <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-rose-500 opacity-60" />
            )}

            <div
              className={`size-5 rounded-full border-2 flex items-center justify-center text-[9px] font-black transition-transform ${
                isSelected
                  ? "scale-125 ring-2 ring-white shadow-lg"
                  : isHovered
                  ? "scale-115"
                  : ""
              } ${
                isCritical
                  ? "bg-rose-600 border-white text-white"
                  : "bg-amber-400 border-white text-amber-950"
              }`}
            >
              !
            </div>

            {showTooltip && (
              <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-950/95 text-white p-2.5 rounded-lg text-[10px] whitespace-nowrap shadow-xl border border-slate-700 z-30 pointer-events-none">
                <div className="flex items-center gap-1.5 font-bold font-mono text-amber-300">
                  <span>Panel {spot.panelId}</span>
                  <span className="text-slate-400">({spot.cellLocation})</span>
                </div>
                <p className="text-slate-200 mt-0.5">
                  T. Medida: <span className="font-bold text-white">{spot.tSpot} °C</span> (ΔT +{spot.deltaT} °C)
                </p>
                <p className="text-rose-400 font-bold mt-0.5">
                  {isCritical ? "Acción: Cambiar panel completo" : "Acción: Monitoreo pre-cambio"}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen text-slate-800">
      {/* ── Encabezado Principal ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="bg-rose-100 text-rose-800 text-[10px] font-black uppercase px-2 py-0.5 rounded">
              IEC 62446-3 / Protocolo de Reemplazo
            </span>
            <span className="text-slate-400 font-mono text-xs">
              Mapeo Radiométrico Dron Dual Sensor
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Diagnóstico de Puntos Calientes y Plan de Cambio de Paneles
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
            <MapPin size={13} className="text-slate-400" />
            <span>{INSPECTION_METADATA.facility}</span>
            <span className="text-slate-300">•</span>
            <Calendar size={13} className="text-slate-400" />
            <span>{INSPECTION_METADATA.date}</span>
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="self-start md:self-center inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer"
        >
          <Download size={14} />
          <span>Exportar Informe de Compra (PDF)</span>
        </button>
      </div>

      {/* ── Resumen de Sustitución Obligatoria ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-700">
                Paneles para Cambio Obligatorio
              </span>
              <AlertOctagon size={18} className="text-rose-600" />
            </div>
            <p className="text-3xl font-black text-rose-950 mt-2">{panelsToReplace.length} Módulos</p>
            <p className="text-xs text-rose-800 mt-1 leading-relaxed">
              Las celdas con calentamiento severo no tienen reparación posible. Para evitar incendios, delaminación y caída de corriente en la serie, se debe cambiar el módulo completo.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-rose-200/80 flex items-center justify-between text-xs font-bold text-rose-900">
            <span>Códigos: {panelsToReplace.join(", ")}</span>
            <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded uppercase">Urgente</span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-800">
                Paneles en Observación (Pre-Cambio)
              </span>
              <AlertTriangle size={18} className="text-amber-600" />
            </div>
            <p className="text-3xl font-black text-amber-950 mt-2">5 Módulos</p>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              Celdas con calentamiento moderado (10 °C ≤ ΔT &lt; 15 °C). Requieren lavado químico inmediato; si la celda no normaliza su temperatura en la termografía de control, se cambiarán de inmediato.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-200/80 text-xs font-bold text-amber-900">
            <span>Protocolo: Lavado + Vuelo térmico de comprobación</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Módulo Fotovoltaico de Reemplazo
              </span>
              <ShieldAlert size={18} className="text-blue-600" />
            </div>
            <p className="text-base font-black text-slate-900 mt-2">{INSPECTION_METADATA.replacementModel}</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Por ser un circuito serie, los módulos nuevos deben coincidir estrictamente con la corriente de trabajo (Imp = 11.06 A) para no restringir la generación del string.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Tope presupuestal</span>
            <strong className="text-slate-800">Hasta 8 unidades de reemplazo</strong>
          </div>
        </div>
      </div>

      {/* ── Visor Sincronizado Lado a Lado (Térmica Izquierda | Óptica Derecha) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LADO IZQUIERDO: Infrarrojo */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer size={16} className="text-rose-500" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Térmica Radiométrica (Izquierda)
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">DJI_0149_R.JPG</span>
          </div>

          <div className="relative w-full aspect-16/11 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 select-none">
            <img
              src="/DJI_0149_R.JPG"
              alt="Termografía Infrarroja de Celdas"
              className="w-full h-full object-cover"
            />
            {renderCellPins(true)}
          </div>
          <p className="text-[11px] text-slate-500 italic">
            Los puntos amarillos/blancos indican celdas individuales en sobrecalentamiento.
          </p>
        </div>

        {/* LADO DERECHO: Luz Visible */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera size={16} className="text-blue-500" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Óptica Normal (Derecha)
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">DJI_0150.jpg</span>
          </div>

          <div className="relative w-full aspect-16/11 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 select-none">
            <img
              src="/DJI_0150.jpg"
              alt="Fotografía Visual de Celdas"
              className="w-full h-full object-cover"
            />
            {renderCellPins(false)}
          </div>
          <p className="text-[11px] text-slate-500 italic">
            Comprobación directa de la causa física (excremento, polución opaca o quemadura).
          </p>
        </div>
      </div>

      {/* ── Ficha Técnica de Decisión (Enfocada al Cambio Integral) ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-3">
            <span className="font-mono font-black text-slate-900 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg text-sm">
              Panel {selectedHotspot.panelId}
            </span>
            <span className="text-xs font-semibold text-slate-700">
              Celda detectada: {selectedHotspot.cellLocation}
            </span>
          </div>

          <span
            className={`self-start sm:self-center text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
              selectedHotspot.status === "CRITICAL"
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-amber-50 text-amber-800 border border-amber-200"
            }`}
          >
            {selectedHotspot.status === "CRITICAL" ? "🔴 Sustitución de Módulo Obligatoria" : "🟡 Observación Pre-Reemplazo"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100">
            <span className="text-[10px] font-bold text-rose-700 uppercase block">Temperatura Máxima en Celda</span>
            <span className="text-2xl font-black font-mono text-rose-950 mt-1 block">
              {selectedHotspot.tSpot} °C
            </span>
            <span className="text-[10px] text-rose-800 mt-0.5 block">
              Gradiente térmico: +{selectedHotspot.deltaT} °C
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Causa Física en la Celda</span>
            <span className="text-xs font-medium text-slate-700 mt-1 block leading-relaxed">
              {selectedHotspot.visualCause}
            </span>
          </div>

          <div className="md:col-span-2 bg-slate-900 text-white p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Dictamen Técnico Final
              </span>
              <p className="text-sm font-black text-white mt-1">
                {selectedHotspot.action}
              </p>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {selectedHotspot.actionDescription}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabla de Decisiones y Registro de Celdas ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Inventario de Puntos Térmicos y Módulos a Sustituir
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Norma IEC 62446-3: Umbral crítico ΔT ≥ 15 °C
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3 px-3">Cód.</th>
                <th className="pb-3 px-3">Panel Asignado</th>
                <th className="pb-3 px-3">Celda Crítica</th>
                <th className="pb-3 px-3">T. Celda</th>
                <th className="pb-3 px-3">Gradiente (ΔT)</th>
                <th className="pb-3 px-3">Estado</th>
                <th className="pb-3 px-3">Causa Visible (RGB)</th>
                <th className="pb-3 px-3 text-right">Acción Requerida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {HOTSPOTS_DATA.map((spot) => (
                <tr
                  key={spot.id}
                  onClick={() => setSelectedHotspot(spot)}
                  className={`hover:bg-slate-50 transition cursor-pointer ${
                    selectedHotspot.id === spot.id ? "bg-slate-50/90 font-bold" : ""
                  }`}
                >
                  <td className="py-3 px-3 font-mono text-slate-400">{spot.id}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{spot.panelId}</td>
                  <td className="py-3 px-3 text-slate-600">{spot.cellLocation}</td>
                  <td className="py-3 px-3 font-mono text-rose-600 font-bold">{spot.tSpot} °C</td>
                  <td className="py-3 px-3 font-mono font-bold text-rose-700">+{spot.deltaT} °C</td>
                  <td className="py-3 px-3">
                    {spot.status === "CRITICAL" ? (
                      <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                        CAMBIO OBLIGATORIO
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                        PRE-CAMBIO
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs truncate" title={spot.visualCause}>
                    {spot.visualCause}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">{spot.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};