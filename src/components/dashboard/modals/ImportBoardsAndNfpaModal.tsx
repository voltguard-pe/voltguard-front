import {
  AlertCircle,
  CheckCircle2,
  FileArchive,
  Loader2,
  UploadCloud,
  X,
  CircuitBoard,
  ShieldCheck,
  ZapOff,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

import type { CompanyResponseDTO } from "../../../shared/types/CompanyProps";
import {
  importBoardsWithNfpa,
  type ImportBoardsResponse,
} from "../../../services/importUnifilarNfpa-ai.service";
import { useSidebar } from "../../../contexts/SidebarContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  companies: CompanyResponseDTO[];
  onSuccess: () => void;
};

type Status = "idle" | "processing" | "success" | "error";

// ============================================================================
// 1. DETECTOR DE FALTA DE CRÉDITOS DE OPENAI
// ============================================================================
export const isNoCreditsError = (raw: unknown): boolean => {
  const errObj = raw as any;
  const text =
    typeof raw === "string"
      ? raw
      : errObj?.response?.data?.error ||
        errObj?.response?.data?.message ||
        errObj?.error ||
        errObj?.message ||
        "";

  const lower = String(text).toLowerCase();
  return (
    errObj?.response?.status === 402 ||
    errObj?.response?.status === 429 ||
    errObj?.status === 402 ||
    errObj?.status === 429 ||
    errObj?.response?.data?.code === "NO_CREDITS" ||
    errObj?.code === "NO_CREDITS" ||
    lower.includes("429") ||
    lower.includes("credit") ||
    lower.includes("crédito") ||
    lower.includes("credito") ||
    lower.includes("quota") ||
    lower.includes("billing") ||
    lower.includes("insufficient_quota") ||
    lower.includes("platform.openai.com")
  );
};

// Función para disparar la ventana desde cualquier parte
export const triggerGlobalNoCreditsModal = () => {
  window.dispatchEvent(new CustomEvent("openai-no-credits"));
};

// ============================================================================
// 2. VIGILANTE GLOBAL AUTOMÁTico (Escucha Axios y Fetch en toda la web)
// ============================================================================
export const GlobalNoCreditsWatcher = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => {
      // Cierra cualquier toast rojo feo que haya intentado salir al mismo tiempo
      toast.dismiss();
      setIsOpen(true);
    };

    window.addEventListener("openai-no-credits", handleOpen);

    // 1. Vigila cualquier llamada hecha con fetch() en cualquier servicio
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (!response.ok) {
        try {
          const clone = response.clone();
          const data = await clone.json();
          if (isNoCreditsError({ status: response.status, ...data })) {
            triggerGlobalNoCreditsModal();
          }
        } catch {
          // Si no es JSON, ignoramos
        }
      }
      return response;
    };

    // 2. Vigila cualquier llamada hecha con axios global
    const interceptorId = axios.interceptors.response.use(
      (res) => res,
      (error) => {
        if (isNoCreditsError(error)) {
          triggerGlobalNoCreditsModal();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      window.removeEventListener("openai-no-credits", handleOpen);
      window.fetch = originalFetch;
      axios.interceptors.response.eject(interceptorId);
    };
  }, []);

  return (
    <NoCreditsModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      hintText="Ningún registro ni archivo existente fue afectado. En cuanto recargues créditos de IA podrás volver a subir y procesar tu documento."
    />
  );
};

// ============================================================================
// 3. DISEÑO DEL MODAL DE FALTA DE CRÉDITOS
// ============================================================================
type NoCreditsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  hintText?: string;
};

export const NoCreditsModal = ({
  isOpen,
  onClose,
  hintText = "Ningún registro existente fue afectado. En cuanto recargues créditos podrás volver a subir tu archivo.",
}: NoCreditsModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-2.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8 text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200/70 shadow-inner">
            <ZapOff className="size-8 text-amber-600" strokeWidth={2.2} />
          </div>

          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
            <Sparkles size={12} />
            <span>Motor de lectura inteligente en pausa</span>
          </div>

          <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900">
            ¡Nos quedamos sin energía de IA!
          </h3>

          <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200/70 p-3.5 text-xs text-slate-500 font-semibold">
            💡 {hintText}
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-[#0797d5]/25 hover:brightness-95 transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const formatBoardError = (rawError?: string) => {
  if (!rawError) return "Error desconocido al procesar este tablero.";
  if (isNoCreditsError(rawError)) {
    return "Sin créditos de IA disponibles para analizar este tablero.";
  }
  return rawError
    .replace(/https?:\/\/\S+/g, "")
    .replace(/429/g, "")
    .trim();
};

// ============================================================================
// 4. MODAL DE IMPORTACIÓN DE TABLEROS
// ============================================================================
const ImportBoardsAndNfpaModal = ({
  isOpen,
  onClose,
  companies,
  onSuccess,
}: Props) => {
  const { triggerRefresh } = useSidebar();
  const [file, setFile] = useState<File | null>(null);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportBoardsResponse | null>(null);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);

  const token = localStorage.getItem("token") || "";

  const resetState = () => {
    setFile(null);
    setSelectedCompany("");
    setStatus("idle");
    setProgress(0);
    setResult(null);
    setShowNoCreditsModal(false);
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
          setProgress(Math.floor(uploadPercent * 0.15));
        }
      );

      clearInterval(interval);
      setProgress(100);
      setResult(response);

      const failedBoards =
        response.results?.filter((r) => r.status === "failed") || [];

      if (failedBoards.length > 0) {
        setStatus("error");
        triggerRefresh(selectedCompany);
        onSuccess();

        const huboFaltaDeCreditos = failedBoards.some((b) =>
          isNoCreditsError(b.error)
        );

        if (huboFaltaDeCreditos) {
          setShowNoCreditsModal(true);
        } else {
          toast.error("Proceso completado con algunas omisiones o errores.", {
            autoClose: 6000,
          });
        }
        return;
      }

      setStatus("success");
      toast.success("Tableros y etiquetas NFPA registrados con éxito");

      triggerRefresh(selectedCompany);

      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 900);
    } catch (error: any) {
      clearInterval(interval);
      setStatus("error");
      console.error("Error en la importación:", error);

      if (isNoCreditsError(error)) {
        setShowNoCreditsModal(true);
        return;
      }

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
              onChange={(e) =>
                e.target.files?.[0] && handleFile(e.target.files[0])
              }
            />
          </label>

          <div
            className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${statusContent.className}`}
          >
            {statusContent.icon}
            {statusContent.text}
          </div>

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

          {result && (
            <div className="space-y-3">
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
                            {board.hasNfpa
                              ? "NFPA Calculado"
                              : "Sin ITM (Solo Tablero)"}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {result.results.some((r) => r.status === "failed") && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-800">
                    Tableros con observaciones ({result.failed})
                  </h4>
                  <div className="mt-2 max-h-32 space-y-1.5 overflow-y-auto">
                    {result.results
                      .filter((r) => r.status === "failed")
                      .map((failed, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl bg-white px-3 py-2 text-xs font-medium text-red-700 shadow-sm"
                        >
                          ❌ <strong>{failed.boardCode}:</strong>{" "}
                          {formatBoardError(failed.error)}
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

      <NoCreditsModal
        isOpen={showNoCreditsModal}
        onClose={() => setShowNoCreditsModal(false)}
        hintText="Ningún tablero existente fue afectado. En cuanto recargues créditos podrás volver a importar tu archivo ZIP."
      />
    </div>
  );
};

export default ImportBoardsAndNfpaModal;