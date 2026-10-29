import { useSyncExternalStore } from "react";

// ── Store compartido en memoria ──
// La página de Comparativo y el sidebar (Facturación > Recibo de Luz) leen la
// misma lista con useBillingComparisons(), así el código que se escribe al
// importar aparece en el menú sin pasar props entre componentes.
// Está en memoria: al recargar el navegador vuelve al SEED. Cuando exista
// backend, reemplaza add() y setBill() por llamadas a la API.

export type Slot = "a" | "b";
export type BillFile = { name: string; url: string };
export type CostItem = { name: string; value: number; power?: boolean };

export type ComparisonMetrics = {
  contractedKw: number;
  months: string[];
  kwhFp: number[];
  kwhHp: number[];
  maxKw: number[];
  costItems: CostItem[]; // desglose del recibo actual (S/); power = cargo por potencia
  totalBill: number;
};

export type Comparison = {
  id: string;
  code: string; // código que se ve en el sidebar
  title: string; // ubicación / título
  companyCode?: string;
  distributor: string;
  supplyNumber?: string;
  baseLabel: string;
  currentLabel: string;
  bills: Record<Slot, BillFile | null>;
  metrics: ComparisonMetrics;
  // "demo" = números de prueba hardcodeados (todavía no se leen del PDF)
  source: "demo" | "pdf";
};

// Tabla "Historial de Consumos y Demandas" del recibo (May-25 a Abr-26)
export const DEMO_METRICS: ComparisonMetrics = {
  contractedKw: 55,
  months: ["May-25", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic", "Ene-26", "Feb", "Mar", "Abr"],
  kwhFp: [7678, 5688, 5232, 5645, 5631, 6523, 7880, 8482, 11891, 13714, 13459, 12779],
  kwhHp: [966, 942, 906, 840, 956, 977, 1049, 942, 1216, 1535, 1292, 1166],
  maxKw: [50.88, 31.72, 30.36, 46.0, 36.24, 43.92, 45.44, 52.8, 55.92, 56.08, 58.17, 62.52],
  costItems: [
    { name: "Energía fuera de punta", value: 3423.55 },
    { name: "Potencia distribución", value: 3054.82, power: true },
    { name: "Potencia generación", value: 2674.61, power: true },
    { name: "IGV", value: 1763.44 },
    { name: "Energía hora punta", value: 362.27 },
    { name: "Alumbrado público", value: 208.5 },
    { name: "Electrificación rural", value: 153.39 },
    { name: "Reactiva capacitiva", value: 61.84 },
    { name: "Cargos fijos", value: 11.28 },
  ],
  totalBill: 11713.7,
};

const SEED: Comparison = {
  id: "seed-luz-1405305",
  code: "LUZ-1405305",
  title: "Suministro principal",
  distributor: "Luz del Sur S.A.A.",
  supplyNumber: "1405305",
  baseLabel: "May-25",
  currentLabel: "Abr-26",
  bills: { a: null, b: null },
  metrics: DEMO_METRICS,
  source: "demo",
};

let state: Comparison[] = [SEED];
const listeners = new Set<() => void>();
const commit = (next: Comparison[]) => {
  state = next;
  listeners.forEach((l) => l());
};

export const fileToBill = (f: File): BillFile => ({ name: f.name, url: URL.createObjectURL(f) });

export type NewComparisonInput = {
  code: string;
  title: string;
  companyCode?: string;
  baseLabel: string;
  currentLabel: string;
  fileA: File;
  fileB: File;
};

export const billingStore = {
  add(input: NewComparisonInput): Comparison {
    const created: Comparison = {
      id: `cmp-${Date.now()}`,
      code: input.code,
      title: input.title,
      companyCode: input.companyCode,
      distributor: "Luz del Sur S.A.A.",
      baseLabel: input.baseLabel,
      currentLabel: input.currentLabel,
      bills: { a: fileToBill(input.fileA), b: fileToBill(input.fileB) },
      metrics: DEMO_METRICS, // pendiente: extraer los valores del PDF
      source: "demo",
    };
    commit([...state, created]);
    return created;
  },

  setBill(id: string, slot: Slot, file: File) {
    commit(
      state.map((c) => {
        if (c.id !== id) return c;
        if (c.bills[slot]) URL.revokeObjectURL(c.bills[slot]!.url);
        return { ...c, bills: { ...c.bills, [slot]: fileToBill(file) } };
      }),
    );
  },
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const useBillingComparisons = () =>
  useSyncExternalStore(subscribe, () => state, () => state);
