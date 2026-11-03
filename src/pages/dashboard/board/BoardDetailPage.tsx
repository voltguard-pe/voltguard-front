import { ArrowLeft, Building2, CheckCircle2, FileText, Info, MapPin, RefreshCw, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isNoCreditsError, triggerGlobalNoCreditsModal } from "../../../components/dashboard/modals/ImportBoardsAndNfpaModal";
import { CarbonEmissionsSection } from "../../../components/dashboard/sections/CarbonEmissionsSection";
import { DemandSection } from "../../../components/dashboard/sections/DemandSection";
import { EnergyBarSection } from "../../../components/dashboard/sections/EnergyBarSection";
import { IticCurveSection } from "../../../components/dashboard/sections/IticCurveSection";
import { Nfpa70eSection } from "../../../components/dashboard/sections/Nfpa70eSection";
import { ReactivePowerSection } from "../../../components/dashboard/sections/ReactivePowerSection";
import { ThdVoltageSection } from "../../../components/dashboard/sections/ThdVoltageSection";
import { ThermographySection } from "../../../components/dashboard/sections/ThermographySection";
import { updateAhorroMeta, uploadReceiptBill } from "../../../services/bill.service";
import { getBoardByCode, updateBoard } from "../../../services/board.service";
import { getDemandChartData, uploadMetrelCsv } from "../../../services/measurement.service";
import { getIticEvents, uploadIticCsv, type VoltageEventItem } from "../../../services/voltageEvent.service";
import { useAuth } from "../../../shared/hooks/useAuth";
import type { BoardResponseDTO } from "../../../shared/types/BoardProps";

// ── FUNCIONES AUXILIARES DE FORMATEO ──
const value = (data: unknown) =>
  data === null || data === undefined || data === "" ? "-" : String(data);

// const bool = (data?: boolean) => (data ? "Sí" : "No");

const formatMeasurementWithUnit = (
  data: number | null | undefined,
  unit = "MΩ"
) => {
  if (data === null || data === undefined) return "-";
  return `${data} ${unit}`;
};

const WEEKDAYS_ES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

// El backend ya entrega los kW reales (importMetrel detecta Ptot en W o Eptot en Wh),
// por eso no se aplica ninguna corrección adicional.
const FACTOR_CORRECCION_BACKEND = 1;

// Un día con menos de este % de puntos con dato se considera incompleto
// (típico del primer y último día de la medición) y no entra al promedio
const MIN_COBERTURA_DIA = 0.9;

const DIA_ABREV_A_NOMBRE: Record<string, (typeof WEEKDAYS_ES)[number]> = {
  lun: "Lunes", mon: "Lunes",
  mar: "Martes", tue: "Martes",
  mie: "Miércoles", wed: "Miércoles",
  jue: "Jueves", thu: "Jueves",
  vie: "Viernes", fri: "Viernes",
  sab: "Sábado", sat: "Sábado",
  dom: "Domingo", sun: "Domingo",
};

const normalizarDia = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().slice(0, 3);

const BoardDetailPage = () => {
  const { auth, loading: authLoading } = useAuth();

  const rawRole = (auth?.role || "USER").toUpperCase();
  const rawPlan = (auth?.plan || "basico").toLowerCase();

  const effectiveRole = rawRole === "SUPERADMIN"
    ? "SUPERADMIN"
    : rawPlan === "empresarial"
      ? "ADMIN"
      : "USER";

  const isSuperAdmin = effectiveRole === "SUPERADMIN" || rawRole === "SUPERADMIN";
  const isEmpresarial = isSuperAdmin || rawPlan === "empresarial";
  const isAdmin = auth?.role === "ADMIN"

  const navigate = useNavigate();
  const { publicCode, code } = useParams();

  const [board, setBoard] = useState<BoardResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rawChartData, setRawChartData] = useState<any[]>([]);
  const [seriesKeys, setSeriesKeys] = useState<string[]>([]);
  const [selectedReactiveDay, setSelectedReactiveDay] = useState<string | null>(null);
  const [selectedThdUDay, setSelectedThdUDay] = useState<string | null>(null);

  const [visibleThdFases, setVisibleThdFases] = useState<{ [key: string]: boolean }>({
    u12: true,
    u23: true,
    u31: true,
  });

  const [visibleDemandSeries, setVisibleDemandSeries] = useState<{ [key: string]: boolean }>({
    "Promedio_General": true,
  });
  const [visibleReactiveSeries, setVisibleReactiveSeries] = useState<{ [key: string]: boolean }>({
    "kvar_inductivo": true,
    "kvar_capacitivo": true,
  });
  const [visibleEnergySeries, setVisibleEnergySeries] = useState<{ [key: string]: boolean }>({});
  const [visibleCarbonSeries, setVisibleCarbonSeries] = useState<{ [key: string]: boolean }>({});
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

  // Cambiar imagen diagrama unifilar
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [replacingImageIndex, setReplacingImageIndex] = useState<number | null>(null);
  const [isUpdatingUnifilar, setIsUpdatingUnifilar] = useState(false);

  // Manejador para reemplazar la imagen seleccionada
  const handleReplaceUnifilarImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    const targetIndex = replacingImageIndex;

    // Reseteamos el input de inmediato para permitir seleccionar el mismo archivo si es necesario
    e.target.value = "";

    if (!rawFile || targetIndex === null || !board || !publicCode || !code) {
      setReplacingImageIndex(null);
      return;
    }

    setIsUpdatingUnifilar(true);

    try {
      // 1. Optimización del peso para evitar lag y tiempos muertos
      const file = await compressImage(rawFile, 2048, 0.82);

      // 2. Conservamos las demás imágenes existentes excluyendo la que se reemplaza
      const currentImages = board.images?.unifilar || [];
      const updatedExisting = currentImages.filter((_, idx) => idx !== targetIndex);

      // 3. Petición real al backend
      await updateBoard(publicCode, code, {
        existingUnifilar: updatedExisting,
        unifilar: [file],
      });

      // 4. Consulta del estado real guardado en base de datos
      const freshBoard = await getBoardByCode(publicCode, code);

      // Romper caché del navegador para la nueva URL
      const timestamp = Date.now();
      const cacheBustedUnifilar = (freshBoard.images?.unifilar || []).map((url: string) =>
        url.includes("?") ? `${url}&t=${timestamp}` : `${url}?t=${timestamp}`
      );

      // 5. Asignar el nuevo estado real
      setBoard({
        ...freshBoard,
        images: {
          ...freshBoard.images,
          unifilar: cacheBustedUnifilar,
        },
      });
    } catch (err: any) {
      console.error("Error al actualizar unifilar:", err);
      alert("Error al actualizar la imagen: " + (err.response?.data?.message || err.message));
    } finally {
      // Apagamos siempre el spinner y limpiamos el índice
      setIsUpdatingUnifilar(false);
      setReplacingImageIndex(null);
    }
  };
  // Cambiar imagen diagrama unifilar

  // Zoom
  // Estados para el visor interactivo tipo Google Drive
  const [activePreview, setActivePreview] = useState<{
    url: string;
    title: string;
    reading?: string;
  } | null>(null);

  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Referencias para interacción
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const touchDistanceRef = useRef<number | null>(null);

  const resetZoom = () => {
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
    touchDistanceRef.current = null;
  };

  // Bloqueo de scroll global, tecla Escape y Zoom nativo no pasivo
  useEffect(() => {
    if (!activePreview) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActivePreview(null);
        resetZoom();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const container = imageContainerRef.current;
    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY < 0 ? 0.2 : -0.2;
      setZoomScale((prev) => Math.min(Math.max(0.5, prev + delta), 4));
    };

    if (container) {
      container.addEventListener("wheel", handleNativeWheel, { passive: false });
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (container) {
        container.removeEventListener("wheel", handleNativeWheel);
      }
    };
  }, [activePreview]);

  // Gestos táctiles en móvil (1 dedo = Pan, 2 dedos = Pinch to Zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistanceRef.current = dist;
    } else if (e.touches.length === 1 && zoomScale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panPosition.x,
        y: e.touches[0].clientY - panPosition.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / touchDistanceRef.current;
      setZoomScale((prev) => Math.min(Math.max(0.5, prev * ratio), 4));
      touchDistanceRef.current = currentDist;
    } else if (e.touches.length === 1 && isDragging && zoomScale > 1) {
      setPanPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistanceRef.current = null;
  };
  // Zoom

  const fetchChartData = async (boardId: string, start?: string, end?: string) => {
    try {
      const res: any = await getDemandChartData(boardId, start, end);
      const { agrupado } = res;

      if (!agrupado || Object.keys(agrupado).length === 0) {
        setRawChartData([]);
        setSeriesKeys([]);
        setHoraPicoMaximo(null);
        setAnalisisPotencia(null);
        return;
      }

      const rawKeys = Object.keys(agrupado);
      // const labelsX = Array.from({ length: 288 }, (_, i) => {
      //   const h = String(Math.floor((i * 5) / 60)).padStart(2, '0');
      //   const m = String((i * 5) % 60).padStart(2, '0');
      //   return `${h}:${m}`;
      // });

      // En BoardDetailPage.tsx, dentro de fetchChartData:

      // 1. Obtener solo las horas/minutos reales que existen en la medición
      const horasSet = new Set<string>();
      rawKeys.forEach((diaKey) => {
        if (agrupado[diaKey]) {
          Object.keys(agrupado[diaKey]).forEach((h) => horasSet.add(h));
        }
      });

      // Ordenar cronológicamente (si no hay datos, fallback a las 24 hrs estándar)
      const labelsX = horasSet.size > 0
        ? Array.from(horasSet).sort()
        : Array.from({ length: 288 }, (_, i) => {
          const h = String(Math.floor((i * 5) / 60)).padStart(2, '0');
          const m = String((i * 5) % 60).padStart(2, '0');
          return `${h}:${m}`;
        });

      // 2. Mapear formattedData (ahora cada punto del array tendrá datos reales)
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

          const rawP = typeof punto === 'number' ? punto : punto?.p;
          const valP = rawP !== undefined && rawP !== null ? rawP / FACTOR_CORRECCION_BACKEND : null;

          const rawInd = typeof punto === 'object' ? punto?.ind : undefined;
          const valInd = rawInd !== undefined && rawInd !== null ? rawInd / FACTOR_CORRECCION_BACKEND : null;

          const rawCap = typeof punto === 'object' ? punto?.cap : undefined;
          const valCap = rawCap !== undefined && rawCap !== null ? rawCap / FACTOR_CORRECCION_BACKEND : null;

          row[labelCorto] = valP;
          row[`inductiva_${labelCorto}`] = valInd;
          row[`capacitiva_${labelCorto}`] = valCap;
          row[`thd_v_${labelCorto}`] = typeof punto === 'object' ? (punto?.thd_v ?? null) : null;
          row[`thd_i_${labelCorto}`] = typeof punto === 'object' ? (punto?.thd_i ?? null) : null;
          row[`thd_u12_${labelCorto}`] = typeof punto === 'object' ? (punto?.thd_u12 ?? null) : null;
          row[`thd_u23_${labelCorto}`] = typeof punto === 'object' ? (punto?.thd_u23 ?? null) : null;
          row[`thd_u31_${labelCorto}`] = typeof punto === 'object' ? (punto?.thd_u31 ?? null) : null;

          if (valP !== null) {
            sumaP += valP;
            sumaInd += (valInd ?? 0);
            sumaCap += (valCap ?? 0);
            count++;
          }
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

      setRawChartData(formattedData);
      setSeriesKeys(sortedCleanKeys);
      setSelectedReactiveDay(prev => (prev && sortedCleanKeys.includes(prev) ? prev : sortedCleanKeys[0] || null));

      calcularMetricasLuzDelSur(formattedData);

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

  useEffect(() => {
    if (board?._id) {
      fetchIticData(board._id);
    }
  }, [board?._id]);

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
    setVisibleEnergySeries(prev => ({ ...prev, [key]: prev[key] === false }));
  };

  const toggleCarbonDay = (key: string) => {
    setVisibleCarbonSeries(prev => ({ ...prev, [key]: prev[key] === false }));
  };

  const toggleThdFase = (fase: string) => {
    setVisibleThdFases(prev => ({ ...prev, [fase]: !prev[fase] }));
  };

  useEffect(() => {
    if (authLoading) return;

    const fetchBoard = async () => {
      try {
        const data = await getBoardByCode(publicCode!, code!);
        setBoard(data);
        if (data?._id && isEmpresarial) {
          await fetchChartData(data._id);
        }
      } catch {
        setError("Error cargando tablero");
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [code, publicCode, authLoading, isEmpresarial]);

  useEffect(() => {
    if (rawChartData.length > 0) {
      calcularMetricasLuzDelSur(rawChartData);
    }
  }, [rawChartData, visibleDemandSeries, seriesKeys, tarifaContratada, costokW_HP, costokW_HFP]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !board?._id) return;

    // Solo verificar que sea archivo CSV, sin importar la marca o el nombre
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert("Por favor, sube un archivo con extensión .csv válido");
      return;
    }

    setImporting(true);
    try {
      await uploadMetrelCsv(board._id, file);
      alert("¡Archivo cargado y procesado por completo!");
      await fetchChartData(board._id);
    } catch (err: any) {
      alert("Error procesando archivo: " + (err.response?.data?.error || err.message));
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  };

  const calcularMetricasLuzDelSur = (data: any[]) => {
    if (!data || data.length === 0) return;

    const activeKeys = [
      ...seriesKeys,
      "Promedio_General"
    ].filter((key) => visibleDemandSeries[key] === true);

    if (activeKeys.length === 0) {
      setHoraPicoMaximo(null);
      setAnalisisPotencia(null);
      return;
    }

    let maxHP: { valor: number; hora: string; fecha: string } | null = null;
    let maxHFP: { valor: number; hora: string; fecha: string } | null = null;
    let valorPicoAbsoluto = -1;
    let horaPicoAbsoluto = "";

    for (const row of data) {
      const horaStr = row.horaMinuto;
      if (!horaStr) continue;

      const [horas, minutos] = horaStr.split(":").map(Number);
      const totalMinutos = horas * 60 + minutos;

      const esHoraPunta = totalMinutos >= 18 * 60 && totalMinutos < 23 * 60;

      for (const key of activeKeys) {
        const valor = Number(row[key]);

        if (!isNaN(valor) && valor !== null && valor !== undefined && valor > 0) {
          if (valor > valorPicoAbsoluto) {
            valorPicoAbsoluto = valor;
            horaPicoAbsoluto = horaStr;
          }

          if (esHoraPunta) {
            if (!maxHP || valor > maxHP.valor) {
              maxHP = { valor, hora: horaStr, fecha: key };
            }
          } else {
            if (!maxHFP || valor > maxHFP.valor) {
              maxHFP = { valor, hora: horaStr, fecha: key };
            }
          }
        }
      }
    }

    if (horaPicoAbsoluto) {
      setHoraPicoMaximo(horaPicoAbsoluto);
    } else {
      setHoraPicoMaximo(null);
    }

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

  const [rates, setRates] = useState<{ hp: number; fp: number } | null>(() => {
    const r = (board as any)?.energyRates;
    if (r?.tarifaHP && r?.tarifaFP) {
      return { hp: Number(r.tarifaHP), fp: Number(r.tarifaFP) };
    }
    return null;
  });

  const [isUploadingBill, setIsUploadingBill] = useState(false);
  const [ahorroMeta, setAhorroMeta] = useState<number>(5);
  const [savingAhorro, setSavingAhorro] = useState(false);
  const [ahorroGuardado, setAhorroGuardado] = useState<number | null>(null);
  const [editandoAhorro, setEditandoAhorro] = useState(false);
  const ahorroBloqueado = ahorroGuardado !== null && !editandoAhorro;

  const [billHistory, setBillHistory] = useState<any[]>([]);

  useEffect(() => {
    const energyRates = (board as any)?.energyRates;
    if (energyRates?.tarifaHP && energyRates?.tarifaFP) {
      setRates({
        hp: Number(energyRates.tarifaHP),
        fp: Number(energyRates.tarifaFP),
      });
    }
    const h = energyRates?.history;
    setBillHistory(Array.isArray(h) ? h : []);

    const metaGuardada = Number(energyRates?.ahorroMeta);
    if (energyRates?.ahorroMeta !== undefined && energyRates?.ahorroMeta !== null && Number.isFinite(metaGuardada)) {
      setAhorroMeta(metaGuardada);
      setAhorroGuardado(metaGuardada);
    }
  }, [board]);

  // Energía mensual según el recibo de luz (solo se usa en EnergyBarSection)
  const energiaMensualRecibo = useMemo(() => {
    if (!rates || billHistory.length === 0) return [];

    return billHistory
      .map((h: any, i: number) => {
        const dias = Number(h.dias) > 0 ? Number(h.dias) : 30;
        const kwhHP = Number(h.kwhHP) || (Number(h.costoHP) > 0 ? Number(h.costoHP) / rates.hp : 0);
        const kwhFP = Number(h.kwhFP) || (Number(h.costoFP) > 0 ? Number(h.costoFP) / rates.fp : 0);
        return {
          name: String(h.period || `Mes ${i + 1}`),
          dias,
          kwhHP: Math.round(kwhHP * 100) / 100,
          kwhFP: Math.round(kwhFP * 100) / 100,
          kWh: Math.round((kwhHP + kwhFP) * 100) / 100,
          costoTotalRecibo: Number(h.costoTotal) > 0 ? Number(h.costoTotal) : null,
          totalEsEstimado: Boolean(h.totalEsEstimado),
        };
      })
      .filter((m) => m.kWh > 0);
  }, [billHistory, rates]);

  // En BoardDetailPage.tsx, dentro de useMemo de energiaDiariaMedida:
  const energiaDiariaMedida = useMemo(() => {
    if (rawChartData.length === 0 || seriesKeys.length === 0) return [];

    // 1. Detectar el intervalo real en horas entre muestras (soporta 5, 10, 15, 30 o 60 min)
    let horasPorPunto = 5 / 60; // fallback por defecto
    if (rawChartData.length >= 2) {
      const [h0, m0] = (rawChartData[0].horaMinuto || "00:00").split(':').map(Number);
      const [h1, m1] = (rawChartData[1].horaMinuto || "00:05").split(':').map(Number);
      const diffMinutos = Math.abs((h1 * 60 + m1) - (h0 * 60 + m0));
      if (diffMinutos > 0) {
        horasPorPunto = diffMinutos / 60;
      }
    }

    const candidatos: { nombre: string; kWh: number; cobertura: number }[] = [];

    seriesKeys.forEach((key) => {
      const match = key.match(/\(([^)]+)\)/);
      const nombre = match ? DIA_ABREV_A_NOMBRE[normalizarDia(match[1])] : undefined;
      if (!nombre) return;

      let sumaKw = 0;
      let puntosConDato = 0;
      rawChartData.forEach((row) => {
        const v = Number(row[key]);
        if (Number.isFinite(v) && v > 0) {
          sumaKw += v;
          puntosConDato++;
        }
      });

      candidatos.push({
        nombre,
        kWh: sumaKw * horasPorPunto, // Multiplicado por el intervalo real del analizador
        cobertura: puntosConDato / rawChartData.length,
      });
    });

    const completos = candidatos.filter((c) => c.cobertura >= MIN_COBERTURA_DIA);
    const usados = completos.length > 0 ? completos : candidatos;

    return WEEKDAYS_ES.map((day) => {
      const delDia = usados.filter((u) => u.nombre === day);
      if (delDia.length === 0) return null;
      const prom = delDia.reduce((a, u) => a + u.kWh, 0) / delDia.length;
      return {
        name: day,
        kWh: Math.round(prom * 100) / 100,
        count: delDia.length,
        fuente: "medicion",
      };
    }).filter((d): d is NonNullable<typeof d> => d !== null);
  }, [rawChartData, seriesKeys]);

  // Solo se muestran los botones de los días que tienen medición
  const diasSemanaKeys = WEEKDAYS_ES.filter((d) =>
    energiaDiariaMedida.some((x) => x.name === d)
  );

  const handleBillUpload = async (file: File) => {
    if (!file || !board?._id) return;

    try {
      setIsUploadingBill(true);
      const res = await uploadReceiptBill(
        board._id,
        file,
        ahorroGuardado === null ? ahorroMeta : undefined
      );
      if (res?.data?.ahorroMeta != null) {
        setAhorroGuardado(res.data.ahorroMeta);
      }
      if (res?.data) {
        setRates({
          hp: Number(res.data.tarifaHP) || 0.3095,
          fp: Number(res.data.tarifaFP) || 0.2616,
        });
        const historyFromBill = (res.data as any).history;
        setBillHistory(Array.isArray(historyFromBill) ? historyFromBill : []);
        alert("¡Tarifas y consumo extraídos y actualizados correctamente!");
      }
    } catch (err: any) {
      // 1. Si el error es por falta de créditos de OpenAI, disparamos nuestro modal corporativo
      if (isNoCreditsError(err)) {
        triggerGlobalNoCreditsModal();
        return;
      }

      // 2. Si es cualquier otro error, se mantiene el alert habitual
      alert("Error al procesar recibo: " + (err.response?.data?.error || err.message));
    } finally {
      setIsUploadingBill(false);
    }
  };

  const handleSaveAhorro = async () => {
    if (!board?._id) return;
    try {
      setSavingAhorro(true);
      await updateAhorroMeta(board._id, ahorroMeta);
      setAhorroGuardado(ahorroMeta);
      setEditandoAhorro(false);
      alert("Meta de ahorro guardada.");
    } catch (err: any) {
      alert("Error al guardar la meta: " + (err.response?.data?.error || err.message));
    } finally {
      setSavingAhorro(false);
    }
  };

  // const renderField = (label: string, data: unknown, index: number) => (
  //   <div style={{ animation: "fadeUp 0.4s ease both", animationDelay: `${index * 30}ms` }} className="rounded-2xl bg-slate-50 p-4 transition-all hover:bg-slate-100/80">
  //     <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
  //     <p className="mt-1 break-words text-sm font-bold text-slate-800">{value(data)}</p>
  //   </div>
  // );

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

  if (loading || authLoading) {
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

  const compressImage = (file: File, maxWidth = 2048, quality = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      // Si no es una imagen común (por ejemplo, SVG o PDF), devolver el original
      if (!file.type.startsWith("image/")) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Redimensionar proporcionalmente si supera el ancho máximo (2048px es óptimo para planos)
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file);
            return;
          }

          // Suavizado de líneas para planos
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Exportar a WebP (o JPEG si no es soportado) comprimido al 80%
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                type: "image/webp",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            "image/webp",
            quality
          );
        };

        img.onerror = () => resolve(file);
      };

      reader.onerror = () => resolve(file);
    });
  };

  // ── REGLAS DE VISIBILIDAD POR DATOS CARGADOS ──
  // El SUPERADMIN siempre ve todas las secciones (incluso vacías para poder subir datos)
  const tieneMediciones = rawChartData.length > 0;
  const mostrarMediciones = isSuperAdmin || tieneMediciones;

  const tieneEventosItic = iticEvents.length > 0;
  const mostrarItic = isSuperAdmin || tieneEventosItic;

  const tieneReciboLuz = energiaMensualRecibo.length > 0 || billHistory.length > 0;
  const mostrarReciboLuz = isSuperAdmin || tieneReciboLuz;

  // Termografía: verifica si existe imagen térmica, óptica o registros de termografía
  const tieneTermografia = Boolean(
    board?.images?.termografia?.length ||
    (board as any)?.thermography ||
    (board as any)?.images?.termografica ||
    (board as any)?.images?.optica
  );
  const mostrarTermografia = isSuperAdmin || tieneTermografia;

  // const companyName = typeof board.company === "object" ? board.company.name : "Sin empresa";

  // TODO:  Harcodeado para DEMO
  const isDemoAccount = true; // REEMPLAZAR POR TU LÓGICA REAL DE DETECCIÓN DE CUENTA DEMO

  const currentCode = board?.boardCode || code;

  // 1. Detección de tableros específicos
  const isElcorsaBoard = currentCode === "ELC-MIR-TE-001";
  const isBbvaDemoBoard = isDemoAccount && currentCode === "BBVA-SB-TE-001"; // Lógica solicitada
  const isVelaxBoard = currentCode === "VEL-SI-TE-001"; // Nuevo: Detección para VELAX

  // 2. Lógica para el Nombre de la Empresa
  // Orden de prioridad: BBVA Demo > Elcorsa > VELAX > Datos de DB > Por defecto
  const companyName = isBbvaDemoBoard
    ? "BBVA" // Valor forzado para DEMO BBVA
    : isElcorsaBoard
      ? "ELCORSA"
      : isVelaxBoard
        ? "VL" // Valor forzado para VELAX
        : typeof board.company === "object" && board.company.name
          ? board.company.name
          : "Sin empresa";

  // 3. Lógica para la Ubicación (Nueva)
  // Orden de prioridad: BBVA Demo > Datos de DB > Por defecto
  const boardLocation = isBbvaDemoBoard
    ? "SAN BORJA" // Valor forzado para DEMO BBVA
    : board.location || "Sin ubicación";
  // TODO:  Harcodeado para DEMO

  return (
    <>
      <section className="mx-auto max-w-7xl space-y-6 opacity-0" style={{ animation: "fadeUp 0.5s ease forwards" }}>

        {/* ── HEADER DEL TABLERO ── */}
        <section className="sticky top-0 z-30 rounded-2xl border border-slate-200/80 bg-white/90 shadow-md backdrop-blur-md transition-all duration-300">
          <div className="relative rounded-2xl bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] p-3.5 px-6 text-white transition-all duration-300">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 to-transparent" />

            <div className="relative z-10 flex flex-row items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
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

              <div className="shrink-0 rounded-2xl border border-white/10 bg-white/15 px-3.5 py-1.5 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Código</p>
                <p className="text-sm font-black tracking-tight">
                  {value(board.boardCode)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── GRILLA DE DETALLES (EMPRESA, UBICACIÓN, SISTEMA, ESTADO) ── */}
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-4">
          {[
            { l: "Empresa", v: companyName, icon: Building2, textCls: "text-slate-800", iconCls: "text-[#0797d5]" },
            // { l: "Ubicación", v: board.location, icon: MapPin, textCls: "text-slate-800", iconCls: "text-[#0797d5]" },
            { l: "Ubicación", v: boardLocation, icon: MapPin, textCls: "text-slate-800", iconCls: "text-[#0797d5]" },
            { l: "Sistema", v: getSistemaCompleto(board), icon: Info, textCls: "text-slate-800", iconCls: "text-[#0797d5]" },
            { l: "Estado", v: board.estadoGeneral, icon: CheckCircle2, textCls: "text-slate-800", iconCls: "text-[#3aaa35]" }
          ].map((item, i) => {
            const CardIcon = item.icon;
            return (
              <div key={i} className="rounded-2xl border border-transparent bg-slate-50/70 p-4 transition-colors hover:border-slate-200/50">
                <CardIcon className={item.iconCls} size={20} />
                <p className="mt-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.l}</p>
                <p className={`mt-0.5 text-xs font-bold sm:text-sm ${item.textCls}`}>{value(item.v)}</p>
              </div>
            );
          })}
        </div>

        {isEmpresarial && board?.nfpa && (
          <Nfpa70eSection board={board} publicCode={publicCode} />
        )}

        {isEmpresarial && (
          <>
            {mostrarMediciones && (
              <>
                <DemandSection
                  rawChartData={rawChartData}
                  seriesKeys={seriesKeys}
                  visibleDemandSeries={visibleDemandSeries}
                  onToggleDemandDay={toggleDemandDay}
                  importing={importing}
                  onFileChange={handleFileChange}
                  horaPicoMaximo={horaPicoMaximo}
                  analisisPotencia={analisisPotencia}
                />

                <ReactivePowerSection
                  rawChartData={rawChartData}
                  seriesKeys={seriesKeys}
                  selectedReactiveDay={selectedReactiveDay}
                  onSelectReactiveDay={setSelectedReactiveDay}
                  visibleReactiveSeries={visibleReactiveSeries}
                  onToggleReactiveDay={toggleReactiveDay}
                />

                <ThdVoltageSection
                  rawChartData={rawChartData}
                  seriesKeys={seriesKeys}
                  selectedThdUDay={selectedThdUDay}
                  onSelectThdUDay={setSelectedThdUDay}
                  visibleThdFases={visibleThdFases}
                  onToggleThdFase={toggleThdFase}
                />
              </>
            )}

            {mostrarItic && (
              <IticCurveSection
                iticEvents={iticEvents}
                tensionNominal={board?.tensionNominal}
                uploadingItic={uploadingItic}
                onIticFileUpload={handleIticFileUpload}
              />
            )}

            {mostrarReciboLuz && (
              <>
                {!isAdmin && (
                  <div className="flex flex-col gap-3 rounded-3xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-950">Meta de ahorro de la empresa</h2>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Se guarda con el tablero y se envía junto con el recibo de luz.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={ahorroMeta}
                        disabled={ahorroBloqueado}
                        onChange={(e) =>
                          setAhorroMeta(Math.min(100, Math.max(0, Number(e.target.value) || 0)))
                        }
                        className="w-24 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-right text-sm font-black text-slate-800 disabled:bg-emerald-100/50 disabled:text-slate-500"
                      />
                      <span className="text-sm font-black text-emerald-700">%</span>

                      {ahorroBloqueado ? (
                        isSuperAdmin ? (
                          <button
                            type="button"
                            onClick={() => setEditandoAhorro(true)}
                            className="cursor-pointer rounded-xl border border-emerald-600 px-4 py-2 text-xs font-black text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95"
                          >
                            Editar
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">🔒 Meta fijada</span>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={handleSaveAhorro}
                          disabled={savingAhorro}
                          className="cursor-pointer rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-60"
                        >
                          {savingAhorro ? "Guardando..." : "Guardar"}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Gráfico de Consumo de Energía con el Botón para Subir Recibo */}
                <EnergyBarSection
                  energiaPorMesData={energiaMensualRecibo}
                  ahorroMeta={ahorroMeta}
                  visibleEnergySeries={visibleEnergySeries}
                  onToggleEnergyDay={toggleEnergyDay}
                  isUploadingBill={isUploadingBill}
                  onBillUpload={handleBillUpload}
                />
              </>
            )}

            {/* Huella de carbono: calculada solo con las mediciones del CSV */}
            {mostrarMediciones && (
              <CarbonEmissionsSection
                energiaPorDiaData={energiaDiariaMedida}
                visibleCarbonSeries={visibleCarbonSeries}
                seriesKeys={diasSemanaKeys}
                onToggleCarbonDay={toggleCarbonDay}
              />
            )}
          </>
        )}

{/* ── SECCIÓN DIAGRAMA UNIFILAR ── */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          {/* Input oculto para subir la imagen */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleReplaceUnifilarImage}
            accept="image/*"
            className="hidden"
          />

          {/* Cabecera con título, badge y botón Cambiar imagen */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-950">Diagrama unifilar</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Plano eléctrico del tablero. Haz clic sobre el plano para abrir el visor interactivo de zoom.
              </p>
            </div>

              <button
                type="button"
                disabled={isUpdatingUnifilar}
                onClick={() => {
                  setReplacingImageIndex(0);
                  fileInputRef.current?.click();
                }}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Reemplazar plano unifilar"
              >
                <RefreshCw size={13} className={isUpdatingUnifilar ? "animate-spin text-[#0797d5]" : "text-slate-500"} />
                <span>{isUpdatingUnifilar ? "Subiendo plano..." : "Cambiar imagen"}</span>
              </button>
          </div>

          {/* Área del plano */}
          {board.images?.unifilar && board.images.unifilar.length > 0 ? (
            <div className="space-y-6">
              {board.images.unifilar.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative w-full h-[650px] rounded-2xl border border-slate-200 bg-slate-900/5 overflow-hidden flex items-center justify-center shadow-xs"
                >
                  {/* Imagen: Solo este elemento dispara el modal al hacer clic */}
                  <img
                    src={imgUrl}
                    alt={`Diagrama unifilar ${idx + 1}`}
                    onClick={() => {
                      setActivePreview({
                        url: imgUrl,
                        title: `Diagrama Unifilar - ${board.boardCode}`,
                        reading: `Plano ${idx + 1} de ${board.images.unifilar.length}`,
                      });
                      resetZoom();
                    }}
                    className="max-h-full max-w-full object-contain p-3 cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-12 text-center">
              <FileText className="text-slate-400 opacity-40 mb-2" size={32} />
              <p className="text-xs font-bold text-slate-500 mb-3">
                Sin diagramas unifilares registrados para este tablero
              </p>
              <button
                type="button"
                onClick={() => {
                  setReplacingImageIndex(0);
                  fileInputRef.current?.click();
                }}
                className="flex items-center gap-2 rounded-xl bg-[#0797d5] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#0684ba] active:scale-95 cursor-pointer"
              >
                <RefreshCw size={13} />
                Subir plano unifilar
              </button>
            </div>
          )}
        </div>

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

        {isEmpresarial && board.insulationMeasurements && board.insulationMeasurements.length > 0 && (
          renderInsulationMeasurements()
        )}

        {isEmpresarial && board?._id && mostrarTermografia && (
          <ThermographySection
            boardId={board._id}
            originalImageUrl={board.images?.termografia?.[0]}
          />
        )}

      </section>

      {/* ========================================================================= */}
      {/* VISOR ESTILO GOOGLE DRIVE (DESKTOP + MOBILE TOUCH & PINCH) */}
      {/* ========================================================================= */}
      {activePreview && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md select-none touch-none animate-fade-in"
          onClick={() => {
            setActivePreview(null);
            resetZoom();
          }}
        >
          {/* Barra Superior */}
          <div
            className="w-full flex items-center justify-between text-white px-4 py-3 sm:px-6 sm:py-4 z-20 bg-gradient-to-b from-black/90 to-transparent gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0 pr-2">
              <p className="text-xs sm:text-sm font-bold tracking-wide truncate">
                {activePreview.title}
              </p>
              {activePreview.reading && (
                <p className="text-[10px] sm:text-xs text-slate-300 font-mono mt-0.5 truncate">
                  {activePreview.reading}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Controles de Zoom */}
              <div className="flex items-center gap-1 sm:gap-2 bg-slate-900/90 border border-slate-700/60 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-1 sm:py-1.5 backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => setZoomScale((s) => Math.max(0.5, s - 0.25))}
                  className="flex size-7 items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Alejar (-)"
                >
                  <ZoomOut size={15} />
                </button>

                <span className="text-[11px] sm:text-xs font-mono font-semibold px-0.5 text-slate-200 min-w-10 text-center">
                  {Math.round(zoomScale * 100)}%
                </span>

                <button
                  type="button"
                  onClick={() => setZoomScale((s) => Math.min(4, s + 0.25))}
                  className="flex size-7 items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Acercar (+)"
                >
                  <ZoomIn size={15} />
                </button>

                <div className="h-3.5 w-px bg-slate-700 mx-0.5" />

                <button
                  type="button"
                  onClick={resetZoom}
                  className="flex size-7 items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Restablecer tamaño original"
                >
                  <RotateCcw size={13} />
                </button>
              </div>

              {/* Botón Cerrar */}
              <button
                type="button"
                onClick={() => {
                  setActivePreview(null);
                  resetZoom();
                }}
                className="flex size-9 sm:size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
                title="Cerrar (Esc)"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Área Central Interactiva (Mouse + Touch) */}
          <div
            ref={imageContainerRef}
            className={`relative flex-1 w-full overflow-hidden flex items-center justify-center ${zoomScale > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
              }`}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => {
              if (zoomScale <= 1) return;
              setIsDragging(true);
              setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
            }}
            onMouseMove={(e) => {
              if (!isDragging || zoomScale <= 1) return;
              setPanPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
              });
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={activePreview.url}
              alt={activePreview.title}
              draggable={false}
              style={{
                transform: `translate3d(${panPosition.x}px, ${panPosition.y}px, 0) scale(${zoomScale})`, // translate3d activa aceleración GPU
                transition: isDragging ? "none" : "transform 0.15s ease-out",
              }}
              className="max-h-[82vh] max-w-[92vw] object-contain select-none pointer-events-auto rounded-lg shadow-2xl will-change-transform"
            />
          </div>

          {/* Barra Inferior Informativa */}
          <div
            className="w-full text-center py-2.5 px-4 text-[10px] sm:text-[11px] text-slate-400 bg-gradient-to-t from-black/90 to-transparent z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="hidden sm:inline">
              Rueda del ratón para Zoom &nbsp;•&nbsp; Arrastra para mover &nbsp;•&nbsp; Presiona Esc para salir
            </span>
            <span className="sm:hidden">
              Pellizca con 2 dedos para zoom &nbsp;•&nbsp; Arrastra con 1 dedo para mover
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default BoardDetailPage;
