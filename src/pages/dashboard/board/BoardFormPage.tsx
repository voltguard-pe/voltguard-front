import {
  Building2,
  FileImage,
  FileText,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
  Zap
} from "lucide-react";
import Checkbox from "../../../shared/components/Checkbox";
import DragAndDrop from "../../../shared/components/DragAndDrop";
import Input from "../../../shared/components/Input";
import Select from "../../../shared/components/Select";
import type { BoardCircuit } from "../../../shared/types/BoardProps";
import type { CompanyResponseDTO } from "../../../shared/types/CompanyProps";


export type CircuitError = {
  circuito?: string;
  descripcion?: string;
};

export type BoardFormErrors = {
  boardCode?: string;
  name?: string;
  type?: string;
  tensionNominal?: string;
  numeroFases?: string;
  company?: string;
  incluyeNeutro?: string;
  circuits?: string;
  circuitsDetail?: CircuitError[];
};

export type BoardFormValues = {
  boardCode: string;
  name: string;
  type: string;
  tensionNominal?: number;
  numeroFases?: number;
  incluyeNeutro: boolean;
  sistema?: "MONOFASICO" | "TRIFASICO";
  estadoGeneral?: "OPERATIVO" | "OBSERVACION" | "CRITICO";
  location: string;
  description: string;
  company: string;
  circuits: BoardCircuit[];

  unifilar: File[];
  tablero: File[];
  termografia: File[];

  certificadosMantenimiento: File[];
  certificadosOperatividad: File[];

  existingUnifilar: string[];
  existingTablero: string[];
  existingTermografia: string[];

  existingCertificadosMantenimiento: string[];
  existingCertificadosOperatividad: string[];
};

type Props = {
  mode: "create" | "edit";
  values: BoardFormValues;
  errors: BoardFormErrors;
  companies: CompanyResponseDTO[];
  loading?: boolean;
  saving?: boolean;
  selectedImage: string | null;
  onSelectedImageChange: (value: string | null) => void;
  onChange: <K extends keyof BoardFormValues>(
    key: K,
    value: BoardFormValues[K]
  ) => void;
  onCircuitChange: (
    index: number,
    field: keyof BoardCircuit,
    value: any
  ) => void;
  onAddCircuit: () => void;
  onRemoveCircuit: (index: number) => void;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
};

const BoardForm = ({
  mode,
  values,
  errors,
  companies,
  loading = false,
  saving = false,
  selectedImage,
  onSelectedImageChange,
  onChange,
  onCircuitChange,
  onAddCircuit,
  onRemoveCircuit,
  onSubmit,
  onCancel,
}: Props) => {
  const isEdit = mode === "edit";

  const renderExistingImages = (
    images: string[],
    key: keyof Pick<
      BoardFormValues,
      "existingUnifilar" | "existingTablero" | "existingTermografia"
    >
  ) => {
    if (!images.length) return null;

    return (
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.map((image, index) => (
          <div key={image} className="group relative overflow-hidden rounded-2xl">
            <img
              src={image}
              onClick={() => onSelectedImageChange(image)}
              className="h-28 w-full cursor-pointer object-cover transition group-hover:scale-105"
            />

            <button
              type="button"
              onClick={() =>
                onChange(
                  key,
                  images.filter((_, imageIndex) => imageIndex !== index) as any
                )
              }
              className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-xl bg-red-600 text-white shadow"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderNewImages = (
    files: File[],
    key: keyof Pick<BoardFormValues, "unifilar" | "tablero" | "termografia">
  ) => {
    if (!files.length) return null;

    return (
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
        {files.map((file, index) => {
          const url = URL.createObjectURL(file);

          return (
            <div key={`${file.name}-${index}`} className="group relative overflow-hidden rounded-2xl">
              <img
                src={url}
                onClick={() => onSelectedImageChange(url)}
                className="h-28 w-full cursor-pointer object-cover transition group-hover:scale-105"
              />

              <button
                type="button"
                onClick={() =>
                  onChange(
                    key,
                    files.filter((_, fileIndex) => fileIndex !== index) as any
                  )
                }
                className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-xl bg-red-600 text-white shadow"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="h-28 animate-pulse rounded-3xl bg-slate-200" />
        <div className="h-[600px] animate-pulse rounded-3xl bg-slate-200" />
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            {isEdit ? "Editar tablero eléctrico" : "Crear tablero eléctrico"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {isEdit
              ? "Modifica la información técnica del tablero."
              : "Registra un nuevo tablero eléctrico con sus circuitos y archivos."}
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <X size={18} />
          Cancelar
        </button>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] text-white">
            <Zap size={24} />
          </div>

          <div>
            <h2 className="font-bold text-slate-950">
              Información general
            </h2>
            <p className="text-sm text-slate-500">
              Datos principales y eléctricos del tablero.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Código del tablero"
            value={values.boardCode}
            required
            error={errors.boardCode}
            disabled={isEdit}
            onChange={(e) => onChange("boardCode", e.target.value)}
          />

          <Input
            label="Nombre del tablero"
            value={values.name}
            required
            error={errors.name}
            onChange={(e) => onChange("name", e.target.value)}
          />

          <Input
            label="Tipo de tablero"
            value={values.type}
            required
            error={errors.type}
            onChange={(e) => onChange("type", e.target.value)}
          />

          <Input
            type="number"
            label="Tensión nominal (V)"
            value={values.tensionNominal ?? ""}
            required
            error={errors.tensionNominal}
            onChange={(e) =>
              onChange(
                "tensionNominal",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
          />

          <Input
            type="number"
            label="Número de fases"
            value={values.numeroFases ?? ""}
            required
            error={errors.numeroFases}
            onChange={(e) =>
              onChange(
                "numeroFases",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
          />

          <Select
            label="Sistema eléctrico"
            value={values.sistema || ""}
            onChange={(e) =>
              onChange(
                "sistema",
                e.target.value
                  ? (e.target.value as "MONOFASICO" | "TRIFASICO")
                  : undefined
              )
            }
            options={[
              { label: "Monofásico", value: "MONOFASICO" },
              { label: "Trifásico", value: "TRIFASICO" },
            ]}
          />

          <Select
            label="Estado general"
            value={values.estadoGeneral || ""}
            onChange={(e) =>
              onChange(
                "estadoGeneral",
                e.target.value
                  ? (e.target.value as "OPERATIVO" | "OBSERVACION" | "CRITICO")
                  : undefined
              )
            }
            options={[
              { label: "Operativo", value: "OPERATIVO" },
              { label: "Observación", value: "OBSERVACION" },
              { label: "Crítico", value: "CRITICO" },
            ]}
          />

          <Select
            label="Empresa responsable"
            value={values.company}
            required
            error={errors.company}
            disabled={isEdit}
            onChange={(e) => onChange("company", e.target.value)}
            options={companies.map((company) => ({
              label: company.name,
              value: company.publicCode,
            }))}
          />

          <Input
            label="Ubicación"
            value={values.location}
            onChange={(e) => onChange("location", e.target.value)}
          />

          <div className="md:col-span-2">
            <Input
              label="Descripción"
              value={values.description}
              onChange={(e) => onChange("description", e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Checkbox
              label="Incluye neutro"
              checked={values.incluyeNeutro}
              required
              error={errors.incluyeNeutro}
              onChange={(checked) => onChange("incluyeNeutro", checked)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
              <Building2 size={24} />
            </div>

            <div>
              <h2 className="font-bold text-slate-950">
                Circuitos del tablero
              </h2>
              <p className="text-sm text-slate-500">
                Agrega los circuitos asociados al tablero.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onAddCircuit}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087fb3]"
          >
            <Plus size={18} />
            Agregar circuito
          </button>
        </div>

        {errors.circuits && (
          <p className="mb-4 text-sm text-red-500">{errors.circuits}</p>
        )}

        <div className="space-y-4">
          {values.circuits.map((circuit, index) => (
            <div
              key={index}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-950">
                  Circuito #{index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => onRemoveCircuit(index)}
                  className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-100 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Código circuito"
                  value={circuit.circuito}
                  required
                  error={errors.circuitsDetail?.[index]?.circuito}
                  onChange={(e) =>
                    onCircuitChange(index, "circuito", e.target.value)
                  }
                />

                <Input
                  label="Descripción"
                  value={circuit.descripcion}
                  required
                  error={errors.circuitsDetail?.[index]?.descripcion}
                  onChange={(e) =>
                    onCircuitChange(index, "descripcion", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#8ccf2f]/15 text-[#3aaa35]">
            <FileImage size={24} />
          </div>

          <div>
            <h2 className="font-bold text-slate-950">Archivos e imágenes</h2>
            <p className="text-sm text-slate-500">
              Adjunta diagramas, fotos del tablero y termografías.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="mb-3 font-semibold text-slate-800">
              Diagrama unifilar
            </h3>

            <DragAndDrop
              multiple
              label="Subir diagrama unifilar"
              helperText="Puedes subir imágenes del diagrama unifilar."
              onFilesChange={(files) => onChange("unifilar", files)}
            />

            {renderExistingImages(values.existingUnifilar, "existingUnifilar")}
            {renderNewImages(values.unifilar, "unifilar")}
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-slate-800">
              Galería del tablero
            </h3>

            <DragAndDrop
              multiple
              label="Subir imágenes del tablero"
              helperText="Fotos exteriores, interiores o placa del tablero."
              onFilesChange={(files) => onChange("tablero", files)}
            />

            {renderExistingImages(values.existingTablero, "existingTablero")}
            {renderNewImages(values.tablero, "tablero")}
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-slate-800">
              Termografía
            </h3>

            <DragAndDrop
              multiple
              label="Subir imágenes de termografía"
              helperText="Carga fotos térmicas o reportes visuales."
              onFilesChange={(files) => onChange("termografia", files)}
            />

            {renderExistingImages(
              values.existingTermografia,
              "existingTermografia"
            )}
            {renderNewImages(values.termografia, "termografia")}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
            <FileText size={24} />
          </div>

          <div>
            <h2 className="font-bold text-slate-950">Documentos técnicos</h2>
            <p className="text-sm text-slate-500">
              Adjunta certificados y documentos relacionados al tablero eléctrico.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="mb-3 font-semibold text-slate-800">
              Certificados de mantenimiento
            </h3>

            <DragAndDrop
              multiple
              label="Subir certificados de mantenimiento"
              helperText="Carga certificados, informes o documentos de mantenimiento."
              onFilesChange={(files) =>
                onChange("certificadosMantenimiento", files)
              }
            />
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-slate-800">
              Certificados de operatividad
            </h3>

            <DragAndDrop
              multiple
              label="Subir certificados de operatividad"
              helperText="Carga certificados e informes de operatividad."
              onFilesChange={(files) =>
                onChange("certificadosOperatividad", files)
              }
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#087fb3] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving
            ? "Guardando..."
            : isEdit
              ? "Guardar cambios"
              : "Crear tablero"}
        </button>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => onSelectedImageChange(null)}
        >
          <img
            src={selectedImage}
            className="max-h-[90vh] max-w-[90vw] rounded-3xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            type="button"
            onClick={() => onSelectedImageChange(null)}
            className="absolute right-5 top-5 flex size-11 items-center justify-center rounded-2xl bg-white text-slate-700"
          >
            <X size={22} />
          </button>
        </div>
      )}
    </form>
  );
};

export default BoardForm;