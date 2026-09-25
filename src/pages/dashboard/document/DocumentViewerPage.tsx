import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink, FileText, Loader2 } from "lucide-react";
import { getDocumentById } from "../../../services/document.service";
import type { DocumentResponseDTO } from "../../../shared/types/BoardProps";

const DocumentViewerPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [document, setDocument] = useState<DocumentResponseDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        getDocumentById(id)
            .then((data) => setDocument(data))
            .catch((err) => console.error("Error cargando documento:", err))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="animate-spin text-[#0797d5]" size={36} />
            </div>
        );
    }

    if (!document) {
        return (
            <div className="p-6 text-center">
                <p className="text-sm text-slate-500">Documento no encontrado.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                >
                    Volver
                </button>
            </div>
        );
    }

    const cleanUrl = document.cloudinaryUrl.replace("/fl_attachment", "");

    const handleDownload = async () => {
        if (!document) return;

        try {
            // Usar fl_attachment de Cloudinary para forzar el header Content-Disposition: attachment
            const downloadUrl = document.cloudinaryUrl.includes("/upload/")
                ? document.cloudinaryUrl.replace("/upload/", "/upload/fl_attachment/")
                : document.cloudinaryUrl;

            const response = await fetch(downloadUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = window.document.createElement("a");
            a.href = url;
            a.download = document.title.toLowerCase().endsWith(".pdf")
                ? document.title
                : `${document.title}.pdf`;
            window.document.body.appendChild(a);
            a.click();
            window.document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch {
            // Fallback si la petición directa falla
            window.open(document.cloudinaryUrl.replace("/upload/", "/upload/fl_attachment/"), "_blank");
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col bg-slate-100">
            {/* Barra superior del visor */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer"
                        title="Volver"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500 shrink-0">
                        <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                        <h1 className="truncate text-sm font-bold text-slate-900">{document.title}</h1>
                        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{document.type}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <a
                        href={cleanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                        <ExternalLink size={13} />
                        <span className="hidden sm:inline">Pestaña externa</span>
                    </a>
                    <button
                        type="button"
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 rounded-xl bg-[#0797d5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#087fb3] transition-colors cursor-pointer"
                        title="Descargar archivo en su equipo"
                    >
                        <Download size={13} />
                        <span>Descargar</span>
                    </button>
                </div>
            </div>

            {/* Visor PDF integrado */}
            <div className="flex-1 p-2 sm:p-4">
                <div className="h-full w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <iframe
                        src={`${cleanUrl}#toolbar=1&navpanes=0`}
                        title={document.title}
                        className="h-full w-full border-none"
                    />
                </div>
            </div>
        </div>
    );
};

export default DocumentViewerPage;