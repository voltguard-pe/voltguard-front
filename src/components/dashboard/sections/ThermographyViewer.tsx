import React, { useEffect, useRef, useState } from "react";
import { 
  Flame, 
  Thermometer, 
  UploadCloud, 
  Crosshair, 
  Sliders 
} from "lucide-react";
import { getThermographyInfo, fetchThermalMatrix } from "../../../services/thermography.service";

interface ThermographyViewerProps {
  boardId?: string;
  originalImageUrl?: string;
  title?: string;
  onOpenImportModal: () => void; // 👈 Abre el modal desacoplado
  reloadKey?: number; // Permite forzar recarga tras guardar con éxito en el modal
}

// ── PALETA DE COLORES "IRONBOW" OFICIAL DE FLIR ──
const FLIR_IRONBOW: [number, number, number, number][] = [
  [0.00, 0, 0, 4],
  [0.10, 31, 0, 100],
  [0.25, 90, 0, 140],
  [0.40, 150, 0, 140],
  [0.55, 210, 40, 50],
  [0.70, 245, 120, 0],
  [0.85, 255, 210, 0],
  [0.95, 255, 250, 160],
  [1.00, 255, 255, 255],
];

function getFlirColor(t: number): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, t));
  for (let i = 0; i < FLIR_IRONBOW.length - 1; i++) {
    const [t0, r0, g0, b0] = FLIR_IRONBOW[i];
    const [t1, r1, g1, b1] = FLIR_IRONBOW[i + 1];
    if (clamped >= t0 && clamped <= t1) {
      const factor = (clamped - t0) / (t1 - t0);
      return [
        Math.round(r0 + (r1 - r0) * factor),
        Math.round(g0 + (g1 - g0) * factor),
        Math.round(b0 + (b1 - b0) * factor),
      ];
    }
  }
  return [255, 255, 255];
}

export const ThermographyViewer: React.FC<ThermographyViewerProps> = ({
  boardId,
  originalImageUrl,
  title = "Inspección Termográfica Radiométrica (NFPA 70B)",
  onOpenImportModal,
  reloadKey = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [matrix, setMatrix] = useState<Float32Array | null>(null);
  const [dimensions, setDimensions] = useState<{ rows: number; cols: number }>({ rows: 0, cols: 0 });
  const [stats, setStats] = useState<{ min: number; max: number; avg: number; maxPos: [number, number]; minPos: [number, number] } | null>(null);
  const [, setLoading] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(originalImageUrl || null);
  const [viewMode, setViewMode] = useState<"blended" | "thermal" | "visual">("blended");
  const [edgeIntensity, setEdgeIntensity] = useState<number>(65);

  const [hoverData, setHoverData] = useState<{
    x: number;
    y: number;
    canvasX: number;
    canvasY: number;
    temp: number;
  } | null>(null);

  // Consulta de la BD
  useEffect(() => {
    if (!boardId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const res = await getThermographyInfo(boardId);
        if (res?.data) {
          setStats(res.data.stats);
          setDimensions({ rows: res.data.rows, cols: res.data.cols });
          if (res.data.originalImageUrl) {
            setBgImage(res.data.originalImageUrl);
          }
          const { matrix: loadedMatrix } = await fetchThermalMatrix(boardId);
          setMatrix(loadedMatrix);
        }
      } catch (err) {
        console.error("Error al cargar termografía:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [boardId, reloadKey]);

  // Dibujar Canvas
  useEffect(() => {
    if (!matrix || !canvasRef.current || !stats) return;
    const { rows, cols } = dimensions;
    if (!rows || !cols || isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = cols;
    canvas.height = rows;

    const imgData = ctx.createImageData(cols, rows);
    const data = imgData.data;
    const { min, max } = stats;
    const range = max - min || 1;

    for (let i = 0; i < matrix.length; i++) {
      const temp = matrix[i];
      const norm = Math.pow(Math.max(0, Math.min(1, (temp - min) / range)), 0.85);
      const [r, g, b] = getFlirColor(norm);

      const p = i * 4;
      data[p] = r;
      data[p + 1] = g;
      data[p + 2] = b;
      data[p + 3] = 255;
    }

    ctx.putImageData(imgData, 0, 0);
  }, [matrix, dimensions, stats]);

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
              Fusión Térmica MSX® y Matriz Radiométrica de {dimensions.cols || 480}×{dimensions.rows || 640} píxeles
            </p>
          </div>
        </div>

        {/* Botón que abre el modal independiente */}
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
            Importa el archivo CSV con la matriz radiométrica para habilitar la inspección
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
          {/* Controles de visualización */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-100/80 p-2.5 border border-slate-200/50">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-slate-400 mr-2">MODO:</span>
              <button
                type="button"
                onClick={() => setViewMode("blended")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  viewMode === "blended"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                Fusión MSX®
              </button>
              <button
                type="button"
                onClick={() => setViewMode("thermal")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  viewMode === "thermal"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                Térmico Puro
              </button>
              {bgImage && (
                <button
                  type="button"
                  onClick={() => setViewMode("visual")}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    viewMode === "visual"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  Foto Original
                </button>
              )}
            </div>

            {viewMode === "blended" && bgImage && (
              <div className="flex items-center gap-2">
                <Sliders size={13} className="text-slate-500" />
                <span className="text-[11px] font-bold text-slate-600">Nitidez Bordes:</span>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={edgeIntensity}
                  onChange={(e) => setEdgeIntensity(Number(e.target.value))}
                  className="w-24 accent-orange-600 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Estadísticas de Temperatura */}
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

          {/* Canvas Interactivo */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 bg-slate-950 p-4 sm:p-8 rounded-3xl shadow-2xl">
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoverData(null)}
              className="relative cursor-crosshair overflow-hidden rounded-2xl border border-slate-800 shadow-2xl bg-black"
              style={{
                width: "420px",
                maxWidth: "100%",
                aspectRatio: `${dimensions.cols || 480} / ${dimensions.rows || 640}`,
              }}
            >
              <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full object-fill ${
                  viewMode === "visual" ? "opacity-0" : "opacity-100"
                }`}
              />

              {bgImage && viewMode === "blended" && (
                <img
                  src={bgImage}
                  alt="Relieve MSX"
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none"
                  style={{
                    mixBlendMode: "luminosity",
                    opacity: edgeIntensity / 100,
                    filter: "contrast(180%) brightness(95%)",
                  }}
                />
              )}

              {bgImage && viewMode === "visual" && (
                <img
                  src={bgImage}
                  alt="Visual FLIR"
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none"
                />
              )}

              {stats && (
                <div
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 text-red-500 font-bold"
                  style={{
                    left: `${(stats.maxPos[1] / dimensions.cols) * 100}%`,
                    top: `${(stats.maxPos[0] / dimensions.rows) * 100}%`,
                  }}
                >
                  <div className="size-6 border-2 border-red-500 rounded-full animate-ping absolute" />
                  <div className="size-6 border border-white rounded-full flex items-center justify-center bg-red-600/30">
                    <div className="size-1.5 bg-white rounded-full" />
                  </div>
                  <span className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                    MAX {stats.max.toFixed(1)} °C
                  </span>
                </div>
              )}

              {hoverData && (
                <div
                  className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full pb-3"
                  style={{ left: `${hoverData.canvasX}px`, top: `${hoverData.canvasY}px` }}
                >
                  <div className="flex flex-col items-center">
                    <div className="rounded-xl border border-slate-700 bg-slate-900/95 px-3 py-1.5 shadow-2xl backdrop-blur-md text-center text-white">
                      <div className="flex items-center justify-center gap-1 text-[12px] font-black text-amber-400">
                        <Thermometer size={14} />
                        {hoverData.temp.toFixed(2)} °C
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium">
                        Coord: [{hoverData.x}, {hoverData.y}]
                      </div>
                    </div>
                    <div className="size-2 rotate-45 bg-slate-900 border-r border-b border-slate-700 -mt-1" />
                  </div>
                </div>
              )}

              {hoverData && (
                <div
                  className="pointer-events-none absolute size-6 -translate-x-1/2 -translate-y-1/2 border border-white rounded-full"
                  style={{ left: `${hoverData.canvasX}px`, top: `${hoverData.canvasY}px` }}
                >
                  <div className="absolute top-1/2 left-0 w-full h-px bg-white/70 -translate-y-1/2" />
                  <div className="absolute left-1/2 top-0 h-full w-px bg-white/70 -translate-x-1/2" />
                </div>
              )}
            </div>

            {stats && (
              <div className="flex flex-row lg:flex-col items-center gap-3 text-white text-xs font-bold shrink-0">
                <span className="text-red-400 font-mono text-xs">{stats.max.toFixed(1)} °C</span>
                <div
                  className="w-44 lg:w-5 h-5 lg:h-80 rounded-xl border border-slate-700 shadow-md"
                  style={{
                    background:
                      "linear-gradient(to top, #000004 0%, #1f0064 10%, #5a008c 25%, #96008c 40%, #d22832 55%, #f57800 70%, #ffd200 85%, #fffab4 95%, #ffffff 100%)",
                  }}
                />
                <span className="text-blue-400 font-mono text-xs">{stats.min.toFixed(1)} °C</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <Crosshair size={14} className="text-orange-500" />
              Pasa el cursor por cualquier punto del circuito para medir la temperatura puntual.
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

export default ThermographyViewer;