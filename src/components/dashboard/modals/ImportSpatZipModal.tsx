import React, { useEffect, useState } from "react";
import {
  Building2,
  FileArchive,
  Layers,
  Loader2,
  MapPin,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import type { CompanyResponseDTO } from "../../../shared/types/CompanyProps";
import { getCompanies } from "../../../services/company.service";
import { importSpatZip } from "../../../services/spat.service";
import { useAuth } from "../../../shared/hooks/useAuth";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  defaultCompanyCode?: string;
  onSuccess: () => void;
};

export const ImportSpatZipModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultCompanyCode = "",
  onSuccess,
}) => {
  const { auth } = useAuth();
  const [companies, setCompanies] = useState<CompanyResponseDTO[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>(defaultCompanyCode || "");
  const [location, setLocation] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);

  // Cargar lista real de empresas si el modal se abre
  useEffect(() => {
    const fetchCompaniesList = async () => {
      try {
        const data = await getCompanies();
        setCompanies(data);

        if (defaultCompanyCode) {
          setSelectedCompany(defaultCompanyCode);
        } else if (auth?.companyPublicCode) {
          const compCode =
            typeof auth.companyPublicCode === "string"
              ? auth.companyPublicCode
              : auth.companyPublicCode.publicCode;
          setSelectedCompany(compCode);
        } else if (data.length > 0) {
          setSelectedCompany(data[0].publicCode);
        }
      } catch (err) {
        console.error("Error cargando empresas:", err);
      }
    };

    if (isOpen) {
      fetchCompaniesList();
    }
  }, [isOpen, defaultCompanyCode, auth]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (status === "processing") return;
    setFile(null);
    setLocation("");
    setStatus("idle");
    setProgress(0);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (ext !== "zip") {
      toast.error("Solo se permite subir un archivo ZIP.");
      return;
    }
    setFile(selectedFile);
  };

  const handleImport = async () => {
    if (!file || !selectedCompany) {
      toast.error("Selecciona una empresa y adjunta el archivo ZIP.");
      return;
    }

    setStatus("processing");
    setProgress(15);
    const interval = setInterval(() => setProgress((p) => Math.min(p + 6, 92)), 450);

    try {
      await importSpatZip(file, selectedCompany, location);
      clearInterval(interval);
      setProgress(100);
      setStatus("success");
      toast.success("¡Pozos SPAT procesados y guardados con éxito!");

      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 900);
    } catch (err: any) {
      clearInterval(interval);
      setStatus("error");
      toast.error(err.response?.data?.error || "Error al procesar el archivo ZIP.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4 py-6">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <Layers size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Importación Masiva SPAT (.zip)
              </h2>
              <p className="text-xs text-slate-500">
                Fotos de telurómetro, pinza de fuga y caja de registro
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={status === "processing"}
            className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-6">
          {/* Selector de Empresa */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Building2 size={14} className="text-slate-400" /> Empresa Destino
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              disabled={status === "processing"}
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none transition focus:border-[#0797d5]"
            >
              <option value="">Selecciona la empresa...</option>
              {companies.map((c) => (
                <option key={c.publicCode} value={c.publicCode}>
                  {c.name} ({c.publicCode})
                </option>
              ))}
            </select>
          </div>

          {/* Ubicación del pozo */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin size={14} className="text-slate-400" /> Ubicación física del pozo
            </label>
            <input
              type="text"
              placeholder="Ej: Patio principal / Subestación / Taller"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={status === "processing"}
              className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs text-slate-700 outline-none transition focus:border-[#0797d5]"
            />
          </div>

          {/* Zona ZIP */}
          <label
            htmlFor="spatZipInputFile"
            className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center transition ${
              file ? "border-amber-500 bg-amber-50/40" : "border-slate-200 bg-slate-50 hover:bg-slate-100/50"
            }`}
          >
            <FileArchive size={32} className={file ? "text-amber-600" : "text-slate-400"} />
            <p className="mt-2 text-xs font-bold text-slate-800">
              {file ? file.name : "Selecciona o arrastra el archivo ZIP con las fotos"}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Ej: ELC-MIR-SPAT-001_2025_telurometro.png o ELC-MIR-SPAT-001_telurometro.png"}
            </p>
            <input
              id="spatZipInputFile"
              type="file"
              accept=".zip"
              disabled={status === "processing"}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Barra de progreso */}
          {status === "processing" && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Leyendo pantallas con IA y subiendo a Cloudinary...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={handleClose}
            disabled={status === "processing"}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={!file || !selectedCompany || status === "processing"}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-5 py-2 text-xs font-bold text-white hover:bg-amber-700 shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {status === "processing" ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
            {status === "processing" ? "Procesando Lote..." : "Importar Pozos SPAT"}
          </button>
        </div>
      </div>
    </div>
  );
};