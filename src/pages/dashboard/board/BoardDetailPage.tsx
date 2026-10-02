import { ArrowLeft, Building2, CheckCircle2, Info, MapPin, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { CarbonEmissionsSection } from "../../../components/dashboard/sections/CarbonEmissionsSection";
import { DemandSection } from "../../../components/dashboard/sections/DemandSection";
import { EnergyBarSection } from "../../../components/dashboard/sections/EnergyBarSection";
import { EnergyCostSection } from "../../../components/dashboard/sections/EnergyCostSection";
import { IticCurveSection } from "../../../components/dashboard/sections/IticCurveSection";
import { Nfpa70eSection } from "../../../components/dashboard/sections/Nfpa70eSection";
import { ReactivePowerSection } from "../../../components/dashboard/sections/ReactivePowerSection";
import { ThdVoltageSection } from "../../../components/dashboard/sections/ThdVoltageSection";
import { ThermographySection } from "../../../components/dashboard/sections/ThermographySection";
import { uploadReceiptBill } from "../../../services/bill.service";
import { getBoardByCode } from "../../../services/board.service";
import { getDemandChartData, uploadMetrelCsv } from "../../../services/measurement.service";
import { getIticEvents, uploadIticCsv, type VoltageEventItem } from "../../../services/voltageEvent.service";
import { useAuth } from "../../../shared/hooks/useAuth";
import type { BoardResponseDTO } from "../../../shared/types/BoardProps";

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
  const { auth, loading: authLoading } = useAuth();

  // Normalizamos a mayúsculas/minúsculas para evitar desajustes ('EMPRESARIAL' vs 'empresarial')
  const rawRole = (auth?.role || "USER").toUpperCase();
  const rawPlan = (auth?.plan || "basico").toLowerCase();

  // 1. Determinar el rol efectivo
  const effectiveRole = rawRole === "SUPERADMIN"
    ? "SUPERADMIN"
    : rawPlan === "empresarial"
      ? "ADMIN"
      : "USER";

  // 2. Banderas de control de vistas
  const isSuperAdmin = effectiveRole === "SUPERADMIN" || rawRole === "SUPERADMIN";
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

  // Agrega este estado cerca de visibleDemandSeries / visibleReactiveSeries:
  const [visibleThdFases, setVisibleThdFases] = useState<{ [key: string]: boolean }>({
    u12: true,
    u23: true,
    u31: true,
  });

  // Dentro de tu componente BoardDetailPage:
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
          // ✅ CÓDIGO CORREGIDO:
          const valThdV = typeof punto === 'object' ? (punto?.thd_v ?? 0) : 0;
          const valThdI = typeof punto === 'object' ? (punto?.thd_i ?? 0) : 0;
          // Leemos las tres fases individuales que envía el nuevo backend:
          const valU12 = typeof punto === 'object' ? (punto?.thd_u12 ?? 0) : 0;
          const valU23 = typeof punto === 'object' ? (punto?.thd_u23 ?? 0) : 0;
          const valU31 = typeof punto === 'object' ? (punto?.thd_u31 ?? 0) : 0;

          row[labelCorto] = valP;
          row[`inductiva_${labelCorto}`] = valInd;
          row[`capacitiva_${labelCorto}`] = valCap;
          row[`thd_v_${labelCorto}`] = valThdV;
          row[`thd_i_${labelCorto}`] = valThdI;

          // Inyectamos las tres líneas trifásicas por día:
          row[`thd_u12_${labelCorto}`] = valU12;
          row[`thd_u23_${labelCorto}`] = valU23;
          row[`thd_u31_${labelCorto}`] = valU31;

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

  const toggleThdFase = (fase: string) => {
    setVisibleThdFases(prev => ({ ...prev, [fase]: !prev[fase] }));
  };

  useEffect(() => {
    // Si la autenticación aún se está resolviendo, esperamos
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

  /* TODO: SEPARADOR */

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

  /* TODO: SEPARADOR */

  // ── ESTADOS PARA RECIBO Y COSTO DE ENERGÍA (HP / FP) ──
  // 1. Inicializa leyendo directamente del tablero si ya existen en la base de datos
  const [rates, setRates] = useState<{ hp: number; fp: number } | null>(() => {
    const r = (board as any)?.energyRates;
    if (r?.tarifaHP && r?.tarifaFP) {
      return { hp: Number(r.tarifaHP), fp: Number(r.tarifaFP) };
    }
    return null;
  });

  const [isUploadingBill, setIsUploadingBill] = useState(false);

  // 2. Sincronizar cuando el tablero termine de cargar desde la API
  useEffect(() => {
    const energyRates = (board as any)?.energyRates;
    if (energyRates?.tarifaHP && energyRates?.tarifaFP) {
      setRates({
        hp: Number(energyRates.tarifaHP),
        fp: Number(energyRates.tarifaFP),
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
      e.target.value = "";
    }
  };

  /* TODO: SEPARADOR */

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

  const renderField = (label: string, data: unknown, index: number) => (
    <div style={{ animation: "fadeUp 0.4s ease both", animationDelay: `${index * 30}ms` }} className="rounded-2xl bg-slate-50 p-4 transition-all hover:bg-slate-100/80">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-slate-800">{value(data)}</p>
    </div>
  );

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

        {/* ── PLAN EMPRESARIAL: ETIQUETADO DE SEGURIDAD (NFPA 70E) ── */}
        {isEmpresarial && board?.nfpa && (
          <Nfpa70eSection board={board} publicCode={publicCode} />
        )}

        {isEmpresarial && (
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

            {/* {renderCombinedDemandAndReactiveSection()} */}

            <ThdVoltageSection
              rawChartData={rawChartData}
              seriesKeys={seriesKeys}
              selectedThdUDay={selectedThdUDay}
              onSelectThdUDay={setSelectedThdUDay}
              visibleThdFases={visibleThdFases}
              onToggleThdFase={toggleThdFase}
            />

            {/* {renderThdCurrentSection()} */}

            <IticCurveSection
              iticEvents={iticEvents}
              tensionNominal={board?.tensionNominal}
              uploadingItic={uploadingItic}
              onIticFileUpload={handleIticFileUpload}
            />

            <EnergyBarSection
              energiaPorDiaData={energiaPorDiaData}
              visibleEnergySeries={visibleEnergySeries}
              seriesKeys={seriesKeys}
              onToggleEnergyDay={toggleEnergyDay}
            />

            <CarbonEmissionsSection
              energiaPorDiaData={energiaPorDiaData}
              visibleCarbonSeries={visibleCarbonSeries}
              seriesKeys={seriesKeys}
              onToggleCarbonDay={toggleCarbonDay}
            />

            <EnergyCostSection
              rates={rates}
              energiaPorDiaData={energiaPorDiaData}
              visibleCostSeries={visibleCostSeries}
              seriesKeys={seriesKeys}
              onToggleCostDay={toggleCostDay}
              isUploadingBill={isUploadingBill}
              onBillUpload={handleBillUpload}
            />

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

        {/* ── PLAN EMPRESARIAL: INSPECCIÓN TERMOGRÁFICA (NFPA 70B) ── */}
        {isEmpresarial && board?._id && (
          <ThermographySection
            boardId={board._id}
            originalImageUrl={board.images?.termografia?.[0]}
          />
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