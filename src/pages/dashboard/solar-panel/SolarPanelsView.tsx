import {
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  Camera,
  Download,
  Loader2,
  ShieldAlert,
  Sun,
  Thermometer,
  UploadCloud
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { solarThermographyService, type Hotspot, type SolarInspectionData, type SolarListItem } from "../../../services/solarThermography.service";
import { useAuth } from "../../../shared/hooks/useAuth";

import { ImportSolarModal } from "../../../components/dashboard/modals/ImportSolarModal";

export const SolarInspectionReportView: React.FC = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const params = useParams<{ publicCode?: string; companyCode?: string; solarCode?: string }>();

  const effectivePublicCode =
    auth?.role === "ADMIN"
      ? typeof auth.companyPublicCode === "string"
        ? auth.companyPublicCode
        : auth.companyPublicCode?.publicCode
      : params.publicCode || params.companyCode;

  const activeSolarCode = params.solarCode;

  // Referencia para cálculo exacto de escala
  const thermalContainerRef = useRef<HTMLDivElement | null>(null);

  // Estados de lista y datos
  const [solarList, setSolarList] = useState<SolarListItem[]>([]);
  const [selectedSolarCode, setSelectedSolarCode] = useState<string>(activeSolarCode || "");
  const [data, setData] = useState<SolarInspectionData | null>(null);
  const [thermalMatrix, setThermalMatrix] = useState<Float32Array | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Modal
  const [showModal, setShowModal] = useState<boolean>(false);

  // Estados de inspección
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null);

  // Estado con coordenadas y porcentajes para clamping inteligente
  const [hoverData, setHoverData] = useState<{
    canvasX: number;
    canvasY: number;
    col: number;
    row: number;
    temp: number;
    percentX: number;
    percentY: number;
  } | null>(null);

  // 1. Cargar lista de subarreglos solares
  const loadSolarList = async () => {
    if (!effectivePublicCode) return;
    try {
      const list = await solarThermographyService.getCompanySolarList(effectivePublicCode);
      setSolarList(list);

      if (list.length > 0) {
        const target = activeSolarCode && list.some((s) => s.solarCode === activeSolarCode)
          ? activeSolarCode
          : list[0].solarCode;
        setSelectedSolarCode(target);
      } else {
        setSelectedSolarCode("");
        setData(null);
      }
    } catch (err) {
      console.error("Error cargando lista solar:", err);
    }
  };

  useEffect(() => {
    loadSolarList();
  }, [effectivePublicCode]);

  useEffect(() => {
    if (activeSolarCode) {
      setSelectedSolarCode(activeSolarCode);
    }
  }, [activeSolarCode]);

  // 2. Cargar detalle de la auditoría seleccionada
  useEffect(() => {
    if (!effectivePublicCode || !selectedSolarCode) {
      setData(null);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const [inspection, matrix] = await Promise.all([
          solarThermographyService.getSolarDetails(effectivePublicCode, selectedSolarCode),
          solarThermographyService.getThermalMatrix(effectivePublicCode, selectedSolarCode).catch(() => null),
        ]);

        setData(inspection);
        if (inspection?.hotspots && inspection.hotspots.length > 0) {
          setSelectedHotspot(inspection.hotspots[0]);
        }
        setThermalMatrix(matrix);
      } catch (err) {
        console.error("Error cargando detalle solar:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [effectivePublicCode, selectedSolarCode]);

  // Manejo de lectura térmica continua con cálculo porcentual idéntico a tableros
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!thermalMatrix || !data) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (clientX < 0 || clientY < 0 || clientX > rect.width || clientY > rect.height) {
      setHoverData(null);
      return;
    }

    const scaleX = data.cols / rect.width;
    const scaleY = data.rows / rect.height;
    const col = Math.floor(clientX * scaleX);
    const row = Math.floor(clientY * scaleY);

    if (row >= 0 && row < data.rows && col >= 0 && col < data.cols) {
      const temp = thermalMatrix[row * data.cols + col];
      if (!isNaN(temp)) {
        setHoverData({
          canvasX: clientX,
          canvasY: clientY,
          col,
          row,
          temp,
          percentX: (clientX / rect.width) * 100,
          percentY: (clientY / rect.height) * 100,
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  const panelsToReplace = Array.from(
    new Set(data?.hotspots.filter((h) => h.status === "CRITICAL").map((h) => h.panelId) || [])
  );

  // Renderizado de pines de celda con control perimetral inteligente
  const renderCellPins = (showTooltip: boolean = true) => {
    if (!data) return null;

    return data.hotspots.map((spot) => {
      const isSelected = selectedHotspot?.id === spot.id;
      const isHovered = hoveredHotspot?.id === spot.id;
      const isCritical = spot.status === "CRITICAL";

      // Posición dinámica antidesborde del tooltip del pin
      const pinNearTop = spot.y < 25;
      const pinNearLeft = spot.x < 25;
      const pinNearRight = spot.x > 75;

      const pinTranslateX = pinNearLeft ? "0%" : pinNearRight ? "-100%" : "-50%";
      const pinTranslateY = pinNearTop ? "18px" : "-100%";

      return (
        <div
          key={spot.id}
          style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedHotspot(spot);
          }}
          onMouseEnter={(e) => {
            e.stopPropagation();
            setHoveredHotspot(spot);
          }}
          onMouseLeave={() => {
            setHoveredHotspot(null);
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center">
            {isCritical && (
              <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-rose-500 opacity-60" />
            )}

            <div
              className={`size-5 rounded-full border-2 flex items-center justify-center text-[9px] font-black transition-transform ${isSelected ? "scale-125 ring-2 ring-white shadow-lg" : isHovered ? "scale-115" : ""
                } ${isCritical ? "bg-rose-600 border-white text-white" : "bg-amber-400 border-white text-amber-950"}`}
            >
              !
            </div>

            {/* Tooltip de la Celda: Z-index superior (z-40) y solo se muestra si NO choca con otros */}
            {showTooltip && (
              <div
                className="hidden group-hover:block pointer-events-none absolute z-40 transition-all duration-75"
                style={{
                  left: "50%",
                  top: pinNearTop ? "100%" : "0%",
                  transform: `translate(${pinTranslateX}, ${pinTranslateY})`,
                  marginBottom: pinNearTop ? "0px" : "10px",
                  marginTop: pinNearTop ? "10px" : "0px",
                }}
              >
                <div className="rounded-xl border border-slate-700/90 bg-slate-950/95 p-3 text-white shadow-2xl backdrop-blur-md whitespace-nowrap min-w-48 space-y-1">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5">
                    <span className="font-bold font-mono text-amber-300 text-xs">Panel {spot.panelId}</span>
                    <span className="text-slate-400 font-sans text-[10px]">({spot.cellLocation})</span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs text-slate-300 pt-0.5">
                    <span>T. Medida:</span>
                    <span className="font-bold text-amber-400 font-mono text-sm">{spot.tSpot.toFixed(1)} °C</span>
                  </div>
                  <div className="flex items-baseline justify-between text-[11px] text-slate-400 font-mono">
                    <span>Diferencial (ΔT):</span>
                    <span className="text-rose-400 font-bold">+{spot.deltaT.toFixed(1)} °C</span>
                  </div>
                  <p className="text-[10px] font-bold text-rose-400 pt-1 border-t border-slate-800/80">
                    {isCritical ? "Acción: Reemplazo obligatorio de panel" : "Acción: Monitoreo post-lavado"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <section className="space-y-6 font-sans pb-16 overflow-x-hidden">
      {/* Cabecera Principal */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-3 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
          >
            <ArrowLeft size={15} /> Volver
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight break-words">
              Inspección Termográfica de Paneles Solares
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Diagnóstico de puntos calientes celda por celda y plan de reemplazo según norma IEC 62446-3.
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex justify-center items-center gap-2 rounded-2xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <UploadCloud size={16} /> Importar Inspección Solar
          </button>

          <button
            type="button"
            disabled={!data}
            onClick={() => window.print()}
            className="inline-flex justify-center items-center gap-2 rounded-2xl bg-[#0797d5] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0684ba] shadow-sm transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download size={16} /> Exportar Informe PDF
          </button>
        </div>
      </div>

      {/* Selector de Subarreglo Solar Activo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <Sun size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subarreglo Activo</p>
            <p className="text-sm sm:text-base font-black text-slate-950 truncate">
              {selectedSolarCode ? `${selectedSolarCode} - ${data?.title || "Auditoría Fotovoltaica"}` : "Sin auditorías solares"}
            </p>
          </div>
        </div>

        {solarList.length > 0 && (
          <select
            value={selectedSolarCode}
            onChange={(e) => {
              const code = e.target.value;
              setSelectedSolarCode(code);
              navigate(`/dashboard/companies/${effectivePublicCode}/solar/${code}`);
            }}
            className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer truncate"
          >
            {solarList.map((s) => (
              <option key={s.solarCode} value={s.solarCode}>
                {s.solarCode} - {s.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Estado de carga o sin datos */}
      {loading ? (
        <div className="py-20 text-center text-xs font-bold text-slate-400">
          <Loader2 className="animate-spin inline-block mr-2" size={18} /> Cargando datos radiométricos y análisis de celdas...
        </div>
      ) : !data ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-8 sm:p-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 mb-3">
            <Sun size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Sin inspecciones solares registradas para esta empresa
          </h3>
          <p className="mt-1 max-w-md text-xs text-slate-500">
            Utiliza el botón <strong>"Importar Inspección Solar"</strong> para procesar el CSV del dron y las capturas radiométricas.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tarjetas de Decisión */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-700">
                    Cambio Obligatorio de Panel
                  </span>
                  <AlertOctagon size={18} className="text-rose-600" />
                </div>
                <p className="text-3xl font-black text-rose-950 mt-2">{panelsToReplace.length} Módulos</p>
                <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                  Celdas con gradiente ΔT ≥ 15 °C. No tienen reparación posible; requieren reemplazo integral del panel.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-rose-200/80 flex items-center justify-between text-xs font-bold text-rose-900">
                <span>Paneles: {panelsToReplace.join(", ") || "Ninguno"}</span>
                <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded uppercase">Urgente</span>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-800">
                    Celdas en Observación
                  </span>
                  <AlertTriangle size={18} className="text-amber-600" />
                </div>
                <p className="text-3xl font-black text-amber-950 mt-2">{data.stats.warningHotspotsCount} Celdas</p>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Calentamiento moderado (10 °C ≤ ΔT &lt; 15 °C). Requiere lavado especializado y vuelo térmico de control.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-200/80 text-xs font-bold text-amber-900">
                <span>Protocolo: Lavado + Termografía</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Termometría Global
                  </span>
                  <ShieldAlert size={18} className="text-blue-600" />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Punto Máx</span>
                    <span className="text-lg font-black text-rose-600">{data.stats.max} °C</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Promedio</span>
                    <span className="text-lg font-black text-slate-700">{data.stats.avg} °C</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Diferencial térmico máximo: <strong>+{data.stats.deltaTMax} °C</strong>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Cursor en vivo:</span>
                <strong className="text-indigo-600 font-mono text-sm">{hoverData ? `${hoverData.temp.toFixed(1)} °C` : "--"}</strong>
              </div>
            </div>
          </div>

          {/* Visor Dual Lado a Lado (Térmica Izquierda | Óptica Derecha) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Lado Izquierdo: Térmica */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer size={16} className="text-rose-500" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Térmica Radiométrica
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{data.cols}x{data.rows} px</span>
              </div>

              <div
                ref={thermalContainerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative w-full aspect-16/11 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 select-none cursor-crosshair"
              >
                <img
                  src={data.thermalImageUrl || ""}
                  alt="Termografía Infrarroja"
                  className="w-full h-full object-cover pointer-events-none"
                />

                {/* Pines de celdas */}
                {renderCellPins(true)}

                {/* Sonda flotante del Cursor: Se oculta automáticamente si el mouse está sobre un Pin */}
                {hoverData && !hoveredHotspot && (() => {
                  const isNearTop = hoverData.percentY < 18;
                  const isNearLeft = hoverData.percentX < 20;
                  const isNearRight = hoverData.percentX > 80;

                  const translateX = isNearLeft ? "0%" : isNearRight ? "-100%" : "-50%";
                  const translateY = isNearTop ? "0%" : "-100%";

                  return (
                    <>
                      {/* Etiqueta de temperatura */}
                      <div
                        className="pointer-events-none absolute z-20 transition-transform duration-75"
                        style={{
                          left: `${hoverData.canvasX}px`,
                          top: isNearTop ? `${hoverData.canvasY + 16}px` : `${hoverData.canvasY - 14}px`,
                          transform: `translate(${translateX}, ${translateY})`,
                        }}
                      >
                        <div className="rounded-xl border border-slate-700/80 bg-slate-950/95 px-2.5 py-1 text-center shadow-2xl backdrop-blur-md whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1 text-xs font-black text-amber-400">
                            <Thermometer size={12} />
                            {hoverData.temp.toFixed(1)} °C
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono">
                            [{hoverData.col}, {hoverData.row}]
                          </div>
                        </div>
                      </div>

                      {/* Mira Láser Cruzada centrada en el píxel */}
                      <div
                        className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 border border-white rounded-full z-10"
                        style={{ left: `${hoverData.canvasX}px`, top: `${hoverData.canvasY}px` }}
                      >
                        <div className="absolute top-1/2 left-0 w-full h-px bg-white/70 -translate-y-1/2" />
                        <div className="absolute left-1/2 top-0 h-full w-px bg-white/70 -translate-x-1/2" />
                      </div>
                    </>
                  );
                })()}
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Pasa el cursor sobre la imagen para leer la temperatura exacta de cada celda.
              </p>
            </div>

            {/* LADO DERECHO: Luz Visible RGB */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera size={16} className="text-blue-500" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Óptica Normal
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Canal RGB de Referencia</span>
              </div>

              <div
                className="relative w-full aspect-16/11 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 select-none flex items-center justify-center"
              >
                <img
                  src={data.visualImageUrl || ""}
                  alt="Fotografía Visual"
                  className="w-full h-full object-cover select-none pointer-events-none"
                />

                {/* En lugar de pines desalineados, mostramos una insignia activa si hay una celda seleccionada */}
                {selectedHotspot && (
                  <div className="absolute top-3 right-3 bg-slate-900/90 text-white border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-xl backdrop-blur-md text-[11px] font-mono flex items-center gap-2">
                    <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>Panel seleccionado: <strong>{selectedHotspot.panelId}</strong></span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-500 italic">
                Vista óptica general para verificar manchas de suciedad o excremento en el módulo seleccionado.
              </p>
            </div>
          </div>

          {/* Ficha Técnica de la Celda Seleccionada */}
          {selectedHotspot && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-slate-900 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg text-sm">
                    Panel {selectedHotspot.panelId}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    Ubicación: {selectedHotspot.cellLocation}
                  </span>
                </div>

                <span
                  className={`self-start sm:self-center text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${selectedHotspot.status === "CRITICAL"
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                >
                  {selectedHotspot.status === "CRITICAL"
                    ? "🔴 Sustitución de Módulo Obligatoria"
                    : "🟡 Observación Pre-Reemplazo"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100">
                  <span className="text-[10px] font-bold text-rose-700 uppercase block">T. de Celda</span>
                  <span className="text-2xl font-black font-mono text-rose-950 mt-1 block">
                    {selectedHotspot.tSpot} °C
                  </span>
                  <span className="text-[10px] text-rose-800 mt-0.5 block">
                    ΔT: +{selectedHotspot.deltaT} °C
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Causa Visual (RGB)</span>
                  <span className="text-xs font-medium text-slate-700 mt-1 block leading-relaxed">
                    {selectedHotspot.visualCause}
                  </span>
                </div>

                <div className="md:col-span-2 bg-slate-900 text-white p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      Dictamen Técnico
                    </span>
                    <p className="text-sm font-black text-white mt-1">
                      {selectedHotspot.action}
                    </p>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {selectedHotspot.status === "CRITICAL"
                        ? "La celda supera el umbral crítico de disipación de calor. Al no ser reparable en campo, se debe reemplazar el módulo completo."
                        : "Someter a lavado químico especializado y reevaluar gradiente térmico en la siguiente auditoría."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de Hotspots */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Listado de Puntos Térmicos Detectados ({data.hotspots.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="pb-3 px-3">Cód.</th>
                    <th className="pb-3 px-3">Panel</th>
                    <th className="pb-3 px-3">Celda</th>
                    <th className="pb-3 px-3">T. Celda</th>
                    <th className="pb-3 px-3">ΔT</th>
                    <th className="pb-3 px-3">Severidad</th>
                    <th className="pb-3 px-3">Causa Detectada</th>
                    <th className="pb-3 px-3 text-right">Acción Técnica</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {data.hotspots.map((spot) => (
                    <tr
                      key={spot.id}
                      onClick={() => setSelectedHotspot(spot)}
                      className={`hover:bg-slate-50 transition cursor-pointer ${selectedHotspot?.id === spot.id ? "bg-slate-50/90 font-bold" : ""
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
      )}

      {/* Modal de importación */}
      <ImportSolarModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        defaultCompanyCode={effectivePublicCode}
        onSuccess={(newSolarCode) => {
          loadSolarList();
          if (newSolarCode) {
            setSelectedSolarCode(newSolarCode);
            navigate(`/dashboard/companies/${effectivePublicCode}/solar/${newSolarCode}`);
          }
        }}
      />
    </section>
  );
};