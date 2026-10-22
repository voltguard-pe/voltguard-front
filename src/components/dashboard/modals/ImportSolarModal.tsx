import React, { useEffect, useState } from "react";
import {
  Building2,
  Camera,
  FileSpreadsheet,
  Layers,
  Loader2,
  MapPin,
  Sun,
  Thermometer,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import type { CompanyResponseDTO } from "../../../shared/types/CompanyProps";
import { getCompanies } from "../../../services/company.service";
import { useAuth } from "../../../shared/hooks/useAuth";
import { useSidebar } from "../../../contexts/SidebarContext";
import { solarThermographyService } from "../../../services/solarThermography.service";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  defaultCompanyCode?: string;
  onSuccess: (newSolarCode?: string) => void;
};

export const ImportSolarModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultCompanyCode = "",
  onSuccess,
}) => {
  const { auth } = useAuth();
  const { triggerRefresh } = useSidebar();
  const [companies, setCompanies] = useState<CompanyResponseDTO[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>(defaultCompanyCode || "");
  const [installationTitle, setInstallationTitle] = useState<string>("");
  const [subarregloCode, setSubarregloCode] = useState<string>("");

  // 3 Archivos requeridos
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [thermalImage, setThermalImage] = useState<File | null>(null);
  const [visualImage, setVisualImage] = useState<File | null>(null);

  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);

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
    setCsvFile(null);
    setThermalImage(null);
    setVisualImage(null);
    setInstallationTitle("");
    setSubarregloCode("");
    setStatus("idle");
    setProgress(0);
    onClose();
  };

  const handleImport = async () => {
    if (!selectedCompany) {
      toast.error("Selecciona una empresa.");
      return;
    }
    if (!csvFile) {
      toast.error("El archivo CSV térmico es obligatorio.");
      return;
    }

    setStatus("processing");
    setProgress(15);
    const interval = setInterval(() => setProgress((p) => Math.min(p + 8, 92)), 400);

    try {
      const result = await solarThermographyService.uploadPackage(
        selectedCompany,
        csvFile,
        thermalImage || undefined,
        visualImage || undefined,
        installationTitle || "Sistema Fotovoltaico en Azotea",
        subarregloCode || "SOLAR-001"
      );

      clearInterval(interval);
      setProgress(100);
      setStatus("success");
      toast.success("¡Inspección solar procesada con éxito!");

      triggerRefresh(selectedCompany);

      setTimeout(() => {
        handleClose();
        onSuccess(result.solarCode || result.id);
      }, 700);
    } catch (err: any) {
      clearInterval(interval);
      setStatus("error");
      toast.error(err.response?.data?.error || "Error al procesar la inspección solar.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4 py-6 overflow-y-auto">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-fade-up my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <Sun size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Importar Inspección Solar con Dron
              </h2>
              <p className="text-xs text-slate-500">
                Matriz radiométrica CSV + Captura Térmica + Captura Visible
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
          {/* Empresa */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Building2 size={14} className="text-slate-400" /> Empresa Destino
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              disabled={status === "processing"}
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none transition focus:border-amber-500"
            >
              <option value="">Selecciona la empresa...</option>
              {companies.map((c) => (
                <option key={c.publicCode} value={c.publicCode}>
                  {c.name} ({c.publicCode})
                </option>
              ))}
            </select>
          </div>

          {/* Nombre y Código */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers size={14} className="text-slate-400" /> Código Subarreglo
              </label>
              <input
                type="text"
                placeholder="Ej: SOLAR-SUB-A1"
                value={subarregloCode}
                onChange={(e) => setSubarregloCode(e.target.value)}
                disabled={status === "processing"}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-2 text-xs text-slate-700 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-400" /> Ubicación / Título
              </label>
              <input
                type="text"
                placeholder="Ej: Azotea Torre Miraflores"
                value={installationTitle}
                onChange={(e) => setInstallationTitle(e.target.value)}
                disabled={status === "processing"}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-2 text-xs text-slate-700 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 1. CSV Radiométrico */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
              <FileSpreadsheet size={14} className="text-emerald-600" /> 1. Matriz Térmica CSV (Obligatorio)
            </label>
            <label
              className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 border-dashed px-4 py-3 transition ${
                csvFile ? "border-emerald-500 bg-emerald-50/30" : "border-slate-200 bg-slate-50 hover:bg-slate-100/50"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <FileSpreadsheet size={20} className={csvFile ? "text-emerald-600" : "text-slate-400"} />
                <span className="text-xs font-semibold text-slate-700 truncate">
                  {csvFile ? csvFile.name : "Seleccionar CSV de temperatura..."}
                </span>
              </div>
              <input
                type="file"
                accept=".csv,text/csv"
                disabled={status === "processing"}
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>

          {/* 2 y 3. Imágenes Térmica y Óptica */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                <Thermometer size={14} className="text-rose-500" /> 2. Foto Térmica (DJI_..._R.JPG)
              </label>
              <label
                className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 border-dashed px-3 py-2.5 transition ${
                  thermalImage ? "border-rose-400 bg-rose-50/30" : "border-slate-200 bg-slate-50 hover:bg-slate-100/50"
                }`}
              >
                <span className="text-xs font-semibold text-slate-700 truncate">
                  {thermalImage ? thermalImage.name : "Subir térmica..."}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  disabled={status === "processing"}
                  onChange={(e) => setThermalImage(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                <Camera size={14} className="text-blue-500" /> 3. Foto Visible (DJI_....JPG)
              </label>
              <label
                className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 border-dashed px-3 py-2.5 transition ${
                  visualImage ? "border-blue-400 bg-blue-50/30" : "border-slate-200 bg-slate-50 hover:bg-slate-100/50"
                }`}
              >
                <span className="text-xs font-semibold text-slate-700 truncate">
                  {visualImage ? visualImage.name : "Subir visible..."}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  disabled={status === "processing"}
                  onChange={(e) => setVisualImage(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Barra de progreso */}
          {status === "processing" && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Calculando hotspots IEC 62446-3 y subiendo a Cloudinary...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300"
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
            disabled={!csvFile || !selectedCompany || status === "processing"}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-5 py-2 text-xs font-bold text-white hover:bg-amber-700 shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {status === "processing" ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
            {status === "processing" ? "Procesando..." : "Importar Inspección"}
          </button>
        </div>
      </div>
    </div>
  );
};