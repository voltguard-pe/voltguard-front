import React, { useEffect, useMemo, useRef, useState } from "react";
import { Coins, Loader2, ReceiptText, UploadCloud, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface EnergyCostSectionProps {
  rates: { hp: number; fp: number } | null;
  energiaPorMesData: any[];
  visibleCostSeries: { [key: string]: boolean };
  seriesKeys: string[];
  onToggleCostDay: (key: string) => void;
  isUploadingBill: boolean;
  onBillUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

type Vista = "total" | "energia";

const money = (n: number) =>
  n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CostTooltip = ({ active, payload, label, vista }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    const verTotal = vista === "total";
    const totalMostrado = verTotal ? d.costoTotal : d.costoEnergia;

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl font-sans text-xs min-w-[260px] z-50">
        <div className="border-b border-slate-100 pb-2.5 mb-3 flex items-center justify-between gap-3">
          <span className="font-bold text-slate-800 text-sm">
            {label} <span className="text-slate-400 font-medium text-xs">({d.dias} días)</span>
          </span>
          <span className="font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 text-xs">
            S/. {money(totalMostrado)}
          </span>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 font-bold text-[#ff2e51]">
              <span className="size-3 rounded-full bg-[#ff2e51] inline-block" />
              Hora Punta (HP):
            </span>
            <span className="text-right">
              <span className="font-black text-slate-900 tabular-nums block text-xs">S/. {money(d.costoHP)}</span>
              <span className="text-[11px] text-slate-400 tabular-nums">{money(d.kwhHP)} kWh</span>
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 font-bold text-blue-600">
              <span className="size-3 rounded-full bg-blue-500 inline-block" />
              Fuera de Punta (FP):
            </span>
            <span className="text-right">
              <span className="font-black text-slate-900 tabular-nums block text-xs">S/. {money(d.costoFP)}</span>
              <span className="text-[11px] text-slate-400 tabular-nums">{money(d.kwhFP)} kWh</span>
            </span>
          </div>

          {verTotal && d.costoOtros > 0 && (
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 font-bold text-slate-500">
                <span className="size-3 rounded-full bg-slate-400 inline-block" />
                Potencia, reactiva e IGV:
              </span>
              <span className="text-right">
                <span className="font-black text-slate-900 tabular-nums block text-xs">S/. {money(d.costoOtros)}</span>
                <span className="text-[11px] text-slate-400">{d.estimado ? "estimado" : "según recibo"}</span>
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 border-t border-slate-100 pt-2 text-[10px] text-slate-400 flex justify-between font-medium">
          <span>HP: 18:00 a 23:00 hrs</span>
          <span className="font-bold text-blue-600">VoltGuard</span>
        </div>
      </div>
    );
  }
  return null;
};

// Renderizado de etiquetas garantizado incluso en barras delgadas (Jul 25, Ago 25)
const renderSegmentLabel = (props: any, key: "costoFP" | "costoHP" | "costoOtros", data: any[]) => {
  const { x, y, width, height, index } = props;
  const item = data?.[index];
  if (!item || width < 20) return null;

  const valor = Math.round(item[key]);
  if (valor <= 0) return null;

  // Ajuste de tamaño de fuente si el segmento de la barra es estrecho
  const isThin = height < 14;
  const fontSize = isThin ? "10px" : "12px";

  return (
    <text
      x={x + width / 2}
      y={y + height / 2 + (isThin ? 3 : 4.5)}
      fill="#ffffff"
      textAnchor="middle"
      style={{ fontSize, fontWeight: 900 }}
      className="tabular-nums select-none pointer-events-none drop-shadow-xs"
    >
      {valor.toLocaleString("es-PE")}
    </text>
  );
};

// Monto total superior bien grande y visible
const renderTotalLabel = (props: any, data: any[], vista: Vista) => {
  const { x, y, width, index } = props;
  const item = data?.[index];
  if (!item) return null;
  const valor = vista === "total" ? item.costoTotal : item.costoEnergia;

  return (
    <text
      x={x + width / 2}
      y={y - 9}
      fill="#0f172a"
      textAnchor="middle"
      className="text-[13px] font-black tabular-nums select-none pointer-events-none"
    >
      S/. {Math.round(valor).toLocaleString("es-PE")}
      {vista === "total" && item.estimado ? "*" : ""}
    </text>
  );
};

export const EnergyCostSection: React.FC<EnergyCostSectionProps> = ({
  rates,
  energiaPorMesData = [],
  visibleCostSeries = {},
  seriesKeys = [],
  onToggleCostDay,
  isUploadingBill,
  onBillUpload
}) => {
  const billFileInputRef = useRef<HTMLInputElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [animate, setAnimate] = useState(true);
  const [vista, setVista] = useState<Vista>("total");

  useEffect(() => {
    const t = setTimeout(() => setAnimate(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const costoData = useMemo(() => {
    if (!rates || !Array.isArray(energiaPorMesData)) return [];

    return energiaPorMesData
      .filter((m) => m && visibleCostSeries[m.name] !== false)
      .map((m) => {
        const kwhHP = Number(m.kwhHP) || 0;
        const kwhFP = Number(m.kwhFP) || 0;
        const costoHP = Math.round(kwhHP * rates.hp * 100) / 100;
        const costoFP = Math.round(kwhFP * rates.fp * 100) / 100;
        const costoEnergia = Math.round((costoHP + costoFP) * 100) / 100;

        const totalRecibo = Number(m.costoTotalRecibo) || 0;
        const tieneTotal = totalRecibo > costoEnergia * 1.02;
        const costoTotal = tieneTotal ? totalRecibo : costoEnergia;
        const costoOtros = Math.round((costoTotal - costoEnergia) * 100) / 100;

        return {
          name: m.name,
          dias: Number(m.dias) || 30,
          kwhHP,
          kwhFP,
          costoHP,
          costoFP,
          costoEnergia,
          costoOtros,
          costoTotal: Math.round(costoTotal * 100) / 100,
          tieneTotal,
          estimado: tieneTotal && Boolean(m.totalEsEstimado)
        };
      });
  }, [rates, energiaPorMesData, visibleCostSeries]);

  const isAllSelected = useMemo(
    () => seriesKeys.length > 0 && seriesKeys.every((key) => visibleCostSeries[key] !== false),
    [seriesKeys, visibleCostSeries]
  );

  const activeCount = useMemo(
    () => seriesKeys.filter((key) => visibleCostSeries[key] !== false).length,
    [seriesKeys, visibleCostSeries]
  );

  const handleSafeToggle = (key: string) => {
    const isCurrentlySelected = visibleCostSeries[key] !== false;
    if (isCurrentlySelected && activeCount <= 1) return;
    onToggleCostDay(key);
  };

  const handleSelectAll = () => {
    seriesKeys.forEach((key) => {
      if (visibleCostSeries[key] === false) onToggleCostDay(key);
    });
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -180 : 180;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const fileInput = (
    <input
      type="file"
      ref={billFileInputRef}
      onChange={onBillUpload}
      accept="image/*,application/pdf"
      className="hidden"
      disabled={isUploadingBill}
    />
  );

  if (!rates) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm font-sans mt-6">
        {fileInput}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 px-4 py-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-rose-100 text-blue-600 mb-3">
            <ReceiptText size={28} />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">Costo de Energía Estimado</h3>
          <p className="mt-1 mb-4 text-xs text-slate-500 max-w-md">
            Adjunta una fotografía de tu recibo de luz para extraer las tarifas y consumo.
          </p>

          <button
            type="button"
            disabled={isUploadingBill}
            onClick={() => billFileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 rounded-xl text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 border border-blue-500/30 bg-blue-600 cursor-pointer"
          >
            {isUploadingBill ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" />
                <span>Analizando recibo...</span>
              </>
            ) : (
              <>
                <UploadCloud size={16} className="text-white" />
                <span>Adjuntar Recibo de Luz</span>
              </>
            )}
          </button>
        </div>
      </section>
    );
  }

  const hayDatos = energiaPorMesData.length > 0;
  const sinTotal = costoData.length > 0 && costoData.every((d) => !d.tieneTotal);
  const vistaEfectiva: Vista = vista === "total" && !sinTotal ? "total" : "energia";
  const verTotal = vistaEfectiva === "total";

  const totalEnergia = costoData.reduce((a, d) => a + d.costoEnergia, 0);
  const totalHP = costoData.reduce((a, d) => a + d.costoHP, 0);
  const totalFP = costoData.reduce((a, d) => a + d.costoFP, 0);
  const totalOtros = costoData.reduce((a, d) => a + d.costoOtros, 0);
  const totalFacturado = costoData.reduce((a, d) => a + d.costoTotal, 0);
  const totalDias = costoData.reduce((a, d) => a + d.dias, 0);

  const base = verTotal ? totalFacturado : totalEnergia;
  const promedioMensual = costoData.length > 0 ? base / costoData.length : 0;
  const costoPorDia = totalDias > 0 ? base / totalDias : 0;
  const proyeccionAnual = costoPorDia * 365;

  const pctOtros = totalFacturado > 0 ? (totalOtros / totalFacturado) * 100 : 0;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm font-sans mt-6">
      {fileInput}

      {/* Encabezado */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-rose-100 text-blue-600 border border-blue-200">
            <Coins size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                Costo de Energía Estimado
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-[#ff2e51] border border-rose-200">
                HP / FP
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Gasto mensual de los últimos meses facturados. Tarifas:{" "}
              <span className="text-[#ff2e51] font-semibold">HP = S/. {rates.hp.toFixed(4)}</span> |{" "}
              <span className="text-blue-600 font-semibold">FP = S/. {rates.fp.toFixed(4)}</span> por kWh
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isUploadingBill}
          onClick={() => billFileInputRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 rounded-xl text-white px-4.5 py-2.5 text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 cursor-pointer border border-blue-500/30 bg-blue-600"
        >
          <ReceiptText size={16} className="text-white" />
          <span>Cambiar Recibo de Luz</span>
        </button>
      </div>

      {hayDatos && (
        <>
          {/* Tarjetas KPI Corporativas */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5">
              <p className="text-xs font-black uppercase tracking-wider text-blue-600">
                {verTotal ? "Total Facturado" : "Total Energía Activa"} ({costoData.length} meses)
              </p>
              <p className="mt-2 text-3xl font-black text-slate-900 tracking-tight">
                S/. {money(base)}
              </p>
              <p className="mt-2 text-xs text-slate-500 font-medium">Promedio: S/. {money(promedioMensual)} / mes</p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5">
              <p className="text-xs font-black uppercase tracking-wider text-blue-600">Proyección Anual (365D)</p>
              <p className="mt-2 text-3xl font-black text-slate-900 tracking-tight">
                S/. {money(proyeccionAnual)}
              </p>
              <p className="mt-2 text-xs text-slate-500 font-medium">Equivale a S/. {money(costoPorDia)} / día</p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
              <p className="text-xs font-black uppercase tracking-wider text-blue-600">Energía Activa (HP + FP)</p>
              <p className="mt-2 text-3xl font-black text-blue-700 tracking-tight">S/. {money(totalEnergia)}</p>
              <p className="mt-2 text-xs text-blue-600/80 font-medium">
                <span className="text-[#ff2e51]">HP {money(totalHP)}</span> · <span>FP {money(totalFP)}</span>
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">Potencia, Reactiva e IGV</p>
              <p className="mt-2 text-3xl font-black text-slate-700 tracking-tight">
                {sinTotal ? "—" : `S/. ${money(totalOtros)}`}
              </p>
              <p className="mt-2 text-xs text-slate-500 font-medium">{pctOtros.toFixed(0)}% del total</p>
            </div>
          </div>

          {/* Barra de Filtros */}
          <div className="mb-6 flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50/90 border border-slate-200/90 font-sans">
            <div className="flex items-center gap-1.5 pl-2 shrink-0">
              <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Meses:</span>
            </div>

            <div className="relative flex items-center flex-1 min-w-0">
              <button
                type="button"
                onClick={() => scroll("left")}
                className="hidden sm:flex items-center justify-center size-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 shrink-0 mr-1.5 cursor-pointer shadow-2xs"
              >
                <ChevronLeft size={16} />
              </button>

              <div
                ref={scrollContainerRef}
                className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-0.5 scroll-smooth flex-1"
              >
                {seriesKeys.map((key) => {
                  const isSelected = visibleCostSeries[key] !== false;
                  const isLastActive = isSelected && activeCount === 1;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSafeToggle(key)}
                      title={isLastActive ? "Debe mantener al menos un mes visible" : undefined}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border shrink-0 cursor-pointer transition-all ${
                        isSelected
                          ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                          : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"
                      } ${isLastActive ? "cursor-not-allowed opacity-80" : ""}`}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => scroll("right")}
                className="hidden sm:flex items-center justify-center size-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 shrink-0 ml-1.5 cursor-pointer shadow-2xs"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="pl-2 border-l border-slate-200 shrink-0">
              <button
                type="button"
                onClick={handleSelectAll}
                className={`px-4 py-1.5 text-xs font-black rounded-full border cursor-pointer transition-all ${
                  isAllSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white border-slate-200 text-blue-600 hover:bg-blue-50"
                }`}
              >
                Todos
              </button>
            </div>
          </div>

          {!sinTotal && (
            <div className="mb-4 flex justify-end">
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold">
                {([
                  ["total", "Total facturado"],
                  ["energia", "Solo energía activa"]
                ] as [Vista, string][]).map(([v, texto]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVista(v)}
                    className={`px-4 py-2 rounded-lg cursor-pointer transition-all ${
                      vista === v
                        ? "bg-white text-blue-700 border border-slate-200 shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {texto}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Gráfico Ampliado y Barras Grandes con Números Visibles en Todas las Barras Rojas */}
          <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white p-3 sm:p-5 scrollbar-thin">
            <div className="h-[520px] md:h-[600px] min-w-[1000px] w-full text-xs font-medium text-slate-600 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={costoData}
                  margin={{ top: 45, right: 20, left: 15, bottom: 35 }}
                  barCategoryGap="14%"
                >
                  <defs>
                    <linearGradient id="gradFP" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                    <linearGradient id="gradHP" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f94e6b" />
                      <stop offset="100%" stopColor="#d61a3b" />
                    </linearGradient>
                    <linearGradient id="gradOtros" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#94a3b8" />
                      <stop offset="100%" stopColor="#64748b" />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    stroke="#94a3b8"
                    dy={10}
                    tick={{ fontSize: "12px", fontWeight: "800", fill: "#334155" }}
                  >
                    <Label
                      value="Meses facturados"
                      position="insideBottom"
                      offset={-22}
                      style={{ textAnchor: "middle", fill: "#475569", fontWeight: "800", fontSize: "11px", letterSpacing: "0.05em" }}
                    />
                  </XAxis>
                  
                  <YAxis
                    domain={[0, 80000]}
                    ticks={[0, 20000, 40000, 60000, 80000]}
                    tickLine={false}
                    stroke="#94a3b8"
                    width={85}
                    tick={{ fontSize: "12px", fontWeight: "700", fill: "#475569" }}
                    tickFormatter={(val) => `S/. ${Number(val).toLocaleString("es-PE")}`}
                  >
                    <Label
                      value="Costo (S/.)"
                      angle={-90}
                      position="insideLeft"
                      offset={-5}
                      style={{ textAnchor: "middle", fill: "#475569", fontWeight: "800", fontSize: "11px", letterSpacing: "0.05em" }}
                    />
                  </YAxis>

                  <Tooltip
                    content={<CostTooltip vista={vistaEfectiva} />}
                    cursor={{ fill: "#3b82f6", opacity: 0.05 }}
                  />

                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: "20px", fontSize: "13px", fontWeight: 700 }}
                  />

                  {/* Barras de Fuera de Punta (FP) */}
                  <Bar
                    dataKey="costoFP"
                    name="Fuera de Punta (FP)"
                    stackId="costo"
                    fill="url(#gradFP)"
                    maxBarSize={78}
                    isAnimationActive={animate}
                  >
                    <LabelList content={(props: any) => renderSegmentLabel(props, "costoFP", costoData)} />
                  </Bar>

                  {/* Barras de Hora Punta (HP) - Garantiza la visualización de Jul y Ago */}
                  <Bar
                    dataKey="costoHP"
                    name="Hora Punta (HP)"
                    stackId="costo"
                    fill="url(#gradHP)"
                    radius={verTotal ? [0, 0, 0, 0] : [8, 8, 0, 0]}
                    maxBarSize={78}
                    isAnimationActive={animate}
                  >
                    <LabelList content={(props: any) => renderSegmentLabel(props, "costoHP", costoData)} />
                    {!verTotal && (
                      <LabelList content={(props: any) => renderTotalLabel(props, costoData, "energia")} />
                    )}
                  </Bar>

                  {/* Barras de Potencia, reactiva e IGV */}
                  {verTotal && (
                    <Bar
                      dataKey="costoOtros"
                      name="Potencia, reactiva e IGV"
                      stackId="costo"
                      fill="url(#gradOtros)"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={78}
                      isAnimationActive={animate}
                    >
                      <LabelList content={(props: any) => renderSegmentLabel(props, "costoOtros", costoData)} />
                      <LabelList content={(props: any) => renderTotalLabel(props, costoData, "total")} />
                    </Bar>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </section>
  );
};