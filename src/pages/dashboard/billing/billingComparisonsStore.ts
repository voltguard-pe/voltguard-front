import { useSyncExternalStore } from "react";

export type Slot = "a" | "b";
export type BillFile = { name: string; url: string };
export type CostItem = {
  name: string;
  value: number;
  baseValue?: number; // Monto real del recibo base (año 1)
  power?: boolean;
};

export type ComparisonMetrics = {
  contractedKw: number;
  months: string[];
  kwhFp: number[];
  kwhHp: number[];
  maxKw: number[];
  costItems: CostItem[];
  totalBill: number;
  baseTotalBill?: number;
  /** Posición (en `months`) del mes del recibo base. Por defecto 0. */
  baseIndex?: number;
};

export type Comparison = {
  id: string;
  code: string;
  title: string;
  companyCode?: string;
  distributor: string;
  supplyNumber?: string;
  baseLabel: string;
  currentLabel: string;
  bills: Record<Slot, BillFile | null>;
  metrics: ComparisonMetrics;
  source?: "pdf";
  status?: "processing" | "ready" | "error";
  error?: string;
  warnings?: string[];
};

// Ya no se piden periodos: la IA lee el mes real de cada PDF en el servidor.
export type NewComparisonInput = {
  code: string;
  title: string;
  companyCode?: string;
  fileA: File;
  fileB: File;
};

// ── API ──
const BASE_API = (import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1").replace(/\/$/, "");
const API_URL = BASE_API.endsWith("/api/v1")
  ? `${BASE_API}/bill/comparisons`
  : `${BASE_API}/api/v1/bill/comparisons`;

// Métricas vacías: solo se usan mientras el servidor lee los PDF
const EMPTY_METRICS: ComparisonMetrics = {
  contractedKw: 0,
  months: [],
  kwhFp: [],
  kwhHp: [],
  maxKw: [],
  costItems: [],
  totalBill: 0,
};

// Texto temporal mientras la IA detecta los meses reales
const PENDING_LABEL = "...";

// ── ESTADO ──
let state: Comparison[] = [];
const listeners = new Set<() => void>();

const commit = (next: Comparison[]) => {
  state = next;
  listeners.forEach((l) => l());
};

/** Aplica un cambio a un solo comparativo. */
const patch = (id: string, fn: (c: Comparison) => Comparison) =>
  commit(state.map((c) => (c.id === id ? fn(c) : c)));

const revoke = (url?: string) => {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
};

export const fileToBill = (f: File): BillFile => ({
  name: f.name,
  url: URL.createObjectURL(f),
});

const readError = async (res: Response, fallback: string) => {
  const text = await res.text().catch(() => "");
  return text || fallback;
};

export const billingStore = {
  /** Carga los comparativos del servidor. Conserva los que aún se están procesando o fallaron. */
  async fetchAll(companyCode?: string) {
    try {
      const url = companyCode ? `${API_URL}?companyCode=${encodeURIComponent(companyCode)}` : API_URL;
      const res = await fetch(url);
      if (!res.ok) return;
      const data: Comparison[] = await res.json();
      if (!Array.isArray(data)) return;

      const pending = state.filter((c) => c.status === "processing" || c.status === "error");
      const fromServer = data
        .filter((d) => !pending.some((p) => p.id === d.id))
        .map((d) => ({ ...d, status: "ready" as const }));

      commit([...pending, ...fromServer]);
    } catch (err) {
      console.error("Error cargando comparativos desde el servidor:", err);
    }
  },

  add(input: NewComparisonInput): Comparison {
    const clientId = `cmp-${Date.now()}`;
    const localBills: Record<Slot, BillFile> = {
      a: fileToBill(input.fileA),
      b: fileToBill(input.fileB),
    };

    const optimistic: Comparison = {
      id: clientId,
      code: input.code,
      title: input.title,
      companyCode: input.companyCode,
      distributor: "Analizando recibos PDF con IA...",
      baseLabel: PENDING_LABEL,
      currentLabel: PENDING_LABEL,
      bills: localBills,
      metrics: EMPTY_METRICS,
      source: "pdf",
      status: "processing",
    };

    commit([optimistic, ...state]);

    const formData = new FormData();
    formData.append("id", clientId);
    formData.append("code", input.code);
    formData.append("title", input.title);
    if (input.companyCode) formData.append("companyCode", input.companyCode);
    formData.append("fileA", input.fileA);
    formData.append("fileB", input.fileB);

    fetch(API_URL, { method: "POST", body: formData })
      .then(async (res) => {
        if (!res.ok) throw new Error(await readError(res, "Error en el servidor al analizar los PDF"));
        return res.json() as Promise<Comparison>;
      })
      .then((saved) => {
        patch(clientId, () => ({
          ...saved, // trae baseLabel y currentLabel reales, calculados desde el PDF
          id: clientId, // Conservamos el ID activo para no perder la vista ni los PDF
          status: "ready",
          bills: {
            a: saved.bills?.a?.url ? saved.bills.a : localBills.a,
            b: saved.bills?.b?.url ? saved.bills.b : localBills.b,
          },
        }));
      })
      .catch((err: Error) => {
        console.error("Error procesando recibos:", err);
        patch(clientId, (c) => ({
          ...c,
          status: "error",
          error: err.message || "Error desconocido",
        }));
      });

    return optimistic;
  },

  /** Quita un comparativo de la lista local (por ejemplo, uno que falló). */
  remove(id: string) {
    const target = state.find((c) => c.id === id);
    revoke(target?.bills.a?.url);
    revoke(target?.bills.b?.url);
    commit(state.filter((c) => c.id !== id));
  },

  /** Cambia el PDF de un recibo. Se ve al instante y se sincroniza con el servidor. */
  setBill(id: string, slot: Slot, file: File) {
    const newLocalBill = fileToBill(file);

    patch(id, (c) => {
      revoke(c.bills[slot]?.url);
      return { ...c, bills: { ...c.bills, [slot]: newLocalBill } };
    });

    const formData = new FormData();
    formData.append("file", file);

    fetch(`${API_URL}/${id}/bill/${slot}`, { method: "PUT", body: formData })
      .then(async (res) => {
        if (!res.ok) throw new Error(await readError(res, "No se pudo guardar el PDF"));
        return res.json() as Promise<Comparison>;
      })
      .then((updated) => {
        patch(id, (c) => ({
          ...updated,
          id,
          status: "ready",
          bills: {
            ...c.bills,
            [slot]: updated.bills?.[slot]?.url ? updated.bills[slot] : newLocalBill,
          },
        }));
      })
      .catch((err: Error) => {
        console.error("Error actualizando PDF individual:", err);
        const warning = `El PDF del recibo ${slot.toUpperCase()} no se guardó en el servidor y solo se ve en este navegador.`;
        patch(id, (c) => ({
          ...c,
          warnings: [...(c.warnings ?? []).filter((w) => w !== warning), warning],
        }));
      });
  },
};

// La carga inicial la hace la página con su `companyCode` (billingStore.fetchAll).
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const useBillingComparisons = () =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
