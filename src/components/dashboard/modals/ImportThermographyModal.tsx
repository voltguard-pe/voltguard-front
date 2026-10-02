import {
  FileSpreadsheet,
  Flame,
  ImageIcon,
  Loader2,
  UploadCloud,
  X
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { uploadThermographyPackage } from "../../../services/thermography.service";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  onSuccess: () => void;
};

export const ImportThermographyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  boardId,
  onSuccess,
}) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [thermalImage, setThermalImage] = useState<File | null>(null);
  const [visualImage, setVisualImage] = useState<File | null>(null);

  const [previewThermal, setPreviewThermal] = useState<string | null>(null);
  const [previewVisual, setPreviewVisual] = useState<string | null>(null);

  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");

  // Estados visuales para Drag and Drop
  const [dragCsv, setDragCsv] = useState(false);
  const [dragThermal, setDragThermal] = useState(false);
  const [dragVisual, setDragVisual] = useState(false);

  // 1. Bloqueo del scroll del body mientras el modal esté abierto
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const resetState = () => {
    setCsvFile(null);
    setThermalImage(null);
    setVisualImage(null);
    setPreviewThermal(null);
    setPreviewVisual(null);
    setStatus("idle");
    setDragCsv(false);
    setDragThermal(false);
    setDragVisual(false);
  };

  const handleClose = () => {
    if (status === "processing") return;
    resetState();
    onClose();
  };

  const handleCsvFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Selecciona el archivo .csv de temperaturas");
      return;
    }
    setCsvFile(file);
    setStatus("idle");
  };

  const handleThermalImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona un archivo de imagen válido");
      return;
    }
    setThermalImage(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewThermal(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleVisualImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona un archivo de imagen válido");
      return;
    }
    setVisualImage(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewVisual(reader.result as string);
    reader.readAsDataURL(file);
  };

  // 2. Controladores de Drag & Drop
  const handleDropCsv = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragCsv(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleCsvFile(file);
  };

  const handleDropThermal = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragThermal(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleThermalImage(file);
  };

  const handleDropVisual = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragVisual(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleVisualImage(file);
  };

  const handleSubmit = async () => {
    if (!csvFile) {
      toast.warning("El archivo CSV con las temperaturas es obligatorio");
      return;
    }
    setStatus("processing");

    try {
      await uploadThermographyPackage(boardId, csvFile, thermalImage, visualImage);
      setStatus("success");
      toast.success("Inspección sincronizada exitosamente");
      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 600);
    } catch (err: any) {
      setStatus("error");
      toast.error(err?.response?.data?.error || "Error al subir los archivos");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600">
              <Flame size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-950">Subir Inspección Termográfica</h2>
              <p className="text-xs text-slate-500">Carga o arrastra la foto térmica, visual y matriz CSV</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* 1. CSV Drag & Drop */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              1. Matriz de Temperaturas (.CSV) <span className="text-red-500">*</span>
            </label>
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragCsv(true);
              }}
              onDragLeave={() => setDragCsv(false)}
              onDrop={handleDropCsv}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 transition ${
                dragCsv
                  ? "border-orange-500 bg-orange-50 scale-[0.99]"
                  : "border-slate-200 bg-slate-50 hover:border-orange-500 hover:bg-orange-500/5"
              }`}
            >
              <FileSpreadsheet
                size={26}
                className={dragCsv ? "text-orange-600 animate-bounce" : csvFile ? "text-emerald-500" : "text-slate-400"}
              />
              <span className="mt-1 text-xs font-bold text-slate-800 text-center">
                {dragCsv
                  ? "Suelta el archivo CSV aquí"
                  : csvFile
                  ? csvFile.name
                  : "Arrastra o selecciona temperaturas_flir.csv"}
              </span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleCsvFile(e.target.files[0])}
              />
            </label>
          </div>

          {/* 2. Foto Térmica FLIR Drag & Drop */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              2. Foto Térmica FLIR (.JPG){" "}
              <span className="text-slate-400 font-normal">(Imagen nativa con relieve térmico)</span>
            </label>
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragThermal(true);
              }}
              onDragLeave={() => setDragThermal(false)}
              onDrop={handleDropThermal}
              className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 border-dashed p-3 transition ${
                dragThermal
                  ? "border-orange-500 bg-orange-50 scale-[0.99]"
                  : "border-slate-200 bg-slate-50 hover:border-orange-500"
              }`}
            >
              <div className="flex items-center gap-3">
                {previewThermal ? (
                  <img src={previewThermal} alt="Térmica" className="size-12 rounded-xl object-cover border" />
                ) : (
                  <div
                    className={`flex size-12 items-center justify-center rounded-xl ${
                      dragThermal ? "bg-orange-600 text-white" : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    <Flame size={22} />
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {dragThermal
                      ? "Suelta la imagen térmica aquí"
                      : thermalImage
                      ? thermalImage.name
                      : "Arrastra o selecciona FLIR_...jpg"}
                  </p>
                  <p className="text-[11px] text-slate-400">Captura infrarroja original de la cámara</p>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleThermalImage(e.target.files[0])}
              />
            </label>
          </div>

          {/* 3. Foto Normal Drag & Drop */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              3. Foto Normal del Tablero (.JPG){" "}
              <span className="text-slate-400 font-normal">(Cámara visual en luz visible)</span>
            </label>
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragVisual(true);
              }}
              onDragLeave={() => setDragVisual(false)}
              onDrop={handleDropVisual}
              className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 border-dashed p-3 transition ${
                dragVisual
                  ? "border-orange-500 bg-orange-50 scale-[0.99]"
                  : "border-slate-200 bg-slate-50 hover:border-orange-500"
              }`}
            >
              <div className="flex items-center gap-3">
                {previewVisual ? (
                  <img src={previewVisual} alt="Visual" className="size-12 rounded-xl object-cover border" />
                ) : (
                  <div
                    className={`flex size-12 items-center justify-center rounded-xl ${
                      dragVisual ? "bg-sky-600 text-white" : "bg-sky-100 text-sky-600"
                    }`}
                  >
                    <ImageIcon size={22} />
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {dragVisual
                      ? "Suelta la foto del tablero aquí"
                      : visualImage
                      ? visualImage.name
                      : "Arrastra o selecciona tablero_visual.jpg"}
                  </p>
                  <p className="text-[11px] text-slate-400">Foto óptica nítida del tablero</p>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleVisualImage(e.target.files[0])}
              />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!csvFile || status === "processing"}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2 text-xs font-bold text-white hover:bg-orange-700 disabled:opacity-50 cursor-pointer transition-all active:scale-95"
          >
            {status === "processing" ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
            Guardar Termografía
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};