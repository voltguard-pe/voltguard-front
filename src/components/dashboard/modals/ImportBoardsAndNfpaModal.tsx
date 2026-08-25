import {
  AlertCircle,
  CheckCircle2,
  FileArchive,
  Loader2,
  UploadCloud,
  X,
  CircuitBoard,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import type { CompanyResponseDTO } from "../../../shared/types/CompanyProps";
import { importBoardsWithNfpa, type ImportBoardsResponse } from "../../../services/importUnifilarNfpa-ai.service";
// import {
//   importBoardsWithNfpa,
//   type ImportBoardsResponse,
// } from "../../../services/board-ai.service";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  companies: CompanyResponseDTO[];
  onSuccess: () => void;
};

type Status = "idle" | "processing" | "success" | "error";

const ImportBoardsAndNfpaModal = ({
  isOpen,
  onClose,
  companies,
  onSuccess,
}: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportBoardsResponse | null>(null);

  const token = localStorage.getItem("token") || "";

  const resetState = () => {
    setFile(null);
    setSelectedCompany("");
    setStatus("idle");
    setProgress(0);
    setResult(null);
  };

  const handleClose = () => {
    if (status === "processing") return;
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  const handleFile = (selectedFile: File) => {
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (ext !== "zip") {
      toast.error("Solo se permite subir un archivo ZIP");
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setStatus("idle");
    setProgress(0);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const selectedFile = event.dataTransfer.files[0];
    if (selectedFile) handleFile(selectedFile);
  };

  const simulateAiProgress = () => {
    let value = 15;
    const interval = setInterval(() => {
      value += Math.random() * 6;
      if (value >= 92) {
        value = 92;
        clearInterval(interval);
      }
      setProgress(Math.floor(value));
    }, 600);
    return interval;
  };

  const handleImport = async () => {
    if (!file || !selectedCompany) return;

    setStatus("processing");
    setProgress(10);

    const interval = simulateAiProgress();

    try {
      const response = await importBoardsWithNfpa(
        file,
        token,
        selectedCompany,
        (uploadPercent) => {
          // El primer 15% refleja la subida física del archivo
          setProgress(Math.floor(uploadPercent * 0.15));
        }
      );

      clearInterval(interval);
      setProgress(100);
      setResult(response);

      const failedBoards = response.results?.filter((r) => r.status === "failed") || [];

      if (failedBoards.length > 0) {
        setStatus("error");
        onSuccess(); // Actualiza los tableros creados exitosamente en segundo plano
        toast.error("Proceso completado con algunas omisiones o errores.", {
          autoClose: 6000,
        });
        return;
      }

      setStatus("success");
      toast.success("Tableros y etiquetas NFPA registrados con éxito");

      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 900);
    } catch (error: any) {
      clearInterval(interval);
      setStatus("error");
      console.error("Error en la importación:", error);

      let mensajeError = "Error al procesar el lote consolidado";
      if (error?.response?.data?.error) {
        mensajeError = error.response.data.error;
      } else if (error?.message) {
        mensajeError = error.message;
      }

      toast.error(mensajeError, { autoClose: 8000 });
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case "processing":
        return {
          icon: <Loader2 size={18} className="animate-spin text-[#0797d5]" />,
          text: `Extrayendo diagramas, calculando NFPA y cargando... ${progress}%`,
          className: "bg-[#0797d5]/10 text-[#0797d5]",
        };
      case "success":
        return {
          icon: <CheckCircle2 size={18} className="text-[#3aaa35]" />,
          text: "Tableros y certificaciones registradas exitosamente",
          className: "bg-[#8ccf2f]/15 text-[#3aaa35]",
        };
      case "error":
        return {
          icon: <AlertCircle size={18} className="text-red-600" />,
          text: "Se encontraron problemas durante la importación",
          className: "bg-red-100 text-red-700",
        };
      default:
        return {
          icon: <UploadCloud size={18} className="text-slate-600" />,
          text: "Sube un ZIP con planos unifilares, fotos de tablero e ITMs",
          className: "bg-slate-100 text-slate-600",
        };
    }
  };

  const statusContent = getStatusContent();
  const canImport = file && selectedCompany && status !== "processing";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] text-white">
              <CircuitBoard size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Importación Masiva de Tableros & NFPA 70E
              </h2>
              <p className="text-xs text-slate-500">
                Sube el ZIP con las carpetas de planos y fotos asociadas (Máx. 10MB por foto).
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
          {/* Selector de empresa */}
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Empresa destino
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0797d5] disabled:cursor-not-allowed disabled:bg-slate-50"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              disabled={status === "processing"}
            >
              <option value="">Seleccionar empresa</option>
              {companies.map((company) => (
                <option key={company.publicCode} value={company.publicCode}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          {/* Zona Drag & Drop */}
          <label
            htmlFor="fullZipInput"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition ${
              status === "processing"
                ? "pointer-events-none border-slate-200 bg-slate-50 opacity-60"
                : file
                ? "border-[#8ccf2f] bg-[#8ccf2f]/10"
                : "border-slate-200 bg-slate-50 hover:border-[#0797d5] hover:bg-[#0797d5]/5"
            }`}
          >
            <div
              className={`flex size-16 items-center justify-center rounded-3xl ${
                file
                  ? "bg-[#8ccf2f]/15 text-[#3aaa35]"
                  : "bg-[#0797d5]/10 text-[#0797d5]"
              }`}
            >
              {file ? <FileArchive size={30} /> : <UploadCloud size={30} />}
            </div>

            <h3 className="mt-4 font-bold text-slate-950">
              {file ? file.name : "Arrastra el ZIP consolidado aquí"}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {file
                ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                : "Incluye fotos _unifilar, _normal, _termografia y _itm"}
            </p>

            <input
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              className="hidden"
              id="fullZipInput"
              disabled={status === "processing"}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>

          {/* Estado actual */}
          <div
            className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${statusContent.className}`}
          >
            {statusContent.icon}
            {statusContent.text}
          </div>

          {/* Barra de progreso */}
          {status === "processing" && (
            <div>
              <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500">
                <span>Procesando lote con IA</span>
                <span>{progress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Resumen de resultados (Tableros creados con éxito y omitidos) */}
          {result && (
            <div className="space-y-3">
              {/* Tableros creados con resumen de NFPA */}
              {result.results.filter((r) => r.status === "created").length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Procesados exitosamente ({result.created})
                  </h4>
                  <div className="mt-2 max-h-32 space-y-1.5 overflow-y-auto">
                    {result.results
                      .filter((r) => r.status === "created")
                      .map((board) => (
                        <div
                          key={board.boardCode}
                          className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs text-slate-700 shadow-sm"
                        >
                          <span className="font-semibold">{board.boardCode}</span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium ${
                              board.hasNfpa
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            <ShieldCheck size={13} />
                            {board.hasNfpa ? "NFPA Calculado" : "Sin ITM (Solo Tablero)"}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Errores u omisiones */}
              {result.results.some((r) => r.status === "failed") && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-800">
                    Tableros con error ({result.failed})
                  </h4>
                  <div className="mt-2 max-h-32 space-y-1.5 overflow-y-auto">
                    {result.results
                      .filter((r) => r.status === "failed")
                      .map((failed, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl bg-white px-3 py-2 text-xs font-medium text-red-700 shadow-sm"
                        >
                          ❌ <strong>{failed.boardCode}:</strong> {failed.error}
                        </div>
                      ))}
                  </div>
                </div>
              )}
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
            Cerrar
          </button>

          <button
            onClick={handleImport}
            disabled={!canImport}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087fb3] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "processing" && (
              <Loader2 size={18} className="animate-spin" />
            )}
            {status === "processing" ? "Procesando Lote..." : "Importar Todo"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportBoardsAndNfpaModal;