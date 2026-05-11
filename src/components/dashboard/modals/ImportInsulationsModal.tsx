import {
  AlertCircle,
  CheckCircle2,
  FileArchive,
  Loader2,
  UploadCloud,
  X,
  ShieldCheck,
} from "lucide-react";

import { useState } from "react";
import { toast } from "react-toastify";

import type { CompanyResponseDTO } from "../../../shared/types/CompanyProps";

import { runImport, validateImport } from "../../../services/import.service";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  companies: CompanyResponseDTO[];
  onSuccess: () => void;
};

type Status = "idle" | "validating" | "valid" | "error" | "importing";

const ImportInsulationsModal = ({
  isOpen,
  onClose,
  companies,
  onSuccess,
}: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);

  const token = localStorage.getItem("token") || "";

  const resetState = () => {
    setFile(null);
    setSelectedCompany("");
    setResult(null);
    setStatus("idle");
    setProgress(0);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".zip")) {
      toast.error("Solo se permiten archivos .zip");
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

    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleValidate = async () => {
    if (!file) return;

    setStatus("validating");

    try {
      const response = await validateImport(file, token);

      setResult(response);

      if (response.errors?.length > 0) {
        setStatus("error");
        toast.error("El archivo tiene errores");
      } else {
        setStatus("valid");
        toast.success("Archivo válido");
      }
    } catch {
      setStatus("error");
      toast.error("Error al validar el archivo");
    }
  };

  const simulateProgress = () => {
    let value = 0;

    const interval = setInterval(() => {
      value += Math.random() * 10;

      if (value >= 90) {
        value = 90;
        clearInterval(interval);
      }

      setProgress(Math.floor(value));
    }, 400);

    return interval;
  };

  const handleImport = async () => {
    if (!file || !selectedCompany) return;

    setStatus("importing");
    setProgress(0);

    const interval = simulateProgress();

    try {
      await runImport(file, token, selectedCompany);

      clearInterval(interval);
      setProgress(100);

      setTimeout(() => {
        toast.success("Mediciones de aislamiento importadas correctamente");
        handleClose();
        onSuccess();
      }, 700);
    } catch {
      clearInterval(interval);
      setStatus("error");
      toast.error("Error al importar las mediciones de aislamiento");
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case "validating":
        return {
          icon: <Loader2 size={18} className="animate-spin" />,
          text: "Validando archivo...",
          className: "bg-[#0797d5]/10 text-[#0797d5]",
        };

      case "valid":
        return {
          icon: <CheckCircle2 size={18} />,
          text: "Archivo válido y listo para importar",
          className: "bg-[#8ccf2f]/15 text-[#3aaa35]",
        };

      case "error":
        return {
          icon: <AlertCircle size={18} />,
          text: "Se encontraron errores en el archivo",
          className: "bg-red-100 text-red-700",
        };

      case "importing":
        return {
          icon: <Loader2 size={18} className="animate-spin" />,
          text: `Importando mediciones... ${progress}%`,
          className: "bg-[#0797d5]/10 text-[#0797d5]",
        };

      default:
        return {
          icon: <UploadCloud size={18} />,
          text: "Selecciona un archivo ZIP para comenzar",
          className: "bg-slate-100 text-slate-600",
        };
    }
  };

  const statusContent = getStatusContent();

  const canValidate =
    file && status !== "validating" && status !== "importing";

  const canImport = file && selectedCompany && status === "valid";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] text-white">
              <ShieldCheck size={24} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Importar mediciones de aislamiento
              </h2>

              <p className="text-sm text-slate-500">
                Sube un archivo ZIP para importar mediciones por empresa.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={status === "importing"}
            className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Empresa destino
            </label>

            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0797d5] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              value={selectedCompany}
              onChange={(event) => setSelectedCompany(event.target.value)}
              disabled={status === "importing"}
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
            htmlFor="insulationsFileInput"
            onDrop={handleDrop}
            onDragOver={(event) => event.preventDefault()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition ${
              status === "importing"
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
              {file ? file.name : "Arrastra tu archivo ZIP aquí"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {file
                ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                : "También puedes hacer click para seleccionarlo desde tu equipo."}
            </p>

            <input
              type="file"
              accept=".zip"
              className="hidden"
              id="insulationsFileInput"
              disabled={status === "importing"}
              onChange={(event) =>
                event.target.files?.[0] && handleFile(event.target.files[0])
              }
            />
          </label>

          <div
            className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${statusContent.className}`}
          >
            {statusContent.icon}
            {statusContent.text}
          </div>

          {status === "importing" && (
            <div>
              <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500">
                <span>Progreso</span>
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
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-950">
                    Resultado de validación
                  </h3>

                  <p className="text-sm text-slate-500">
                    Total detectado: {result.total}
                  </p>
                </div>

                {result.errors?.length > 0 ? (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    {result.errors.length} errores
                  </span>
                ) : (
                  <span className="rounded-full bg-[#8ccf2f]/15 px-3 py-1 text-xs font-semibold text-[#3aaa35]">
                    Sin errores
                  </span>
                )}
              </div>

              <div className="mt-4 max-h-40 space-y-2 overflow-y-auto">
                {result.errors?.length > 0 ? (
                  result.errors.map((error: string, index: number) => (
                    <div
                      key={index}
                      className="rounded-2xl bg-white px-4 py-3 text-xs text-red-700"
                    >
                      {error}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-white px-4 py-3 text-sm text-[#3aaa35]">
                    El archivo fue validado correctamente.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            onClick={handleClose}
            disabled={status === "importing"}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cerrar
          </button>

          <button
            onClick={handleValidate}
            disabled={!canValidate}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "validating" && (
              <Loader2 size={18} className="animate-spin" />
            )}

            {status === "validating" ? "Validando..." : "Validar archivo"}
          </button>

          <button
            onClick={handleImport}
            disabled={!canImport}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087fb3] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "importing" && (
              <Loader2 size={18} className="animate-spin" />
            )}

            {status === "importing" ? "Importando..." : "Importar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportInsulationsModal;