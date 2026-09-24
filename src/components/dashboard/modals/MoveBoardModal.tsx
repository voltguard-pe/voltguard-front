import React, { useState } from "react";
import { ArrowRightLeft, Building2, Loader2, X } from "lucide-react";
import { toast } from "react-toastify";
import type { CompanyResponseDTO } from "../../../shared/types/CompanyProps";
import { moveBoardToCompany } from "../../../services/board.service";
import { useSidebar } from "../../../contexts/SidebarContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  boardCode: string; // UUID code
  boardName: string;
  currentCompanyCode: string;
  companies: CompanyResponseDTO[];
  onSuccess: () => void;
};

export const MoveBoardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  boardCode,
  boardName,
  currentCompanyCode,
  companies,
  onSuccess,
}) => {
  const { triggerRefresh } = useSidebar();
  const [targetCompany, setTargetCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  // Filtrar para no mostrar la empresa actual como destino
  const availableCompanies = companies.filter((c) => c.publicCode !== currentCompanyCode);

const handleMove = async () => {
    if (!targetCompany) {
      toast.warning("Selecciona la empresa destino.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await moveBoardToCompany(boardCode, targetCompany);
      toast.success("Tablero y registros vinculados trasladados exitosamente.");

      // 👉 El backend devuelve previousCompanyCode y targetCompanyPublicCode
      // Si el backend no los envía, usamos currentCompanyCode como respaldo:
      const originCode = response?.previousCompanyCodes?.[0] || response?.previousCompanyCode || currentCompanyCode;
      const destinationCode = response?.targetCompanyPublicCode || targetCompany;

      // Disparamos la recarga pasando ambos UUIDs exactos confirmados:
      triggerRefresh([originCode, destinationCode]);

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error al trasladar el tablero.");
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
              <h2 className="text-base font-bold text-slate-900">Mover Tablero de Empresa</h2>
              <p className="text-xs text-slate-500">Acción administrativa de reasignación</p>
            </div>
          </div>
          <button onClick={onClose} disabled={submitting} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80">
            <p className="text-[11px] font-bold uppercase text-slate-400">Tablero seleccionado</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{boardName}</p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1.5">
              <Building2 size={13} className="text-slate-400" /> Nueva Empresa Destino
            </label>
            <select
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              disabled={submitting}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-[#0797d5]"
            >
              <option value="">Selecciona la empresa destino...</option>
              {availableCompanies.map((c) => (
                <option key={c.publicCode} value={c.publicCode}>
                  {c.name} ({c.publicCode})
                </option>
              ))}
            </select>
          </div>

          <p className="text-[11px] text-slate-500">
            Esta acción transferirá la ficha técnica, unifilar, fotos térmicas, ITM y certificados asociados a la empresa seleccionada.
          </p>
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
            Trasladar Tablero
          </button>
        </div>
      </div>
    </div>
  );
};