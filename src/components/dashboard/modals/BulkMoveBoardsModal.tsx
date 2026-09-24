import React, { useState } from "react";
import { ArrowRightLeft, Building2, Loader2, X } from "lucide-react";
import { toast } from "react-toastify";
import type { CompanyResponseDTO } from "../../../shared/types/CompanyProps";
import { bulkMoveBoards } from "../../../services/board.service";
import { useSidebar } from "../../../contexts/SidebarContext";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    selectedBoardCodes: string[];
    currentCompanyCode: string;
    companies: CompanyResponseDTO[];
    onSuccess: () => void;
};

export const BulkMoveBoardsModal: React.FC<Props> = ({
    isOpen,
    onClose,
    selectedBoardCodes,
    currentCompanyCode,
    companies,
    onSuccess,
}) => {
    const { triggerRefresh } = useSidebar();
    const [targetCompany, setTargetCompany] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const availableCompanies = companies.filter((c) => c.publicCode !== currentCompanyCode);

    const handleMove = async () => {
        if (!targetCompany) {
            toast.warning("Selecciona la empresa destino.");
            return;
        }

        setSubmitting(true);
        try {
            await bulkMoveBoards(selectedBoardCodes, targetCompany);
            toast.success(`Se trasladaron ${selectedBoardCodes.length} tableros exitosamente.`);

            // Sincronizar contadores del Sidebar para ambas empresas
            // Enviar ambas en una sola notificación:
            triggerRefresh([currentCompanyCode, targetCompany]);

            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Error al trasladar tableros.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-fade-up">
                <div className="flex items-center justify-between border-b border-slate-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-[#0797d5]/10 text-[#0797d5]">
                            <ArrowRightLeft size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Traslado Masivo de Tableros</h2>
                            <p className="text-xs text-slate-500">Reasignación administrativa de equipos</p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={submitting} className="text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="rounded-2xl bg-amber-50 p-3.5 border border-amber-200">
                        <p className="text-xs font-bold text-amber-800">
                            Vas a mover <span className="underline font-black">{selectedBoardCodes.length}</span> tableros seleccionados.
                        </p>
                        <p className="text-[11px] text-amber-700 mt-0.5">
                            Se transferirán sus diagramas unifilares, etiquetas NFPA, termografías e historiales asociados.
                        </p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1.5">
                            <Building2 size={13} className="text-slate-400" /> Selecciona la Empresa Destino
                        </label>
                        <select
                            value={targetCompany}
                            onChange={(e) => setTargetCompany(e.target.value)}
                            disabled={submitting}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-[#0797d5]"
                        >
                            <option value="">Seleccionar empresa...</option>
                            {availableCompanies.map((c) => (
                                <option key={c.publicCode} value={c.publicCode}>
                                    {c.name} ({c.publicCode})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-2.5 border-t border-slate-100 p-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleMove}
                        disabled={!targetCompany || submitting}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0797d5] px-5 py-2 text-xs font-bold text-white hover:bg-[#087fb3] disabled:opacity-50"
                    >
                        {submitting ? <Loader2 size={14} className="animate-spin" /> : <ArrowRightLeft size={14} />}
                        Mover {selectedBoardCodes.length} Tableros
                    </button>
                </div>
            </div>
        </div>
    );
};