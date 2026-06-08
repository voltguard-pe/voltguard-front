import { useEffect, useMemo, useState } from "react";
import { X, Search, CheckSquare, Square, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { getBoards, assignSingleDocumentToMultipleBoards } from "../../../services/board.service";
import type { BoardResponseDTO } from "../../../shared/types/BoardProps";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  companyPublicCode: string;
  documentId: string;
  documentTitle: string;
  onSuccess: () => void;
};

export const AssignDocToBoardsModal = ({ isOpen, onClose, companyPublicCode, documentId, documentTitle, onSuccess }: Props) => {
  const [boards, setBoards] = useState<BoardResponseDTO[]>([]);
  const [selectedBoardCodes, setSelectedBoardCodes] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Cargar los tableros de la empresa cuando se abre el modal
  useEffect(() => {
    if (isOpen && companyPublicCode) {
      const loadBoards = async () => {
        setLoading(true);
        try {
          const data = await getBoards(companyPublicCode);
          setBoards(data.boards);
          
          // Pre-marcar los tableros que ya tienen este documento asignado
          const alreadyAssigned = data.boards
            .filter(b => b.assignedDocuments?.some(d => d._id === documentId))
            .map(b => b.code);
          setSelectedBoardCodes(alreadyAssigned);
        } catch (err) {
          toast.error("Error al cargar los tableros de la empresa");
        } finally {
          setLoading(false);
        }
      };
      loadBoards();
    }
  }, [isOpen, companyPublicCode, documentId]);

  // Filtrar tableros por búsqueda en tiempo real (útil si hay más de 100)
  const filteredBoards = useMemo(() => {
    return boards.filter(b => 
      b.name.toLowerCase().includes(search.toLowerCase()) || 
      b.boardCode.toLowerCase().includes(search.toLowerCase()) ||
      b.location.toLowerCase().includes(search.toLowerCase())
    );
  }, [boards, search]);

  const handleToggleSelect = (code: string) => {
    setSelectedBoardCodes(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  // Botón mágico para seleccionar o deseleccionar los 100 tableros de un golpe
  const handleSelectAllFiltered = () => {
    const filteredCodes = filteredBoards.map(b => b.code);
    const allAreSelected = filteredCodes.every(code => selectedBoardCodes.includes(code));

    if (allAreSelected) {
      // Quitar los filtrados de la selección global
      setSelectedBoardCodes(prev => prev.filter(code => !filteredCodes.includes(code)));
    } else {
      // Agregar los que falten
      setSelectedBoardCodes(prev => Array.from(new Set([...prev, ...filteredCodes])));
    }
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await assignSingleDocumentToMultipleBoards(companyPublicCode, selectedBoardCodes, documentId);
      toast.success("Asignación masiva completada con éxito");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Hubo un problema al procesar la asignación masiva");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Asignación Masiva a Tableros</h2>
            <p className="text-xs text-slate-500 mt-1 truncate max-w-md">Documento: <span className="font-semibold text-slate-700">{documentTitle}</span></p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-200 rounded-xl transition cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Buscador e interruptor masivo */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar por código o zona..."
              className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-xs text-slate-700 outline-none focus:border-[#0797d5]"
            />
          </div>

          <button
            type="button" onClick={handleSelectAllFiltered} disabled={filteredBoards.length === 0}
            className="text-xs font-bold text-[#0797d5] hover:text-[#087fb3] flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <CheckSquare size={16} /> Seleccionar / Deseleccionar Todo Filtrado
          </button>
        </div>

        {/* Listado de Tableros con scroll */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 space-y-2">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#0797d5]" /></div>
          ) : filteredBoards.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-8">No se encontraron tableros que coincidan.</p>
          ) : (
            <div className="grid grid-cols-1 h-max-80 sm:grid-cols-2 gap-2 overflow-auto">
              {filteredBoards.map((board) => {
                const isSelected = selectedBoardCodes.includes(board.code);
                return (
                  <div
                    key={board.code} onClick={() => handleToggleSelect(board.code)}
                    className={`p-3 border rounded-2xl cursor-pointer bg-white flex items-center justify-between transition-all select-none hover:border-slate-300 ${
                      isSelected ? "border-[#0797d5] ring-2 ring-[#0797d5]/10" : "border-slate-200"
                    }`}
                  >
                    <div className="truncate max-w-[80%]">
                      <p className="font-bold text-slate-900 text-xs truncate">{board.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Código: {board.boardCode} {board.location && `• Zona: ${board.location}`}</p>
                    </div>
                    <div className={isSelected ? "text-[#0797d5]" : "text-slate-300"}>
                      {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-white">
          <p className="text-xs font-semibold text-slate-500">
            {selectedBoardCodes.length} tableros seleccionados de {boards.length}
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} disabled={submitting} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
              Cancelar
            </button>
            <button
              onClick={handleSave} disabled={submitting || boards.length === 0}
              className="rounded-xl bg-[#0797d5] px-5 py-2 text-xs font-semibold text-white hover:bg-[#087fb3] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? "Procesando..." : "Aplicar Asignación Masiva"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};