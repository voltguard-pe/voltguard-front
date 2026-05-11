import {
  ArrowLeft,
  Building2,
  Loader2,
  Save,
  ShieldCheck,
} from "lucide-react";

import { useEffect, useState } from "react";

import Input from "../../../shared/components/Input";

export type CompaniesFormData = {
  name: string;
  ruc: string;
};

interface CompaniesFormProps {
  mode: "create" | "edit";

  loading?: boolean;

  initialValues?: Partial<CompaniesFormData>;

  onSubmit: (
    data: CompaniesFormData
  ) => void | Promise<void>;

  onCancel?: () => void;
}

const CompaniesFormPage = ({
  mode,
  loading = false,
  initialValues,
  onSubmit,
  onCancel,
}: CompaniesFormProps) => {
  const isEdit = mode === "edit";

  const [name, setName] = useState("");
  const [ruc, setRuc] = useState("");

  useEffect(() => {
    if (!initialValues) return;

    setName(initialValues.name ?? "");
    setRuc(initialValues.ruc ?? "");
  }, [initialValues]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    await onSubmit({
      name: name.trim(),
      ruc: ruc.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white/20">
              {isEdit ? (
                <ShieldCheck size={24} />
              ) : (
                <Building2 size={24} />
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold">
                {isEdit
                  ? "Editar empresa"
                  : "Crear empresa"}
              </h2>

              <p className="text-sm text-white/90">
                {isEdit
                  ? "Actualiza la información de la empresa."
                  : "Registra una nueva empresa en Voltguard."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-6">
          <Input
            label="Nombre de la empresa"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Ej: Volvo Perú"
            icon={Building2}
            required
          />

          <Input
            label="RUC"
            value={ruc}
            onChange={(e) =>
              setRuc(e.target.value)
            }
            placeholder="Ej: 20123456789"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <ArrowLeft size={18} />
              Cancelar
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087fb3] disabled:opacity-60"
          >
            {loading ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Save size={18} />
            )}

            {loading
              ? isEdit
                ? "Guardando..."
                : "Creando..."
              : isEdit
              ? "Guardar cambios"
              : "Crear empresa"}
          </button>
        </div>
      </section>
    </form>
  );
};

export default CompaniesFormPage;