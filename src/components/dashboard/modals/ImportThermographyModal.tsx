import {
  FileSpreadsheet,
  Flame,
  ImageIcon,
  Loader2,
  UploadCloud,
  X
} from "lucide-react";
import React, { useState } from "react";
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

  const resetState = () => {
    setCsvFile(null);
    setThermalImage(null);
    setVisualImage(null);
    setPreviewThermal(null);
    setPreviewVisual(null);
    setStatus("idle");
  };

  const handleClose = () => {
    if (status === "processing") return;
    resetState();
    onClose();
  };

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-xs">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600">
              <Flame size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-950">Subir Inspección Termográfica</h2>
              <p className="text-xs text-slate-500">Carga la foto térmica FLIR, la foto normal y el archivo CSV</p>
            </div>
          </div>
          <button onClick={handleClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* 1. CSV */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              1. Matriz de Temperaturas (.CSV) <span className="text-red-500">*</span>
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 hover:border-orange-500 hover:bg-orange-500/5 transition">
              <FileSpreadsheet size={26} className={csvFile ? "text-emerald-500" : "text-slate-400"} />
              <span className="mt-1 text-xs font-bold text-slate-800">
                {csvFile ? csvFile.name : "Seleccionar temperaturas_flir.csv"}
              </span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleCsvFile(e.target.files[0])}
              />
            </label>
          </div>

          {/* 2. Foto Térmica FLIR */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              2. Foto Térmica FLIR (.JPG) <span className="text-slate-400 font-normal">(Imagen nativa con relieve térmico)</span>
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-3 hover:border-orange-500 transition">
              <div className="flex items-center gap-3">
                {previewThermal ? (
                  <img src={previewThermal} alt="Térmica" className="size-12 rounded-xl object-cover border" />
                ) : (
                  <div className="flex size-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <Flame size={22} />
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {thermalImage ? thermalImage.name : "Subir FLIR_...jpg"}
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

          {/* 3. Foto Normal */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              3. Foto Normal del Tablero (.JPG) <span className="text-slate-400 font-normal">(Cámara visual en luz visible)</span>
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-3 hover:border-orange-500 transition">
              <div className="flex items-center gap-3">
                {previewVisual ? (
                  <img src={previewVisual} alt="Visual" className="size-12 rounded-xl object-cover border" />
                ) : (
                  <div className="flex size-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                    <ImageIcon size={22} />
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {visualImage ? visualImage.name : "Subir tablero_visual.jpg"}
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
            onClick={handleClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!csvFile || status === "processing"}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2 text-xs font-bold text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {status === "processing" ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
            Guardar Termografía
          </button>
        </div>
      </div>
    </div>
  );
};