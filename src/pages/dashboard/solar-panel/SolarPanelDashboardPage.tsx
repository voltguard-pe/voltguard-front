import React, { useState } from 'react';

// Tipos basados en el informe técnico MAPFRE
interface HotspotPoint {
  id: number;
  panelId: string;
  ubicacion: string;
  tPunto: number;
  tNormal: number;
  deltaT: number;
  severidad: 'GRAVE' | 'MODERADO';
  accion: 'REEMPLAZO OBLIGATORIO' | 'OBSERVACIÓN POST-LAVADO';
}

export const SolarPanelDashboardPage: React.FC = () => {
  // Datos reales del Anexo A.6 y Anexo B del informe
  const puntosCalientes: HotspotPoint[] = [
    { id: 1, panelId: 'A2-06', ubicacion: 'Línea interior A2 - 6.° panel', tPunto: 49.0, tNormal: 30.3, deltaT: 18.8, severidad: 'GRAVE', accion: 'REEMPLAZO OBLIGATORIO' },
    { id: 2, panelId: 'A1-03', ubicacion: 'Línea parapeto A1 - 3.er panel', tPunto: 49.1, tNormal: 32.2, deltaT: 16.9, severidad: 'GRAVE', accion: 'REEMPLAZO OBLIGATORIO' },
    { id: 3, panelId: 'A1-02', ubicacion: 'Línea parapeto A1 - 2.° panel', tPunto: 46.0, tNormal: 30.4, deltaT: 15.6, severidad: 'GRAVE', accion: 'REEMPLAZO OBLIGATORIO' },
    { id: 4, panelId: 'A1-05', ubicacion: 'Línea parapeto A1 - 5.° panel', tPunto: 45.0, tNormal: 30.4, deltaT: 14.8, severidad: 'MODERADO', accion: 'OBSERVACIÓN POST-LAVADO' },
    { id: 5, panelId: 'A2-04', ubicacion: 'Línea interior A2 - 4.° panel', tPunto: 45.3, tNormal: 30.5, deltaT: 14.7, severidad: 'MODERADO', accion: 'OBSERVACIÓN POST-LAVADO' },
    { id: 6, panelId: 'A2-09', ubicacion: 'Línea interior A2 - 9.° panel', tPunto: 45.5, tNormal: 31.2, deltaT: 14.3, severidad: 'MODERADO', accion: 'OBSERVACIÓN POST-LAVADO' },
  ];

  console.log(puntosCalientes)

  const [selectedPanel, setSelectedPanel] = useState<string>('A2-06');

  // Representación del string físico del plano B-2
  const filaA1 = ['A1-01', 'A1-02', 'A1-03', 'A1-04', 'A1-05', 'A1-06', 'A1-07', 'A1-08', 'A1-09', 'A1-10'];
  const filaA2 = ['A2-01', 'A2-02', 'A2-03', 'A2-04', 'A2-05', 'A2-06', 'A2-07', 'A2-08', 'A2-09', 'A2-10', 'A2-11'];

  const getPanelStatusClass = (panelId: string) => {
    if (['A2-06', 'A1-03', 'A1-02'].includes(panelId)) {
      return 'bg-red-500/20 border-red-500 text-red-400 font-bold'; // Grave: Reemplazo
    }
    if (['A1-05', 'A2-04', 'A2-09'].includes(panelId)) {
      return 'bg-amber-500/20 border-amber-500 text-amber-400'; // Moderado al borde
    }
    return 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500';
  };

  return (
    <div className="flex-1 bg-[#0b111e] text-slate-100 min-h-screen p-6 space-y-6">
      {/* 1. Header & Acciones Operativas */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <span>Sistema Fotovoltaico</span>
            <span>•</span>
            <span>Edificio MAPFRE Miraflores</span>
          </div>
          <h1 className="text-2xl font-bold mt-1 text-white">Subarreglo A — Azotea Principal</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspección Termográfica Radiométrica • Norma IEC 62446-3 / NETA MTS (Umbral: ΔT &gt; 15 °C)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors">
            Cargar Vuelo Dron (.zip)
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium shadow-lg shadow-blue-600/20 transition-colors">
            Exportar Informe Decisión (PDF)
          </button>
        </div>
      </div>

      {/* 2. Tarjetas de Diagnóstico y Decisión de Compra */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#121a2d] border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Condición de Inspección</span>
          <div className="text-xl font-bold text-white mt-1">10 kW (66% Pn)</div>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            ✓ Post-lavado integral • Cielo despejado
          </p>
        </div>

        <div className="bg-[#121a2d] border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Anomalías Detectadas</span>
          <div className="text-xl font-bold text-white mt-1">14 Puntos Calientes</div>
          <p className="text-[11px] text-slate-400 mt-1">
            <span className="text-red-400 font-semibold">3 Graves</span> (ΔT &gt; 15°C) • 11 Moderados
          </p>
        </div>

        <div className="bg-[#121a2d] border border-red-900/40 p-4 rounded-xl bg-gradient-to-br from-[#121a2d] to-red-950/20">
          <span className="text-xs text-red-300 font-medium">Reemplazo Inmediato Obligatorio</span>
          <div className="text-xl font-bold text-red-400 mt-1">3 Paneles FV</div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">A2-06, A1-03, A1-02</p>
        </div>

        <div className="bg-[#121a2d] border border-blue-900/40 p-4 rounded-xl">
          <span className="text-xs text-blue-300 font-medium">Especificación de Módulo</span>
          <div className="text-xl font-bold text-white mt-1">Trina 455 Wp</div>
          <p className="text-[11px] text-slate-400 mt-1">11.06 A • 41.2 V (Tol. ±2%)</p>
        </div>
      </div>

      {/* 3. Layout del Plano Físico de Azotea (Anexo B-2) */}
      <div className="bg-[#121a2d] border border-slate-800 p-5 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-sm font-bold text-white">Disposición Física de Módulos (Plano As-Built B-2)</h2>
            <p className="text-xs text-slate-400">Haz clic en un módulo para inspeccionar su termografía y causa de falla</p>
          </div>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-500 rounded-sm"></span> Reemplazo Obligatorio</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-500 rounded-sm"></span> Observación / Pre-daño</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-700 rounded-sm"></span> Operativo</span>
          </div>
        </div>

        {/* Fila A1: Lado Parapeto */}
        <div className="space-y-3">
          <div>
            <span className="text-[11px] font-mono text-slate-400 block mb-1">LÍNEA A1 — Lado Parapeto (10 paneles)</span>
            <div className="grid grid-cols-10 gap-2">
              {filaA1.map((id) => (
                <button
                  key={id}
                  onClick={() => setSelectedPanel(id)}
                  className={`h-14 border rounded flex flex-col items-center justify-center transition-all ${getPanelStatusClass(id)} ${selectedPanel === id ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <span className="text-xs">{id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fila A2: Línea Interior */}
          <div>
            <span className="text-[11px] font-mono text-slate-400 block mb-1">LÍNEA A2 — Línea Interior (11 paneles)</span>
            <div className="grid grid-cols-11 gap-2">
              {filaA2.map((id) => (
                <button
                  key={id}
                  onClick={() => setSelectedPanel(id)}
                  className={`h-14 border rounded flex flex-col items-center justify-center transition-all ${getPanelStatusClass(id)} ${selectedPanel === id ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <span className="text-xs">{id}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Visor Dual de Radiometría & Detalle de Falla */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Imagen Visible vs Termograma */}
        <div className="lg:col-span-2 bg-[#121a2d] border border-slate-800 p-5 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Inspección Radiométrica con Dron (Toma Cenital IR-05)</h3>
            <span className="text-xs font-mono text-slate-400">Panel Seleccionado: <strong className="text-emerald-400">{selectedPanel}</strong></span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-black">
              <span className="absolute top-2 left-2 bg-black/70 backdrop-blur text-[10px] text-white px-2 py-0.5 rounded border border-white/10">
                Visible (RGB) Post-Lavado
              </span>
              <img 
                src="https://res.cloudinary.com/tu-cloud/image/upload/mapfre_rgb.jpg" 
                alt="Foto Visible Dron" 
                className="w-full h-56 object-cover" 
              />
            </div>
            <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-black">
              <span className="absolute top-2 left-2 bg-black/70 backdrop-blur text-[10px] text-white px-2 py-0.5 rounded border border-white/10">
                Termograma Calibrado (IR)
              </span>
              <img 
                src="https://res.cloudinary.com/tu-cloud/image/upload/mapfre_ir.jpg" 
                alt="Termograma Dron" 
                className="w-full h-56 object-cover" 
              />
            </div>
          </div>
        </div>

        {/* Panel de Causa y Acción Inmediata */}
        <div className="bg-[#121a2d] border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-3">Diagnóstico de Celda — {selectedPanel}</h3>
            
            <div className="space-y-3 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">Causa Raíz Identificada</span>
                <p className="text-slate-200 font-medium">
                  Excremento de ave pegado post-lavado. La mancha opaca anula la celda y fuerza a la serie a disipar corriente en forma de calor.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Temp. Punto Caliente</span>
                  <span className="text-base font-bold text-red-400">49.0 °C</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Diferencial (ΔT)</span>
                  <span className="text-base font-bold text-red-400">+18.8 °C</span>
                </div>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Acción Recomendada</span>
                <span className="text-red-400 font-bold">REEMPLAZO OBLIGATORIO</span>
                <p className="text-slate-400 text-[11px] mt-1">
                  En verano las celdas llegarán a 78 °C (umbral de daño permanente en 85 °C). Incluir en el lote de compra.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Programa Preventivo:</span>
            <span className="text-emerald-400 font-medium">Limpieza Mensual (12/año)</span>
          </div>
        </div>
      </div>
    </div>
  );
};