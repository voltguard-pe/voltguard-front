import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Building2,
  ChartNoAxesCombined,
  CheckCircle2,
  Clock,
  Container,
  FileDown,
  FileImage,
  Hand,
  ImageIcon,
  Info,
  MapPin,
  RefreshCw,
  Shield,
  // ShieldCheck,
  UploadCloud,
  X,
  Zap
} from "lucide-react";
import {
  Bar,
  BarChart,
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
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { getBoardByCode } from "../../../services/board.service";
import { getDemandChartData, uploadMetrelCsv } from "../../../services/measurement.service";
import { generateNfpaPDF } from "../../../shared/utils/generateNfpaPDF";
import type { BoardResponseDTO } from "../../../shared/types/BoardProps";
import QRCode from "react-qr-code";

// ── OBJETOS HARDCODEADOS PARA LA PRESENTACIÓN ──
const documentosHardcodeados = [
  {
    _id: "spat-001",
    title: "Certificado de Medición y Mantenimiento SPAT (Pozo a Tierra)",
    type: "POZO_A_TIERRA",
    url: "/pdfs/GESENER Certificado SPAT V2.0.pdf", // Ruta local pública
  },
  // {
  //   _id: "mant-001",
  //   title: "Certificado de Mantenimiento de Tableros Eléctricos",
  //   type: "MANTENIMIENTO",
  //   url: "/pdfs/certificado_mantenimiento.pdf",
  // },
  {
    _id: "oper-001",
    title: "Certificado de Operatividad de Tableros Eléctricos",
    type: "OPERATIVIDAD",
    url: "/pdfs/CERTIFICADO DE OPERATIVIDAD DE TABLEROS ELECTRICOS - RECOLETA.pdf",
  },
];

// ── CONSTANTES DE PALETAS DE COLORES ──
const MAIN_COLORS = [
  '#2f5597', '#4caf50', '#9c27b0', '#00bcd4', '#ff9800',
  '#e91e63', '#795548', '#607d8b', '#03a9f4', '#eab308', '#ec4899'
];

// Colores según especificación: Rojo para kvar c (capacitiva) y Azul para kvar i (inductiva)
const REACTIVE_COLOR_CAPACITIVE = "#dc2626"; // Rojo (kvar c)
const REACTIVE_COLOR_INDUCTIVE = "#1d4ed8";  // Azul (kvar i)

// ── FUNCIONES AUXILIARES DE FORMATEO ──
const value = (data: unknown) =>
  data === null || data === undefined || data === "" ? "-" : String(data);

const bool = (data?: boolean) => (data ? "Sí" : "No");

const formatMeasurementWithUnit = (
  data: number | null | undefined,
  unit = "MΩ"
) => {
  if (data === null || data === undefined) return "-";
  return `${data} ${unit}`;
};

const BoardDetailPage = () => {
  const navigate = useNavigate();
  const { publicCode, code } = useParams();

  // ── ESTADOS PRINCIPALES DEL TABLERO ──
  const [board, setBoard] = useState<BoardResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // ── ESTADOS DEL GRÁFICO INTERACTIVO (RECHARTS) ──
  const [rawChartData, setRawChartData] = useState<any[]>([]);
  const [seriesKeys, setSeriesKeys] = useState<string[]>([]);
  const [selectedReactiveDay, setSelectedReactiveDay] = useState<string | null>(null); // ← AÑADIR ESTA LÍNEA
  const [visibleSeries, setVisibleSeries] = useState<{ [key: string]: boolean }>({
    "Promedio_General": true,
    "kvar_inductivo": true,
    "kvar_capacitivo": true
  });
  const [importing, setImporting] = useState(false);

  // ── ESTADOS DE FILTROS TEMPORALES Y LÍMITES ──
  const [limitesPatron, setLimitesPatron] = useState({ min: "2026-06-20", max: "2026-06-30" });
  const [startDate, setStartDate] = useState<string>("2026-06-22");
  const [endDate, setEndDate] = useState<string>("2026-06-28");

  // ── ESTADOS INTERACTIVOS (ZOOM / PAN / DRAG) ──
  const [zoomRange, setZoomRange] = useState<{ startIdx: number; endIdx: number }>({ startIdx: 0, endIdx: 287 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<number>(0);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  // ── ESTADOS DE TARIFAS Y ANÁLISIS ENERGÉTICO ──
  const [tarifaContratada, setTarifaContratada] = useState<number>(350);
  const [costokW_HP, setCostokW_HP] = useState<number>(48.50);
  const [costokW_HFP] = useState<number>(22.10);
  const [horaPicoMaximo, setHoraPicoMaximo] = useState<string | null>(null);
  const [analisisPotencia, setAnalisisPotencia] = useState<{
    maxHP: { valor: number; hora: string; fecha: string } | null;
    maxHFP: { valor: number; hora: string; fecha: string } | null;
    ahorroEstimado: number;
  } | null>(null);

  console.log(setTarifaContratada)
  console.log(setCostokW_HP)

  const [energiaPorDiaData, setEnergiaPorDiaData] = useState<any[]>([]);

  // ── PROCESAMIENTO Y SOLICITUD DE DATOS ──
  const fetchChartData = async (boardId: string, start?: string, end?: string) => {
    try {
      const res: any = await getDemandChartData(boardId, start, end);
      const { agrupado, minFecha, maxFecha } = res;

      if (minFecha && maxFecha) {
        setLimitesPatron({ min: minFecha, max: maxFecha });
        if (!start) {
          setStartDate(minFecha);
          setEndDate(maxFecha);
        }
      }

      if (!agrupado || Object.keys(agrupado).length === 0) {
        setRawChartData([]);
        setSeriesKeys([]);
        return;
      }

      const rawKeys = Object.keys(agrupado);
      const labelsX = Array.from({ length: 288 }, (_, i) => {
        const h = String(Math.floor((i * 5) / 60)).padStart(2, '0');
        const m = String((i * 5) % 60).padStart(2, '0');
        return `${h}:${m}`;
      });

      const energiaAcumuladaAux: { [key: string]: number } = {};

      const formattedData = labelsX.map((hora) => {
        const row: any = { horaMinuto: hora };
        let sumaP = 0;
        let sumaInd = 0;
        let sumaCap = 0;
        let count = 0;

        // ── DENTRO DE fetchChartData EN TU REACT COMPONENT ──
        rawKeys.forEach((diaKey) => {
          const partes = diaKey.split(' ');
          const fechaYMD = partes[0];
          const diaNombre = partes[1] ? partes[1].replace(/[\(\)]/g, '').substring(0, 3) : '';
          const [_, mes, dia] = fechaYMD.split('-');
          const labelCorto = `${dia}/${mes} (${diaNombre})`;

          const punto = agrupado[diaKey]?.[hora];

          // Extraer p, ind y cap directamente de la respuesta del backend
          const valP = typeof punto === 'number' ? punto : (punto?.p ?? 0);
          const valInd = typeof punto === 'object' ? (punto?.ind ?? 0) : 0;
          const valCap = typeof punto === 'object' ? (punto?.cap ?? 0) : 0;

          row[labelCorto] = valP;
          row[`inductiva_${labelCorto}`] = valInd;
          row[`capacitiva_${labelCorto}`] = valCap;

          sumaP += valP;
          sumaInd += valInd;
          sumaCap += valCap;
          count++;

          if (!energiaAcumuladaAux[labelCorto]) energiaAcumuladaAux[labelCorto] = 0;
          energiaAcumuladaAux[labelCorto] += valP;
        });

        row["Promedio_General"] = count > 0 ? Math.round((sumaP / count) * 100) / 100 : null;
        row["kvar_inductivo"] = count > 0 ? Math.round((sumaInd / count) * 100) / 100 : null;
        row["kvar_capacitivo"] = count > 0 ? Math.round((sumaCap / count) * 100) / 100 : null;
        return row;
      });

      const sortedCleanKeys = rawKeys.sort().map(key => {
        const partes = key.split(' ');
        const fechaYMD = partes[0];
        const diaNombre = partes[1] ? partes[1].replace(/[\(\)]/g, '').substring(0, 3) : '';
        const [_, mes, dia] = fechaYMD.split('-');
        return `${dia}/${mes} (${diaNombre})`;
      });

      const barrasProcesadas = sortedCleanKeys.map(key => {
        const totalPuntos = formattedData.filter(d => d[key] !== undefined && d[key] !== null).length;
        const totalPromedioKw = totalPuntos > 0 ? (energiaAcumuladaAux[key] || 0) / totalPuntos : 0;
        const totalKWh = totalPromedioKw * 24;

        return {
          name: key,
          kWh: Math.round(totalKWh * 10) / 10
        };
      });

      setEnergiaPorDiaData(barrasProcesadas);
      setRawChartData(formattedData);
      setSeriesKeys(sortedCleanKeys);
      // ← AÑADIR ESTA LÍNEA: Asigna el primer día disponible al cargar los datos
      setSelectedReactiveDay(prev => (prev && sortedCleanKeys.includes(prev) ? prev : sortedCleanKeys[0] || null));

      // Inicializar todos los días visibles por defecto
      setVisibleSeries(prev => {
        const visibility: any = {
          "Promedio_General": prev["Promedio_General"] ?? true,
          "kvar_inductivo": prev["kvar_inductivo"] ?? true,
          "kvar_capacitivo": prev["kvar_capacitivo"] ?? true
        };
        sortedCleanKeys.forEach((k) => {
          visibility[k] = prev[k] !== undefined ? prev[k] : true;
        });
        return visibility;
      });

    } catch (err) {
      console.error("Error cargando curvas de demanda en Recharts:", err);
    }
  };

  // ── EFECTO PARA PASIVE LISTENERS EN SCROLL WHEEL DEL GRÁFICO ──
  useEffect(() => {
    const contenedor = chartContainerRef.current;
    if (!contenedor) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 4 : -4;

      setZoomRange((prev) => {
        let newStart = prev.startIdx + zoomFactor;
        let newEnd = prev.endIdx - zoomFactor;

        if (newEnd - newStart < 12) return prev;
        if (newStart < 0) newStart = 0;
        if (newEnd > 287) newEnd = 287;

        return { startIdx: newStart, endIdx: newEnd };
      });
    };

    contenedor.addEventListener("wheel", handleNativeWheel, { passive: false });
    return () => {
      contenedor.removeEventListener("wheel", handleNativeWheel);
    };
  }, [rawChartData]);

  // ── EFECTO CARGA INICIAL DEL TABLERO ──
  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const data = await getBoardByCode(publicCode!, code!);
        setBoard(data);
        if (data?._id) {
          await fetchChartData(data._id);
        }
      } catch {
        setError("Error cargando tablero");
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [code, publicCode]);

  // ── EFECTO RECALCULO DE METRICAS ENERGETICAS ──
  useEffect(() => {
    if (rawChartData.length > 0) {
      calcularMetricasLuzDelSur(rawChartData);
    }
  }, [rawChartData, tarifaContratada, costokW_HP, costokW_HFP]);

  // ── ACCIONES Y INTERACCIONES DEL MOUSE / ZOOM ──
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !board?._id) return;

    if (!file.name.includes('.Mediciones.csv')) {
      alert("Por favor, sube exclusivamente el archivo original de Metrel que termina en '.Mediciones.csv'");
      return;
    }

    setImporting(true);
    try {
      await uploadMetrelCsv(board._id, file);
      alert("¡Archivo cargado y procesado por completo en VoltGuard!");
      await fetchChartData(board._id, startDate, endDate);
    } catch (err: any) {
      alert("Error procesando archivo: " + (err.response?.data?.error || err.message));
    } finally {
      setImporting(false);
    }
  };

  const handleMouseDown = (e: any) => {
    if (e && e.chartX) {
      setIsDragging(true);
      setDragStart(e.chartX);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDragging || !e || !e.chartX) return;
    const distance = e.chartX - dragStart;
    if (Math.abs(distance) < 10) return;

    const shift = distance > 0 ? -2 : 2;

    setZoomRange((prev) => {
      let newStart = prev.startIdx + shift;
      let newEnd = prev.endIdx + shift;
      if (newStart < 0 || newEnd > 287) return prev;
      setDragStart(e.chartX);
      return { startIdx: newStart, endIdx: newEnd };
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetZoom = () => {
    setZoomRange({ startIdx: 0, endIdx: 287 });
  };

  const toggleSerieVisibility = (key: string) => {
    setVisibleSeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApplyDateFilter = () => {
    if (board?._id) {
      handleResetZoom();
      fetchChartData(board._id, startDate, endDate);
    }
  };

  const dataFiltradaZoom = rawChartData.slice(zoomRange.startIdx, zoomRange.endIdx + 1);

  // ── LÓGICA TARIFARIA LUZ DEL SUR ──
  const calcularMetricasLuzDelSur = (data: any[]) => {
    if (!data || data.length === 0) return;

    let maxHP = { valor: 0, hora: "", fecha: "" };
    let maxHFP = { valor: 0, hora: "", fecha: "" };
    let valorPicoAbsoluto = 0;
    let horaPicoAbsoluto = "";

    data.forEach((row) => {
      const horaStr = row.horaMinuto;
      const [horas, minutos] = horaStr.split(":").map(Number);
      const totalMinutos = horas * 60 + minutos;

      const esHoraPunta = totalMinutos >= 18 * 60 && totalMinutos < 23 * 60;

      Object.keys(row).forEach((key) => {
        if (key === "horaMinuto" || key === "Promedio_General") return;

        const valor = row[key];
        if (valor !== null && valor !== undefined) {
          if (valor > valorPicoAbsoluto) {
            valorPicoAbsoluto = valor;
            horaPicoAbsoluto = horaStr;
          }

          if (esHoraPunta) {
            if (valor > maxHP.valor) {
              maxHP = { valor, hora: horaStr, fecha: key };
            }
          } else {
            if (valor > maxHFP.valor) {
              maxHFP = { valor, hora: horaStr, fecha: key };
            }
          }
        }
      });
    });

    if (horaPicoAbsoluto) {
      setHoraPicoMaximo(horaPicoAbsoluto);
    }

    const picoMaximoAbsoluto = Math.max(maxHP.valor, maxHFP.valor);
    let sobrecostoPenalidad = 0;
    if (picoMaximoAbsoluto > tarifaContratada) {
      sobrecostoPenalidad = (picoMaximoAbsoluto - tarifaContratada) * costokW_HFP * 1.5;
    }

    const ahorroPotenciaHP = maxHP.valor * 0.15 * costokW_HP;

    setAnalisisPotencia({
      maxHP,
      maxHFP,
      ahorroEstimado: Math.round((ahorroPotenciaHP + sobrecostoPenalidad) * 100) / 100
    });
  };

  // ── TOOLTIP PERSONALIZADO PARA ENERGÍA REACTIVA ──
  const ReactiveTooltip = ({ active, label, payload }: any) => {
    if (active && payload && payload.length) {
      const rowData = payload[0]?.payload || {};
      const activeDay = selectedReactiveDay || seriesKeys[0] || "";

      const valCap = rowData[`capacitiva_${activeDay}`];
      const valInd = rowData[`inductiva_${activeDay}`];

      const mostrarCapacitiva = visibleSeries["kvar_capacitivo"] !== false;
      const mostrarInductiva = visibleSeries["kvar_inductivo"] !== false;

      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xl font-sans text-xs min-w-[220px]">
          <div className="mb-2 border-b border-slate-100 pb-2 flex justify-between items-center">
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Potencia Reactiva</span>
            <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">{label} hrs</span>
          </div>

          <p className="text-[11px] font-bold text-slate-700 mb-2 border-b border-slate-100 pb-1">
            Día: <span className="text-slate-900">{activeDay}</span>
          </p>

          <div className="space-y-2 font-semibold text-[11px]">
            {/* {mostrarCapacitiva && (
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-red-600 font-bold">
                  <span className="size-2 rounded-full bg-red-500 inline-block"></span>
                  kvar c (Capacitiva):
                </span>
                <span className="text-slate-900 font-black tabular-nums">
                  {valCap !== undefined && valCap !== null ? `${Number(valCap).toFixed(2)} kvar` : '-'}
                </span>
              </div>
            )}

            {mostrarInductiva && (
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-blue-600 font-bold">
                  <span className="size-2 rounded-full bg-blue-600 inline-block"></span>
                  kvar i (Inductiva):
                </span>
                <span className="text-slate-900 font-black tabular-nums">
                  {valInd !== undefined && valInd !== null ? `${Number(valInd).toFixed(2)} kvar` : '-'}
                </span>
              </div>
            )} */}

            {mostrarCapacitiva && valCap > 0 && (
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-red-600 font-bold">
                  <span className="size-2 rounded-full bg-red-500 inline-block"></span>
                  kvar c (Capacitiva):
                </span>
                <span className="text-slate-900 font-black tabular-nums">
                  {`${Number(valCap).toFixed(2)} kvar`}
                </span>
              </div>
            )}

            {mostrarInductiva && valInd > 0 && (
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-blue-600 font-bold">
                  <span className="size-2 rounded-full bg-blue-600 inline-block"></span>
                  kvar i (Inductiva):
                </span>
                <span className="text-slate-900 font-black tabular-nums">
                  {`${Number(valInd).toFixed(2)} kvar`}
                </span>
              </div>
            )}
          </div>

          <div className="mt-2.5 border-t border-slate-100 pt-1.5 text-[9px] text-slate-400 font-medium flex justify-between">
            <span>Valores en <strong>kvar</strong></span>
            <span className="font-bold text-[#0797d5]">Voltguard</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // ── COMPONENTE INTERNO: TOOLTIP PERSONALIZADO ──
  const CustomTooltip = ({ active, label, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xl max-w-[280px] sm:max-w-xs font-sans text-xs">
          <div className="mb-2 border-b border-slate-100 pb-1.5 flex justify-between items-center gap-2">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] sm:text-[10px]">Intervalo Diario</span>
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
                    {item.value !== null && item.value !== undefined ? `${item.value.toFixed(2)} kW` : '-'}
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

  // ── SECCIÓN MODULAR 1: CUADRO DE DEMANDA ──
  const renderDemandSection = () => {
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
          <div className="w-full sm:w-auto">
            <label
              htmlFor="csv-metrel"
              className="flex sm:inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl sm:rounded-2xl px-5 py-3 text-xs font-black text-white transition-all duration-300 cursor-pointer shadow-md bg-emerald-600 hover:bg-emerald-700 active:scale-95"
            >
              <UploadCloud size={16} />
              {importing ? "Importando..." : "Importar .Mediciones.csv"}
            </label>
            <input id="csv-metrel" type="file" accept=".csv" onChange={handleFileChange} className="hidden" disabled={importing} />
          </div>
        </div>

        {rawChartData.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end rounded-2xl bg-slate-50 p-3 sm:p-4 border border-slate-100">
            <div className="flex flex-col gap-1 col-span-1">
              <label className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-wider">Inicio</label>
              <input
                type="date"
                value={startDate}
                min={limitesPatron.min}
                max={limitesPatron.max}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 sm:py-2 text-xs font-bold text-slate-700 focus:outline-none shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-1 col-span-1">
              <label className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-wider">Cierre</label>
              <input
                type="date"
                value={endDate}
                min={limitesPatron.min}
                max={limitesPatron.max}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 sm:py-2 text-xs font-bold text-slate-700 focus:outline-none shadow-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyDateFilter}
              className="col-span-2 sm:col-span-1 rounded-xl bg-slate-800 px-4 py-2 text-xs font-black text-white hover:bg-slate-900 transition-colors shadow-sm cursor-pointer h-[34px]"
            >
              Filtrar Periodo
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="col-span-2 sm:col-span-1 sm:ml-auto flex items-center justify-center gap-x-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer h-[34px]"
            >
              <RefreshCw size={14} /> Restablecer Vista
            </button>
          </div>
        )}

        {rawChartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
            <BarChart3 size={32} className="text-slate-300 animate-pulse" />
            <p className="mt-3 text-xs font-bold text-slate-500">Sin historial de curvas de demanda para este rango</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex gap-1.5 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap rounded-2xl bg-slate-100 p-2 border border-slate-200/40 scrollbar-none">
              <button
                type="button"
                onClick={() => toggleSerieVisibility("Promedio_General")}
                className={`flex shrink-0 items-center gap-x-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${visibleSeries["Promedio_General"] ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white border-slate-200 text-slate-600'
                  }`}
              >
                <ChartNoAxesCombined size={14} /> Promedio General
              </button>
              {seriesKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleSerieVisibility(key)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer shrink-0 ${visibleSeries[key] ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-600'
                    }`}
                >
                  {key}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2 px-1 sm:hidden">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Panel Gráfico</span>
              <span className="flex items-center gap-1 text-[9px] font-black text-slate-500 animate-pulse bg-slate-100 px-2 py-1 rounded-lg border border-slate-200/60">
                Desliza para explorar horas →
              </span>
            </div>

            <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-0 sm:border-none scrollbar-thin">
              <div ref={chartContainerRef} className="h-72 sm:h-80 md:h-[420px] w-[850px] sm:w-full text-xs font-medium text-slate-500 select-none cursor-ew-resize">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dataFiltradaZoom}
                    margin={{ top: 25, right: 15, left: 10, bottom: 25 }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <ReferenceArea x1="00:00" x2="18:00" fill="#f8fafc" fillOpacity={0.55}>
                      <Label value="HORA FUERA DE PUNTA (HFP)" position="top" offset={10} fill="#0284c7" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '0.05em' }} />
                    </ReferenceArea>
                    <ReferenceArea x1="18:00" x2="23:00" fill="#fff1f2" fillOpacity={0.65}>
                      <Label value="HORA PUNTA (HP)" position="top" offset={10} fill="#f43f5e" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '0.05em' }} />
                    </ReferenceArea>
                    <ReferenceArea x1="23:00" x2="23:55" fill="#f8fafc" fillOpacity={0.55} />

                    {horaPicoMaximo && (
                      <ReferenceLine x={horaPicoMaximo} stroke="#be123c" strokeWidth={2} strokeDasharray="4 4">
                        <Label value="PICO MÁXIMO DEL PERIODO" position="top" offset={10} fill="#be123c" style={{ fontSize: '8px', fontWeight: '900' }} />
                      </ReferenceLine>
                    )}

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

                    <YAxis domain={[0, 'auto']} tickLine={false} stroke="#94a3b8" width={50} tick={{ fontSize: '10px' }}>
                      <Label value="Demanda de Potencia Activa (kW)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#475569', fontWeight: '800', fontSize: '9px', letterSpacing: '0.05em' }} />
                    </YAxis>

                    <Tooltip content={<CustomTooltip />} shared={true} />

                    {visibleSeries["Promedio_General"] && (
                      <Line type="monotone" name="Promedio General" dataKey="Promedio_General" stroke="#ff5722" strokeWidth={2.5} dot={false} connectNulls animationDuration={150} />
                    )}

                    {seriesKeys.map((key, idx) =>
                      visibleSeries[key] ? (
                        <Line key={key} type="monotone" name={key} dataKey={key} stroke={MAIN_COLORS[idx % MAIN_COLORS.length]} strokeWidth={1.5} dot={false} connectNulls animationDuration={150} />
                      ) : null
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {analisisPotencia && (
              // <div className="mt-8 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2 md:grid-cols-3">
              <div className="mt-8 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-rose-700">
                    <Clock size={16} className="animate-pulse" />
                    <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-wider">Pico Máximo en Hora Punta (HP)</h3>
                  </div>
                  <p className="mt-2 text-2xl sm:text-3xl font-black text-rose-950">{analisisPotencia.maxHP?.valor.toFixed(1)} <span className="text-xs sm:text-sm font-bold text-rose-500">kW</span></p>
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
                  <p className="mt-2 text-2xl sm:text-3xl font-black text-blue-950">{analisisPotencia.maxHFP?.valor.toFixed(1)} <span className="text-xs sm:text-sm font-bold text-blue-500">kW</span></p>
                  <div className="mt-1 text-[11px] sm:text-xs text-slate-500">
                    Registrado el <strong className="text-slate-700">{analisisPotencia.maxHFP?.fecha}</strong> a las <strong className="text-slate-700">{analisisPotencia.maxHFP?.hora} hrs</strong>.
                  </div>
                  <span className="mt-2.5 inline-block rounded-lg bg-blue-100 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-blue-700">Horario Base: 23:00 a 18:00 hrs</span>
                </div>

                {/* <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 sm:p-5 flex flex-col justify-between col-span-1 sm:col-span-2 md:col-span-1 font-sans">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <TrendingDown size={16} />
                      <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-wider">Simulador de Ahorro Estimado</h3>
                    </div>
                    <p className="mt-2 text-2xl sm:text-3xl font-black text-emerald-950">S/. {analisisPotencia.ahorroEstimado.toLocaleString("es-PE")}<span className="text-xs sm:text-sm font-bold text-emerald-600">/ mes</span></p>
                    <p className="mt-1 text-[10px] sm:text-[11px] text-slate-500 leading-relaxed">Estimación de reducción reduciendo picos en un 15% comparado con tu límite contratado de ({tarifaContratada} kW).</p>
                  </div>
                  <div className="mt-4 flex gap-x-2 border-t border-emerald-100/60 pt-3">
                    <div className="flex-1">
                      <label className="text-[9px] font-bold text-slate-400 block mb-1">Contratada (kW)</label>
                      <input type="number" value={tarifaContratada} onChange={(e) => setTarifaContratada(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[9px] font-bold text-slate-400 block mb-1">Costo kW HP (S/.)</label>
                      <input type="number" value={costokW_HP} onChange={(e) => setCostokW_HP(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none" />
                    </div>
                  </div>
                </div> */}
              </div>
            )}
          </div>
        )}
      </section>
    );
  };

  // ── SECCIÓN MODULAR 2: POTENCIA REACTIVA POR DÍA SELECCIONADO ──
  const renderReactivePowerSection = () => {
    if (rawChartData.length === 0) return null;

    const activeDay = selectedReactiveDay || seriesKeys[0] || "";

    return (
      <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm font-sans mt-6">
        {/* Encabezado */}
        <div className="mb-5 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
              <Activity size={22} />
            </div>
            <div>
              <h2 className="font-bold text-slate-950 text-base">Análisis de Potencia Reactiva (Capacitiva e Inductiva)</h2>
              <p className="text-xs text-slate-500 mt-0.5">Visualización detallada por día de las curvas de potencia reactiva (kvar)</p>
            </div>
          </div>
        </div>

        {/* Controles: Selector de Día y Toggles de Visibilidad (Conservados) */}
        <div className="space-y-3 mb-5">
          {/* Barra de Selección de Día */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 p-2 rounded-2xl bg-slate-100/80 border border-slate-200/40 scrollbar-thin">
            <span className="text-[10px] font-black uppercase text-slate-400 self-center mr-2 shrink-0">SELECCIONAR DÍA:</span>
            {seriesKeys.map((key) => {
              const isSelected = activeDay === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedReactiveDay(key)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all border cursor-pointer shrink-0 ${isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md scale-105'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {key}
                </button>
              );
            })}
          </div>

          {/* Botones de Alternado de Visibilidad (kvar c / kvar i) */}
          <div className="flex gap-2 overflow-x-auto pb-1 p-1.5 bg-slate-50 rounded-xl border border-slate-100">
            <button
              type="button"
              onClick={() => toggleSerieVisibility("kvar_capacitivo")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${visibleSeries["kvar_capacitivo"] !== false ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-200'
                }`}
            >
              <span className={`size-2.5 rounded-full inline-block ${visibleSeries["kvar_capacitivo"] !== false ? 'bg-white' : 'bg-red-600'}`}></span>
              kvar c (Capacitiva)
            </button>
            <button
              type="button"
              onClick={() => toggleSerieVisibility("kvar_inductivo")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${visibleSeries["kvar_inductivo"] !== false ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-slate-600 border-slate-200'
                }`}
            >
              <span className={`size-2.5 rounded-full inline-block ${visibleSeries["kvar_inductivo"] !== false ? 'bg-white' : 'bg-blue-700'}`}></span>
              kvar i (Inductiva)
            </button>
          </div>
        </div>

        {/* Gráfico Recharts dibujando los datos reales del día seleccionado */}
        <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-0">
          <div className="h-72 sm:h-80 md:h-[380px] w-[850px] sm:w-full text-xs select-none">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataFiltradaZoom} margin={{ top: 15, right: 15, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="horaMinuto"
                  tickLine={false}
                  interval={11}
                  stroke="#94a3b8"
                  dy={5}
                  tick={{ fontSize: '9px', fontWeight: '600', fill: '#64748b' }}
                >
                  <Label
                    value="Hora del Día"
                    position="insideBottom"
                    offset={-15}
                    style={{ textAnchor: 'middle', fill: '#475569', fontWeight: '800', fontSize: '9px', letterSpacing: '0.05em' }}
                  />
                </XAxis>
                <YAxis tickLine={false} stroke="#94a3b8" width={45} domain={[0, 'auto']}>
                  <Label value="N [kvar]" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#475569', fontWeight: '800', fontSize: '9px' }} />
                </YAxis>
                <Tooltip content={<ReactiveTooltip />} shared={true} />

                {/* Línea Capacitiva Real (Rojo) */}
                {visibleSeries["kvar_capacitivo"] !== false && activeDay && (
                  <Line
                    type="linear"
                    name={`Ntotcap+ - ${activeDay}`}
                    dataKey={`capacitiva_${activeDay}`}
                    stroke={REACTIVE_COLOR_CAPACITIVE}
                    strokeWidth={1.5}
                    dot={false}
                    connectNulls={true}
                    isAnimationActive={false}
                  />
                )}

                {/* Línea Inductiva Real (Azul) */}
                {visibleSeries["kvar_inductivo"] !== false && activeDay && (
                  <Line
                    type="linear"
                    name={`Ntotind+ - ${activeDay}`}
                    dataKey={`inductiva_${activeDay}`}
                    stroke={REACTIVE_COLOR_INDUCTIVE}
                    strokeWidth={1.5}
                    dot={false}
                    connectNulls={true}
                    isAnimationActive={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    );
  };

  // ── SECCIÓN MODULAR 3: ENERGÍA CONSUMIDA POR DÍA ──
  const renderEnergyBarSection = () => {
    const barrasVisibles = energiaPorDiaData.filter(d => visibleSeries[d.name] !== false);

    if (barrasVisibles.length === 0) return null;

    return (
      <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all duration-300 hover:border-slate-300 font-sans mt-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            {/* Ícono actualizado a AZUL */}
            <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-500/10 text-blue-600">
              <Container size={20} className="sm:size-[22px]" />
            </div>
            <div>
              <h2 className="font-bold text-slate-950 text-sm sm:text-base tracking-tight">Energía Consumida por Día</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Energía total acumulada diariamente expresada en KiloVatios-Hora (kWh)</p>
            </div>
          </div>
        </div>

        {/* Botones interactivos - Actualizados a AZUL */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 p-2 rounded-2xl bg-slate-100 border border-slate-200/40 scrollbar-none">
          <span className="text-[10px] font-black uppercase text-slate-400 self-center mr-1">Días:</span>
          {seriesKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleSerieVisibility(key)}
              // Clases actualizadas: bg-blue-700, border-blue-700
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer shrink-0 ${visibleSeries[key] !== false
                ? 'bg-blue-700 border-blue-700 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-400'
                }`}
            >
              {key}
            </button>
          ))}
        </div>

        <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-0 sm:border-none scrollbar-thin">
          <div className="h-72 sm:h-80 md:h-[400px] w-[600px] sm:w-full text-xs font-medium text-slate-500 select-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barrasVisibles} margin={{ top: 25, right: 15, left: 10, bottom: 30 }} style={{ outline: 'none', border: 'none' }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  stroke="#94a3b8"
                  dy={8}
                  tick={{ fontSize: '10px', fontWeight: '700', fill: '#475569' }}
                >
                  <Label value="Días del Periodo" position="insideBottom" offset={-20} style={{ textAnchor: 'middle', fill: '#475569', fontWeight: '800', fontSize: '9px', letterSpacing: '0.05em' }} />
                </XAxis>
                <YAxis tickLine={false} stroke="#94a3b8" width={55} tick={{ fontSize: '10px' }}>
                  <Label value="Energía Activa (kWh)" angle={-90} position="insideLeft" offset={-5} style={{ textAnchor: 'middle', fill: '#475569', fontWeight: '800', fontSize: '9px', letterSpacing: '0.05em' }} />
                </YAxis>
                <Tooltip cursor={{ fill: '#f1f5f9', opacity: 0.6 }} formatter={(value: any) => [`${Number(value).toFixed(1)} kWh`, 'Consumo Total']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                {/* Relleno de Barra actualizado a AZUL (Blue 600) */}
                <Bar dataKey="kWh" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    );
  };

  // ── SECCIÓN MODULAR 4: HUELLA DE CARBONO Y EMISIONES DE CO₂ (PERÚ) ──
  const renderCarbonEmissionsSection = () => {
    const FACTOR_EMISION_PERU = 0.00021;

    const emisionesData = energiaPorDiaData
      .filter(d => visibleSeries[d.name] !== false)
      .map(item => {
        const tCO2_dia = (item.kWh || 0) * FACTOR_EMISION_PERU;
        return {
          name: item.name,
          tCO2: Number(tCO2_dia.toFixed(4)),
          kgCO2: Number((tCO2_dia * 1000).toFixed(2))
        };
      });

    if (emisionesData.length === 0) return null;

    const totalTCO2Semana = emisionesData.reduce((acc, curr) => acc + curr.tCO2, 0);
    const promedioTCO2Diario = emisionesData.length > 0 ? totalTCO2Semana / emisionesData.length : 0;
    const proyeccionTCO2Mes = promedioTCO2Diario * 30;
    const proyeccionTCO2Ano = promedioTCO2Diario * 365;

    return (
      <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all duration-300 hover:border-slate-300 font-sans mt-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            {/* Ícono actualizado a GRIS (Slate 500) */}
            <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-slate-500/10 text-slate-600">
              <Zap size={20} className="sm:size-[22px]" />
            </div>
            <div>
              <h2 className="font-bold text-slate-950 text-sm sm:text-base tracking-tight">Emisiones de CO₂ por Día (Huella de Carbono)</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Dióxido de Carbono equivalente emitido por el consumo eléctrico (tCO₂eq - SEIN Perú)</p>
            </div>
          </div>
        </div>

        {/* Tarjetas de Resumen - Actualizadas todas a variantes de GRIS (Slate) */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Tarjeta 1 */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">Emisión Diaria Promedio</p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {promedioTCO2Diario < 0.01
                ? (promedioTCO2Diario * 1000).toFixed(2)
                : promedioTCO2Diario.toFixed(3)}
              <span className="text-xs font-bold text-slate-600 ml-1">
                {promedioTCO2Diario < 0.01 ? "kg CO₂/día" : "tCO₂/día"}
              </span>
            </p>
            <p className="mt-1 text-[10px] text-slate-500">Equivalencia del periodo filtrado</p>
          </div>

          {/* Tarjeta 2 */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">Proyección Mensual (30 días)</p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {proyeccionTCO2Mes.toFixed(3)} <span className="text-xs font-bold text-slate-600">tCO₂/mes</span>
            </p>
            <p className="mt-1 text-[10px] text-slate-500">Estimación a 30 días de operación</p>
          </div>

          {/* Tarjeta 3 */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">Proyección Anual (365 días)</p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {proyeccionTCO2Ano.toFixed(2)} <span className="text-xs font-bold text-slate-600">tCO₂/año</span>
            </p>
            <p className="mt-1 text-[10px] text-slate-500">Estimación a 365 días de operación</p>
          </div>
        </div>

        {/* Seleccionador de Días - Actualizado a GRIS OSCURO (Slate 700/800) */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 p-2 rounded-2xl bg-slate-100 border border-slate-200/40 scrollbar-none">
          <span className="text-[10px] font-black uppercase text-slate-400 self-center mr-1">Días:</span>
          {seriesKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleSerieVisibility(key)}
              // Clases actualizadas: bg-slate-700, border-slate-700
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer shrink-0 ${visibleSeries[key] !== false
                ? 'bg-slate-700 border-slate-700 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-400'
                }`}
            >
              {key}
            </button>
          ))}
        </div>

        <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-0 sm:border-none scrollbar-thin">
          <div className="h-72 sm:h-80 md:h-[380px] w-[600px] sm:w-full text-xs font-medium text-slate-500 select-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emisionesData} margin={{ top: 25, right: 15, left: 10, bottom: 30 }} style={{ outline: 'none', border: 'none' }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tickLine={false} stroke="#94a3b8" dy={8} tick={{ fontSize: '10px', fontWeight: '700', fill: '#475569' }}>
                  <Label value="Días del Periodo" position="insideBottom" offset={-20} style={{ textAnchor: 'middle', fill: '#475569', fontWeight: '800', fontSize: '9px', letterSpacing: '0.05em' }} />
                </XAxis>
                <YAxis tickLine={false} stroke="#94a3b8" width={65} tick={{ fontSize: '10px' }} tickFormatter={(val) => val.toFixed(3)}>
                  <Label value="Emisiones (tCO₂)" angle={-90} position="insideLeft" offset={-5} style={{ textAnchor: 'middle', fill: '#475569', fontWeight: '800', fontSize: '9px', letterSpacing: '0.05em' }} />
                </YAxis>
                <Tooltip cursor={{ fill: '#f1f5f9', opacity: 0.6 }} formatter={(val: any) => [`${Number(val).toFixed(4)} tCO₂ (${(Number(val) * 1000).toFixed(1)} kg CO₂)`, 'Huella de Carbono']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                {/* Relleno de Barra actualizado a GRIS (Slate 500) */}
                <Bar dataKey="tCO2" fill="#64748b" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    );
  };

  // ── MANEJO Y RENDERIZADO DE DOCUMENTOS Y PDF ──
  // const certificadosSpat = board?.assignedDocuments?.filter(doc => doc.type as string === "POZO_A_TIERRA") || [];
  // const certificadosMantenimiento = board?.assignedDocuments?.filter(doc => doc.type === "MANTENIMIENTO") || [];
  // const certificadosOperatividad = board?.assignedDocuments?.filter(doc => doc.type === "OPERATIVIDAD") || [];

  const certificadosSpat = documentosHardcodeados.filter(
    (doc) => doc.type === "POZO_A_TIERRA"
  );

  const certificadosMantenimiento = documentosHardcodeados.filter(
    (doc) => doc.type === "MANTENIMIENTO"
  );

  const certificadosOperatividad = documentosHardcodeados.filter(
    (doc) => doc.type === "OPERATIVIDAD"
  );

  // const openPdfInNewTab = async (url: string, title: string) => {
  //   try {
  //     const response = await fetch(url);
  //     const blob = await response.blob();
  //     const pdfBlob = new Blob([blob], { type: "application/pdf" });
  //     const blobUrl = URL.createObjectURL(pdfBlob);
  //     const newTab = window.open(blobUrl, "_blank");
  //     if (newTab) newTab.document.title = title;
  //   } catch (error) {
  //     console.error("Error al abrir el PDF:", error);
  //     window.open(url, "_blank");
  //   }
  // };

  const openPdfInNewTab = (url: string) => {
    if (!url) return;
    // Abrimos directamente la URL de Cloudinary en una pestaña nueva.
    // El navegador ejecutará su visor nativo de PDF sin problemas de CORS ni Blobs vacíos.
    window.open(url, "_blank", "noopener,noreferrer");
  };

  //   const openPdfInNewTab = async (url: string) => {
  //   try {
  //     const response = await fetch(url);
  //     const blob = await response.blob();
  //     // 💡 Forzamos explícitamente que el Blob sea interpretado como application/pdf
  //     const pdfBlob = new Blob([blob], { type: "application/pdf" });
  //     const blobUrl = URL.createObjectURL(pdfBlob);

  //     window.open(blobUrl, "_blank");
  //   } catch (error) {
  //     console.error("Error al abrir PDF:", error);
  //     window.open(url, "_blank");
  //   }
  // };

  const renderField = (label: string, data: unknown, index: number) => (
    <div style={{ animation: "fadeUp 0.4s ease both", animationDelay: `${index * 30}ms` }} className="rounded-2xl bg-slate-50 p-4 transition-all hover:bg-slate-100/80">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-slate-800">{value(data)}</p>
    </div>
  );

  const renderImageSection = (title: string, description: string, images: string[] = []) => (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-300">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#8ccf2f]/12 text-[#3aaa35]"><ImageIcon size={22} /></div>
        <div>
          <h2 className="font-bold text-slate-950 text-base tracking-tight">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <FileImage size={32} className="text-slate-300" />
          <p className="mt-2 text-xs font-bold text-slate-500">Sin imágenes registradas</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((img, index) => (
            <button key={`${img}-${index}`} type="button" onClick={() => setSelectedImage(img)} className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-left cursor-pointer transition-all hover:border-slate-300 hover:shadow-sm">
              <div className="overflow-hidden h-44 w-full">
                <img src={img} alt={`${title} ${index + 1}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-3"><p className="truncate text-xs font-bold text-slate-600">Imagen {index + 1}</p></div>
            </button>
          ))}
        </div>
      )}
    </section>
  );

  const renderPdfSection = (title: string, description: string, documentsList: any[]) => {
    if (!documentsList || documentsList.length === 0) {
      return null;
    }

    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-300">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]"><FileImage size={22} /></div>
          <div>
            <h2 className="font-bold text-slate-950 text-base tracking-tight">{title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>
        </div>
        {documentsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <FileImage size={32} className="text-slate-300" />
            <p className="mt-2 text-xs font-bold text-slate-500">Sin documentos registrados</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {documentsList.map((doc) => (
              // <button key={doc._id} onClick={() => openPdfInNewTab(doc.cloudinaryUrl, doc.title)} className="inline-flex items-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-xs font-bold text-white transition-all duration-300 hover:bg-[#087fb3] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0797d5]/20 cursor-pointer">
              // <button key={doc._id} onClick={() => openPdfInNewTab(doc.cloudinaryUrl)} className="inline-flex items-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-xs font-bold text-white transition-all duration-300 hover:bg-[#087fb3] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0797d5]/20 cursor-pointer">
              <button key={doc._id} onClick={() => openPdfInNewTab(doc.url)} className="inline-flex items-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-xs font-bold text-white transition-all duration-300 hover:bg-[#087fb3] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0797d5]/20 cursor-pointer">
                <FileImage size={15} />
                {doc.title}
              </button>
            ))}
          </div>
        )}
      </section>
    );
  }

  // ── SECCIÓN MODULAR 4: NFPA RIESGOS ELÉCTRICOS ──
  const renderNfpaSection = () => {
    if (!board?.nfpa) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-8 text-center text-xs font-semibold text-slate-400">
          Este tablero no cuenta con parámetros de seguridad NFPA 70E registrados.
        </div>
      );
    }

    const { nfpa } = board;
    const currentCompanyName = typeof board.company === "object" ? board.company?.name : "Sin empresa";

    // Construcción de la URL pública directa para el QR
    const qrUrl = `${window.location.origin}/dashboard/boards/${publicCode}/${board.code}`;

    // Helper para separar valor numérico y unidad si vienen juntos en un string (ej: "3.13 cal/cm²" => { val: "3.13", unit: "cal/cm²" })
    const parseValUnit = (strValue: string | number | null | undefined, defaultUnit: string = "") => {
      if (!strValue && strValue !== 0) return { val: "-", unit: defaultUnit };
      const str = String(strValue).trim();
      const match = str.match(/^([\d.,]+)\s*(.*)$/);
      if (match) {
        return { val: match[1], unit: match[2] || defaultUnit };
      }
      return { val: str, unit: defaultUnit };
    };

    return (
      <>
        <div className="mb-4 flex justify-end no-print">
          <button
            type="button"
            onClick={() => generateNfpaPDF(board, currentCompanyName)}
            className="relative z-10 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-black text-slate-900 border border-slate-200 shadow-md transition-all duration-200 hover:bg-amber-400 hover:border-amber-400 hover:text-slate-950 active:scale-95 cursor-pointer"
          >
            <FileDown size={15} /> Exportar Etiqueta
          </button>
        </div>

        {/* ETIQUETA ANSI Z535 / NFPA 70E */}
        <div className="overflow-hidden rounded-[26px] bg-white shadow-2xl ring-1 ring-slate-300">
          {/* ENCABEZADO ANSI Z535 · PELIGRO */}
          <header className="flex h-[142px] items-center justify-center gap-6 bg-gradient-to-b from-[#D81332] to-[#A50E24]">
            <AlertTriangle className="h-[90px] w-[90px] text-white fill-white stroke-[#C8102E] stroke-[1.5]" />
            <h1 className="text-[78px] font-black leading-none tracking-[0.08em] text-white">PELIGRO</h1>
          </header>

          {/* TÍTULO Y NORMA */}
          <div className="bg-slate-900 px-8 pb-5 pt-4 text-center">
            <h2 className="text-[31px] font-extrabold leading-tight tracking-wide text-white">
              RIESGO DE ARCO ELÉCTRICO Y ELECTROCUCIÓN PRESENTE
            </h2>
            <p className="mt-2 flex items-center justify-center gap-3 text-[14px] font-medium text-slate-400">
              Se requiere EPP de acuerdo a categoría
              <span className="rounded-full border border-slate-600 bg-slate-800 px-3 py-[3px] text-[12.5px] font-bold tracking-wide text-slate-100">
                NORMA NFPA 70E · 2027
              </span>
            </p>
          </div>

          {/* CUERPO */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 px-[26px] py-5">
            {/* ARCO ELÉCTRICO */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                <span className="h-[19px] w-[6px] rounded-full bg-[#C8102E]"></span>
                <h3 className="text-[15.5px] font-extrabold tracking-wide text-slate-900">RIESGO DE ARCO ELÉCTRICO</h3>
              </div>
              <div className="mt-3 flex gap-5">
                <div className="grid h-[126px] w-[146px] shrink-0 place-content-center rounded-2xl bg-gradient-to-br from-[#E01234] to-[#9B0C22] text-center">
                  <p className="text-[10.5px] font-bold tracking-[0.12em] text-red-100">CATEGORÍA EPP</p>
                  <p className="-mt-1 text-[92px] font-black leading-[1.05] text-white">
                    {nfpa.categoriaRiesgo ?? 1}
                  </p>
                  <span className="mx-auto -mt-2 block h-[4px] w-[78px] rounded-full bg-white/55"></span>
                </div>
                <div className="flex-1">
                  <div className="flex items-end justify-between border-b border-slate-100 py-[7px] last:border-0">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-500">Energía incidente</span>
                    <span className="flex items-baseline gap-1.5">
                      <span className="text-[26px] font-extrabold leading-none tracking-tight text-slate-900">
                        {parseValUnit(nfpa.energiaIncidente, "cal/cm²").val}
                      </span>
                      <span className="text-[13px] font-semibold text-slate-500">
                        {parseValUnit(nfpa.energiaIncidente, "cal/cm²").unit}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-end justify-between border-b border-slate-100 py-[7px] last:border-0">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-500">Distancia de arco</span>
                    <span className="flex items-baseline gap-1.5">
                      <span className="text-[26px] font-extrabold leading-none tracking-tight text-slate-900">
                        {parseValUnit(nfpa.distanciaArco, "m").val}
                      </span>
                      <span className="text-[13px] font-semibold text-slate-500">
                        {parseValUnit(nfpa.distanciaArco, "m").unit}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-end justify-between border-b border-slate-100 py-[7px] last:border-0">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-500">Distancia de trabajo</span>
                    <span className="flex items-baseline gap-1.5">
                      <span className="text-[26px] font-extrabold leading-none tracking-tight text-slate-900">
                        {parseValUnit(nfpa.distanciaTrabajo, "cm (18 in)").val}
                      </span>
                      <span className="text-[13px] font-semibold text-slate-500">
                        {parseValUnit(nfpa.distanciaTrabajo, "cm (18 in)").unit}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ELECTROCUCIÓN */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                <span className="h-[19px] w-[6px] rounded-full bg-sky-500"></span>
                <h3 className="text-[15.5px] font-extrabold tracking-wide text-slate-900">RIESGO DE ELECTROCUCIÓN</h3>
              </div>
              <div className="mt-3 flex gap-5">
                <div className="grid h-[126px] w-[146px] shrink-0 place-content-center rounded-2xl bg-gradient-to-br from-slate-800 to-[#0B1220] text-center">
                  <p className="text-[10.5px] font-bold tracking-[0.12em] text-slate-400">TENSIÓN NOMINAL</p>
                  <p className="text-[62px] font-black leading-tight tracking-tight text-white">
                    {board.tensionNominal || 380}
                  </p>
                  <p className="-mt-1 text-[12px] font-bold tracking-[0.14em] text-slate-400">VOLTIOS CA</p>
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-end justify-between border-b border-slate-100 py-[7px] last:border-0">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-500">Límite de aproximación</span>
                    <span className="flex items-baseline gap-1.5">
                      <span className="text-[26px] font-extrabold leading-none tracking-tight text-slate-900">
                        {parseValUnit(nfpa.limiteAproximacion, "m").val}
                      </span>
                      <span className="text-[13px] font-semibold text-slate-500">
                        {parseValUnit(nfpa.limiteAproximacion, "m").unit}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-end justify-between border-b border-slate-100 py-[7px] last:border-0">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-500">Distancia restringida</span>
                    <span className="flex items-baseline gap-1.5">
                      <span className="text-[26px] font-extrabold leading-none tracking-tight text-slate-900">
                        {parseValUnit(nfpa.distanciaRestringida, "m").val}
                      </span>
                      <span className="text-[13px] font-semibold text-slate-500">
                        {parseValUnit(nfpa.distanciaRestringida, "m").unit}
                      </span>
                    </span>
                  </div>
                  <div className="mt-auto flex items-center gap-3 rounded-xl border border-[#F0B429] bg-[#FEF6E0] px-3 py-2">
                    <Hand className="h-5 w-5 shrink-0 text-[#7A4E0B]" />
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.11em] text-[#7A4E0B]">GUANTES DIELÉCTRICOS</p>
                      <p className="text-[13px] font-semibold text-[#4A3007]">
                        {nfpa.guantesClase || "No especificados"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* EPP REQUERIDO */}
            <section className="col-span-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" style={{ gridColumn: "span 1" }}>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-[19px] w-[6px] rounded-full bg-[#C8102E]"></span>
                  <h3 className="text-[15.5px] font-extrabold tracking-wide text-slate-900">EPP REQUERIDO</h3>
                </div>
                <span className="rounded-full border border-red-200 bg-red-50 px-3 py-[3px] text-[11.5px] font-bold text-[#9B0C22]">
                  MÍNIMO {parseValUnit(nfpa.energiaIncidente, "cal/cm²").val !== "-" ? parseValUnit(nfpa.energiaIncidente, "cal/cm²").val + " cal/cm²" : "4 cal/cm²"}
                </span>
              </div>
              <ul className="mt-3 space-y-[7px]">
                {Array.isArray(nfpa.eppRequerido) && nfpa.eppRequerido.length > 0 ? (
                  nfpa.eppRequerido.map((item: string, index: number) => (
                    <li key={index} className="flex items-center gap-3">
                      <span className="grid h-[25px] w-[25px] shrink-0 place-items-center rounded-full bg-[#FDECEF]">
                        <Shield className="h-4 w-4 text-[#9B0C22]" />
                      </span>
                      <span className="text-[13.5px] font-medium leading-tight text-slate-800">{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-400 font-medium">No hay EPP registrado</li>
                )}
              </ul>
            </section>

            {/* QR */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                <span className="h-[19px] w-[6px] rounded-full bg-sky-500"></span>
                <h3 className="text-[15.5px] font-extrabold tracking-wide text-slate-900">ESCANEAR TABLERO</h3>
              </div>
              <div className="mt-4 flex items-center gap-5">
                <div className="relative rounded-xl border border-slate-200 bg-white p-2 shrink-0">
                  <QRCode
                    value={qrUrl}
                    size={118}
                    level="H"
                    style={{ height: "118px", width: "118px" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white p-0.5 rounded-md shadow-md border border-slate-100 size-6 flex items-center justify-center">
                      <img src="/voltguard.png" alt="Voltguard" className="object-contain size-full" />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[10.5px] font-bold tracking-[0.12em] text-slate-500">ACCESO RÁPIDO</p>
                  <p className="mt-1 text-[13.5px] font-medium leading-snug text-slate-800">
                    Datos técnicos, memoria de cálculo y curvas de protección del tablero.
                  </p>
                  <p className="mt-2 inline-block rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 text-[12px] font-semibold text-slate-700">
                    {qrUrl.replace(/^https?:\/\//, "")}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* PIE DE ETIQUETA */}
          <footer className="flex h-[78px] items-center justify-between border-t-[3px] border-[#C8102E] bg-[#0B1220] px-[26px]">
            <div>
              <p className="text-[10.5px] font-bold tracking-[0.16em] text-slate-400">TABLERO</p>
              <p className="text-[24px] font-black leading-tight text-white uppercase">
                {board?.boardCode || board?.name || "PRUEBA"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[9.5px] font-bold tracking-[0.16em] text-slate-400">CREADO POR</p>
              <div className="mt-[2px] flex items-center justify-center gap-2">
                {/* <ShieldCheck className="h-6 w-6 text-emerald-500 fill-emerald-500/20" /> */}
                <div className="p-0.5 size-6 flex items-center justify-center">
                  <img src="/voltguard.png" alt="Voltguard" className="object-contain size-full" />
                </div>
                <span className="text-[22px] font-extrabold leading-none text-white">Voltguard</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10.5px] font-bold tracking-[0.16em] text-slate-400">FECHA DE CÁLCULO</p>
              <p className="text-[24px] font-extrabold leading-tight text-white">
                {board?.createdAt ? new Date(board.createdAt).toLocaleDateString("es-ES") : "21/6/2026"}
              </p>
            </div>
          </footer>
        </div>
      </>
    );
  };

  // ── SECCIÓN MODULAR 5: MEDICIONES DE AISLAMIENTO ──
  const renderInsulationMeasurements = () => {
    const records = board?.insulationMeasurements ?? [];
    const record = records.length > 0 ? records[records.length - 1] : null;
    const row = record?.rows?.[0];

    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-slate-300">
        <div className="mb-4">
          <h2 className="font-bold text-slate-950 text-base">Mediciones de aislamiento</h2>
          <p className="text-xs text-slate-400 mt-0.5">Medición fase-tierra expresada en MΩ</p>
        </div>

        {!row ? (
          <p className="text-sm text-slate-400 font-medium">Sin mediciones de aislamiento registradas</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 md:hidden">
              <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs font-medium text-slate-600">
                <p className="border-b border-slate-200/60 pb-1.5"><strong className="text-slate-800">Descripción:</strong> {value(row.description || "Barras generales")}</p>
                <p className="border-b border-slate-200/60 pb-1.5 flex justify-between"><span>Fase 1 - Tierra:</span><strong className="text-slate-900">{formatMeasurementWithUnit(row.measurement_l1_g, row.unit || record.unit || "MΩ")}</strong></p>
                <p className="border-b border-slate-200/60 pb-1.5 flex justify-between"><span>Fase 2 - Tierra:</span><strong className="text-slate-900">{formatMeasurementWithUnit(row.measurement_l2_g, row.unit || record.unit || "MΩ")}</strong></p>
                <p className="flex justify-between"><span>Fase 3 - Tierra:</span><strong className="text-slate-900">{formatMeasurementWithUnit(row.measurement_l3_g, row.unit || record.unit || "MΩ")}</strong></p>
              </div>
            </div>

            <div className="hidden overflow-x-auto md:block rounded-2xl border border-slate-100">
              <table className="w-full min-w-[720px] text-xs text-left border-collapse">
                <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-4 w-2/5">Descripción</th>
                    <th className="p-4 text-center">Fase 1 - Tierra</th>
                    <th className="p-4 text-center">Fase 2 - Tierra</th>
                    <th className="p-4 text-center">Fase 3 - Tierra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 text-slate-900 font-bold">{value(row.description || "Barras generales")}</td>
                    <td className="p-4 text-center text-slate-900">{formatMeasurementWithUnit(row.measurement_l1_g, row.unit || record.unit || "MΩ")}</td>
                    <td className="p-4 text-center text-slate-900">{formatMeasurementWithUnit(row.measurement_l2_g, row.unit || record.unit || "MΩ")}</td>
                    <td className="p-4 text-center text-slate-900">{formatMeasurementWithUnit(row.measurement_l3_g, row.unit || record.unit || "MΩ")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  };

  // ── MANEJO DE ESTADOS DE CARGA INICIAL EXCEPCIONES ──
  if (loading) {
    return (
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="h-28 animate-pulse rounded-3xl bg-slate-200" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-3xl bg-slate-200" />
          <div className="h-72 animate-pulse rounded-3xl bg-slate-200" />
        </div>
        <div className="h-96 animate-pulse rounded-3xl bg-slate-200" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 font-bold text-sm">{error}</div>
      </section>
    );
  }

  if (!board) {
    return (
      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-400 font-semibold text-sm">No encontrado</div>
      </section>
    );
  }

  const companyName = typeof board.company === "object" ? board.company.name : "Sin empresa";

  return (
    <>
      <section className="mx-auto max-w-7xl space-y-6 opacity-0" style={{ animation: "fadeUp 0.5s ease forwards" }}>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        {/* ── SECCIÓN IDENTIFICACIÓN GENERAL ── */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] p-6 text-white relative">
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center relative z-10">
              <div>
                <div className="mb-2.5 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                  <Zap size={12} />
                  Tablero eléctrico
                </div>
                <h1 className="text-2xl font-black md:text-3xl tracking-tight">{board.name}</h1>
                <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-white/95">
                  <Building2 size={15} />
                  {companyName}
                </p>
              </div>

              <div className="rounded-2xl bg-white/15 px-5 py-3.5 backdrop-blur border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Código</p>
                <p className="mt-0.5 text-xl font-black tracking-tight">{value(board.boardCode)}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 grid-cols-2 lg:grid-cols-4">
            {[
              { l: "Ubicación", v: board.location, icon: MapPin, textCls: "text-slate-800", iconCls: "text-[#0797d5]" },
              { l: "Tipo", v: board.type, icon: Info, textCls: "text-slate-800", iconCls: "text-[#0797d5]" },
              { l: "Sistema", v: board.sistema, icon: Zap, textCls: "text-slate-800", iconCls: "text-[#0797d5]" },
              { l: "Estado", v: board.estadoGeneral, icon: CheckCircle2, textCls: "text-slate-800", iconCls: "text-[#3aaa35]" }
            ].map((item, i) => {
              const CardIcon = item.icon;
              return (
                <div key={i} className="rounded-2xl bg-slate-50/70 p-4 border border-transparent hover:border-slate-200/50 transition-colors">
                  <CardIcon className={item.iconCls} size={20} />
                  <p className="mt-2.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider">{item.l}</p>
                  <p className={`mt-0.5 text-xs sm:text-sm font-bold truncate ${item.textCls}`}>{value(item.v)}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Renderizado de bloques modulares */}
        {renderNfpaSection()}
        {/* 3. 🛡️ SECCIÓN SUPERIOR: PROTOCOLOS Y CERTIFICADOS SPAT (POZO A TIERRA) */}
        {renderPdfSection(
          "Certificados de Puesta a Tierra (SPAT)",
          "Protocolos de medición de resistencia (Ω), corriente de fuga y salud del pozo",
          certificadosSpat
        )}
        {/* {renderGroundingSection()}
        {renderLoadPanelSection()} */}

        {/* PANEL DE CONTROL DE GRÁFICOS INYECTADO AUTOMÁTICAMENTE AQUÍ */}
        {renderDemandSection()}
        {renderReactivePowerSection()}
        {renderEnergyBarSection()}
        {renderCarbonEmissionsSection()}

        {/* ── ESPECIFICACIONES TÉCNICAS (CASCADA COMPACTA) ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-950 text-base">Información general</h2>
            <div className="space-y-2">
              {renderField("Código real del tablero", board.boardCode, 1)}
              {renderField("Nombre", board.name, 2)}
              {renderField("Tipo", board.type, 3)}
              {renderField("Sistema", board.sistema, 4)}
              {renderField("Estado general", board.estadoGeneral, 5)}
              {renderField("Ubicación", board.location, 6)}
              {renderField("Descripción", board.description, 7)}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-950 text-base">Información eléctrica</h2>
            <div className="space-y-2">
              {renderField("Tensión nominal", board.tensionNominal ? `${board.tensionNominal} V` : "-", 1)}
              {renderField("Número de fases", board.numeroFases, 2)}
              <div
                style={{ animation: "fadeUp 0.4s ease both", animationDelay: "90ms" }}
                className="rounded-2xl bg-slate-50 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Incluye neutro</p>
                <p className="mt-1 break-words text-sm font-bold text-slate-800">{bool(board.incluyeNeutro)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── LEYENDA TÉCNICA ── */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-bold text-slate-950 text-base">Leyenda</h2>

          {!board.circuits?.length ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-xs font-bold text-slate-400 uppercase">
              Sin circuitos registrados
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {board.circuits.map((c, i) => (
                  <div key={i} className="space-y-1.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-xs font-medium text-slate-600">
                    <p><strong className="text-slate-800">Circuito:</strong> {value(c.circuito)}</p>
                    <p><strong className="text-slate-800">Descripción:</strong> {value(c.descripcion)}</p>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block rounded-2xl border border-slate-100">
                <table className="w-full min-w-[720px] text-xs text-left border-collapse">
                  <thead className="bg-slate-50 font-bold text-slate-500 uppercase border-b border-slate-100 tracking-wider">
                    <tr>
                      <th className="p-3 w-1/4">Circuito</th>
                      <th className="p-3">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {board.circuits.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="p-3 text-slate-900 font-bold">{value(c.circuito)}</td>
                        <td className="p-3 font-medium">{value(c.descripcion)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Secciones de imágenes fijas */}
        {renderInsulationMeasurements()}
        {renderImageSection("Imágenes del tablero", "Fotografías generales del tablero eléctrico", board.images?.tablero)}
        {renderImageSection("Diagrama unifilar", "Imágenes del diagrama unifilar registrado", board.images?.unifilar)}
        {renderImageSection("Termografía", "Imágenes termográficas asociadas al tablero", board.images?.termografia)}

        {/* ── 📄 CONECTADO: SECCIONES DE CERTIFICADOS ASIGNADOS REALES DE CLOUDINARY ── */}
        {renderPdfSection(
          "Certificados de mantenimiento",
          "Documentos PDF asignados de mantenimiento técnico",
          certificadosMantenimiento
        )}

        {renderPdfSection(
          "Certificados de operatividad",
          "Documentos PDF asignados del nivel de operatividad estructural",
          certificadosOperatividad
        )}

      </section>

      {/* Visor de imágenes modal integrado */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 transition-all duration-300 animate-fade-in">
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-5 top-5 flex size-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow shadow-black/20 hover:bg-slate-50 cursor-pointer transition-colors z-50"
          >
            <X size={20} />
          </button>

          <TransformWrapper>
            <TransformComponent>
              <img
                src={selectedImage}
                alt="Vista ampliada"
                className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl transition-all relative z-40"
                onClick={(event) => event.stopPropagation()}
              />
            </TransformComponent>
          </TransformWrapper>
        </div>
      )}
    </>
  );
};

export default BoardDetailPage;