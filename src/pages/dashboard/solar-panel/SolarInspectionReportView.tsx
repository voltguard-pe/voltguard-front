import {
  AlertTriangle,
  Download,
  Flame,
  Layers,
  ShieldAlert
} from "lucide-react";
import { useState } from "react";
// import { useParams } from "react-router-dom";

// Datos tomados directamente del informe técnico MAPFRE
const INSPECTION_DATA = {
  facility: "Sistema Fotovoltaico en Azotea — Edificio MAPFRE, Miraflores",
  date: "06 de octubre de 2026",
  engineer: "Ing. César Augusto Inga Zapata (CIP 99496)",
  operatingPower: "10 kW (66% de capacidad instalada)",
  ambientTemp: 19,
  normalPanelTemp: 30.2,
  hotspotsFound: 14,
  criticalHotspots: 3,
  rootCause: "Suciedad concentrada por excremento de aves tras el lavado (efecto celda sombreada)",
  actionRecommended: "Reemplazo obligatorio de 3 paneles (A2-06, A1-03, A1-02) y reserva para hasta 14 paneles",
};

// Detalle de los 14 puntos calientes analizados
const HOTSPOTS_LIST = [
  { id: 1, panelId: "A2-06", tSpot: 49.0, tNormal: 30.3, deltaT: 18.8, status: "CRITICAL", action: "Reemplazo obligatorio" },
  { id: 2, panelId: "A1-03", tSpot: 49.1, tNormal: 32.2, deltaT: 16.9, status: "CRITICAL", action: "Reemplazo obligatorio" },
  { id: 3, panelId: "A1-02", tSpot: 46.0, tNormal: 30.4, deltaT: 15.6, status: "CRITICAL", action: "Reemplazo obligatorio" },
  { id: 4, panelId: "A1-04", tSpot: 45.0, tNormal: 30.4, deltaT: 14.8, status: "WARNING", action: "Monitoreo post-lavado" },
  { id: 5, panelId: "A1-07", tSpot: 45.3, tNormal: 30.5, deltaT: 14.7, status: "WARNING", action: "Monitoreo post-lavado" },
  { id: 6, panelId: "A2-10", tSpot: 45.5, tNormal: 31.2, deltaT: 14.3, status: "WARNING", action: "Monitoreo post-lavado" },
  { id: 7, panelId: "A2-04", tSpot: 44.5, tNormal: 30.2, deltaT: 14.3, status: "WARNING", action: "Monitoreo post-lavado" },
  { id: 8, panelId: "A1-08", tSpot: 44.6, tNormal: 30.6, deltaT: 14.0, status: "WARNING", action: "Monitoreo post-lavado" },
];

export const SolarInspectionReportView = () => {
  // const { companyCode } = useParams<{ companyCode: string }>();
  const [selectedPanel, setSelectedPanel] = useState<string | null>("A2-06");

  // Representación del Subarreglo A (Lámina B-2: Línea A1 Parapeto [10 paneles] y Línea A2 Interior [11 paneles])
  const lineA1 = ["A1-01", "A1-02", "A1-03", "A1-04", "A1-05", "A1-06", "A1-07", "A1-08", "A1-09", "A1-10"];
  const lineA2 = ["A2-01", "A2-02", "A2-03", "A2-04", "A2-05", "A2-06", "A2-07", "A2-08", "A2-09", "A2-10", "A2-11"];

  const criticalPanels = ["A2-06", "A1-03", "A1-02"];
  const warningPanels = ["A1-04", "A1-07", "A2-10", "A2-04", "A1-08"];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ── Encabezado del Informe Ejecutivo ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
              Informe Técnico Termográfico
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Norma IEC 62446-3 / NETA MTS</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900">
            Diagnóstico de Puntos Calientes (Hotspots) y Plan de Reemplazo
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {INSPECTION_DATA.facility} • Inspeccionado el {INSPECTION_DATA.date}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
        >
          <Download size={14} />
          <span>Exportar Informe PDF</span>
        </button>
      </div>

      {/* ── Resumen de Decisión / Alerta Temprana ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tarjeta de Riesgo y Acción */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Reemplazo Urgente</span>
              <Flame size={16} className="text-rose-600" />
            </div>
            <p className="text-2xl font-black text-rose-950 mt-1">3 Paneles Críticos</p>
            <p className="text-[11px] text-rose-800 mt-1 leading-relaxed">
              Superan los <strong>15 °C de gradiente térmico (ΔT)</strong>. En verano llegarán a 78 °C, provocando daño irreversible en las celdas y pérdida de generación.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-rose-200/60 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-rose-900">Paneles: A2-06, A1-03, A1-02</span>
            <span className="font-bold text-rose-700 underline cursor-pointer">Ver en plano</span>
          </div>
        </div>

        {/* Tarjeta de Causa Raíz */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Causa Raíz Identificada</span>
              <AlertTriangle size={16} className="text-amber-600" />
            </div>
            <p className="text-base font-bold text-amber-950 mt-1">Excremento de Aves (Foco Concentrado)</p>
            <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
              La mancha opaca anula celdas en fila forzándolas a disipar energía en calor. Las palomas y la baja inclinación (10°) anulan el lavado por lluvia.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-amber-200/60 text-[11px] font-medium text-amber-900">
            Plan exigido: <strong>Limpieza recurrente 1 vez al mes</strong>
          </div>
        </div>

        {/* Tarjeta de Compatibilidad para Compra */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Especificación de Reemplazo</span>
              <ShieldAlert size={16} className="text-[#0797d5]" />
            </div>
            <p className="text-base font-bold text-slate-900 mt-1">Trina Solar 455 Wp o equivalente</p>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Corriente y voltaje estricto: <strong>11.06 A / 41.2 V (tolerancia ±2%)</strong>. Mezclar corrientes distintas degrada la fila entera de paneles.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Reserva presupuestal: <strong>Tope 14 unidades</strong>
          </div>
        </div>
      </div>

      {/* ── Layout Visual e Interactivo de la Azotea (Lámina B-2) ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-slate-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Subarreglo A — Azotea (Disposición en Campo)
              </h2>
            </div>
            <p className="text-[11px] text-slate-500">Haz clic sobre un panel para inspeccionar su condición térmica</p>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-medium">
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded bg-rose-500 border border-rose-600" />
              <span>Grave / Reemplazo Obligatorio (ΔT &gt; 15 °C)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded bg-amber-400 border border-amber-500" />
              <span>Moderado en Observación</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded bg-slate-100 border border-slate-300" />
              <span>Normal (&lt; 32 °C)</span>
            </div>
          </div>
        </div>

        {/* Matriz física de paneles */}
        <div className="pt-6 pb-2 overflow-x-auto">
          <div className="min-w-[760px] space-y-3">
            {/* Fila A1: Parapeto */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Línea A1 — Junto al Parapeto (10 Paneles)
              </div>
              <div className="grid grid-cols-10 gap-1.5">
                {lineA1.map((pCode) => {
                  const isCritical = criticalPanels.includes(pCode);
                  const isWarning = warningPanels.includes(pCode);
                  const isSelected = selectedPanel === pCode;

                  let bgClass = "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-400";
                  if (isCritical) bgClass = "bg-rose-500 border-rose-600 text-white font-black shadow-sm ring-2 ring-rose-200";
                  else if (isWarning) bgClass = "bg-amber-100 border-amber-300 text-amber-900 font-bold";

                  return (
                    <button
                      key={pCode}
                      onClick={() => setSelectedPanel(pCode)}
                      className={`h-16 rounded-lg border flex flex-col items-center justify-center p-1 text-xs transition-all cursor-pointer ${bgClass} ${
                        isSelected ? "scale-105 ring-2 ring-slate-900" : ""
                      }`}
                    >
                      <span className="text-[11px] font-mono">{pCode}</span>
                      {isCritical && <span className="text-[8px] uppercase tracking-tight mt-0.5 font-bold">ΔT &gt; 15°C</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fila A2: Interior */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Línea A2 — Interior (11 Paneles)
              </div>
              <div className="grid grid-cols-11 gap-1.5">
                {lineA2.map((pCode) => {
                  const isCritical = criticalPanels.includes(pCode);
                  const isWarning = warningPanels.includes(pCode);
                  const isSelected = selectedPanel === pCode;

                  let bgClass = "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-400";
                  if (isCritical) bgClass = "bg-rose-500 border-rose-600 text-white font-black shadow-sm ring-2 ring-rose-200";
                  else if (isWarning) bgClass = "bg-amber-100 border-amber-300 text-amber-900 font-bold";

                  return (
                    <button
                      key={pCode}
                      onClick={() => setSelectedPanel(pCode)}
                      className={`h-16 rounded-lg border flex flex-col items-center justify-center p-1 text-xs transition-all cursor-pointer ${bgClass} ${
                        isSelected ? "scale-105 ring-2 ring-slate-900" : ""
                      }`}
                    >
                      <span className="text-[11px] font-mono">{pCode}</span>
                      {isCritical && <span className="text-[8px] uppercase tracking-tight mt-0.5 font-bold">ΔT &gt; 15°C</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Panel informativo dinámico del panel seleccionado */}
        {selectedPanel && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono font-black text-slate-900 bg-white border border-slate-200 px-2 py-1 rounded">
                Panel {selectedPanel}
              </span>
              <span className="text-slate-600">
                {criticalPanels.includes(selectedPanel)
                  ? "Punto crítico grave detectado. Calentamiento focalizado por mancha de excremento. Cambio inmediato requerido."
                  : warningPanels.includes(selectedPanel)
                  ? "Punto moderado al borde de gravedad (ΔT ~14 °C). Requiere verificación tras próximo lavado."
                  : "Panel operando a temperatura normal (~30 °C). Sin fallas térmicas activas."}
              </span>
            </div>
            {criticalPanels.includes(selectedPanel) && (
              <span className="text-rose-600 font-bold uppercase text-[10px] tracking-wide shrink-0">
                Acción: Incluir en compra
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Evidencia Termográfica: Visible vs. Infrarrojo (Anexo A.5) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Evidencia 1: Foto Óptica (Luz Visible)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Dron Dual Sensor • 14:29 h</span>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center">
            {/* Aquí puedes enlazar la imagen subida en tu servidor o Cloudinary */}
            <div className="p-4 text-center">
              <p className="text-xs font-bold text-slate-700">Mancha Localizada sobre Fila de Celdas</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                Cuerpo denso y reguero alargado dejado por excremento de ave. El lavado inicial no eliminó la mancha.
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            El excremento genera un obstáculo opaco que convierte a la celda en receptor de carga.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Evidencia 2: Termografía Radiométrica (IR-01)
            </h3>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Punto Caliente: 49.0 °C (ΔT = 18.8 °C)
            </span>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center text-white">
            <div className="p-4 text-center">
              <Flame size={28} className="mx-auto text-amber-400 mb-1 animate-pulse" />
              <p className="text-xs font-bold">Foco Concentrado Térmico</p>
              <p className="text-[11px] text-slate-300 mt-1 max-w-sm">
                El mapa térmico reproduce exactamente la misma geometría de la mancha. Se descarta falsa alarma o defecto de fábrica.
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            Cumple criterio de gravedad de la norma IEC 62446-3 al superar los 15 grados de diferencia.
          </p>
        </div>
      </div>

      {/* ── Tabla de Monitoreo de los 14 Puntos Térmicos ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">
          Registro de Puntos de Recalentamiento Confirmados (Toma Cenital IR)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px]">
                <th className="pb-3 px-3">Punto N.º</th>
                <th className="pb-3 px-3">Panel Asignado</th>
                <th className="pb-3 px-3">T. Medida</th>
                <th className="pb-3 px-3">T. Normal Panel</th>
                <th className="pb-3 px-3">Diferencia (ΔT)</th>
                <th className="pb-3 px-3">Nivel de Criticidad</th>
                <th className="pb-3 px-3 text-right">Acción Requerida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {HOTSPOTS_LIST.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold">#{String(h.id).padStart(2, "0")}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{h.panelId}</td>
                  <td className="py-3 px-3 font-mono text-slate-900">{h.tSpot.toFixed(1)} °C</td>
                  <td className="py-3 px-3 font-mono text-slate-500">{h.tNormal.toFixed(1)} °C</td>
                  <td className="py-3 px-3 font-mono font-bold text-rose-600">+{h.deltaT.toFixed(1)} °C</td>
                  <td className="py-3 px-3">
                    {h.status === "CRITICAL" ? (
                      <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        GRAVE (&gt; 15 °C)
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        Moderado al límite
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-800">{h.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};