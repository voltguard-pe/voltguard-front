import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Flame,
  ImageIcon,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { uploadThermographyPackage } from "../../../services/thermography.service";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  onSuccess: () => void;
};

type Status = "idle" | "processing" | "success" | "error";

export const ImportThermographyModal = ({
  isOpen,
  onClose,
  boardId,
  onSuccess,
}: Props) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);

  const resetState = () => {
    setCsvFile(null);
    setImageFile(null);
    setPreviewImage(null);
    setStatus("idle");
    setProgress(0);
  };

  const handleClose = () => {
    if (status === "processing") return;
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  // Validación y arrastre de CSV
  const handleCsvFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv") {
      toast.error("Solo se permite subir archivo .CSV para la matriz térmica");
      return;
    }
    setCsvFile(file);
    setStatus("idle");
  };

  // Validación y arrastre de Imagen JPG
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permite subir archivos de imagen (.jpg, .jpeg, .png)");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);
    setStatus("idle");
  };

  const simulateProgress = () => {
    let value = 0;
    const interval = setInterval(() => {
      value += Math.random() * 12;
      if (value >= 90) {
        value = 90;
        clearInterval(interval);
      }
      setProgress(Math.floor(value));
    }, 300);
    return interval;
  };

  const handleSubmit = async () => {
    if (!csvFile) {
      toast.warning("El archivo CSV con la matriz térmica es obligatorio");
      return;
    }
    if (!boardId) {
      toast.error("Identificador de tablero no válido");
      return;
    }

    setStatus("processing");
    setProgress(0);
    const interval = simulateProgress();

    try {
      await uploadThermographyPackage(boardId, csvFile, imageFile);

      clearInterval(interval);
      setProgress(100);
      setStatus("success");
      toast.success("Inspección termográfica guardada correctamente en la BD");

      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 700);
    } catch (error: any) {
      clearInterval(interval);
      setStatus("error");
      console.error("Error subiendo termografía:", error);

      const msg =
        error?.response?.data?.error ||
        error.message ||
        "Error al procesar la termografía en el servidor";
      toast.error(msg, { autoClose: 8000 });
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case "processing":
        return {
          icon: <Loader2 size={18} className="animate-spin" />,
          text: `Procesando matriz radiométrica y comprimiendo datos... ${progress}%`,
          className: "bg-orange-500/10 text-orange-600",
        };
      case "success":
        return {
          icon: <CheckCircle2 size={18} />,
          text: "Datos radiométricos sincronizados con éxito",
          className: "bg-emerald-50 text-emerald-700",
        };
      case "error":
        return {
          icon: <AlertCircle size={18} />,
          text: "Ocurrió un error al procesar los archivos térmicos",
          className: "bg-red-50 text-red-700",
        };
      default:
        return {
          icon: <UploadCloud size={18} />,
          text: "Selecciona el CSV de temperaturas y opcionalmente la foto visible",
          className: "bg-slate-100 text-slate-600",
        };
    }
  };

  const statusContent = getStatusContent();
  const canUpload = !!csvFile && status !== "processing";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20">
              <Flame size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Importar Inspección Termográfica (NFPA 70B)
              </h2>
              <p className="text-sm text-slate-500">
                Carga la matriz radiométrica (.csv) y la foto real (.jpg) para habilitar la fusión MSX.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={status === "processing"}
            className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
          {/* Zona 1: CSV Térmico (Obligatorio) */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">
              1. Matriz de Temperaturas (.CSV) <span className="text-red-500">*</span>
            </label>
            <label
              htmlFor="csvThermFileInput"
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) handleCsvFile(e.dataTransfer.files[0]);
              }}
              onDragOver={(e) => e.preventDefault()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center transition ${
                status === "processing"
                  ? "pointer-events-none border-slate-200 bg-slate-50 opacity-60"
                  : csvFile
                  ? "border-emerald-500 bg-emerald-50/20"
                  : "border-slate-200 bg-slate-50 hover:border-orange-500 hover:bg-orange-500/5"
              }`}
            >
              <div
                className={`flex size-14 items-center justify-center rounded-2xl ${
                  csvFile ? "bg-emerald-100 text-emerald-600" : "bg-orange-500/10 text-orange-600"
                }`}
              >
                {csvFile ? <CheckCircle2 size={26} /> : <FileSpreadsheet size={26} />}
              </div>

              <h3 className="mt-3 font-bold text-slate-900 text-sm">
                {csvFile ? csvFile.name : "Arrastra tu archivo CSV térmico aquí"}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {csvFile
                  ? `${(csvFile.size / 1024 / 1024).toFixed(2)} MB - Matriz lista`
                  : "O haz clic para seleccionar la exportación de FLIR / Cámara"}
              </p>

              <input
                type="file"
                accept=".csv"
                id="csvThermFileInput"
                className="hidden"
                disabled={status === "processing"}
                onChange={(e) => e.target.files?.[0] && handleCsvFile(e.target.files[0])}
              />
            </label>
          </div>

          {/* Zona 2: Fotografía Visible (Opcional) */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">
              2. Fotografía Visible del Tablero (.JPG / .PNG){" "}
              <span className="text-slate-400 font-normal">(Opcional para Fusión MSX)</span>
            </label>
            <label
              htmlFor="imageThermFileInput"
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) handleImageFile(e.dataTransfer.files[0]);
              }}
              onDragOver={(e) => e.preventDefault()}
              className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 border-dashed p-4 transition ${
                status === "processing"
                  ? "pointer-events-none border-slate-200 bg-slate-50 opacity-60"
                  : imageFile
                  ? "border-emerald-500 bg-emerald-50/20"
                  : "border-slate-200 bg-slate-50 hover:border-orange-500 hover:bg-orange-500/5"
              }`}
            >
              <div className="flex items-center gap-3">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="size-12 rounded-xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="flex size-12 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
                    <ImageIcon size={22} />
                  </div>
                )}
                <div className="text-left">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {imageFile ? imageFile.name : "Seleccionar fotografía del elemento eléctrico"}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {imageFile
                      ? `${(imageFile.size / 1024 / 1024).toFixed(2)} MB`
                      : "Permite superponer el relieve de los interruptores y cables"}
                  </p>
                </div>
              </div>

              {imageFile && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setImageFile(null);
                    setPreviewImage(null);
                  }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                >
                  <X size={16} />
                </button>
              )}

              <input
                type="file"
                accept="image/*"
                id="imageThermFileInput"
                className="hidden"
                disabled={status === "processing"}
                onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
              />
            </label>
          </div>

          {/* Banner de Estado */}
          <div
            className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${statusContent.className}`}
          >
            {statusContent.icon}
            {statusContent.text}
          </div>

          {/* Barra de Progreso */}
          {status === "processing" && (
            <div>
              <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500">
                <span>Progreso de sincronización</span>
                <span>{progress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            onClick={handleClose}
            disabled={status === "processing"}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={!canUpload}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 hover:bg-orange-700 px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-600/20 transition disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
          >
            {status === "processing" ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Guardando en BD...</span>
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                <span>Guardar Termografía</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportThermographyModal;