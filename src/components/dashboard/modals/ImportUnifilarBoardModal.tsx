import {
    AlertCircle,
    CheckCircle2,
    FileImage,
    Loader2,
    UploadCloud,
    X,
    CircuitBoard,
} from "lucide-react";

import { useState } from "react";
import { toast } from "react-toastify";

import type { CompanyResponseDTO } from "../../../shared/types/CompanyProps";
import { createBoardFromUnifilar } from "../../../services/board-ai.service";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    companies: CompanyResponseDTO[];
    onSuccess: () => void;
};

type Status = "idle" | "processing" | "success" | "error";

const ImportUnifilarBoardModal = ({
    isOpen,
    onClose,
    companies,
    onSuccess,
}: Props) => {
    const [file, setFile] = useState<File | null>(null);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [status, setStatus] = useState<Status>("idle");
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<any>(null);

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

        if (selectedFile) {
            handleFile(selectedFile);
        }
    };

    const simulateProgress = () => {
        let value = 0;

        const interval = setInterval(() => {
            value += Math.random() * 8;

            if (value >= 90) {
                value = 90;
                clearInterval(interval);
            }

            setProgress(Math.floor(value));
        }, 500);

        return interval;
    };

    // const handleCreateBoard = async () => {
    //     if (!file || !selectedCompany) return;

    //     setStatus("processing");
    //     setProgress(0);

    //     const interval = simulateProgress();

    //     try {
    //         const response = await createBoardFromUnifilar(
    //             file,
    //             token,
    //             selectedCompany
    //         );

    //         clearInterval(interval);
    //         setProgress(100);
    //         setResult(response);

    //         // 🚨 VALIDACIÓN CRÍTICA DE ERRORES INTERNOS (Ej: Imágenes > 10MB rechazadas por Cloudinary)
    //         const tablerosFallidos = response?.results?.filter((r: any) => r.status === "failed") || [];

    //         if (tablerosFallidos.length > 0) {
    //             // Si hubo fallas por peso o Cloudinary, cambiamos el estado a error
    //             setStatus("error");

    //             // Construimos un mensaje detallando qué tableros fallaron
    //             const erroresDetallados = tablerosFallidos
    //                 .map((t: any) => `Tablero ${t.boardCode}: ${t.error}`)
    //                 .join(" | ");

    //             toast.error(`Importación incompleta. Errores detectados: ${erroresDetallados}`, {
    //                 autoClose: 8000 // Dejamos el toast abierto más tiempo para que el usuario lea qué falló
    //             });
    //             return; // Frenamos la ejecución aquí para que no cierre el modal ni mande el toast verde
    //         }

    //         setStatus("success");

    //         toast.success("Tableros importados correctamente desde el ZIP");

    //         setTimeout(() => {
    //             handleClose();
    //             onSuccess();
    //         }, 800);
    //     } catch (error: any) {
    //         clearInterval(interval);
    //         setStatus("error");

    //         toast.error(
    //             error?.response?.data?.error ||
    //             "Error al crear el tablero desde el unifilar"
    //         );
    //     }
    // };

    const handleCreateBoard = async () => {
        if (!file || !selectedCompany) return;

        setStatus("processing");
        setProgress(0);

        const interval = simulateProgress();

        try {
            const response = await createBoardFromUnifilar(
                file,
                token,
                selectedCompany
            );

            clearInterval(interval);
            setProgress(100);
            setResult(response);

            // Validar errores individuales del lote procesado por el backend
            const tablerosFallidos = response?.results?.filter((r: any) => r.status === "failed") || [];

            if (tablerosFallidos.length > 0) {
                setStatus("error");
                const erroresDetallados = tablerosFallidos
                    .map((t: any) => `Tablero ${t.boardCode}: ${t.error}`)
                    .join(" | ");

                toast.error(`Importación incompleta. Errores detectados: ${erroresDetallados}`, {
                    autoClose: 8000
                });
                return;
            }

            setStatus("success");
            toast.success("Tableros importados correctamente desde el ZIP");

            setTimeout(() => {
                handleClose();
                onSuccess();
            }, 800);
        } catch (error: any) {
            clearInterval(interval);
            setStatus("error");

            // 🔍 DIAGNÓSTICO AVANZADO PARA PRODUCCIÓN:
            console.error("Error completo capturado:", error);

            let mensajeError = "Error al crear el tablero desde el unifilar";

            if (error?.response) {
                // El servidor respondió con un estatus fuera del rango 2xx
                const statusHttp = error.response.status;
                const dataError = error.response.data?.error;

                if (statusHttp === 413) {
                    mensajeError = `Error 413: El archivo ZIP es demasiado grande para el servidor de producción (${(file.size / 1024 / 1024).toFixed(2)} MB).`;
                } else if (statusHttp === 504 || statusHttp === 502) {
                    mensajeError = `Error ${statusHttp}: Tiempo de espera agotado (Timeout) en producción. El procesamiento tomó demasiado tiempo.`;
                } else {
                    mensajeError = dataError || `Error del servidor (Código: ${statusHttp})`;
                }
            } else if (error?.request) {
                // La petición se realizó pero no se recibió respuesta (caída de red o caída de servidor)
                mensajeError = "No se recibió respuesta del servidor. Posible problema de red o el archivo superó los límites permitidos.";
            } else {
                // Algo ocurrió al configurar la petición
                mensajeError = error.message || mensajeError;
            }

            toast.error(mensajeError, { autoClose: 10000 });
        }
    };

    const getStatusContent = () => {
        switch (status) {
            case "processing":
                return {
                    icon: <Loader2 size={18} className="animate-spin" />,
                    text: `Analizando diagrama con IA... ${progress}%`,
                    className: "bg-[#0797d5]/10 text-[#0797d5]",
                };

            case "success":
                return {
                    icon: <CheckCircle2 size={18} />,
                    text: "Tablero creado correctamente",
                    className: "bg-[#8ccf2f]/15 text-[#3aaa35]",
                };

            case "error":
                return {
                    icon: <AlertCircle size={18} />,
                    text: "No se pudo procesar el diagrama",
                    className: "bg-red-100 text-red-700",
                };

            default:
                return {
                    icon: <UploadCloud size={18} />,
                    text: "Selecciona un ZIP con imágenes de diagramas unifilares",
                    className: "bg-slate-100 text-slate-600",
                };
        }
    };

    const statusContent = getStatusContent();

    const canCreate = file && selectedCompany && status !== "processing";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] text-white">
                            <CircuitBoard size={24} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-950">
                                Crear tableros desde ZIP de unifilares
                            </h2>

                            <p className="text-sm text-slate-500">
                                Sube un archivo ZIP con las imágenes. <span className="font-semibold text-amber-600">Nota: Cada imagen interna debe pesar menos de 10MB</span> para garantizar el correcto análisis de la IA.
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

                <div className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
                    <div>
                        <label className="text-sm font-semibold text-slate-700">
                            Empresa destino
                        </label>

                        <select
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0797d5] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                            value={selectedCompany}
                            onChange={(event) => setSelectedCompany(event.target.value)}
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
                        htmlFor="unifilarFileInput"
                        onDrop={handleDrop}
                        onDragOver={(event) => event.preventDefault()}
                        className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition ${status === "processing"
                            ? "pointer-events-none border-slate-200 bg-slate-50 opacity-60"
                            : file
                                ? "border-[#8ccf2f] bg-[#8ccf2f]/10"
                                : "border-slate-200 bg-slate-50 hover:border-[#0797d5] hover:bg-[#0797d5]/5"
                            }`}
                    >
                        <div
                            className={`flex size-16 items-center justify-center rounded-3xl ${file
                                ? "bg-[#8ccf2f]/15 text-[#3aaa35]"
                                : "bg-[#0797d5]/10 text-[#0797d5]"
                                }`}
                        >
                            {file ? <FileImage size={30} /> : <UploadCloud size={30} />}
                        </div>

                        <h3 className="mt-4 font-bold text-slate-950">
                            {file ? file.name : "Arrastra el archivo ZIP aquí"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            {file
                                ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                                : "También puedes hacer click para seleccionarlo desde tu equipo."}
                        </p>

                        <input
                            type="file"
                            accept=".zip,application/zip,application/x-zip-compressed"
                            className="hidden"
                            id="unifilarFileInput"
                            disabled={status === "processing"}
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

                    {status === "processing" && (
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

                    {result?.warnings?.length > 0 && (
                        <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-5">
                            <h3 className="font-bold text-yellow-800">
                                Observaciones detectadas
                            </h3>

                            <div className="mt-3 max-h-40 space-y-2 overflow-y-auto">
                                {result.warnings.map((warning: string, index: number) => (
                                    <div
                                        key={index}
                                        className="rounded-2xl bg-white px-4 py-3 text-xs text-yellow-800"
                                    >
                                        {warning}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-end">
                    <button
                        onClick={handleClose}
                        disabled={status === "processing"}
                        className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cerrar
                    </button>

                    <button
                        onClick={handleCreateBoard}
                        disabled={!canCreate}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087fb3] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {status === "processing" && (
                            <Loader2 size={18} className="animate-spin" />
                        )}

                        {status === "processing"
                            ? "Importando..."
                            : "Importar tableros"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportUnifilarBoardModal;