import { useState } from "react";
import type { CompanyResponseDTO } from "../../../shared/types/CompanyProps";
import { runImport, validateImport } from "../../../services/import.service";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  companies: CompanyResponseDTO[];
  onSuccess: () => void;
};

type Status = "idle" | "validating" | "valid" | "error" | "importing";

const ImportBoardsModal = ({
  isOpen,
  onClose,
  companies,
  onSuccess,
}: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState<Status>("idle");

  const token = localStorage.getItem("token") || "";

  if (!isOpen) return null;

  // =========================
  // 📂 FILE HANDLING
  // =========================
  const handleFile = (f: File) => {
    if (!f.name.endsWith(".zip")) {
      alert("Solo se permiten archivos .zip");
      return;
    }

    setFile(f);
    setResult(null);
    setStatus("idle");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  // =========================
  // 🔍 VALIDATE
  // =========================
  const handleValidate = async () => {
    if (!file) return;

    setStatus("validating");

    try {
      const res = await validateImport(file, token);
      setResult(res);

      if (res.errors?.length > 0) {
        setStatus("error");
      } else {
        setStatus("valid");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  // =========================
  // 🚀 IMPORT
  // =========================
  const handleImport = async () => {
    if (!file || !selectedCompany) return;

    setStatus("importing");

    try {
      await runImport(file, token, selectedCompany);

      onClose();
      onSuccess();
    } catch (err) {
      alert("Error al importar");
      setStatus("error");
    }
  };

  // =========================
  // 🎨 UI HELPERS
  // =========================
  const getStatusText = () => {
    switch (status) {
      case "validating":
        return "Validando archivo...";
      case "valid":
        return "Archivo válido ✅";
      case "error":
        return "Se encontraron errores ❌";
      case "importing":
        return "Importando...";
      default:
        return "Selecciona un archivo .zip";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg flex flex-col gap-4">

        <h2 className="text-lg font-bold">Importar tableros</h2>

        {/* SELECT EMPRESA */}
        <select
          className="border p-2 rounded"
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
        >
          <option value="">Seleccionar empresa</option>
          {companies.map((c) => (
            <option key={c.publicCode} value={c.publicCode}>
              {c.name}
            </option>
          ))}
        </select>

        {/* DROP ZONE */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition"
        >
          <p className="text-sm text-gray-500">
            Arrastra tu archivo ZIP aquí o haz click
          </p>

          <input
            type="file"
            accept=".zip"
            className="hidden"
            id="fileInput"
            onChange={(e) =>
              e.target.files?.[0] && handleFile(e.target.files[0])
            }
          />

          <label
            htmlFor="fileInput"
            className="text-blue-600 text-sm cursor-pointer"
          >
            Seleccionar archivo
          </label>

          {file && (
            <p className="mt-2 text-sm text-gray-700">
              📦 {file.name}
            </p>
          )}
        </div>

        {/* STATUS */}
        <p className="text-sm text-gray-600">{getStatusText()}</p>

        {/* BOTONES */}
        <div className="flex gap-2">
          <button
            onClick={handleValidate}
            disabled={!file || status === "validating"}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {status === "validating" ? "Validando..." : "Validar"}
          </button>

          <button
            onClick={handleImport}
            disabled={
              !file ||
              !selectedCompany ||
              status !== "valid"
            }
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {status === "importing" ? "Importando..." : "Importar"}
          </button>
        </div>

        {/* RESULTADO */}
        {result && (
          <div className="max-h-40 overflow-y-auto border rounded p-2">
            <p className="text-sm font-semibold">
              Total: {result.total}
            </p>

            {result.errors?.length > 0 ? (
              result.errors.map((e: string, i: number) => (
                <p key={i} className="text-red-500 text-xs">
                  • {e}
                </p>
              ))
            ) : (
              <p className="text-green-600 text-sm">
                Sin errores ✅
              </p>
            )}
          </div>
        )}

        {/* FOOTER */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportBoardsModal;