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
  Hand,
  Info,
  Loader2,
  MapPin,
  ReceiptText,
  Shield,
  UploadCloud,
  X,
  Zap
} from "lucide-react";
import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { useNavigate, useParams } from "react-router-dom";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { ImportThermographyModal } from "../../../components/dashboard/modals/ImportThermographyModal";
import { ThermographyViewer } from "../../../components/dashboard/sections/ThermographyViewer";
import { uploadReceiptBill } from "../../../services/bill.service";
import { getBoardByCode } from "../../../services/board.service";
import { getDemandChartData, uploadMetrelCsv } from "../../../services/measurement.service";
import { getIticEvents, uploadIticCsv, type VoltageEventItem } from "../../../services/voltageEvent.service";
import { useAuth } from "../../../shared/hooks/useAuth";
import type { BoardResponseDTO } from "../../../shared/types/BoardProps";
import { generateNfpaPDF } from "../../../shared/utils/generateNfpaPDF";

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
  // const { auth } = useAuth();
  // const userPlan = auth?.plan || "basico";
  // const isSuperAdmin = auth?.role === "SUPERADMIN";

  // const isIntermedioOrSuperior = isSuperAdmin || ["intermedio", "empresarial"].includes(userPlan);
  // const isEmpresarial = isSuperAdmin || userPlan === "empresarial";

  const { auth } = useAuth();
  const rawRole = auth?.role || "USER";
  const rawPlan = auth?.plan || "basico";

  // 1. Determinar el rol efectivo considerando la excepción del plan
  const effectiveRole = rawRole === "SUPERADMIN"
    ? "SUPERADMIN"
    : rawPlan === "empresarial"
      ? "ADMIN"
      : "USER";

  // 2. Control de banderas para permisos y vistas
  const isSuperAdmin = effectiveRole === "SUPERADMIN";
  // const isAdmin = effectiveRole === "ADMIN";
  // const isUser = effectiveRole === "USER";

  // Permisos de Acciones de Gestión (ej. importar CSVs, subir archivos, etc.)
  // const canManage = isSuperAdmin || isUser;

  // Acceso a visualizar más de 1 registro (múltiples tarjetas / historial amplio)
  // const canViewMultipleRecords = isSuperAdmin || isAdmin;

  // Acceso a visualizar secciones según plan/rol
  const isEmpresarial = isSuperAdmin || rawPlan === "empresarial";



  const navigate = useNavigate();
  const { publicCode, code } = useParams();

  const [board, setBoard] = useState<BoardResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [rawChartData, setRawChartData] = useState<any[]>([]);
  const [seriesKeys, setSeriesKeys] = useState<string[]>([]);
  const [selectedReactiveDay, setSelectedReactiveDay] = useState<string | null>(null);
  // ── ESTADOS PARA DISTORSIÓN ARMÓNICA ──
  const [selectedThdUDay, setSelectedThdUDay] = useState<string | null>(null);
  // const [selectedThdIDay, setSelectedThdIDay] = useState<string | null>(null);

  // Dentro de tu componente BoardDetailPage:
  const [showThermographyModal, setShowThermographyModal] = useState(false);
  const [thermographyReloadKey, setThermographyReloadKey] = useState(0);

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
  // const [visibleSolarSeries, setVisibleSolarSeries] = useState<{ [key: string]: boolean }>({});
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
          const valThdV = typeof punto === 'object' ? (punto?.thd_v ?? 0) : 0;
          const valThdI = typeof punto === 'object' ? (punto?.thd_i ?? 0) : 0;

          row[labelCorto] = valP;
          row[`inductiva_${labelCorto}`] = valInd;
          row[`capacitiva_${labelCorto}`] = valCap;
          row[`thd_v_${labelCorto}`] = valThdV;
          row[`thd_i_${labelCorto}`] = valThdI;

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

      // const barrasProcesadas = sortedCleanKeys.map(key => {
      //   const totalPuntos = formattedData.filter(d => d[key] !== undefined && d[key] !== null).length;
      //   const totalPromedioKw = totalPuntos > 0 ? (energiaAcumuladaAux[key] || 0) / totalPuntos : 0;
      //   const totalKWh = totalPromedioKw * 24;

      //   return {
      //     name: key,
      //     kWh: Math.round(totalKWh * 10) / 10
      //   };
      // });

      // En fetchChartData dentro de BoardDetailPage.tsx:
      const barrasProcesadas = sortedCleanKeys.map((key) => {
        // Filtrar las lecturas válidas del día
        const puntosValidos = formattedData.filter(
          (d) => d[key] !== undefined && d[key] !== null
        );

        let sumaKwFP = 0;
        let countFP = 0;
        let sumaKwHP = 0;
        let countHP = 0;

        puntosValidos.forEach((d) => {
          const val = Number(d[key]) || 0;
          const hora = d.horaMinuto; // Ej: "18:25"
          if (!hora) return;

          const [h] = hora.split(":").map(Number);
          // Hora Punta (HP): 18:00 a 23:00 hrs (18, 19, 20, 21, 22)
          const esHP = h >= 18 && h < 23;

          if (esHP) {
            sumaKwHP += val;
            countHP++;
          } else {
            sumaKwFP += val;
            countFP++;
          }
        });

        // Cada punto equivale a un intervalo de 5 minutos (1/12 de hora)
        const kwhHP = countHP > 0 ? (sumaKwHP / countHP) * 5 : 0;   // 5 horas de HP
        const kwhFP = countFP > 0 ? (sumaKwFP / countFP) * 19 : 0; // 19 horas de FP
        const totalKWh = kwhHP + kwhFP;

        return {
          name: key,
          kWh: Math.round(totalKWh * 10) / 10,
          kwhHP: Math.round(kwhHP * 10) / 10,
          kwhFP: Math.round(kwhFP * 10) / 10,
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
          visibility[k] = prev[k] !== undefined ? prev[k] : false;
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
      // setVisibleSolarSeries(prev => Object.keys(prev).length ? prev : { ...initialVisibility });
    } catch (err) {
      console.error("Error cargando curvas de demanda en Recharts:", err);
    }
  };

  const getSistemaCompleto = (board: BoardResponseDTO) => {
    if (!board) return "N/D";

    const sistema = board.sistema || "TRIFÁSICO";
    const tension = board.tensionNominal ? `${board.tensionNominal}VAC` : "220VAC";
    const fases = board.numeroFases || 3;
    const neutro = board.incluyeNeutro ? " + NEUTRO" : "";

    return `${sistema} ${tension} DELTA (${fases} HILOS${neutro} + TIERRA)`;
  };

  const [iticEvents, setIticEvents] = useState<VoltageEventItem[]>([]);
  const [uploadingItic, setUploadingItic] = useState(false);

  // Función para consultar los eventos del tablero
  const fetchIticData = async (boardId: string) => {
    try {
      const res = await getIticEvents(boardId);
      if (res?.events) {
        setIticEvents(res.events);
      }
    } catch (err) {
      console.error("Error al cargar eventos ITIC:", err);
    }
  };

  // Disparar la consulta al cargar el tablero
  useEffect(() => {
    if (board?._id) {
      fetchIticData(board._id);
    }
  }, [board?._id]);

  // Función para convertir duraciones de Metrel ("18 ms", "1.958 s", "11 h", "24 c") a segundos reales
  // const parseMetrelDuration = (raw: any): number => {
  //   if (typeof raw === "number") return raw > 0 ? raw : 0.00001;
  //   const str = String(raw || "").trim().toLowerCase();

  //   if (!str || str === "0" || str.includes("< 10 us") || str.includes("instant")) {
  //     return 0.00001; // 10 µs exactos (extremo izquierdo de Metrel)
  //   }

  //   // Horas ("11 h 20 min" o "2 h")
  //   if (str.includes("h")) {
  //     const parts = str.split("h");
  //     const hours = parseFloat(parts[0]) || 0;
  //     const mins = parseFloat(parts[1]?.replace("min", "")) || 0;
  //     return hours * 3600 + mins * 60;
  //   }

  //   // Minutos ("15 min")
  //   if (str.includes("min") || str.includes("m ")) {
  //     return (parseFloat(str) || 0) * 60;
  //   }

  //   // Milisegundos ("651 ms", "18 ms")
  //   if (str.includes("ms")) {
  //     return (parseFloat(str) || 0) / 1000;
  //   }

  //   // Ciclos a 50Hz/60Hz ("24 c" -> ~0.48 s)
  //   if (str.includes("c")) {
  //     return (parseFloat(str) || 0) * 0.02;
  //   }

  //   // Segundos simples ("1.958 s", "1.958")
  //   const sec = parseFloat(str.replace("s", ""));
  //   return !isNaN(sec) && sec > 0 ? sec : 0.00001;
  // };

  // Handler para subir el archivo CSV de la Curva ITIC
  const handleIticFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !board?._id) return;

    setUploadingItic(true);
    try {
      await uploadIticCsv(board._id, file);
      alert("¡Eventos ITIC cargados y procesados correctamente!");
      await fetchIticData(board._id);
    } catch (err: any) {
      alert("Error al importar eventos ITIC: " + (err.response?.data?.error || err.message));
    } finally {
      setUploadingItic(false);
      e.target.value = "";
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

  // const toggleSolarDay = (key: string) => {
  //   setVisibleSolarSeries(prev => ({ ...prev, [key]: !prev[key] }));
  // };

  const handleThermographySuccess = () => {
    // Dispara la recarga de datos en el visor
    setThermographyReloadKey((prev) => prev + 1);
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

  // const renderCombinedDemandAndReactiveSection = () => {
  //   if (rawChartData.length === 0) return null;

  //   const activeDay = selectedReactiveDay || seriesKeys[0] || "";

  //   return (
  //     <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm font-sans mt-6">
  //       <div className="mb-5 border-b border-slate-100 pb-4">
  //         <div className="flex items-center gap-3">
  //           <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600">
  //             <Layers size={22} />
  //           </div>
  //           <div>
  //             <h2 className="font-bold text-slate-950 text-base">
  //               Cuadro Integrado: Demanda (kW) y Potencia Reactiva (kvar)
  //             </h2>
  //             <p className="text-xs text-slate-500 mt-0.5">
  //               Superposición de curva de potencia activa y potencia reactiva capacitiva e inductiva por día
  //             </p>
  //           </div>
  //         </div>
  //       </div>

  //       <div className="space-y-3 mb-5">
  //         <div className="flex gap-1.5 overflow-x-auto pb-1 p-2 rounded-2xl bg-slate-100/80 border border-slate-200/40 scrollbar-thin">
  //           <span className="text-[10px] font-black uppercase text-slate-400 self-center mr-2 shrink-0">
  //             SELECCIONAR DÍA:
  //           </span>
  //           {seriesKeys.map((key) => {
  //             const isSelected = activeDay === key;
  //             return (
  //               <button
  //                 key={key}
  //                 type="button"
  //                 onClick={() => setSelectedReactiveDay(key)}
  //                 className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all border cursor-pointer shrink-0 ${isSelected
  //                   ? 'bg-slate-900 border-slate-900 text-white shadow-md scale-105'
  //                   : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
  //                   }`}
  //               >
  //                 {key}
  //               </button>
  //             );
  //           })}
  //         </div>

  //         <div className="flex flex-wrap gap-2 p-1.5 bg-slate-50 rounded-xl border border-slate-100">
  //           <button
  //             type="button"
  //             onClick={() => toggleDemandDay(activeDay)}
  //             className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${visibleDemandSeries[activeDay] !== false
  //               ? 'bg-orange-600 text-white border-orange-600'
  //               : 'bg-white text-slate-600 border-slate-200'
  //               }`}
  //           >
  //             <span className={`size-2.5 rounded-full inline-block ${visibleDemandSeries[activeDay] !== false ? 'bg-white' : 'bg-orange-600'}`}></span>
  //             Demanda Activa ({activeDay}) [kW]
  //           </button>

  //           <button
  //             type="button"
  //             onClick={() => toggleReactiveDay("kvar_capacitivo")}
  //             className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${visibleReactiveSeries["kvar_capacitivo"] !== false ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-200'
  //               }`}
  //           >
  //             <span className={`size-2.5 rounded-full inline-block ${visibleReactiveSeries["kvar_capacitivo"] !== false ? 'bg-white' : 'bg-red-600'}`}></span>
  //             kvar c (Capacitiva)
  //           </button>

  //           <button
  //             type="button"
  //             onClick={() => toggleReactiveDay("kvar_inductivo")}
  //             className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${visibleReactiveSeries["kvar_inductivo"] !== false ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-white text-slate-600 border-slate-200'
  //               }`}
  //           >
  //             <span className={`size-2.5 rounded-full inline-block ${visibleReactiveSeries["kvar_inductivo"] !== false ? 'bg-white' : 'bg-indigo-700'}`}></span>
  //             kvar i (Inductiva)
  //           </button>
  //         </div>
  //       </div>

  //       <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-0">
  //         <div className="h-72 sm:h-80 md:h-[400px] w-[850px] sm:w-full text-xs select-none">
  //           <ResponsiveContainer width="100%" height="100%">
  //             <LineChart data={rawChartData} margin={{ top: 15, right: 25, left: 10, bottom: 25 }}>
  //               <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

  //               <XAxis
  //                 dataKey="horaMinuto"
  //                 tickLine={false}
  //                 interval={11}
  //                 stroke="#94a3b8"
  //                 dy={5}
  //                 tick={{ fontSize: '9px', fontWeight: '600', fill: '#64748b' }}
  //               >
  //                 <Label
  //                   value="Hora del Día"
  //                   position="insideBottom"
  //                   offset={-15}
  //                   style={{ textAnchor: 'middle', fill: '#475569', fontWeight: '800', fontSize: '9px', letterSpacing: '0.05em' }}
  //                 />
  //               </XAxis>

  //               <YAxis yAxisId="left" tickLine={false} stroke="#f97316" width={45} domain={[0, 'auto']}>
  //                 <Label value="Demanda [kW]" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#f97316', fontWeight: '800', fontSize: '9px' }} />
  //               </YAxis>

  //               <YAxis yAxisId="right" orientation="right" tickLine={false} stroke="#dc2626" width={45} domain={[0, 'auto']}>
  //                 <Label value="Reactiva [kvar]" angle={90} position="insideRight" style={{ textAnchor: 'middle', fill: '#dc2626', fontWeight: '800', fontSize: '9px' }} />
  //               </YAxis>

  //               <Tooltip content={<CustomTooltip />} shared={true} />

  //               {visibleDemandSeries[activeDay] !== false && activeDay && (
  //                 <Line
  //                   yAxisId="left"
  //                   type="monotone"
  //                   name={`Demanda kW - ${activeDay}`}
  //                   dataKey={activeDay}
  //                   stroke="#f97316"
  //                   strokeWidth={2.5}
  //                   dot={false}
  //                   connectNulls={true}
  //                   animationDuration={150}
  //                 />
  //               )}

  //               {visibleReactiveSeries["kvar_capacitivo"] !== false && activeDay && (
  //                 <Line
  //                   yAxisId="right"
  //                   type="linear"
  //                   name={`Ntotcap+ - ${activeDay}`}
  //                   dataKey={`capacitiva_${activeDay}`}
  //                   stroke={REACTIVE_COLOR_CAPACITIVE}
  //                   strokeWidth={1.5}
  //                   dot={false}
  //                   connectNulls={true}
  //                   isAnimationActive={false}
  //                 />
  //               )}

  //               {visibleReactiveSeries["kvar_inductivo"] !== false && activeDay && (
  //                 <Line
  //                   yAxisId="right"
  //                   type="linear"
  //                   name={`Ntotind+ - ${activeDay}`}
  //                   dataKey={`inductiva_${activeDay}`}
  //                   stroke={REACTIVE_COLOR_INDUCTIVE}
  //                   strokeWidth={1.5}
  //                   dot={false}
  //                   connectNulls={true}
  //                   isAnimationActive={false}
  //                 />
  //               )}
  //             </LineChart>
  //           </ResponsiveContainer>
  //         </div>
  //       </div>
  //     </section>
  //   );
  // };

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

  // const TARIFO_KWH_PEN = 0.45;
  // const FACTOR_GENERACION_SOLAR_DIARIO = 0.15;

  // ── ESTADOS PARA RECIBO Y COSTO DE ENERGÍA (HP / FP) ──
  const [rates, setRates] = useState<{ hp: number; fp: number }>({
    hp: 0.3095, // Tarifas iniciales del recibo de Luz del Sur[cite: 1, 2]
    fp: 0.2616, //[cite: 1, 2]
  });
  const [isUploadingBill, setIsUploadingBill] = useState(false);
  const billFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Sincronizar tarifas si el tablero ya las tiene guardadas en MongoDB
  useEffect(() => {
    if ((board as any)?.energyRates?.tarifaHP && (board as any)?.energyRates?.tarifaFP) {
      setRates({
        hp: (board as any).energyRates.tarifaHP,
        fp: (board as any).energyRates.tarifaFP,
      });
    }
  }, [board]);

  const handleBillUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !board?._id) return;

    try {
      setIsUploadingBill(true);
      const res = await uploadReceiptBill(board._id, file);
      if (res?.data) {
        setRates({
          hp: Number(res.data.tarifaHP) || 0.3095, //[cite: 1, 2]
          fp: Number(res.data.tarifaFP) || 0.2616, //[cite: 1, 2]
        });
        alert("¡Tarifas extraídas y actualizadas correctamente con OpenAI!");
      }
    } catch (err: any) {
      alert("Error al procesar recibo: " + (err.response?.data?.error || err.message));
    } finally {
      setIsUploadingBill(false);
      if (billFileInputRef.current) billFileInputRef.current.value = "";
    }
  };

  const renderEnergyCostSection = () => {
    // Calculamos el desglose de costos en FP y HP (70% FP y 30% HP si no vienen disgregados de Metrel)
    const costoData = energiaPorDiaData
      .filter(d => visibleCostSeries[d.name] !== false)
      .map(item => {
        const kwhFP = item.kwhFP ?? (item.kWh || 0) * 0.70;
        const kwhHP = item.kwhHP ?? (item.kWh || 0) * 0.30;

        const costoFP = kwhFP * rates.fp;
        const costoHP = kwhHP * rates.hp;
        const costoTotal = costoFP + costoHP;

        return {
          name: item.name,
          costoFP: Number(costoFP.toFixed(2)),
          costoHP: Number(costoHP.toFixed(2)),
          costoTotal: Number(costoTotal.toFixed(2)),
          kWh: item.kWh || 0,
        };
      });

    const totalCostoPeriodo = costoData.reduce((acc, curr) => acc + curr.costoTotal, 0);
    const promedioCostoDiario = costoData.length > 0 ? totalCostoPeriodo / costoData.length : 0;

    return (
      <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all duration-300 hover:border-slate-300 font-sans mt-6">
        {/* Input invisible para adjuntar recibo */}
        <input
          type="file"
          ref={billFileInputRef}
          onChange={handleBillUpload}
          accept="image/*,application/pdf"
          className="hidden"
          disabled={isUploadingBill}
        />

        {/* Header con botón para adjuntar recibo */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-600">
              <Coins size={20} className="sm:size-[22px]" />
            </div>
            <div>
              <h2 className="font-bold text-slate-950 text-sm sm:text-base tracking-tight">
                Costo de Energía Estimado (HP / FP)
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Tarifas aplicadas: HP = <strong className="text-slate-800">S/. {rates.hp.toFixed(4)}</strong> | FP = <strong className="text-slate-800">S/. {rates.fp.toFixed(4)}</strong> por kWh
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isUploadingBill}
            onClick={() => billFileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isUploadingBill ? (
              <>
                <Loader2 size={16} className="animate-spin text-amber-400" />
                <span>Extrayendo con IA...</span>
              </>
            ) : (
              <>
                <ReceiptText size={16} className="text-amber-400" />
                <span>Adjuntar Recibo de Luz</span>
              </>
            )}
          </button>
        </div>

        {/* Tarjetas Resumen */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Costo Total del Periodo</p>
            <p className="mt-1 text-2xl font-black text-amber-950">
              S/. {totalCostoPeriodo.toFixed(2)}
            </p>
            <p className="mt-1 text-[10px] text-amber-600">Suma combinada de Hora Punta y Fuera de Punta</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Gasto Diario Promedio</p>
            <p className="mt-1 text-2xl font-black text-amber-950">
              S/. {promedioCostoDiario.toFixed(2)} <span className="text-xs font-bold text-amber-600">/ día</span>
            </p>
            <p className="mt-1 text-[10px] text-amber-600">Promedio sobre días seleccionados</p>
          </div>
        </div>

        {/* Selector de Días */}
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

        {/* Gráfico Stacked Bar Chart */}
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
                    formatter={(val: any, name: any) => [
                      `S/. ${Number(val).toFixed(2)}`,
                      name === "costoHP" ? "Hora Punta (HP)" : "Fuera de Punta (FP)"
                    ]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 600 }}
                    formatter={(value) => (value === "costoHP" ? "Hora Punta (HP)" : "Fuera de Punta (FP)")}
                  />

                  {/* PARTE INFERIOR: Fuera de Punta (FP) - Tono azul/púrpura de la imagen de referencia */}
                  <Bar
                    dataKey="costoFP"
                    stackId="costo"
                    fill="#7c7bb5"
                    maxBarSize={48}
                  />

                  {/* PARTE SUPERIOR: Hora Punta (HP) - Tono verde con esquinas superiores redondeadas */}
                  <Bar
                    dataKey="costoHP"
                    stackId="costo"
                    fill="#68b48f"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>
    );
  };

  // const renderSolarEnergySection = () => {
  //   const solarData = energiaPorDiaData
  //     .filter(d => visibleSolarSeries[d.name] !== false)
  //     .map(item => {
  //       const solarKWh = (item.kWh || 0) * FACTOR_GENERACION_SOLAR_DIARIO;
  //       return {
  //         name: item.name,
  //         solarKWh: Number(solarKWh.toFixed(1)),
  //         consumoTotal: item.kWh
  //       };
  //     });

  //   const totalSolar = solarData.reduce((acc, curr) => acc + curr.solarKWh, 0);

  //   return (
  //     <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all duration-300 hover:border-slate-300 font-sans mt-6">
  //       <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
  //         <div className="flex items-center gap-3">
  //           <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-600">
  //             <Sun size={20} className="sm:size-[22px]" />
  //           </div>
  //           <div>
  //             <h2 className="font-bold text-slate-950 text-sm sm:text-base tracking-tight">Potencial de Energía Solar por Día</h2>
  //             <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Estimación de generación fotovoltaica por día expresada en KiloVatios-Hora (kWh)</p>
  //           </div>
  //         </div>
  //       </div>

  //       <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
  //         <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
  //           <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Generación Solar Estimada Total</p>
  //           <p className="mt-1 text-2xl font-black text-emerald-950">
  //             {totalSolar.toFixed(1)} <span className="text-xs font-bold text-emerald-600">kWh</span>
  //           </p>
  //           <p className="mt-1 text-[10px] text-emerald-600">Ahorro verde equivalente en el periodo filtrado</p>
  //         </div>

  //         <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
  //           <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Cobertura Solar Estimada</p>
  //           <p className="mt-1 text-2xl font-black text-emerald-950">
  //             {(FACTOR_GENERACION_SOLAR_DIARIO * 100).toFixed(0)}% <span className="text-xs font-bold text-emerald-600">del consumo</span>
  //           </p>
  //           <p className="mt-1 text-[10px] text-emerald-600">Proyección de autogeneración sobre la demanda</p>
  //         </div>
  //       </div>

  //       <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 p-2 rounded-2xl bg-slate-100 border border-slate-200/40 scrollbar-none">
  //         <span className="text-[10px] font-black uppercase text-slate-400 self-center mr-1">Días:</span>
  //         {seriesKeys.map((key) => (
  //           <button
  //             key={key}
  //             type="button"
  //             onClick={() => toggleSolarDay(key)}
  //             className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer shrink-0 ${visibleSolarSeries[key] !== false
  //               ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
  //               : 'bg-white border-slate-200 text-slate-400'
  //               }`}
  //           >
  //             {key}
  //           </button>
  //         ))}
  //       </div>

  //       <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-0 sm:border-none scrollbar-thin">
  //         <div className="h-72 sm:h-80 md:h-[380px] w-[600px] sm:w-full text-xs font-medium text-slate-500 select-none">
  //           {solarData.length === 0 ? (
  //             <div className="flex h-full w-full items-center justify-center text-slate-400 font-semibold text-sm">
  //               Selecciona al menos un día para visualizar los datos del gráfico.
  //             </div>
  //           ) : (
  //             <ResponsiveContainer width="100%" height="100%">
  //               <BarChart data={solarData} margin={{ top: 25, right: 15, left: 10, bottom: 30 }} style={{ outline: 'none', border: 'none' }}>
  //                 <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
  //                 <XAxis dataKey="name" tickLine={false} stroke="#94a3b8" dy={8} tick={{ fontSize: '10px', fontWeight: '700', fill: '#475569' }}>
  //                   <Label value="Días del Periodo" position="insideBottom" offset={-20} style={{ textAnchor: 'middle', fill: '#475569', fontWeight: '800', fontSize: '9px', letterSpacing: '0.05em' }} />
  //                 </XAxis>
  //                 <YAxis tickLine={false} stroke="#94a3b8" width={55} tick={{ fontSize: '10px' }}>
  //                   <Label value="Energía Solar (kWh)" angle={-90} position="insideLeft" offset={-5} style={{ textAnchor: 'middle', fill: '#475569', fontWeight: '800', fontSize: '9px', letterSpacing: '0.05em' }} />
  //                 </YAxis>
  //                 <Tooltip
  //                   cursor={{ fill: '#f1f5f9', opacity: 0.6 }}
  //                   formatter={(val: any) => [`${Number(val).toFixed(1)} kWh`, 'Energía Solar']}
  //                   contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
  //                 />
  //                 <Bar dataKey="solarKWh" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={50} />
  //               </BarChart>
  //             </ResponsiveContainer>
  //           )}
  //         </div>
  //       </div>
  //     </section>
  //   );
  // };

  const renderThdVoltageSection = () => {
    if (rawChartData.length === 0) return null;

    const activeDay = selectedThdUDay || seriesKeys[0] || "";

    let maxThdV = 0;
    let sumThdV = 0;
    let countThdV = 0;
    let horaPicoThdV = "--:--";

    rawChartData.forEach(row => {
      const val = Number(row[`thd_v_${activeDay}`] || 0);
      if (val > 0) {
        if (val > maxThdV) {
          maxThdV = val;
          horaPicoThdV = row.horaMinuto;
        }
        sumThdV += val;
        countThdV++;
      }
    });

    const avgThdV = countThdV > 0 ? sumThdV / countThdV : 0;
    const cumpleNorma = maxThdV <= 5.0;

    const VoltageTooltip = ({ active, label, payload }: any) => {
      if (active && payload && payload.length) {
        const val = payload[0]?.value ?? 0;
        return (
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xl font-sans text-xs min-w-[210px]">
            <div className="mb-2 border-b border-slate-100 pb-1.5 flex justify-between items-center">
              <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Distorsión THD-U</span>
              <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">{label} hrs</span>
            </div>
            <p className="text-[11px] font-bold text-slate-700 mb-2">
              Día: <span className="text-slate-900">{activeDay}</span>
            </p>
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1.5 text-purple-700 font-bold">
                <span className="size-2 rounded-full bg-purple-600 inline-block"></span>
                THD Tensión:
              </span>
              <span className={`font-black tabular-nums text-sm ${val > 5.0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {Number(val).toFixed(2)}%
              </span>
            </div>
            <div className="mt-2 border-t border-slate-100 pt-1.5 text-[9px] flex justify-between text-slate-400">
              <span>Límite IEEE 519: <strong>5.0%</strong></span>
              <span className={val <= 5.0 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                {val <= 5.0 ? "Conforme" : "No conforme"}
              </span>
            </div>
          </div>
        );
      }
      return null;
    };

    return (
      <section className="rounded-2xl sm:rounded-3xl border-2 border-purple-200/70 bg-white p-4 sm:p-6 shadow-sm font-sans mt-6 transition-all">
        {/* Header con Badge de Estado */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-200">
              <Shield size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-slate-950 text-base sm:text-lg tracking-tight">
                  Calidad de Tensión: Distorsión Armónica Total (THD-U)
                </h2>
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-black tracking-wide text-purple-800 uppercase">
                  Parámetro Crítico
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Supervisión de salud de la red bajo estándar <strong>IEEE 519 / CNE</strong> (Límite estricto admisible: <strong>5.00%</strong>)
              </p>
            </div>
          </div>

          <div>
            <span className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black border ${cumpleNorma
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
              }`}>
              <span className={`size-2 rounded-full ${cumpleNorma ? 'bg-emerald-500' : 'bg-rose-600'}`}></span>
              {cumpleNorma ? 'CONFORME CON IEEE 519' : 'SUPERA LÍMITE PERMITIDO (>5%)'}
            </span>
          </div>
        </div>

        {/* Tarjetas KPI de THD-U */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-purple-700">Pico Máximo Registrado</p>
            <p className={`mt-1 text-3xl font-black ${maxThdV > 5.0 ? 'text-rose-600' : 'text-purple-950'}`}>
              {maxThdV.toFixed(2)} <span className="text-sm font-bold text-purple-600">%</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              A las <strong className="text-slate-700">{horaPicoThdV} hrs</strong> en el día filtrado
            </p>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-purple-700">Promedio THD-U Diario</p>
            <p className="mt-1 text-3xl font-black text-purple-950">
              {avgThdV.toFixed(2)} <span className="text-sm font-bold text-purple-600">%</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-500">Tensión en barras principales</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Límite Normativo Máximo</p>
            <p className="mt-1 text-3xl font-black text-slate-800">
              5.00 <span className="text-sm font-bold text-slate-400">%</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-500">Redes de baja tensión (V ≤ 1 kV)</p>
          </div>
        </div>

        {/* Selector de Días */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5 p-2 rounded-2xl bg-slate-100/80 border border-slate-200/40 scrollbar-thin">
          <span className="text-[10px] font-black uppercase text-slate-400 self-center mr-2 shrink-0">
            SELECCIONAR DÍA:
          </span>
          {seriesKeys.map((key) => {
            const isSelected = activeDay === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedThdUDay(key)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all border cursor-pointer shrink-0 ${isSelected
                  ? 'bg-purple-700 border-purple-700 text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {key}
              </button>
            );
          })}
        </div>

        {/* Gráfico THD-U */}
        <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-0">
          <div className="h-72 sm:h-80 md:h-[360px] w-[850px] sm:w-full text-xs select-none">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rawChartData} margin={{ top: 20, right: 25, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="horaMinuto"
                  tickLine={false}
                  stroke="#94a3b8"
                  interval={11}
                  dy={5}
                  tick={{ fontSize: '9px', fontWeight: '600', fill: '#64748b' }}
                >
                  <Label value="Hora del Día" position="insideBottom" offset={-15} style={{ textAnchor: 'middle', fill: '#475569', fontWeight: '800', fontSize: '9px' }} />
                </XAxis>
                <YAxis
                  tickLine={false}
                  stroke="#94a3b8"
                  width={45}
                  domain={[0, (dataMax: number) => Math.max(6, Math.ceil(dataMax + 1))]}
                  tickFormatter={(val) => `${val}%`}
                >
                  <Label value="THD-U (%)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#7e22ce', fontWeight: '800', fontSize: '9px' }} />
                </YAxis>

                <Tooltip content={<VoltageTooltip />} shared={true} />

                {/* Límite 5% IEEE */}
                <ReferenceLine y={5.0} stroke="#dc2626" strokeDasharray="4 4" strokeWidth={2}>
                  <Label
                    value="LÍMITE MÁXIMO IEEE 519 (5.0%)"
                    position="insideTopRight"
                    fill="#dc2626"
                    style={{ fontSize: '9px', fontWeight: '900' }}
                  />
                </ReferenceLine>

                <Line
                  type="monotone"
                  name={`THD-U - ${activeDay}`}
                  dataKey={`thd_v_${activeDay}`}
                  stroke="#9333ea"
                  strokeWidth={2.5}
                  dot={false}
                  connectNulls={true}
                  animationDuration={150}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    );
  };

  // const renderThdCurrentSection = () => {
  //   if (rawChartData.length === 0) return null;

  //   const activeDay = selectedThdIDay || seriesKeys[0] || "";

  //   let maxThdI = 0;
  //   let sumThdI = 0;
  //   let countThdI = 0;
  //   let horaPicoThdI = "--:--";

  //   rawChartData.forEach(row => {
  //     const val = Number(row[`thd_i_${activeDay}`] || 0);
  //     if (val > 0) {
  //       if (val > maxThdI) {
  //         maxThdI = val;
  //         horaPicoThdI = row.horaMinuto;
  //       }
  //       sumThdI += val;
  //       countThdI++;
  //     }
  //   });

  //   const avgThdI = countThdI > 0 ? sumThdI / countThdI : 0;

  //   const CurrentTooltip = ({ active, label, payload }: any) => {
  //     if (active && payload && payload.length) {
  //       const val = payload[0]?.value ?? 0;
  //       return (
  //         <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xl font-sans text-xs min-w-[210px]">
  //           <div className="mb-2 border-b border-slate-100 pb-1.5 flex justify-between items-center">
  //             <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Distorsión THD-I</span>
  //             <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">{label} hrs</span>
  //           </div>
  //           <p className="text-[11px] font-bold text-slate-700 mb-2">
  //             Día: <span className="text-slate-900">{activeDay}</span>
  //           </p>
  //           <div className="flex items-center justify-between font-semibold">
  //             <span className="flex items-center gap-1.5 text-cyan-700 font-bold">
  //               <span className="size-2 rounded-full bg-cyan-600 inline-block"></span>
  //               THD Corriente:
  //             </span>
  //             <span className="font-black tabular-nums text-sm text-slate-900">
  //               {Number(val).toFixed(2)}%
  //             </span>
  //           </div>
  //           <p className="mt-2 border-t border-slate-100 pt-1.5 text-[9px] text-slate-400">
  //             Generado por cargas no lineales (VFD, UPS, Fuentes)
  //           </p>
  //         </div>
  //       );
  //     }
  //     return null;
  //   };

  //   return (
  //     <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm font-sans mt-6 transition-all hover:border-slate-300">
  //       <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
  //         <div className="flex items-center gap-3">
  //           <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600">
  //             <Activity size={22} />
  //           </div>
  //           <div>
  //             <h2 className="font-bold text-slate-950 text-sm sm:text-base tracking-tight">
  //               Distorsión Armónica de Corriente (THD-I)
  //             </h2>
  //             <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
  //               Nivel de contaminación por inyección armónica de las cargas del tablero
  //             </p>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Tarjetas KPI de THD-I */}
  //       <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
  //         <div className="rounded-2xl border border-cyan-100 bg-cyan-50/40 p-4">
  //           <p className="text-[10px] font-black uppercase tracking-wider text-cyan-700">Pico Máximo THD-I</p>
  //           <p className="mt-1 text-2xl sm:text-3xl font-black text-cyan-950">
  //             {maxThdI.toFixed(2)} <span className="text-xs sm:text-sm font-bold text-cyan-600">%</span>
  //           </p>
  //           <p className="mt-1 text-[11px] text-slate-500">
  //             Registrado a las <strong className="text-slate-700">{horaPicoThdI} hrs</strong>
  //           </p>
  //         </div>

  //         <div className="rounded-2xl border border-cyan-100 bg-cyan-50/40 p-4">
  //           <p className="text-[10px] font-black uppercase tracking-wider text-cyan-700">Promedio THD-I del Periodo</p>
  //           <p className="mt-1 text-2xl sm:text-3xl font-black text-cyan-950">
  //             {avgThdI.toFixed(2)} <span className="text-xs sm:text-sm font-bold text-cyan-600">%</span>
  //           </p>
  //           <p className="mt-1 text-[11px] text-slate-500">Inyección armónica promedio hacia la red</p>
  //         </div>
  //       </div>

  //       {/* Selector de Días */}
  //       <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5 p-2 rounded-2xl bg-slate-100/80 border border-slate-200/40 scrollbar-thin">
  //         <span className="text-[10px] font-black uppercase text-slate-400 self-center mr-2 shrink-0">
  //           SELECCIONAR DÍA:
  //         </span>
  //         {seriesKeys.map((key) => {
  //           const isSelected = activeDay === key;
  //           return (
  //             <button
  //               key={key}
  //               type="button"
  //               onClick={() => setSelectedThdIDay(key)}
  //               className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all border cursor-pointer shrink-0 ${isSelected
  //                 ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
  //                 : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
  //                 }`}
  //             >
  //               {key}
  //             </button>
  //           );
  //         })}
  //       </div>

  //       {/* Gráfico THD-I */}
  //       <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 p-2 sm:p-0">
  //         <div className="h-72 sm:h-80 md:h-[340px] w-[850px] sm:w-full text-xs select-none">
  //           <ResponsiveContainer width="100%" height="100%">
  //             <LineChart data={rawChartData} margin={{ top: 15, right: 25, left: 10, bottom: 25 }}>
  //               <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
  //               <XAxis
  //                 dataKey="horaMinuto"
  //                 tickLine={false}
  //                 stroke="#94a3b8"
  //                 interval={11}
  //                 dy={5}
  //                 tick={{ fontSize: '9px', fontWeight: '600', fill: '#64748b' }}
  //               >
  //                 <Label value="Hora del Día" position="insideBottom" offset={-15} style={{ textAnchor: 'middle', fill: '#475569', fontWeight: '800', fontSize: '9px' }} />
  //               </XAxis>
  //               <YAxis
  //                 tickLine={false}
  //                 stroke="#94a3b8"
  //                 width={45}
  //                 domain={[0, 'auto']}
  //                 tickFormatter={(val) => `${val}%`}
  //               >
  //                 <Label value="THD-I (%)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#0891b2', fontWeight: '800', fontSize: '9px' }} />
  //               </YAxis>

  //               <Tooltip content={<CurrentTooltip />} shared={true} />

  //               <Line
  //                 type="monotone"
  //                 name={`THD-I - ${activeDay}`}
  //                 dataKey={`thd_i_${activeDay}`}
  //                 stroke="#0891b2"
  //                 strokeWidth={2}
  //                 dot={false}
  //                 connectNulls={true}
  //                 animationDuration={150}
  //               />
  //             </LineChart>
  //           </ResponsiveContainer>
  //         </div>
  //       </div>
  //     </section>
  //   );
  // };

  // ── TRAZADO OFICIAL CURVA ITIC / CBEMA (COINCIDENTE CON METREL POWERVIEW) ──

  // ── 1. LÍNEA SUPERIOR ESCALONADA EXACTA (IDÉNTICA A LA IMAGEN) ──
  const ITIC_UPPER_LINE = [
    { x: 0.0002, y: 400 },
    { x: 0.0002, y: 200 },
    { x: 0.003, y: 200 },
    { x: 0.003, y: 120 },
    { x: 0.5, y: 120 },
    { x: 0.5, y: 110 },
    { x: 100000, y: 110 },
  ];

  // ── 2. LÍNEA INFERIOR ESCALONADA (HUECOS Y CAÍDAS) ──
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
  const renderIticCurveSection = () => {
    if (!iticEvents || iticEvents.length === 0) {
      return (
        <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-6 shadow-sm font-sans mt-6">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
            <Zap size={32} className="text-slate-300 animate-pulse" />
            <p className="mt-3 text-xs font-bold text-slate-500">Sin historial de eventos ITIC cargado</p>
            <label
              htmlFor="csv-itic-empty"
              className={`mt-4 flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-black text-white shadow-md ${uploadingItic ? 'bg-amber-400 cursor-not-allowed' : 'cursor-pointer bg-amber-600 hover:bg-amber-700'}`}
            >
              <UploadCloud size={15} /> {uploadingItic ? "Procesando..." : "Importar Eventos (.csv)"}
            </label>
            <input id="csv-itic-empty" type="file" accept=".csv" onChange={handleIticFileUpload} className="hidden" disabled={uploadingItic} />
          </div>
        </section>
      );
    }

    // ── SHAPES PERSONALIZADOS FINOS (IDÉNTICOS A METREL) ──
    // const MetrelDot = ({ cx, cy, fill, stroke, shapeType }: any) => {
    //   if (cx === undefined || cy === undefined) return null;

    //   if (shapeType === "square") {
    //     return (
    //       <rect
    //         x={cx - 2.5}
    //         y={cy - 2.5}
    //         width={5}
    //         height={5}
    //         fill={fill}
    //         fillOpacity={0.8}
    //         stroke="#0f172a"
    //         strokeWidth={0.5}
    //       />
    //     );
    //   }

    //   if (shapeType === "cross") {
    //     return (
    //       <g stroke={fill} strokeWidth={1.5}>
    //         <line x1={cx - 3} y1={cy} x2={cx + 3} y2={cy} />
    //         <line x1={cx} y1={cy - 3} x2={cx} y2={cy + 3} />
    //       </g>
    //     );
    //   }

    //   // Círculo pequeño con borde sutil
    //   return (
    //     <circle
    //       cx={cx}
    //       cy={cy}
    //       r={2.5}
    //       fill={fill}
    //       fillOpacity={0.75}
    //       stroke="#1e3a8a"
    //       strokeWidth={0.5}
    //     />
    //   );
    // };

    // ── 1. DETERMINAR TENSIÓN NOMINAL DEL TABLERO (Línea-Línea y Línea-Neutro) ──
    // const vNominalLinea = Number(board?.tensionNominal) || 220;
    // const vNominalFase = Math.round(vNominalLinea / Math.sqrt(3));

    const dataFase1: any[] = [];
    const dataFase2: any[] = [];
    const dataFase3: any[] = [];

    // ── CLASIFICACIÓN MULTIFÁSICA INDEPENDIENTE (IDÉNTICO A METREL) ──
    iticEvents.forEach((ev: any, idx: number) => {
      // 1. Omitir eventos del sistema (Metrel solo grafica perturbaciones eléctricas)
      const tipo = String(ev.tipoEvento || "").toLowerCase();
      if (tipo.includes("sistema") || tipo.includes("system")) {
        return;
      }

      // 2. Corregir duraciones en cero (Metrel trunca < 100ms a 00:00.0; fijar en 10 ms = 0.01 s)
      let tRaw = Number(ev.duracionSegundos);
      if (isNaN(tRaw) || tRaw <= 0) {
        tRaw = 0.01; // 10 ms para que aparezcan las caídas rápidas del círculo morado
      }

      const rawResidual = Number(ev.tensionResidual) || 0;
      const f = String(ev.fase || "").toUpperCase().trim();

      // En Volvo Santa Anita la tensión nominal es 220 V entre líneas
      const vBase = 220;
      let vPercent = rawResidual > 50 ? (rawResidual / vBase) * 100 : rawResidual;

      const t = Math.max(0.00001, Math.min(100000, tRaw));
      const v = Math.max(0, Math.min(400, vPercent));

      const item = {
        id: idx + 1,
        x: t,
        y: v,
        duracionOriginal: ev.duracionSegundos,
        tipoEvento: ev.tipoEvento,
        horaInicio: ev.horaInicio,
        fase: ev.fase,
        voltiosReales: rawResidual > 50 ? rawResidual : (rawResidual * vBase) / 100
      };

      // 3. Evaluar de forma INDEPENDIENTE (sin 'else if') para que L23, L31 genere punto verde Y azul
      if (f.includes("L12") || f === "L1" || f.includes("FASE 1")) {
        dataFase1.push({ ...item, fase: "Línea 12" });
      }
      if (f.includes("L23") || f === "L2" || f.includes("FASE 2")) {
        dataFase2.push({ ...item, fase: "Línea 23" });
      }
      if (f.includes("L31") || f.includes("L3") || f.includes("FASE 3")) {
        dataFase3.push({ ...item, fase: "Línea 31" });
      }
    });

    const MetrelTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0]?.payload;
        if (!data || data.tipoEvento === undefined) return null;

        const duracionMs = data.duracionOriginal < 1
          ? `${Math.round(data.duracionOriginal * 1000)} ms`
          : `${data.duracionOriginal.toFixed(2)} s`;

        return (
          <div className="rounded-lg border border-slate-400 bg-white/95 p-2.5 shadow-xl font-sans text-[11px] leading-tight min-w-[190px] z-50">
            <p className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1">
              {data.fase} {data.tipoEvento}
            </p>
            <div className="space-y-1 text-slate-600">
              <p><strong>Iniciado:</strong> {data.horaInicio || "N/A"}</p>
              <p><strong>Duración:</strong> {duracionMs}</p>
              <p><strong>% Residual:</strong> {data.y.toFixed(1)}%</p>
              <p><strong>Tensión medida:</strong> {data.voltiosReales.toFixed(1)} V</p>
            </div>
          </div>
        );
      }
      return null;
    };

    return (
      <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm font-sans mt-6 transition-all">
        {/* Encabezado y Leyenda */}
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

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-[#dc2626] inline-block" /> Línea 12 / L1
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-[#16a34a] inline-block" /> Línea 23 / L2
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#2563eb] inline-block" /> Línea 31 / L3
              </span>
            </div>

            <label
              htmlFor="csv-itic-btn"
              className="flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-black text-white cursor-pointer bg-amber-600 hover:bg-amber-700 shadow-sm"
            >
              <UploadCloud size={15} /> Recargar CSV
            </label>
            <input id="csv-itic-btn" type="file" accept=".csv" onChange={handleIticFileUpload} className="hidden" />
          </div>
        </div>

        {/* Contenedor del Gráfico */}
        <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">
          <div className="h-[480px] w-[950px] sm:w-full text-xs select-none">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 35 }}>
                <CartesianGrid strokeDasharray="1 1" stroke="#cbd5e1" />

                {/* ── ZONA SUPERIOR: 3 ESCALONES SOMBREADOS EXACTOS ── */}
                {/* 1. Transitorio: 200 µs (0.0002s) a 3 ms (0.003s) en 200% */}
                <ReferenceArea x1={0.0002} x2={0.003} y1={200} y2={400} fill="#fed7aa" fillOpacity={0.65} />
                {/* 2. Dinámico: 3 ms (0.003s) a 0.5 s en 120% */}
                <ReferenceArea x1={0.003} x2={0.5} y1={120} y2={400} fill="#fed7aa" fillOpacity={0.65} />
                {/* 3. Permanente: 0.5 s a 100.000 s en 110% */}
                <ReferenceArea x1={0.5} x2={100000} y1={110} y2={400} fill="#fed7aa" fillOpacity={0.65} />

                {/* ── ZONA INFERIOR: Caída / Apagado (Color Amarillo suave) ── */}
                <ReferenceArea x1={0.02} x2={0.5} y1={0} y2={70} fill="#fef08a" fillOpacity={0.7} />
                <ReferenceArea x1={0.5} x2={10} y1={0} y2={80} fill="#fef08a" fillOpacity={0.7} />
                <ReferenceArea x1={10} x2={100000} y1={0} y2={90} fill="#fef08a" fillOpacity={0.7} />

                {/* ── EJE X CON TODAS LAS DÉCADAS CALIBRADAS ── */}
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
                  tick={{ fontSize: '10px', fill: '#1e293b', fontWeight: 600 }}
                >
                  <Label
                    value="Duración del evento (segundos)"
                    position="insideBottom"
                    offset={-20}
                    style={{ textAnchor: 'middle', fill: '#0f172a', fontWeight: '800', fontSize: '11px' }}
                  />
                </XAxis>

                {/* ── EJE Y (0.0 A 400.0%) ── */}
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[0, 400]}
                  ticks={[0, 100, 200, 300, 400]}
                  stroke="#475569"
                  width={50}
                  tickFormatter={(val) => `${val}.0`}
                  tick={{ fontSize: '10px', fill: '#1e293b', fontWeight: 600 }}
                >
                  <Label
                    value="% de la nominal"
                    angle={-90}
                    position="insideLeft"
                    offset={-5}
                    style={{ textAnchor: 'middle', fill: '#0f172a', fontWeight: '800', fontSize: '11px' }}
                  />
                </YAxis>

                <Tooltip content={<MetrelTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#94a3b8' }} />

                {/* Línea nominal 100% */}
                <ReferenceLine y={100} stroke="#475569" strokeDasharray="3 3" strokeWidth={1} />

                {/* ── LÍNEAS NEGRAS DE LA ENVOLVENTE ITIC ── */}
                <Scatter
                  name="Límite Superior"
                  data={ITIC_UPPER_LINE}
                  line={{ stroke: '#0f172a', strokeWidth: 2 }}
                  shape={() => null}
                  legendType="none"
                  isAnimationActive={false}
                />
                <Scatter
                  name="Límite Inferior"
                  data={ITIC_LOWER_LINE}
                  line={{ stroke: '#0f172a', strokeWidth: 2 }}
                  shape={() => null}
                  legendType="none"
                  isAnimationActive={false}
                />

                {/* ── DISPERSIÓN DE PUNTOS POR FASE ── */}
                {/* <Scatter
                  name="Fase 1"
                  data={dataFase1}
                  fill="#dc2626"
                  shape="square"
                  isAnimationActive={false}
                />
                <Scatter
                  name="Fase 2"
                  data={dataFase2}
                  fill="#16a34a"
                  shape="square"
                  isAnimationActive={false}
                />
                <Scatter
                  name="Fase 3"
                  data={dataFase3}
                  fill="#2563eb"
                  shape="circle"
                  isAnimationActive={false}
                /> */}

                {/* 1. Línea 31 (Círculos azules finos) */}
                <Scatter
                  name="Línea 31"
                  data={dataFase3}
                  fill="#2563eb"
                  shape={(props: any) => (
                    <circle cx={props.cx} cy={props.cy} r={2.8} fill="#2563eb" fillOpacity={0.75} stroke="#1e3a8a" strokeWidth={0.5} />
                  )}
                  isAnimationActive={false}
                />

                {/* 2. Línea 23 (Cuadrados verdes finos) */}
                <Scatter
                  name="Línea 23"
                  data={dataFase2}
                  fill="#16a34a"
                  shape={(props: any) => (
                    <rect x={props.cx - 2.2} y={props.cy - 2.2} width={4.5} height={4.5} fill="#16a34a" fillOpacity={0.8} stroke="#14532d" strokeWidth={0.5} />
                  )}
                  isAnimationActive={false}
                />

                {/* 3. Línea 12 (Cruces/Puntos rojos en primer plano) */}
                <Scatter
                  name="Línea 12"
                  data={dataFase1}
                  fill="#dc2626"
                  shape={(props: any) => (
                    <g stroke="#dc2626" strokeWidth={1.2}>
                      <line x1={props.cx - 2.5} y1={props.cy} x2={props.cx + 2.5} y2={props.cy} />
                      <line x1={props.cx} y1={props.cy - 2.5} x2={props.cx} y2={props.cy + 2.5} />
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

  // interface IDocument {
  //   _id: string;
  //   title: string;
  //   type: string;
  //   cloudinaryUrl: string;
  // }

  // Asumiendo que 'board' es el objeto que recibiste de tu API
  // const assignedDocs = board?.assignedDocuments || [];

  // Filtrar documentos que vienen poblados desde el Tablero
  // const certificadosMantenimiento = assignedDocs.filter(
  //   (doc: any) => typeof doc === "object" && doc.type === "MANTENIMIENTO"
  // );

  // const certificadosOperatividad = assignedDocs.filter(
  //   (doc: any) => typeof doc === "object" && doc.type === "OPERATIVIDAD"
  // );

  // const openPdfInNewTab = (url: string, title: string) => {
  //   if (!url) return;

  //   // Creamos una nueva ventana
  //   const newWindow = window.open("", "_blank");

  //   if (newWindow) {
  //     // Inyectamos el HTML dinámico con el favicon y el título personalizado
  //     // TODO: Este es el icono default de PDF => <link rel="icon" type="image/svg+xml" href="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg" />
  //     newWindow.document.write(`
  //     <!DOCTYPE html>
  //     <html lang="es">
  //       <head>
  //         <meta charset="UTF-8" />
  //         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  //         <title>${title} - Visor PDF</title>

  //         <!-- Icono de PDF estándar o el favicon de tu app -->
  //         <link rel="icon" type="image/svg+xml" href="/voltguard.png" />

  //         <style>
  //           body, html {
  //             margin: 0;
  //             padding: 0;
  //             height: 100%;
  //             overflow: hidden;
  //             background-color: #525659;
  //           }
  //           iframe {
  //             width: 100%;
  //             height: 100%;
  //             border: none;
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <iframe src="${url}"></iframe>
  //       </body>
  //     </html>
  //   `);
  //     newWindow.document.close();
  //   }
  // };

  const renderField = (label: string, data: unknown, index: number) => (
    <div style={{ animation: "fadeUp 0.4s ease both", animationDelay: `${index * 30}ms` }} className="rounded-2xl bg-slate-50 p-4 transition-all hover:bg-slate-100/80">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-slate-800">{value(data)}</p>
    </div>
  );

  // const renderImageSection = (title: string, description: string, images: string[] = []) => (
  //   <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-300">
  //     <div className="mb-5 flex items-center gap-3">
  //       <div className="flex size-11 items-center justify-center rounded-2xl bg-[#8ccf2f]/12 text-[#3aaa35]"><ImageIcon size={22} /></div>
  //       <div>
  //         <h2 className="font-bold text-slate-950 text-base tracking-tight">{title}</h2>
  //         <p className="text-xs text-slate-500 mt-0.5">{description}</p>
  //       </div>
  //     </div>
  //     {images.length === 0 ? (
  //       <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
  //         <FileImage size={32} className="text-slate-300" />
  //         <p className="mt-2 text-xs font-bold text-slate-500">Sin imágenes registradas</p>
  //       </div>
  //     ) : (
  //       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  //         {images.map((img, index) => (
  //           <button key={`${img}-${index}`} type="button" onClick={() => setSelectedImage(img)} className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-left cursor-pointer transition-all hover:border-slate-300 hover:shadow-sm">
  //             <div className="overflow-hidden h-44 w-full">
  //               <img src={img} alt={`${title} ${index + 1}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
  //             </div>
  //             <div className="p-3"><p className="truncate text-xs font-bold text-slate-600">Imagen {index + 1}</p></div>
  //           </button>
  //         ))}
  //       </div>
  //     )}
  //   </section>
  // );

  // const renderPdfSection = (title: string, description: string, documentsList: IDocument[]) => {
  //   return (
  //     <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-300">
  //       <div className="mb-5 flex items-center gap-3">
  //         <div className="flex size-11 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
  //           <FileImage size={22} />
  //         </div>
  //         <div>
  //           <h2 className="font-bold text-slate-950 text-base tracking-tight">{title}</h2>
  //           <p className="text-xs text-slate-500 mt-0.5">{description}</p>
  //         </div>
  //       </div>

  //       {!documentsList || documentsList.length === 0 ? (
  //         <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
  //           <FileImage size={32} className="text-slate-300" />
  //           <p className="mt-2 text-xs font-bold text-slate-500">Sin documentos registrados</p>
  //         </div>
  //       ) : (
  //         <div className="flex flex-wrap gap-2">
  //           {documentsList.map((doc) => (
  //             <button
  //               key={doc._id}
  //               onClick={() => openPdfInNewTab(doc.cloudinaryUrl, doc.title)} // 👈 Uso exacto del campo de MongoDB
  //               className="inline-flex items-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-xs font-bold text-white transition-all duration-300 hover:bg-[#087fb3] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0797d5]/20 cursor-pointer"
  //             >
  //               <FileImage size={15} />
  //               {doc.title}
  //             </button>
  //           ))}
  //         </div>
  //       )}
  //     </section>
  //   );
  // };

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
              RIESGO DE ARCO ELÉCTRICO Y CHOQUE ELÉCTRICO PRESENTE
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
                  RIESGO DE CHOQUE ELÉCTRICO
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
                    size={150}
                    level="H"
                    style={{ height: "150px", width: "150px" }}
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

                  {/* <div className="mt-2.5 w-full overflow-hidden">
                    <p className="w-full truncate rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 tracking-tight" title={qrUrl.replace(/^https?:\/\//, "")}>
                      {qrUrl.replace(/^https?:\/\//, "")}
                    </p>
                  </div> */}
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
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-3">
          {[
            { l: "Ubicación", v: board.location, icon: MapPin, textCls: "text-slate-800", iconCls: "text-[#0797d5]" },
            // { l: "Tipo", v: board.type, icon: Info, textCls: "text-slate-800", iconCls: "text-[#0797d5]" },
            // { l: "Tensión", v: board.tensionNominal ? `${board.tensionNominal} V` : "220 V", icon: Zap, textCls: "text-slate-800", iconCls: "text-[#0797d5]" },
            { l: "Sistema", v: getSistemaCompleto(board), icon: Info, textCls: "text-slate-800", iconCls: "text-[#0797d5]" },
            { l: "Estado", v: board.estadoGeneral, icon: CheckCircle2, textCls: "text-slate-800", iconCls: "text-[#3aaa35]" }
            // { l: "Circuitos", v: board.circuits?.length ? `${board.circuits.length} SALIDAS` : "0 SALIDAS", icon: CheckCircle2, textCls: "text-slate-800", iconCls: "text-[#0797d5]" }
          ].map((item, i) => {
            const CardIcon = item.icon;
            return (
              <div key={i} className="rounded-2xl border border-transparent bg-slate-50/70 p-4 transition-colors hover:border-slate-200/50">
                <CardIcon className={item.iconCls} size={20} />
                <p className="mt-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.l}</p>
                {/* <p className={`mt-0.5 truncate text-xs font-bold sm:text-sm ${item.textCls}`}>{value(item.v)}</p> */}
                <p className={`mt-0.5 text-xs font-bold sm:text-sm ${item.textCls}`}>{value(item.v)}</p>
              </div>
            );
          })}
        </div>

        {/* ── PLAN EMPRESARIAL: ETIQUETADO DE SEGURIDAD (NFPA 70E) ── */}
        {isEmpresarial && board?.nfpa && (
          renderNfpaSection()
        )}

        {/* ── PLAN EMPRESARIAL: ANALÍTICA DE CONSUMO, REACTIVA Y DEMANDA ── */}
        {/* {isEmpresarial && rawChartData.length > 0 && (
          <>
            {renderDemandSection()}
            {renderReactivePowerSection()}
            {renderCombinedDemandAndReactiveSection()}
            {renderHarmonicDistortionSection()}
            {renderEnergyBarSection()}
            {renderCarbonEmissionsSection()}
            {renderEnergyCostSection()}
            {renderSolarEnergySection()}
          </>
        )} */}

        {isEmpresarial && (
          <>
            {renderDemandSection()}
            {renderReactivePowerSection()}
            {/* {renderCombinedDemandAndReactiveSection()} */}
            {renderThdVoltageSection()}
            {/* {renderThdCurrentSection()} */}
            {renderIticCurveSection()}
            {renderEnergyBarSection()}
            {renderCarbonEmissionsSection()}
            {renderEnergyCostSection()}
            {/* {renderSolarEnergySection()} */}
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
        {/* {board.images?.tablero && board.images.tablero.length > 0 && (
          renderImageSection("Imágenes del tablero", "Fotografías generales del tablero eléctrico", board.images.tablero)
        )} */}

        {/* ── PLAN INTERMEDIO Y EMPRESARIAL: DIAGRAMA UNIFILAR ── */}
        {/* {board.images?.unifilar && board.images.unifilar.length > 0 && (
          renderImageSection("Diagrama unifilar", "Imágenes del diagrama unifilar registrado", board.images.unifilar)
        )} */}

        {/* ── PLAN EMPRESARIAL: INSPECCIÓN TERMOGRÁFICA (NFPA 70B) ── */}
        {/* {isEmpresarial && board.images?.termografia && board.images.termografia.length > 0 && (
          renderImageSection("Termografía", "Imágenes termográficas asociadas al tablero", board.images.termografia)
        )} */}

        {/* ── PLAN EMPRESARIAL: INSPECCIÓN TERMOGRÁFICA (NFPA 70B) ── */}
        {isEmpresarial && (
          <>
            <ThermographyViewer
              boardId={board._id}
              title="Inspección Termográfica Radiométrica (NFPA 70B)"
              originalImageUrl={board.images?.termografia?.[0]}
              onOpenImportModal={() => setShowThermographyModal(true)}
              reloadKey={thermographyReloadKey}
            />

            <ImportThermographyModal
              isOpen={showThermographyModal}
              onClose={() => setShowThermographyModal(false)}
              boardId={board._id}
              onSuccess={handleThermographySuccess}
            />
          </>
        )}

        {/* ── PLAN INTERMEDIO Y EMPRESARIAL: CERTIFICADOS Y MANTENIMIENTO ── */}
        {/* {isIntermedioOrSuperior && (
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
        )} */}

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