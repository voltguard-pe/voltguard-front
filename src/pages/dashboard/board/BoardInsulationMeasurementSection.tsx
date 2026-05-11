import { Loader2, Plus, Save, Trash2 } from "lucide-react";

import type { InsulationManualPayload } from "../../../services/insulation.service";

type Props = {
  values: InsulationManualPayload;
  hasMeasurement: boolean;
  isMonofasicBoard: boolean;
  saving: boolean;
  deleting: boolean;
  onChange: (key: keyof InsulationManualPayload, value: string) => void;
  onSave: () => void;
  onDelete: () => void;
};

const formatInputValue = (value: number | null) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const BoardInsulationMeasurementsSection = ({
  values,
  hasMeasurement,
  isMonofasicBoard,
  saving,
  deleting,
  onChange,
  onSave,
  onDelete,
}: Props) => {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Mediciones de aislamiento
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Registro manual de las mediciones generales fase-tierra del tablero.
          </p>
        </div>

        {hasMeasurement ? (
          <span className="w-fit rounded-full bg-[#8ccf2f]/15 px-3 py-1 text-xs font-semibold text-[#3aaa35]">
            Tabla registrada
          </span>
        ) : (
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Sin tabla registrada
          </span>
        )}
      </div>

      <div className="mb-4 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Descripción
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-800">
          Barras generales
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-semibold text-slate-700">
            Fase 1 - Tierra
          </label>

          <div className="mt-2 flex overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <input
              type="number"
              min="0"
              step="0.01"
              value={formatInputValue(values.measurement_l1_g)}
              onChange={(event) =>
                onChange("measurement_l1_g", event.target.value)
              }
              disabled={saving || deleting}
              className="w-full px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-50"
              placeholder="Ej. 120"
            />

            <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-500">
              MΩ
            </span>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">
            Fase 2 - Tierra
          </label>

          <div className="mt-2 flex overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <input
              type="number"
              min="0"
              step="0.01"
              value={formatInputValue(values.measurement_l2_g)}
              onChange={(event) =>
                onChange("measurement_l2_g", event.target.value)
              }
              disabled={saving || deleting}
              className="w-full px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-50"
              placeholder="Ej. 119"
            />

            <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-500">
              MΩ
            </span>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">
            Fase 3 - Tierra
          </label>

          <div className="mt-2 flex overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <input
              type="number"
              min="0"
              step="0.01"
              value={formatInputValue(values.measurement_l3_g)}
              onChange={(event) =>
                onChange("measurement_l3_g", event.target.value)
              }
              disabled={saving || deleting || isMonofasicBoard}
              className="w-full px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              placeholder={isMonofasicBoard ? "No aplica" : "Ej. 118"}
            />

            <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-500">
              MΩ
            </span>
          </div>

          {isMonofasicBoard && (
            <p className="mt-2 text-xs text-slate-500">
              Fase 3 - Tierra está bloqueada porque el tablero es monofásico.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {hasMeasurement && (
          <button
            type="button"
            onClick={onDelete}
            disabled={saving || deleting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Trash2 size={18} />
            )}

            {deleting ? "Eliminando..." : "Eliminar tabla"}
          </button>
        )}

        <button
          type="button"
          onClick={onSave}
          disabled={saving || deleting}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087fb3] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : hasMeasurement ? (
            <Save size={18} />
          ) : (
            <Plus size={18} />
          )}

          {saving
            ? "Guardando..."
            : hasMeasurement
              ? "Actualizar tabla"
              : "Agregar tabla"}
        </button>
      </div>
    </section>
  );
};

export default BoardInsulationMeasurementsSection;