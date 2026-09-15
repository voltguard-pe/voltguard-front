import React, { useEffect, useRef, useState } from "react";
import {
  Flame,
  Thermometer,
  UploadCloud,
  Crosshair,
  Camera,
  Layers
} from "lucide-react";
import { getThermographyInfo, fetchThermalMatrix } from "../../../services/thermography.service";

interface ThermographyViewerProps {
  boardId?: string;
  originalImageUrl?: string;
  title?: string;
  onOpenImportModal: () => void;
  reloadKey?: number;
}

export const ThermographyViewer: React.FC<ThermographyViewerProps> = ({
  boardId,
  title = "Inspección Termográfica Radiométrica (NFPA 70B)",
  onOpenImportModal,
  reloadKey = 0,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [matrix, setMatrix] = useState<Float32Array | null>(null);
  const [dimensions, setDimensions] = useState<{ rows: number; cols: number }>({ rows: 640, cols: 480 });
  const [stats, setStats] = useState<{ min: number; max: number; avg: number; maxPos: [number, number]; minPos: [number, number] } | null>(null);

  const [thermalImage, setThermalImage] = useState<string | null>(null);
  const [visualImage, setVisualImage] = useState<string | null>(null);

  const [hoverData, setHoverData] = useState<{
    x: number;
    y: number;
    canvasX: number;
    canvasY: number;
    temp: number;
    percentX: number;
    percentY: number;
  } | null>(null);

  useEffect(() => {
    if (!boardId) return;

    const loadData = async () => {
      try {
        const res = await getThermographyInfo(boardId);
        if (res?.data) {
          setStats(res.data.stats);
          setDimensions({ rows: res.data.rows || 640, cols: res.data.cols || 480 });
          setThermalImage(res.data.thermalImageUrl || null);
          setVisualImage(res.data.originalImageUrl || null);

          const { matrix: loadedMatrix } = await fetchThermalMatrix(boardId);
          setMatrix(loadedMatrix);
        }
      } catch (err) {
        console.error("Error al cargar termografía:", err);
      }
    };

    loadData();
  }, [boardId, reloadKey]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!matrix || !containerRef.current || !stats) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (clientX < 0 || clientY < 0 || clientX > rect.width || clientY > rect.height) {
      setHoverData(null);
      return;
    }

    const scaleX = dimensions.cols / rect.width;
    const scaleY = dimensions.rows / rect.height;
    const col = Math.floor(clientX * scaleX);
    const row = Math.floor(clientY * scaleY);

    if (row >= 0 && row < dimensions.rows && col >= 0 && col < dimensions.cols) {
      const temp = matrix[row * dimensions.cols + col];
      setHoverData({
        x: col,
        y: row,
        canvasX: clientX,
        canvasY: clientY,
        temp,
        percentX: (clientX / rect.width) * 100,
        percentY: (clientY / rect.height) * 100,
      });
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm transition-all font-sans mt-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600">
            <Flame size={22} />
          </div>
          <div>
            <h2 className="font-bold text-slate-950 text-base">{title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Matriz Radiométrica de {dimensions.cols}×{dimensions.rows} píxeles | Sincronización Térmica y Visual
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenImportModal}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 px-4 py-2.5 text-xs font-black text-white cursor-pointer shadow-md active:scale-95 transition-all"
        >
          <UploadCloud size={16} />
          {matrix ? "Actualizar Termografía" : "Importar Termografía"}
        </button>
      </div>

      {!matrix ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
          <Flame size={36} className="text-slate-300 animate-pulse" />
          <p className="mt-3 text-xs font-bold text-slate-600">No hay datos térmicos cargados en este tablero</p>
          <p className="mt-1 text-[11px] text-slate-400">
            Importa la foto térmica, la foto normal y el archivo CSV para habilitar la inspección
          </p>
          <button
            type="button"
            onClick={onOpenImportModal}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-sm"
          >
            <UploadCloud size={14} /> Cargar Archivos
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Métricas de Temperatura */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-red-700">Punto Caliente (Hotspot)</p>
                <p className="mt-1 text-2xl font-black text-red-950">
                  {stats.max.toFixed(2)} <span className="text-xs font-bold text-red-600">°C</span>
                </p>
                <p className="text-[10px] text-red-600/80 font-semibold">Crítico en conexiones</p>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-blue-700">Punto Frío</p>
                <p className="mt-1 text-2xl font-black text-blue-950">
                  {stats.min.toFixed(2)} <span className="text-xs font-bold text-blue-600">°C</span>
                </p>
                <p className="text-[10px] text-blue-600/80 font-semibold">Temperatura base</p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Diferencial Térmico (ΔT)</p>
                <p className="mt-1 text-2xl font-black text-amber-950">
                  {(stats.max - stats.min).toFixed(2)} <span className="text-xs font-bold text-amber-600">°C</span>
                </p>
                <p className="text-[10px] text-amber-600/80 font-semibold">Promedio: {stats.avg.toFixed(2)} °C</p>
              </div>
            </div>
          )}

          {/* Vistas Lado a Lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-950 p-4 sm:p-7 rounded-3xl shadow-2xl">
            {/* LADO IZQUIERDO: IMAGEN TÉRMICA FLIR */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
                <span className="flex items-center gap-1.5">
                  <Layers size={14} className="text-orange-400" />
                  Termografía Interactiva
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {dimensions.cols}×{dimensions.rows} px
                </span>
              </div>

              <div className="flex items-center justify-center gap-3">
                <div
                  ref={containerRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setHoverData(null)}
                  className="relative w-full cursor-crosshair overflow-hidden rounded-2xl border border-slate-800 shadow-xl bg-black"
                  style={{
                    aspectRatio: `${dimensions.cols} / ${dimensions.rows}`,
                  }}
                >
                  {/* Foto Térmica FLIR nítida oficial */}
                  {thermalImage ? (
                    <img
                      src={thermalImage}
                      alt="Termografía FLIR"
                      className="w-full h-full object-fill pointer-events-none"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-600 text-xs">
                      Sin imagen térmica
                    </div>
                  )}

                  {/* Marcador Hotspot Máximo */}
                  {stats && (
                    <div
                      className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${(stats.maxPos[1] / dimensions.cols) * 100}%`,
                        top: `${(stats.maxPos[0] / dimensions.rows) * 100}%`,
                      }}
                    >
                      <div className="size-6 border-2 border-red-500 rounded-full animate-ping absolute" />
                      <div className="size-6 border border-white rounded-full flex items-center justify-center bg-red-600/40">
                        <div className="size-1.5 bg-white rounded-full" />
                      </div>
                      <span className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                        MAX {stats.max.toFixed(1)} °C
                      </span>
                    </div>
                  )}

                  {/* Tooltip con temperatura en hover */}
                  {/* Tooltip Térmico Inteligente (Anti-recorte en bordes) */}
                  {hoverData && (() => {
                    const isNearTop = hoverData.percentY < 15;
                    const isNearLeft = hoverData.percentX < 18;
                    const isNearRight = hoverData.percentX > 82;

                    // Ajuste horizontal para no salirse de los lados
                    const translateX = isNearLeft ? "0%" : isNearRight ? "-100%" : "-50%";
                    // Invertir a posición inferior si está en la parte superior
                    const translateY = isNearTop ? "0%" : "-100%";

                    return (
                      <>
                        <div
                          className="pointer-events-none absolute z-30 transition-transform duration-75"
                          style={{
                            left: `${hoverData.canvasX}px`,
                            top: isNearTop ? `${hoverData.canvasY + 18}px` : `${hoverData.canvasY - 14}px`,
                            transform: `translate(${translateX}, ${translateY})`,
                          }}
                        >
                          <div className="rounded-xl border border-slate-700/80 bg-slate-950/95 px-2.5 py-1 text-center shadow-2xl backdrop-blur-md whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1 text-xs font-black text-amber-400">
                              <Thermometer size={12} />
                              {hoverData.temp.toFixed(2)} °C
                            </div>
                            <div className="text-[9px] text-slate-400 font-mono">
                              [{hoverData.x}, {hoverData.y}]
                            </div>
                          </div>
                        </div>

                        {/* Mira Láser Cruzada */}
                        <div
                          className="pointer-events-none absolute size-6 -translate-x-1/2 -translate-y-1/2 border border-white rounded-full"
                          style={{ left: `${hoverData.canvasX}px`, top: `${hoverData.canvasY}px` }}
                        >
                          <div className="absolute top-1/2 left-0 w-full h-px bg-white/70 -translate-y-1/2" />
                          <div className="absolute left-1/2 top-0 h-full w-px bg-white/70 -translate-x-1/2" />
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Barra Térmica Lateral Oficial Ironbow */}
                {stats && (
                  <div className="flex flex-col items-center gap-2 text-white text-[11px] font-bold shrink-0">
                    <span className="text-red-400 font-mono text-[10px]">{stats.max.toFixed(1)}°</span>
                    <div
                      className="w-3.5 h-64 sm:h-80 rounded-lg border border-slate-700 shadow-inner"
                      style={{
                        background:
                          "linear-gradient(to top, #000004 0%, #1f0064 10%, #5a008c 25%, #96008c 40%, #d22832 55%, #f57800 70%, #ffd200 85%, #fffab4 95%, #ffffff 100%)",
                      }}
                    />
                    <span className="text-blue-400 font-mono text-[10px]">{stats.min.toFixed(1)}°</span>
                  </div>
                )}
              </div>
            </div>

            {/* LADO DERECHO: FOTO NORMAL DEL TABLERO */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
                <span className="flex items-center gap-1.5">
                  <Camera size={14} className="text-sky-400" />
                  Foto Normal del Tablero
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Cámara Visual FLIR</span>
              </div>

              <div
                className="relative w-full overflow-hidden rounded-2xl border border-slate-800 shadow-xl bg-slate-900"
                style={{
                  aspectRatio: `${dimensions.cols} / ${dimensions.rows}`,
                }}
              >
                {visualImage ? (
                  <img
                    src={visualImage}
                    alt="Foto Visual Tablero"
                    className="w-full h-full object-fill select-none pointer-events-none"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-slate-500 gap-2 p-4 text-center">
                    <Camera size={28} className="opacity-40" />
                    <p className="text-xs">No hay foto normal disponible</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <Crosshair size={14} className="text-orange-500" />
              Pasa el cursor por la termografía para ubicar el elemento físico exacto en la fotografía del tablero.
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

export default ThermographyViewer;