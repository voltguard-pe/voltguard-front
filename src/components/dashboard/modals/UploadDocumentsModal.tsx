import { FileText, Loader2, UploadCloud, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { uploadCompanyDocuments } from "../../../services/document.service";
import type { CompanySummaryDTO } from "../../../shared/types/BoardProps";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  companies: CompanySummaryDTO[]; // Recibe las empresas reales desde la BD
  onSuccess: () => void;
};

type Status = "idle" | "uploading" | "success" | "error";

export const UploadDocumentsModal = ({ isOpen, onClose, companies, onSuccess }: Props) => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [docType, setDocType] = useState<"MANTENIMIENTO" | "OPERATIVIDAD">("MANTENIMIENTO");
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);

  const resetState = () => {
    setFiles([]);
    setSelectedCompany("");
    setDocType("MANTENIMIENTO");
    setStatus("idle");
    setProgress(0);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  const handleFiles = (selectedFiles: FileList) => {
    const validFiles = Array.from(selectedFiles).filter((file) => {
      const isPdf = file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) toast.error(`El archivo ${file.name} no es un PDF válido.`);
      return isPdf;
    });

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
      setStatus("idle");
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) handleFiles(event.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (files.length === 0 || !selectedCompany) return;

    setStatus("uploading");
    setProgress(0);

    try {
      // Usamos el servicio e inyectamos la función para actualizar el progreso
      await uploadCompanyDocuments({
        companyPublicCode: selectedCompany,
        uploadedBy: "60d5ecb8b39d1c123456789a", // ID del usuario auth
        files,
        types: files.map(() => docType)
      }, (percent) => {
        setProgress(percent);
      });

      setStatus("success");
      toast.success("Documentos almacenados con éxito");
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 600);
    } catch (error) {
      setStatus("error");
      toast.error("Error al procesar la subida múltiple");
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
              <UploadCloud size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">Subir Certificados</h2>
              <p className="text-sm text-slate-500">Almacena documentos PDF en lote vinculados a la empresa.</p>
            </div>
          </div>
          <button onClick={handleClose} disabled={status === "uploading"} className="text-slate-500 hover:bg-slate-100 p-2 rounded-xl cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Empresa destino</label>
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#0797d5]"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                disabled={status === "uploading"}
              >
                <option value="">Seleccionar empresa</option>
                {companies.map((company) => (
                  <option key={company.publicCode} value={company.publicCode}>{company.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Tipo de Certificado</label>
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#0797d5]"
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                disabled={status === "uploading"}
              >
                <option value="MANTENIMIENTO">Certificado de Mantenimiento</option>
                <option value="OPERATIVIDAD">Certificado de Operatividad</option>
              </select>
            </div>
          </div>

          <label
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition ${
              status === "uploading" ? "pointer-events-none bg-slate-50 opacity-60" : "border-slate-200 bg-slate-50 hover:border-[#0797d5]"
            }`}
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
              <FileText size={28} />
            </div>
            <h3 className="mt-4 font-bold text-slate-950">Arrastra tus archivos PDF aquí</h3>
            <p className="mt-1 text-sm text-slate-500">O haz clic para explorar tu almacenamiento interno.</p>
            <input
              type="file" multiple accept=".pdf" className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              disabled={status === "uploading"}
            />
          </label>

          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Archivos en cola ({files.length})</p>
              <div className="max-h-36 overflow-y-auto space-y-2 border border-slate-100 p-2 rounded-xl">
                {files.map((f, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
                    <span className="font-medium text-slate-700 truncate max-w-md">{f.name}</span>
                    <button type="button" onClick={() => removeFile(index)} className="text-red-500 hover:bg-red-100 p-1 rounded-md cursor-pointer">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {status === "uploading" && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Subiendo a Cloudinary...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] transition-all duration-150" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-slate-200 px-6 py-5 justify-end">
          <button onClick={handleClose} disabled={status === "uploading"} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || !selectedCompany || status === "uploading"}
            className="rounded-2xl bg-[#0797d5] px-6 py-3 text-sm font-semibold text-white hover:bg-[#087fb3] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Subir archivos
          </button>
        </div>
      </div>
    </div>
  );
};