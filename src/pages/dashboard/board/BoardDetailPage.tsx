import React, { useEffect, useState } from "react";
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
  Coins,
  Container,
  FileDown,
  FileImage,
  Hand,
  ImageIcon,
  Info,
  Layers,
  MapPin,
  Shield,
  Sun,
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
import { useAuth } from "../../../shared/hooks/useAuth";

// ── CONSTANTES DE PALETAS DE COLORES ──
const MAIN_COLORS = [
  '#2f5597', '#4caf50', '#9c27b0', '#00bcd4', '#ff9800',
  '#e91e63', '#795548', '#607d8b', '#03a9f4', '#eab308', '#ec4899'
];

const REACTIVE_COLOR_CAPACITIVE = "#dc2626";
const REACTIVE_COLOR_INDUCTIVE = "#1d4ed8";

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
  const { auth } = useAuth();
  const userPlan = auth?.plan || "basico";
  const isSuperAdmin = auth?.role === "SUPERADMIN";

  const isIntermedioOrSuperior = isSuperAdmin || ["intermedio", "empresarial"].includes(userPlan);
  const isEmpresarial = isSuperAdmin || userPlan === "empresarial";

  const navigate = useNavigate();
  const { publicCode, code } = useParams();

  const [board, setBoard] = useState<BoardResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [rawChartData, setRawChartData] = useState<any[]>([]);
  const [seriesKeys, setSeriesKeys] = useState<string[]>([]);
  const [selectedReactiveDay, setSelectedReactiveDay] = useState<string | null>(null);

  const [visibleDemandSeries, setVisibleDemandSeries] = useState<{ [key: string]: boolean }>({
    "Promedio_General": true,
  });
  const [visibleReactiveSeries, setVisibleReactiveSeries] = useState<{ [key: string]: boolean }>({
    "kvar_inductivo": true,
    "kvar_capacitivo": true,
  });
  const [visibleEnergySeries, setVisibleEnergySeries] = useState<{ [key: string]: boolean }>({});
  const [visibleCarbonSeries, setVisibleCarbonSeries] = useState<{ [key: string]: boolean }>({});
  const [visibleCostSeries, setVisibleCostSeries] = useState<{ [key: string]: boolean }>({});
  const [visibleSolarSeries, setVisibleSolarSeries] = useState<{ [key: string]: boolean }>({});
  const [importing, setImporting] = useState(false);

  const [tarifaContratada] = useState<number>(350);
  const [costokW_HP] = useState<number>(48.50);
  const [costokW_HFP] = useState<number>(22.10);
  const [horaPicoMaximo, setHoraPicoMaximo] = useState<string | null>(null);
  const [analisisPotencia, setAnalisisPotencia] = useState<{
    maxHP: { valor: number; hora: string; fecha: string } | null;
    maxHFP: { valor: number; hora: string; fecha: string } | null;
    ahorroEstimado: number;
  } | null>(null);

  const [energiaPorDiaData, setEnergiaPorDiaData] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  console.log(isScrolled)
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ CÓDIGO CORREGIDO Y REESTRUCTURADO DE fetchChartData:
  const fetchChartData = async (boardId: string, start?: string, end?: string) => {
    try {
      const res: any = await getDemandChartData(boardId, start, end);
      const { agrupado } = res;

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

        rawKeys.forEach((diaKey) => {
          const partes = diaKey.split(' ');
          const fechaYMD = partes[0];
          const diaNombre = partes[1] ? partes[1].replace(/[\(\)]/g, '').substring(0, 3) : '';
          const [_, mes, dia] = fechaYMD.split('-');
          const labelCorto = `${dia}/${mes} (${diaNombre})`;

          const punto = agrupado[diaKey]?.[hora];

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

      const sortedCleanKeys = rawKeys.map(key => {
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
      setSelectedReactiveDay(prev => (prev && sortedCleanKeys.includes(prev) ? prev : sortedCleanKeys[0] || null));

      // Recalcular métricas de picos e indicadores eléctricos inmediatamente con los datos frescos
      calcularMetricasLuzDelSur(formattedData);

      const initialVisibility: { [key: string]: boolean } = {};
      sortedCleanKeys.forEach((k) => {
        initialVisibility[k] = true;
      });

      setVisibleDemandSeries(prev => {
        const visibility: any = {
          "Promedio_General": prev["Promedio_General"] ?? true
        };
        sortedCleanKeys.forEach((k) => {
          visibility[k] = prev[k] !== undefined ? prev[k] : true;
        });
        return visibility;
      });

      setVisibleReactiveSeries(prev => ({
        "kvar_inductivo": prev["kvar_inductivo"] ?? true,
        "kvar_capacitivo": prev["kvar_capacitivo"] ?? true
      }));

      setVisibleEnergySeries(prev => Object.keys(prev).length ? prev : { ...initialVisibility });
      setVisibleCarbonSeries(prev => Object.keys(prev).length ? prev : { ...initialVisibility });
      setVisibleCostSeries(prev => Object.keys(prev).length ? prev : { ...initialVisibility });
      setVisibleSolarSeries(prev => Object.keys(prev).length ? prev : { ...initialVisibility });
    } catch (err) {
      console.error("Error cargando curvas de demanda en Recharts:", err);
    }
  };

  const toggleDemandDay = (key: string) => {
    setVisibleDemandSeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleReactiveDay = (key: string) => {
    setVisibleReactiveSeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleEnergyDay = (key: string) => {
    setVisibleEnergySeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCarbonDay = (key: string) => {
    setVisibleCarbonSeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCostDay = (key: string) => {
    setVisibleCostSeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSolarDay = (key: string) => {
    setVisibleSolarSeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

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

  // ✅ CÓDIGO NUEVO (Recalcula al activar/desactivar días):
  useEffect(() => {
    if (rawChartData.length > 0) {
      calcularMetricasLuzDelSur(rawChartData);
    }
  }, [rawChartData, visibleDemandSeries, seriesKeys, tarifaContratada, costokW_HP, costokW_HFP]);

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
      await fetchChartData(board._id);
    } catch (err: any) {
      alert("Error procesando archivo: " + (err.response?.data?.error || err.message));
    } finally {
      setImporting(false);
    }
  };

  // ✅ FUNCIÓN COMPLETA 100% DINÁMICA:
  const calcularMetricasLuzDelSur = (data: any[]) => {
    if (!data || data.length === 0) return;

    // 1. Filtrar únicamente las series/días que están ACTIVOS actualmente
    const activeKeys = [
      ...seriesKeys,
      "Promedio_General"
    ].filter((key) => visibleDemandSeries[key] === true);

    // Si no hay ninguna serie seleccionada, limpiamos métricas
    if (activeKeys.length === 0) {
      setHoraPicoMaximo(null);
      setAnalisisPotencia(null);
      return;
    }

    let maxHP: { valor: number; hora: string; fecha: string } | null = null;
    let maxHFP: { valor: number; hora: string; fecha: string } | null = null;
    let valorPicoAbsoluto = -1;
    let horaPicoAbsoluto = "";

    // Cambiado de data.forEach a for...of para que TypeScript mantenga el rastro del tipo
    for (const row of data) {
      const horaStr = row.horaMinuto;
      if (!horaStr) continue; // En bucles for...of usamos continue en vez de return

      const [horas, minutos] = horaStr.split(":").map(Number);
      const totalMinutos = horas * 60 + minutos;

      // Hora Punta (HP): 18:00 a 23:00 hrs (1080 a 1380 minutos)
      const esHoraPunta = totalMinutos >= 18 * 60 && totalMinutos < 23 * 60;

      // Cambiado de activeKeys.forEach a for...of
      for (const key of activeKeys) {
        const valor = Number(row[key]);

        if (!isNaN(valor) && valor !== null && valor !== undefined && valor > 0) {
          // Pico Máximo Absoluto
          if (valor > valorPicoAbsoluto) {
            valorPicoAbsoluto = valor;
            horaPicoAbsoluto = horaStr;
          }

          // Evaluar tarjeta de Hora Punta (HP)
          if (esHoraPunta) {
            if (!maxHP || valor > maxHP.valor) {
              maxHP = { valor, hora: horaStr, fecha: key };
            }
          } else {
            // Evaluar tarjeta de Hora Fuera de Punta (HFP)
            if (!maxHFP || valor > maxHFP.valor) {
              maxHFP = { valor, hora: horaStr, fecha: key };
            }
          }
        }
      }
    }

    // Mover la línea vertical punteada al pico de los días activos
    if (horaPicoAbsoluto) {
      setHoraPicoMaximo(horaPicoAbsoluto);
    } else {
      setHoraPicoMaximo(null);
    }

    // TypeScript ahora sabrá perfectamente que maxHP y maxHFP pueden no ser null aquí
    const valHP = maxHP ? maxHP.valor : 0;
    const valHFP = maxHFP ? maxHFP.valor : 0;
    const picoMaximoAbsoluto = Math.max(valHP, valHFP);

    let sobrecostoPenalidad = 0;
    if (picoMaximoAbsoluto > tarifaContratada) {
      sobrecostoPenalidad = (picoMaximoAbsoluto - tarifaContratada) * costokW_HFP * 1.5;
    }

    const ahorroPotenciaHP = valHP * 0.15 * costokW_HP;

    setAnalisisPotencia({
      maxHP,
      maxHFP,
      ahorroEstimado: Math.round((ahorroPotenciaHP + sobrecostoPenalidad) * 100) / 100
    });
  };

  const ReactiveTooltip = ({ active, label, payload }: any) => {
    if (active && payload && payload.length) {
      const rowData = payload[0]?.payload || {};
      const activeDay = selectedReactiveDay || seriesKeys[0] || "";

      const valCap = rowData[`capacitiva_${activeDay}`];
      const valInd = rowData[`inductiva_${activeDay}`];

      const mostrarCapacitiva = visibleReactiveSeries["kvar_capacitivo"] !== false;
      const mostrarInductiva = visibleReactiveSeries["kvar_inductivo"] !== false;

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

  // ✅ CÓDIGO CORREGIDO SIN ZOOM NI DRAG EN RENDERDEMANDSECTION:
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
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <label
              htmlFor="csv-metrel"
              className="flex sm:inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl px-5 py-2.5 text-xs font-black text-white transition-all duration-300 cursor-pointer shadow-md bg-emerald-600 hover:bg-emerald-700 active:scale-95 h-[38px]"
            >
              <UploadCloud size={16} />
              {importing ? "Importando..." : "Importar .Mediciones.csv"}
            </label>
            <input id="csv-metrel" type="file" accept=".csv" onChange={handleFileChange} className="hidden" disabled={importing} />
          </div>
        </div>

        {rawChartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
            <BarChart3 size={32} className="text-slate-300 animate-pulse" />
            <p className="mt-3 text-xs font-bold text-slate-500">Sin historial de curvas de demanda cargado</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Selector de Días */}
            <div className="flex items-center gap-2.5 overflow-x-auto p-2.5 rounded-2xl bg-slate-100/80 border border-slate-200/40 scrollbar-thin">
              <span className="text-[10px] font-black uppercase text-slate-400 self-center mr-1 shrink-0">
                DÍAS:
              </span>

              <button
                type="button"
                onClick={() => toggleDemandDay("Promedio_General")}
                className={`flex shrink-0 items-center gap-x-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all border cursor-pointer ${visibleDemandSeries["Promedio_General"]
                  ? 'bg-orange-600 border-orange-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <ChartNoAxesCombined size={14} /> Promedio General
              </button>

              {seriesKeys.map((key) => {
                const isSelected = !!visibleDemandSeries[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleDemandDay(key)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all border cursor-pointer shrink-0 ${isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>

            <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-0 sm:border-none scrollbar-thin">
              <div className="h-72 sm:h-80 md:h-[420px] w-[850px] sm:w-full text-xs font-medium text-slate-500 select-none">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={rawChartData}
                    margin={{ top: 25, right: 15, left: 10, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

                    {(() => {
                      const horasVisibles = rawChartData.map(d => d.horaMinuto);
                      const primerHora = horasVisibles[0];
                      const ultimaHora = horasVisibles[horasVisibles.length - 1];

                      const hora18 = horasVisibles.find(h => h >= "18:00") || "18:00";
                      const hora23 = horasVisibles.find(h => h >= "23:00") || "23:00";

                      return (
                        <>
                          <ReferenceArea x1={primerHora} x2={hora18} fill="#f8fafc" fillOpacity={0.55}>
                            <Label value="HORA FUERA DE PUNTA (HFP)" position="top" offset={10} fill="#0284c7" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '0.05em' }} />
                          </ReferenceArea>

                          <ReferenceArea x1={hora18} x2={hora23} fill="#fff1f2" fillOpacity={0.65}>
                            <Label value="HORA PUNTA (HP)" position="top" offset={10} fill="#f43f5e" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '0.05em' }} />
                          </ReferenceArea>

                          <ReferenceArea x1={hora23} x2={ultimaHora} fill="#f8fafc" fillOpacity={0.55} />

                        // ✅ CÓDIGO NUEVO (Texto Descriptivo Dinámico):
                          {horaPicoMaximo && horasVisibles.includes(horaPicoMaximo) && (
                            <ReferenceLine x={horaPicoMaximo} stroke="#be123c" strokeWidth={2} strokeDasharray="4 4">
                              <Label
                                value={`PICO MÁXIMO DEL PERIODO (${Number(horaPicoMaximo.split(':')[0]) >= 18 && Number(horaPicoMaximo.split(':')[0]) < 23
                                  ? 'EN HP'
                                  : 'EN HFP'
                                  })`}
                                position="top"
                                offset={10}
                                fill="#be123c"
                                style={{ fontSize: '8px', fontWeight: '900' }}
                              />
                            </ReferenceLine>
                          )}
                        </>
                      );
                    })()}

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

                    {visibleDemandSeries["Promedio_General"] && (
                      <Line type="monotone" name="Promedio General" dataKey="Promedio_General" stroke="#ff5722" strokeWidth={2.5} dot={false} connectNulls animationDuration={150} />
                    )}

                    {seriesKeys.map((key, idx) =>
                      visibleDemandSeries[key] ? (
                        <Line key={key} type="monotone" name={key} dataKey={key} stroke={MAIN_COLORS[idx % MAIN_COLORS.length]} strokeWidth={1.5} dot={false} connectNulls animationDuration={150} />
                      ) : null
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {analisisPotencia && (
              <div className="mt-8 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-rose-700">
                    <Clock size={16} className="animate-pulse" />
                    <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-wider">Pico Máximo en Hora Punta (HP)</h3>
                  </div>
                  <p className="mt-2 text-2xl sm:text-3xl font-black text-rose-950">
                    {analisisPotencia.maxHP?.valor.toFixed(1)} <span className="text-xs sm:text-sm font-bold text-rose-500">kW</span>
                  </p>
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
                  <p className="mt-2 text-2xl sm:text-3xl font-black text-blue-950">
                    {analisisPotencia.maxHFP?.valor.toFixed(1)} <span className="text-xs sm:text-sm font-bold text-blue-500">kW</span>
                  </p>
                  <div className="mt-1 text-[11px] sm:text-xs text-slate-500">
                    Registrado el <strong className="text-slate-700">{analisisPotencia.maxHFP?.fecha}</strong> a las <strong className="text-slate-700">{analisisPotencia.maxHFP?.hora} hrs</strong>.
                  </div>
                  <span className="mt-2.5 inline-block rounded-lg bg-blue-100 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-blue-700">Horario Base: 23:00 a 18:00 hrs</span>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    );
  };

  const renderReactivePowerSection = () => {
    if (rawChartData.length === 0) return null;

    const activeDay = selectedReactiveDay || seriesKeys[0] || "";

    return (
      <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm font-sans mt-6">
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

        <div className="space-y-3 mb-5">
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

          <div className="flex gap-2 overflow-x-auto pb-1 p-1.5 bg-slate-50 rounded-xl border border-slate-100">
            <button
              type="button"
              onClick={() => toggleReactiveDay("kvar_capacitivo")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${visibleReactiveSeries["kvar_capacitivo"] !== false ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-200'
                }`}
            >
              <span className={`size-2.5 rounded-full inline-block ${visibleReactiveSeries["kvar_capacitivo"] !== false ? 'bg-white' : 'bg-red-600'}`}></span>
              kvar c (Capacitiva)
            </button>
            <button
              type="button"
              onClick={() => toggleReactiveDay("kvar_inductivo")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${visibleReactiveSeries["kvar_inductivo"] !== false ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-slate-600 border-slate-200'
                }`}
            >
              <span className={`size-2.5 rounded-full inline-block ${visibleReactiveSeries["kvar_inductivo"] !== false ? 'bg-white' : 'bg-blue-700'}`}></span>
              kvar i (Inductiva)
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-0">
          <div className="h-72 sm:h-80 md:h-[380px] w-[850px] sm:w-full text-xs select-none">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rawChartData} margin={{ top: 15, right: 15, left: 10, bottom: 25 }}>
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

                {visibleReactiveSeries["kvar_capacitivo"] !== false && activeDay && (
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

                {visibleReactiveSeries["kvar_inductivo"] !== false && activeDay && (
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

  const renderCombinedDemandAndReactiveSection = () => {
    if (rawChartData.length === 0) return null;

    const activeDay = selectedReactiveDay || seriesKeys[0] || "";

    return (
      <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm font-sans mt-6">
        <div className="mb-5 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600">
              <Layers size={22} />
            </div>
            <div>
              <h2 className="font-bold text-slate-950 text-base">
                Cuadro Integrado: Demanda (kW) y Potencia Reactiva (kvar)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Superposición de curva de potencia activa y potencia reactiva capacitiva e inductiva por día
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          <div className="flex gap-1.5 overflow-x-auto pb-1 p-2 rounded-2xl bg-slate-100/80 border border-slate-200/40 scrollbar-thin">
            <span className="text-[10px] font-black uppercase text-slate-400 self-center mr-2 shrink-0">
              SELECCIONAR DÍA:
            </span>
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

          <div className="flex flex-wrap gap-2 p-1.5 bg-slate-50 rounded-xl border border-slate-100">
            <button
              type="button"
              onClick={() => toggleDemandDay(activeDay)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${visibleDemandSeries[activeDay] !== false
                ? 'bg-orange-600 text-white border-orange-600'
                : 'bg-white text-slate-600 border-slate-200'
                }`}
            >
              <span className={`size-2.5 rounded-full inline-block ${visibleDemandSeries[activeDay] !== false ? 'bg-white' : 'bg-orange-600'}`}></span>
              Demanda Activa ({activeDay}) [kW]
            </button>

            <button
              type="button"
              onClick={() => toggleReactiveDay("kvar_capacitivo")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${visibleReactiveSeries["kvar_capacitivo"] !== false ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-200'
                }`}
            >
              <span className={`size-2.5 rounded-full inline-block ${visibleReactiveSeries["kvar_capacitivo"] !== false ? 'bg-white' : 'bg-red-600'}`}></span>
              kvar c (Capacitiva)
            </button>

            <button
              type="button"
              onClick={() => toggleReactiveDay("kvar_inductivo")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${visibleReactiveSeries["kvar_inductivo"] !== false ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-white text-slate-600 border-slate-200'
                }`}
            >
              <span className={`size-2.5 rounded-full inline-block ${visibleReactiveSeries["kvar_inductivo"] !== false ? 'bg-white' : 'bg-indigo-700'}`}></span>
              kvar i (Inductiva)
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-0">
          <div className="h-72 sm:h-80 md:h-[400px] w-[850px] sm:w-full text-xs select-none">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rawChartData} margin={{ top: 15, right: 25, left: 10, bottom: 25 }}>
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

                <YAxis yAxisId="left" tickLine={false} stroke="#f97316" width={45} domain={[0, 'auto']}>
                  <Label value="Demanda [kW]" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#f97316', fontWeight: '800', fontSize: '9px' }} />
                </YAxis>

                <YAxis yAxisId="right" orientation="right" tickLine={false} stroke="#dc2626" width={45} domain={[0, 'auto']}>
                  <Label value="Reactiva [kvar]" angle={90} position="insideRight" style={{ textAnchor: 'middle', fill: '#dc2626', fontWeight: '800', fontSize: '9px' }} />
                </YAxis>

                <Tooltip content={<CustomTooltip />} shared={true} />

                {visibleDemandSeries[activeDay] !== false && activeDay && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    name={`Demanda kW - ${activeDay}`}
                    dataKey={activeDay}
                    stroke="#f97316"
                    strokeWidth={2.5}
                    dot={false}
                    connectNulls={true}
                    animationDuration={150}
                  />
                )}

                {visibleReactiveSeries["kvar_capacitivo"] !== false && activeDay && (
                  <Line
                    yAxisId="right"
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

                {visibleReactiveSeries["kvar_inductivo"] !== false && activeDay && (
                  <Line
                    yAxisId="right"
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

  const renderEnergyBarSection = () => {
    const barrasVisibles = energiaPorDiaData.filter(d => visibleEnergySeries[d.name] !== false);

    const totalKWhSemana = barrasVisibles.reduce((acc, curr) => acc + (curr.kWh || 0), 0);
    const promedioKWhDiario = barrasVisibles.length > 0 ? totalKWhSemana / barrasVisibles.length : 0;
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
              <h2 className="font-bold text-slate-950 text-sm sm:text-base tracking-tight">Energía Consumida por Día</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Energía total acumulada diariamente expresada en KiloVatios-Hora (kWh)</p>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-blue-700">Consumo Diario Promedio</p>
            <p className="mt-1 text-2xl font-black text-blue-950">
              {promedioKWhDiario.toFixed(1)} <span className="text-xs font-bold text-blue-600">kWh/día</span>
            </p>
            <p className="mt-1 text-[10px] text-blue-500">Promedio sobre los días seleccionados</p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-blue-700">Proyección Mensual (30 días)</p>
            <p className="mt-1 text-2xl font-black text-blue-950">
              {proyeccionKWhMes.toFixed(1)} <span className="text-xs font-bold text-blue-600">kWh/mes</span>
            </p>
            <p className="mt-1 text-[10px] text-blue-500">Estimación a 30 días de operación</p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-blue-700">Proyección Anual (365 días)</p>
            <p className="mt-1 text-2xl font-black text-blue-950">
              {proyeccionKWhAno.toFixed(0)} <span className="text-xs font-bold text-blue-600">kWh/año</span>
            </p>
            <p className="mt-1 text-[10px] text-blue-500">Estimación a 365 días de operación</p>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 p-2 rounded-2xl bg-slate-100 border border-slate-200/40 scrollbar-none">
          <span className="text-[10px] font-black uppercase text-slate-400 self-center mr-1">Días:</span>
          {seriesKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleEnergyDay(key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer shrink-0 ${visibleEnergySeries[key] !== false
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
            {barrasVisibles.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center text-slate-400 font-semibold text-sm">
                Selecciona al menos un día para visualizar los datos del gráfico.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barrasVisibles} margin={{ top: 25, right: 15, left: 10, bottom: 30 }} style={{ outline: 'none', border: 'none' }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} stroke="#94a3b8" dy={8} tick={{ fontSize: '10px', fontWeight: '700', fill: '#475569' }}>
                    <Label value="Días del Periodo" position="insideBottom" offset={-20} style={{ textAnchor: 'middle', fill: '#475569', fontWeight: '800', fontSize: '9px', letterSpacing: '0.05em' }} />
                  </XAxis>
                  <YAxis tickLine={false} stroke="#94a3b8" width={55} tick={{ fontSize: '10px' }}>
                    <Label value="Energía Activa (kWh)" angle={-90} position="insideLeft" offset={-5} style={{ textAnchor: 'middle', fill: '#475569', fontWeight: '800', fontSize: '9px', letterSpacing: '0.05em' }} />
                  </YAxis>
                  <Tooltip cursor={{ fill: '#f1f5f9', opacity: 0.6 }} formatter={(value: any) => [`${Number(value).toFixed(1)} kWh`, 'Consumo Total']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="kWh" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>
    );
  };

  const renderCarbonEmissionsSection = () => {
    const FACTOR_EMISION_PERU = 0.00021;

    const emisionesData = energiaPorDiaData
      .filter(d => visibleCarbonSeries[d.name] !== false)
      .map(item => {
        const tCO2_dia = (item.kWh || 0) * FACTOR_EMISION_PERU;
        return {
          name: item.name,
          tCO2: Number(tCO2_dia.toFixed(4)),
          kgCO2: Number((tCO2_dia * 1000).toFixed(2))
        };
      });

    const totalTCO2Semana = emisionesData.reduce((acc, curr) => acc + curr.tCO2, 0);
    const promedioTCO2Diario = emisionesData.length > 0 ? totalTCO2Semana / emisionesData.length : 0;
    const proyeccionTCO2Mes = promedioTCO2Diario * 30;
    const proyeccionTCO2Ano = promedioTCO2Diario * 365;

    return (
      <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all duration-300 hover:border-slate-300 font-sans mt-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-slate-500/10 text-slate-600">
              <Zap size={20} className="sm:size-[22px]" />
            </div>
            <div>
              <h2 className="font-bold text-slate-950 text-sm sm:text-base tracking-tight">Emisiones de CO₂ por Día (Huella de Carbono)</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Dióxido de Carbono equivalente emitido por el consumo eléctrico (tCO₂eq - SEIN Perú)</p>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
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

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">Proyección Mensual (30 días)</p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {proyeccionTCO2Mes.toFixed(3)} <span className="text-xs font-bold text-slate-600">tCO₂/mes</span>
            </p>
            <p className="mt-1 text-[10px] text-slate-500">Estimación a 30 días de operación</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">Proyección Anual (365 días)</p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {proyeccionTCO2Ano.toFixed(2)} <span className="text-xs font-bold text-slate-600">tCO₂/año</span>
            </p>
            <p className="mt-1 text-[10px] text-slate-500">Estimación a 365 días de operación</p>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 p-2 rounded-2xl bg-slate-100 border border-slate-200/40 scrollbar-none">
          <span className="text-[10px] font-black uppercase text-slate-400 self-center mr-1">Días:</span>
          {seriesKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleCarbonDay(key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer shrink-0 ${visibleCarbonSeries[key] !== false
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
            {emisionesData.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center text-slate-400 font-semibold text-sm">
                Selecciona al menos un día para visualizar los datos del gráfico.
              </div>
            ) : (
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
                  <Bar dataKey="tCO2" fill="#64748b" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>
    );
  };

  const TARIFO_KWH_PEN = 0.45;
  const FACTOR_GENERACION_SOLAR_DIARIO = 0.15;

  const renderEnergyCostSection = () => {
    const costoData = energiaPorDiaData
      .filter(d => visibleCostSeries[d.name] !== false)
      .map(item => {
        const costoSoles = (item.kWh || 0) * TARIFO_KWH_PEN;
        return {
          name: item.name,
          costo: Number(costoSoles.toFixed(2)),
          kWh: item.kWh
        };
      });

    const totalCostoSemana = costoData.reduce((acc, curr) => acc + curr.costo, 0);
    const promedioCostoDiario = costoData.length > 0 ? totalCostoSemana / costoData.length : 0;

    return (
      <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all duration-300 hover:border-slate-300 font-sans mt-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-600">
              <Coins size={20} className="sm:size-[22px]" />
            </div>
            <div>
              <h2 className="font-bold text-slate-950 text-sm sm:text-base tracking-tight">Costo de Energía Estimado (S/.)</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Estimación económica del consumo eléctrico diario en soles (S/.)</p>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Costo Total del Periodo</p>
            <p className="mt-1 text-2xl font-black text-amber-950">
              S/. {totalCostoSemana.toFixed(2)}
            </p>
            <p className="mt-1 text-[10px] text-amber-600">Basado en tarifa promediada de S/. {TARIFO_KWH_PEN} / kWh</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Gasto Diario Promedio</p>
            <p className="mt-1 text-2xl font-black text-amber-950">
              S/. {promedioCostoDiario.toFixed(2)} <span className="text-xs font-bold text-amber-600">/ día</span>
            </p>
            <p className="mt-1 text-[10px] text-amber-600">Promedio sobre días seleccionados</p>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 p-2 rounded-2xl bg-slate-100 border border-slate-200/40 scrollbar-none">
          <span className="text-[10px] font-black uppercase text-slate-400 self-center mr-1">Días:</span>
          {seriesKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleCostDay(key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer shrink-0 ${visibleCostSeries[key] !== false
                ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-400'
                }`}
            >
              {key}
            </button>
          ))}
        </div>

        <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-0 sm:border-none scrollbar-thin">
          <div className="h-72 sm:h-80 md:h-[380px] w-[600px] sm:w-full text-xs font-medium text-slate-500 select-none">
            {costoData.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center text-slate-400 font-semibold text-sm">
                Selecciona al menos un día para visualizar los datos del gráfico.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costoData} margin={{ top: 25, right: 15, left: 10, bottom: 30 }} style={{ outline: 'none', border: 'none' }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} stroke="#94a3b8" dy={8} tick={{ fontSize: '10px', fontWeight: '700', fill: '#475569' }}>
                    <Label value="Días del Periodo" position="insideBottom" offset={-20} style={{ textAnchor: 'middle', fill: '#475569', fontWeight: '800', fontSize: '9px', letterSpacing: '0.05em' }} />
                  </XAxis>
                  <YAxis tickLine={false} stroke="#94a3b8" width={60} tick={{ fontSize: '10px' }} tickFormatter={(val) => `S/. ${val}`}>
                    <Label value="Costo (S/.)" angle={-90} position="insideLeft" offset={-5} style={{ textAnchor: 'middle', fill: '#475569', fontWeight: '800', fontSize: '9px', letterSpacing: '0.05em' }} />
                  </YAxis>
                  <Tooltip
                    cursor={{ fill: '#f1f5f9', opacity: 0.6 }}
                    formatter={(val: any) => [`S/. ${Number(val).toFixed(2)}`, 'Costo Estimado']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="costo" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>
    );
  };

  const renderSolarEnergySection = () => {
    const solarData = energiaPorDiaData
      .filter(d => visibleSolarSeries[d.name] !== false)
      .map(item => {
        const solarKWh = (item.kWh || 0) * FACTOR_GENERACION_SOLAR_DIARIO;
        return {
          name: item.name,
          solarKWh: Number(solarKWh.toFixed(1)),
          consumoTotal: item.kWh
        };
      });

    const totalSolar = solarData.reduce((acc, curr) => acc + curr.solarKWh, 0);

    return (
      <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all duration-300 hover:border-slate-300 font-sans mt-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Sun size={20} className="sm:size-[22px]" />
            </div>
            <div>
              <h2 className="font-bold text-slate-950 text-sm sm:text-base tracking-tight">Potencial de Energía Solar por Día</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Estimación de generación fotovoltaica por día expresada en KiloVatios-Hora (kWh)</p>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Generación Solar Estimada Total</p>
            <p className="mt-1 text-2xl font-black text-emerald-950">
              {totalSolar.toFixed(1)} <span className="text-xs font-bold text-emerald-600">kWh</span>
            </p>
            <p className="mt-1 text-[10px] text-emerald-600">Ahorro verde equivalente en el periodo filtrado</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Cobertura Solar Estimada</p>
            <p className="mt-1 text-2xl font-black text-emerald-950">
              {(FACTOR_GENERACION_SOLAR_DIARIO * 100).toFixed(0)}% <span className="text-xs font-bold text-emerald-600">del consumo</span>
            </p>
            <p className="mt-1 text-[10px] text-emerald-600">Proyección de autogeneración sobre la demanda</p>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 p-2 rounded-2xl bg-slate-100 border border-slate-200/40 scrollbar-none">
          <span className="text-[10px] font-black uppercase text-slate-400 self-center mr-1">Días:</span>
          {seriesKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleSolarDay(key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer shrink-0 ${visibleSolarSeries[key] !== false
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-400'
                }`}
            >
              {key}
            </button>
          ))}
        </div>

        <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-0 sm:border-none scrollbar-thin">
          <div className="h-72 sm:h-80 md:h-[380px] w-[600px] sm:w-full text-xs font-medium text-slate-500 select-none">
            {solarData.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center text-slate-400 font-semibold text-sm">
                Selecciona al menos un día para visualizar los datos del gráfico.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={solarData} margin={{ top: 25, right: 15, left: 10, bottom: 30 }} style={{ outline: 'none', border: 'none' }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} stroke="#94a3b8" dy={8} tick={{ fontSize: '10px', fontWeight: '700', fill: '#475569' }}>
                    <Label value="Días del Periodo" position="insideBottom" offset={-20} style={{ textAnchor: 'middle', fill: '#475569', fontWeight: '800', fontSize: '9px', letterSpacing: '0.05em' }} />
                  </XAxis>
                  <YAxis tickLine={false} stroke="#94a3b8" width={55} tick={{ fontSize: '10px' }}>
                    <Label value="Energía Solar (kWh)" angle={-90} position="insideLeft" offset={-5} style={{ textAnchor: 'middle', fill: '#475569', fontWeight: '800', fontSize: '9px', letterSpacing: '0.05em' }} />
                  </YAxis>
                  <Tooltip
                    cursor={{ fill: '#f1f5f9', opacity: 0.6 }}
                    formatter={(val: any) => [`${Number(val).toFixed(1)} kWh`, 'Energía Solar']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="solarKWh" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>
    );
  };

  interface IDocument {
    _id: string;
    title: string;
    type: string;
    cloudinaryUrl: string;
  }

  // Asumiendo que 'board' es el objeto que recibiste de tu API
  const assignedDocs = board?.assignedDocuments || [];

  // Filtrar documentos que vienen poblados desde el Tablero
  const certificadosMantenimiento = assignedDocs.filter(
    (doc: any) => typeof doc === "object" && doc.type === "MANTENIMIENTO"
  );

  const certificadosOperatividad = assignedDocs.filter(
    (doc: any) => typeof doc === "object" && doc.type === "OPERATIVIDAD"
  );

  const openPdfInNewTab = (url: string, title: string) => {
    if (!url) return;

    // Creamos una nueva ventana
    const newWindow = window.open("", "_blank");

    if (newWindow) {
      // Inyectamos el HTML dinámico con el favicon y el título personalizado
      // TODO: Este es el icono default de PDF => <link rel="icon" type="image/svg+xml" href="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg" />
      newWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${title} - Visor PDF</title>
          
          <!-- Icono de PDF estándar o el favicon de tu app -->
          <link rel="icon" type="image/svg+xml" href="/voltguard.png" />
          
          <style>
            body, html {
              margin: 0;
              padding: 0;
              height: 100%;
              overflow: hidden;
              background-color: #525659;
            }
            iframe {
              width: 100%;
              height: 100%;
              border: none;
            }
          </style>
        </head>
        <body>
          <iframe src="${url}"></iframe>
        </body>
      </html>
    `);
      newWindow.document.close();
    }
  };

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

  const renderPdfSection = (title: string, description: string, documentsList: IDocument[]) => {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-300">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
            <FileImage size={22} />
          </div>
          <div>
            <h2 className="font-bold text-slate-950 text-base tracking-tight">{title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>
        </div>

        {!documentsList || documentsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <FileImage size={32} className="text-slate-300" />
            <p className="mt-2 text-xs font-bold text-slate-500">Sin documentos registrados</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {documentsList.map((doc) => (
              <button
                key={doc._id}
                onClick={() => openPdfInNewTab(doc.cloudinaryUrl, doc.title)} // 👈 Uso exacto del campo de MongoDB
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-xs font-bold text-white transition-all duration-300 hover:bg-[#087fb3] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0797d5]/20 cursor-pointer"
              >
                <FileImage size={15} />
                {doc.title}
              </button>
            ))}
          </div>
        )}
      </section>
    );
  };

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

    const qrUrl = `${window.location.origin}/dashboard/boards/${publicCode}/${board.code}`;

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

        <div className="overflow-hidden rounded-2xl sm:rounded-[26px] bg-white shadow-2xl ring-1 ring-slate-300 font-sans">
          <header className="flex min-h-[100px] sm:min-h-[142px] items-center justify-center gap-3 sm:gap-6 bg-gradient-to-b from-[#D81332] to-[#A50E24] px-4 py-4">
            <AlertTriangle className="h-12 w-12 sm:h-20 sm:w-20 md:h-[90px] md:w-[90px] text-white fill-white stroke-[#C8102E] stroke-[1.5] shrink-0" />
            <h1 className="text-4xl sm:text-6xl md:text-[78px] font-black leading-none tracking-[0.08em] text-white">
              PELIGRO
            </h1>
          </header>

          <div className="bg-slate-900 px-4 sm:px-8 pb-5 pt-4 text-center">
            <h2 className="text-lg sm:text-2xl md:text-[31px] font-extrabold leading-tight tracking-wide text-white">
              RIESGO DE ARCO ELÉCTRICO Y ELECTROCUCIÓN PRESENTE
            </h2>
            <p className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-[14px] font-medium text-slate-400">
              <span>Se requiere EPP de acuerdo a categoría</span>
              <span className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-[11px] sm:text-[12.5px] font-bold tracking-wide text-slate-100">
                NORMA NFPA 70E · 2027
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 bg-slate-50 p-4 sm:p-[26px]">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                <span className="h-[19px] w-[6px] rounded-full bg-[#C8102E] shrink-0"></span>
                <h3 className="text-sm sm:text-[15.5px] font-extrabold tracking-wide text-slate-900">
                  RIESGO DE ARCO ELÉCTRICO
                </h3>
              </div>

              <div className="mt-3 flex flex-col sm:flex-row gap-4 sm:gap-5 items-center sm:items-stretch">
                <div className="grid h-[110px] sm:h-[126px] w-full sm:w-[146px] shrink-0 place-content-center rounded-2xl bg-gradient-to-br from-[#E01234] to-[#9B0C22] text-center p-2">
                  <p className="text-[10px] sm:text-[10.5px] font-bold tracking-[0.12em] text-red-100">CATEGORÍA EPP</p>
                  <p className="-mt-1 text-6xl sm:text-[92px] font-black leading-[1.05] text-white">
                    {nfpa.categoriaRiesgo ?? 1}
                  </p>
                  <span className="mx-auto -mt-1 sm:-mt-2 block h-[4px] w-[60px] sm:w-[78px] rounded-full bg-white/55"></span>
                </div>

                <div className="w-full flex-1 space-y-1">
                  <div className="flex items-baseline justify-between border-b border-slate-100 py-2">
                    <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500">Energía incidente</span>
                    <span className="flex items-baseline gap-1">
                      <span className="text-xl sm:text-[26px] font-extrabold leading-none tracking-tight text-slate-900">
                        {parseValUnit(nfpa.energiaIncidente, "cal/cm²").val}
                      </span>
                      <span className="text-xs sm:text-[13px] font-semibold text-slate-500">
                        {parseValUnit(nfpa.energiaIncidente, "cal/cm²").unit}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between border-b border-slate-100 py-2">
                    <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500">Distancia de arco</span>
                    <span className="flex items-baseline gap-1">
                      <span className="text-xl sm:text-[26px] font-extrabold leading-none tracking-tight text-slate-900">
                        {parseValUnit(nfpa.distanciaArco, "m").val}
                      </span>
                      <span className="text-xs sm:text-[13px] font-semibold text-slate-500">
                        {parseValUnit(nfpa.distanciaArco, "m").unit}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between py-2">
                    <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500">Distancia de trabajo</span>
                    <span className="flex items-baseline gap-1">
                      <span className="text-xl sm:text-[26px] font-extrabold leading-none tracking-tight text-slate-900">
                        {parseValUnit(nfpa.distanciaTrabajo, "cm (18 in)").val}
                      </span>
                      <span className="text-xs sm:text-[13px] font-semibold text-slate-500">
                        {parseValUnit(nfpa.distanciaTrabajo, "cm (18 in)").unit}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                <span className="h-[19px] w-[6px] rounded-full bg-sky-500 shrink-0"></span>
                <h3 className="text-sm sm:text-[15.5px] font-extrabold tracking-wide text-slate-900">
                  RIESGO DE ELECTROCUCIÓN
                </h3>
              </div>

              <div className="mt-3 flex flex-col sm:flex-row gap-4 sm:gap-5 items-center sm:items-stretch">
                <div className="grid h-[110px] sm:h-[126px] w-full sm:w-[146px] shrink-0 place-content-center rounded-2xl bg-gradient-to-br from-slate-800 to-[#0B1220] text-center p-2">
                  <p className="text-[10px] sm:text-[10.5px] font-bold tracking-[0.12em] text-slate-400">TENSIÓN NOMINAL</p>
                  <p className="text-4xl sm:text-[62px] font-black leading-tight tracking-tight text-white">
                    {board.tensionNominal || 380}
                  </p>
                  <p className="-mt-1 text-[11px] sm:text-[12px] font-bold tracking-[0.14em] text-slate-400">VOLTIOS CA</p>
                </div>

                <div className="w-full flex-1 flex flex-col justify-between space-y-2 sm:space-y-0">
                  <div className="flex items-baseline justify-between border-b border-slate-100 py-1.5">
                    <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500">Límite de aproximación</span>
                    <span className="flex items-baseline gap-1">
                      <span className="text-xl sm:text-[26px] font-extrabold leading-none tracking-tight text-slate-900">
                        {parseValUnit(nfpa.limiteAproximacion, "m").val}
                      </span>
                      <span className="text-xs sm:text-[13px] font-semibold text-slate-500">
                        {parseValUnit(nfpa.limiteAproximacion, "m").unit}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between border-b border-slate-100 py-1.5">
                    <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500">Distancia restringida</span>
                    <span className="flex items-baseline gap-1">
                      <span className="text-xl sm:text-[26px] font-extrabold leading-none tracking-tight text-slate-900">
                        {parseValUnit(nfpa.distanciaRestringida, "m").val}
                      </span>
                      <span className="text-xs sm:text-[13px] font-semibold text-slate-500">
                        {parseValUnit(nfpa.distanciaRestringida, "m").unit}
                      </span>
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#F0B429] bg-[#FEF6E0] px-3 py-2">
                    <Hand className="h-5 w-5 shrink-0 text-[#7A4E0B]" />
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.11em] text-[#7A4E0B]">GUANTES DIELÉCTRICOS</p>
                      <p className="text-xs sm:text-[13px] font-semibold text-[#4A3007]">
                        {nfpa.guantesClase || "No especificados"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-[19px] w-[6px] rounded-full bg-[#C8102E] shrink-0"></span>
                  <h3 className="text-sm sm:text-[15.5px] font-extrabold tracking-wide text-slate-900">EPP REQUERIDO</h3>
                </div>
                <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10.5px] sm:text-[11.5px] font-bold text-[#9B0C22]">
                  MÍNIMO {parseValUnit(nfpa.energiaIncidente, "cal/cm²").val !== "-" ? parseValUnit(nfpa.energiaIncidente, "cal/cm²").val + " cal/cm²" : "4 cal/cm²"}
                </span>
              </div>

              <ul className="mt-3 space-y-2">
                {Array.isArray(nfpa.eppRequerido) && nfpa.eppRequerido.length > 0 ? (
                  nfpa.eppRequerido.map((item: string, index: number) => (
                    <li key={index} className="flex items-center gap-2.5">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#FDECEF]">
                        <Shield className="h-3.5 w-3.5 text-[#9B0C22]" />
                      </span>
                      <span className="text-xs sm:text-[13.5px] font-medium leading-tight text-slate-800">{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-400 font-medium">No hay EPP registrado</li>
                )}
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm min-w-0">
              <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                <span className="h-[19px] w-[6px] rounded-full bg-sky-500 shrink-0"></span>
                <h3 className="text-sm sm:text-[15.5px] font-extrabold tracking-wide text-slate-900">
                  ESCANEAR TABLERO
                </h3>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 min-w-0">
                <div className="relative rounded-xl border border-slate-200 bg-white p-2 shrink-0">
                  <QRCode
                    value={qrUrl}
                    size={110}
                    level="H"
                    style={{ height: "110px", width: "110px" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white p-0.5 rounded-md shadow-md border border-slate-100 size-6 flex items-center justify-center">
                      <img src="/voltguard.png" alt="Voltguard" className="object-contain size-full" />
                    </div>
                  </div>
                </div>

                <div className="text-center sm:text-left min-w-0 w-full flex-1">
                  <p className="text-[10px] font-bold tracking-[0.12em] text-slate-500 uppercase">ACCESO RÁPIDO</p>
                  <p className="mt-1 text-xs sm:text-[13.5px] font-medium leading-snug text-slate-800">
                    Datos técnicos, memoria de cálculo y curvas de protección del tablero.
                  </p>

                  <div className="mt-2.5 w-full overflow-hidden">
                    <p className="w-full truncate rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 tracking-tight" title={qrUrl.replace(/^https?:\/\//, "")}>
                      {qrUrl.replace(/^https?:\/\//, "")}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <footer className="flex flex-col md:flex-row min-h-[78px] items-center justify-between gap-4 border-t-[3px] border-[#C8102E] bg-[#0B1220] px-4 sm:px-[26px] py-4 text-center md:text-left">
            <div>
              <p className="text-[9.5px] sm:text-[10.5px] font-bold tracking-[0.16em] text-slate-400">TABLERO</p>
              <p className="text-xl sm:text-[24px] font-black leading-tight text-white uppercase">
                {board?.boardCode || board?.name || "PRUEBA"}
              </p>
            </div>

            <div>
              <p className="text-[9px] sm:text-[9.5px] font-bold tracking-[0.16em] text-slate-400">CREADO POR</p>
              <div className="mt-0.5 flex items-center justify-center gap-2">
                <div className="p-0.5 size-5 sm:size-6 flex items-center justify-center">
                  <img src="/voltguard.png" alt="Voltguard" className="object-contain size-full" />
                </div>
                <span className="text-lg sm:text-[22px] font-extrabold leading-none text-white">Voltguard</span>
              </div>
            </div>

            <div className="md:text-right">
              <p className="text-[9.5px] sm:text-[10.5px] font-bold tracking-[0.16em] text-slate-400">FECHA DE CÁLCULO</p>
              <p className="text-xl sm:text-[24px] font-extrabold leading-tight text-white">
                {board?.createdAt ? new Date(board.createdAt).toLocaleDateString("es-ES") : "21/6/2026"}
              </p>
            </div>
          </footer>
        </div>
      </>
    );
  };

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

      {/* ── HEADER DEL TABLERO (SIEMPRE COMPACTO Y STICKY) ── */}
      <section className="sticky top-0 z-30 rounded-2xl border border-slate-200/80 bg-white/90 shadow-md backdrop-blur-md transition-all duration-300">
        <div className="relative rounded-2xl bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] p-3.5 px-6 text-white transition-all duration-300">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 to-transparent" />
          
          <div className="relative z-10 flex flex-row items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {/* Botón Volver integrado en el Header */}
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30"
                title="Volver"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-black tracking-tight md:text-xl">
                  {board.name}
                </h1>
                <p className="flex items-center gap-1.5 text-xs font-medium text-white/95">
                  <Building2 size={13} />
                  {companyName}
                </p>
              </div>
            </div>

            {/* Código del Tablero */}
            <div className="shrink-0 rounded-2xl border border-white/10 bg-white/15 px-3.5 py-1.5 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Código</p>
              <p className="text-sm font-black tracking-tight">
                {value(board.boardCode)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── GRILLA DE DETALLES (UBICACIÓN, TIPO, SISTEMA, ESTADO) ── */}
      <div className="grid grid-cols-2 gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-4">
        {[
          { l: "Ubicación", v: board.location, icon: MapPin, textCls: "text-slate-800", iconCls: "text-[#0797d5]" },
          { l: "Tipo", v: board.type, icon: Info, textCls: "text-slate-800", iconCls: "text-[#0797d5]" },
          { l: "Sistema", v: board.sistema, icon: Zap, textCls: "text-slate-800", iconCls: "text-[#0797d5]" },
          { l: "Estado", v: board.estadoGeneral, icon: CheckCircle2, textCls: "text-slate-800", iconCls: "text-[#3aaa35]" }
        ].map((item, i) => {
          const CardIcon = item.icon;
          return (
            <div key={i} className="rounded-2xl border border-transparent bg-slate-50/70 p-4 transition-colors hover:border-slate-200/50">
              <CardIcon className={item.iconCls} size={20} />
              <p className="mt-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.l}</p>
              <p className={`mt-0.5 truncate text-xs font-bold sm:text-sm ${item.textCls}`}>{value(item.v)}</p>
            </div>
          );
        })}
      </div>

        {/* ── PLAN EMPRESARIAL: ETIQUETADO DE SEGURIDAD (NFPA 70E) ── */}
        {isEmpresarial && board?.nfpa && (
          renderNfpaSection()
        )}

        {/* ── PLAN EMPRESARIAL: ANALÍTICA DE CONSUMO, REACTIVA Y DEMANDA ── */}
        {isEmpresarial && rawChartData.length > 0 && (
          <>
            {renderDemandSection()}
            {renderReactivePowerSection()}
            {renderCombinedDemandAndReactiveSection()}
            {renderEnergyBarSection()}
            {renderCarbonEmissionsSection()}
            {renderEnergyCostSection()}
            {renderSolarEnergySection()}
          </>
        )}

        {/* ── PLAN BÁSICO / BÁSICO COMÚN A TODOS ── */}
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

        {/* ── PLAN BÁSICO: LEYENDA Y CIRCUITION ── */}
        {board.circuits && board.circuits.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-bold text-slate-950 text-base">Leyenda de circuitos</h2>

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
          </div>
        )}

        {/* ── PLAN EMPRESARIAL: MEDICIONES DE POZO A TIERRA / AISLAMIENTO (SPAT) ── */}
        {isEmpresarial && board.insulationMeasurements && board.insulationMeasurements.length > 0 && (
          renderInsulationMeasurements()
        )}

        {/* ── IMÁGENES DEL TABLERO ── */}
        {board.images?.tablero && board.images.tablero.length > 0 && (
          renderImageSection("Imágenes del tablero", "Fotografías generales del tablero eléctrico", board.images.tablero)
        )}

        {/* ── PLAN INTERMEDIO Y EMPRESARIAL: DIAGRAMA UNIFILAR ── */}
        {isIntermedioOrSuperior && board.images?.unifilar && board.images.unifilar.length > 0 && (
          renderImageSection("Diagrama unifilar", "Imágenes del diagrama unifilar registrado", board.images.unifilar)
        )}

        {/* ── PLAN EMPRESARIAL: INSPECCIÓN TERMOGRÁFICA (NFPA 70B) ── */}
        {isEmpresarial && board.images?.termografia && board.images.termografia.length > 0 && (
          renderImageSection("Termografía", "Imágenes termográficas asociadas al tablero", board.images.termografia)
        )}

        {/* ── PLAN INTERMEDIO Y EMPRESARIAL: CERTIFICADOS Y MANTENIMIENTO ── */}
        {isIntermedioOrSuperior && (
          <>
            {
              renderPdfSection(
                "Certificados de mantenimiento",
                "Documentos PDF asignados de mantenimiento técnico",
                certificadosMantenimiento
              )}

            {
              renderPdfSection(
                "Certificados de operatividad",
                "Documentos PDF asignados del nivel de operatividad estructural",
                certificadosOperatividad
              )}
          </>
        )}

      </section>

      {/* MODAL PARA VISTA PREVIA DE IMAGEN */}
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