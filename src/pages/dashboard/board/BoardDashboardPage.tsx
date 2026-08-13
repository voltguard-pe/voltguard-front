import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Building2,
  ChevronDown,
  Download,
  Eye,
  FileDown,
  Import,
  Pencil,
  Plus,
  QrCode,
  Search,
  Trash2,
  Zap,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import ImportBoardsModal from "../../../components/dashboard/modals/ImportBoardsModal";
import ImportInsulationsModal from "../../../components/dashboard/modals/ImportInsulationsModal";
import ImportUnifilarBoardModal from "../../../components/dashboard/modals/ImportUnifilarBoardModal";
import ImportNfpa70eBoardModal from "../../../components/dashboard/modals/ImportNfpa70eBoardModal";
import QRModal from "../../../components/dashboard/modals/ViewQRModal";

import {
  deleteBoard,
  publicGetCompanyBoardByCode,
  publicGetCompanyBoards,
} from "../../../services/board.service";
import { getCompanies } from "../../../services/company.service";
import { useAuth } from "../../../shared/hooks/useAuth";

import type { PublicCompanyBoardsItemDTO } from "../../../shared/types/BoardProps";
import type { CompanyResponseDTO } from "../../../shared/types/CompanyProps";

import { generateBoardPDF } from "../../../shared/utils/generateBoardPDF";
import { generateNfpaPDF } from "../../../shared/utils/generateNfpaPDF";
import { generateQrPdf } from "../../../shared/utils/generateQrPdf";

type SortConfig = {
  key: "name" | "boardCode" | "location" | "nfpa";
  direction: "asc" | "desc" | "default";
} | null;

const BoardDashboardPage = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { publicCode } = useParams();

  const [companies, setCompanies] = useState<CompanyResponseDTO[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyResponseDTO | null>(null);
  const [boards, setBoards] = useState<PublicCompanyBoardsItemDTO[]>([]);
  const [search, setSearch] = useState("");

  const [loadingBoards, setLoadingBoards] = useState(false);
  const [selectedBoardForQR, setSelectedBoardForQR] = useState<PublicCompanyBoardsItemDTO | null>(null);

  // Modales
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportInsulationsModal, setShowImportInsulationsModal] = useState(false);
  const [showImportUnifilarModal, setShowImportUnifilarModal] = useState(false);
  const [showNfpa70eModal, setShowNfpa70eModal] = useState(false);

  // Menú desplegable de importación
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const importMenuRef = useRef<HTMLDivElement | null>(null);

  const [selectedBoardCodes, setSelectedBoardCodes] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const effectivePublicCode =
    auth?.role === "ADMIN"
      ? typeof auth.companyPublicCode === "string"
        ? auth.companyPublicCode
        : auth.companyPublicCode?.publicCode
      : publicCode;

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (importMenuRef.current && !importMenuRef.current.contains(event.target as Node)) {
        setIsImportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getCompanies();
        setCompanies(data);
        if (publicCode) {
          const companyFound = data.find((c) => c.publicCode === publicCode) || null;
          setSelectedCompany(companyFound);
        }
      } catch (error) {
        console.error("Error cargando empresas", error);
      }
    };

    if (auth?.role === "SUPERADMIN") {
      fetchCompanies();
    }
  }, [auth, publicCode]);

  useEffect(() => {
    const fetchBoards = async (companyPublicCode: string) => {
      try {
        setLoadingBoards(true);
        const data = await publicGetCompanyBoards(companyPublicCode);
        setBoards(data.boards);
      } catch (error) {
        console.error("Error cargando tableros", error);
        setBoards([]);
      } finally {
        setLoadingBoards(false);
      }
    };

    if (!effectivePublicCode) {
      setBoards([]);
      return;
    }

    fetchBoards(effectivePublicCode);
  }, [effectivePublicCode]);

  const filteredBoards = useMemo(() => {
    let result = boards.filter((board) => {
      const searchValue = search.toLowerCase();
      return (
        board.name?.toLowerCase().includes(searchValue) ||
        board.boardCode?.toLowerCase().includes(searchValue) ||
        board.location?.toLowerCase().includes(searchValue)
      );
    });

    if (sortConfig && sortConfig.direction !== "default") {
      result = [...result].sort((a, b) => {
        const aValue = (a[sortConfig.key] ?? "").toString().toLowerCase();
        const bValue = (b[sortConfig.key] ?? "").toString().toLowerCase();

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [boards, search, sortConfig]);

  const handleSort = (key: "name" | "boardCode" | "location" | "nfpa") => {
    let direction: "asc" | "desc" | "default" = "asc";

    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === "asc") direction = "desc";
      else if (sortConfig.direction === "desc") direction = "default";
    }

    setSortConfig({ key, direction });
  };

  const handleSelectRow = (code: string) => {
    setSelectedBoardCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSelectAllRows = () => {
    const allFilteredCodes = filteredBoards.map((b) => b.code);
    const isAllSelected = allFilteredCodes.every((code) =>
      selectedBoardCodes.includes(code)
    );

    if (isAllSelected) {
      setSelectedBoardCodes((prev) =>
        prev.filter((code) => !allFilteredCodes.includes(code))
      );
    } else {
      setSelectedBoardCodes((prev) => [
        ...prev,
        ...allFilteredCodes.filter((code) => !prev.includes(code)),
      ]);
    }
  };

  const handleDelete = async (code: string) => {
    if (!effectivePublicCode) return;
    if (!confirm("¿Deseas eliminar permanentemente este tablero?")) return;

    try {
      await deleteBoard(effectivePublicCode, code);
      setBoards((prev) => prev.filter((board) => board.code !== code));
    } catch (error) {
      console.error("Error al eliminar tablero", error);
      alert("Error al eliminar el tablero.");
    }
  };

  const handleBulkDelete = async () => {
    if (!effectivePublicCode || selectedBoardCodes.length === 0) return;
    if (!confirm(`¿Eliminar los ${selectedBoardCodes.length} tableros seleccionados?`)) return;

    const previousBoards = [...boards];
    const codesToRemove = [...selectedBoardCodes];

    try {
      setBoards((prev) => prev.filter((board) => !codesToRemove.includes(board.code)));
      setSelectedBoardCodes([]);

      await Promise.all(
        codesToRemove.map((code) => deleteBoard(effectivePublicCode, code))
      );
    } catch (error) {
      console.error("Error al eliminar tableros en lote", error);
      setBoards(previousBoards);
      setSelectedBoardCodes(codesToRemove);
    }
  };

  const handleGeneratePDF = async (boardCode: string) => {
    if (!effectivePublicCode) return;
    try {
      const fullBoard = await publicGetCompanyBoardByCode(effectivePublicCode, boardCode);
      generateBoardPDF(fullBoard);
    } catch (error) {
      console.error("Error generando PDF", error);
    }
  };

  const refreshBoards = async () => {
    if (!effectivePublicCode) return;
    const data = await publicGetCompanyBoards(effectivePublicCode);
    setBoards(data.boards);
  };

  const getIndividualQrUrl = (boardCode: string) => {
    return `${window.location.origin}/dashboard/boards/${effectivePublicCode}/${boardCode}`;
  };

  const renderSortIcon = (key: "name" | "boardCode" | "location" | "nfpa") => {
    if (!sortConfig || sortConfig.key !== key || sortConfig.direction === "default") {
      return <ArrowUpDown size={13} className="opacity-40" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={13} className="text-[#0797d5]" />
    ) : (
      <ArrowDown size={13} className="text-[#0797d5]" />
    );
  };

  const showEmptyCompanyState = auth?.role === "SUPERADMIN" && !effectivePublicCode;
  const showNoBoardsState = !loadingBoards && Boolean(effectivePublicCode) && filteredBoards.length === 0;

  return (
    <section className="space-y-6 pb-20">
      {/* ── 1. CABECERA PREMIUM ── */}
      <div
        style={{ animation: "fadeUp 0.4s ease both" }}
        className="relative z-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-center"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              Gestión de Tableros
            </h1>
            {selectedCompany && (
              <span className="rounded-full bg-[#0797d5]/10 px-3 py-0.5 text-xs font-bold text-[#0797d5]">
                {selectedCompany.name}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Administra los equipos eléctricos, emite certificados NFPA 70E e importa registros.
          </p>
        </div>

        {auth?.role === "SUPERADMIN" && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Dropdown de Acciones Masivas */}
            <div ref={importMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsImportMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
              >
                <Import size={15} className="text-slate-500" />
                Acciones masivas
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform ${isImportMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isImportMenuOpen && (
                <div className="absolute right-0 top-full mt-2 z-20 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <button
                    onClick={() => {
                      setIsImportMenuOpen(false);
                      setShowImportInsulationsModal(true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <Zap size={15} className="text-[#0797d5]" />
                    Importar aislamiento (MΩ)
                  </button>
                  <button
                    onClick={() => {
                      setIsImportMenuOpen(false);
                      setShowImportUnifilarModal(true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <Sparkles size={15} className="text-[#8ccf2f]" />
                    Crear desde unifilar
                  </button>
                  <button
                    onClick={() => {
                      setIsImportMenuOpen(false);
                      setShowImportModal(true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <Import size={15} className="text-slate-500" />
                    Importar lista de tableros
                  </button>
                </div>
              )}
            </div>

            {/* Certificar NFPA */}
            <button
              type="button"
              onClick={() => setShowNfpa70eModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-2.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100/80 cursor-pointer"
            >
              <Zap size={15} className="text-amber-600" />
              Certificar NFPA 70E
            </button>

            {/* Nuevo Tablero */}
            <button
              onClick={() => navigate("/dashboard/boards/create")}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0797d5] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#0797d5]/20 transition hover:bg-[#0684ba] active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              Nuevo tablero
            </button>
          </div>
        )}
      </div>

      {/* ── 2. METRICAS Y BUSCADOR INTEGRADOS ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          style={{ animation: "fadeUp 0.4s ease 40ms both" }}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Equipos</p>
              <h3 className="mt-1 text-2xl font-black text-slate-950 tracking-tight">
                {boards.length}
              </h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
              <Zap size={22} />
            </div>
          </div>
        </div>

        <div
          style={{ animation: "fadeUp 0.4s ease 80ms both" }}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Certificados NFPA 70E</p>
              <h3 className="mt-1 text-2xl font-black text-slate-950 tracking-tight">
                {boards.filter((b) => b.nfpa).length}
              </h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#8ccf2f]/15 text-[#3aaa35]">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        {/* Buscador Integrado */}
        <div
          style={{ animation: "fadeUp 0.4s ease 120ms both" }}
          className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs flex items-center"
        >
          <div className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 px-4 py-2.5">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, código o ubicación..."
              className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* ── 3. CONTENEDOR DE TABLA / RESULTADOS ── */}
      <div
        style={{ animation: "fadeUp 0.5s ease 160ms both" }}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs"
      >
        {showEmptyCompanyState ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-[#0797d5]/10 text-[#0797d5]">
              <Building2 size={30} />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-950">Selecciona una empresa</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-xs">
              Usa el árbol navegable del sidebar para explorar los tableros de cada empresa.
            </p>
          </div>
        ) : loadingBoards ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-2xl bg-slate-50" />
            ))}
          </div>
        ) : showNoBoardsState ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
              <AlertCircle size={30} />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-950">Sin tableros registrados</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-xs">
              No hay registros asociados a los filtros ingresados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-100 font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="w-12 px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-slate-300 text-[#0797d5] focus:ring-[#0797d5] cursor-pointer"
                      checked={filteredBoards.length > 0 && filteredBoards.every((b) => selectedBoardCodes.includes(b.code))}
                      onChange={handleSelectAllRows}
                    />
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer select-none hover:bg-slate-100/50 transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-1.5">
                      Tablero {renderSortIcon("name")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer select-none hover:bg-slate-100/50 transition-colors"
                    onClick={() => handleSort("boardCode")}
                  >
                    <div className="flex items-center gap-1.5">
                      Código {renderSortIcon("boardCode")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer select-none hover:bg-slate-100/50 transition-colors"
                    onClick={() => handleSort("nfpa")}
                  >
                    <div className="flex items-center gap-1.5">
                      NFPA 70E {renderSortIcon("nfpa")}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {filteredBoards.map((board, index) => (
                  <tr
                    key={board.code}
                    style={{ animation: "fadeUp 0.35s ease both", animationDelay: `${index * 25}ms` }}
                    className={`transition-colors duration-150 ${selectedBoardCodes.includes(board.code)
                        ? "bg-[#0797d5]/5 hover:bg-[#0797d5]/10"
                        : "hover:bg-slate-50/70"
                      }`}
                  >
                    <td className="px-6 py-3.5 text-center">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-slate-300 text-[#0797d5] focus:ring-[#0797d5] cursor-pointer"
                        checked={selectedBoardCodes.includes(board.code)}
                        onChange={() => handleSelectRow(board.code)}
                      />
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0797d5] to-[#8ccf2f] text-white shadow-xs">
                          <Zap size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-950 text-xs">{board.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-normal">Tablero eléctrico</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-mono font-bold text-slate-600">
                        {board.boardCode || "-"}
                      </span>
                    </td>

                    <td className="px-6 py-3.5">
                      {board.nfpa ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-100">
                          <CheckCircle2 size={12} />
                          Certificado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                          Sin certificación
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedBoardForQR(board)}
                          className="flex size-8 items-center justify-center rounded-xl text-slate-400 hover:bg-[#0797d5]/10 hover:text-[#0797d5] transition-colors cursor-pointer"
                          title="Ver QR individual"
                        >
                          <QrCode size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleGeneratePDF(board.code)}
                          className="flex size-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Descargar Ficha PDF"
                        >
                          <FileDown size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(`/dashboard/boards/${effectivePublicCode}/${board.code}`)}
                          className="flex size-8 items-center justify-center rounded-xl text-slate-400 hover:bg-[#0797d5]/10 hover:text-[#0797d5] transition-colors cursor-pointer"
                          title="Ver detalle de lecturas"
                        >
                          <Eye size={15} />
                        </button>

                        {auth?.role === "SUPERADMIN" && (
                          <>
                            <button
                              type="button"
                              onClick={() => navigate(`/dashboard/boards/${effectivePublicCode}/${board.code}/edit`)}
                              className="flex size-8 items-center justify-center rounded-xl text-slate-400 hover:bg-[#8ccf2f]/15 hover:text-[#3aaa35] transition-colors cursor-pointer"
                              title="Editar registro"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(board.code)}
                              className="flex size-8 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                              title="Eliminar registro"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 4. BARRA FLOTANTE DE ACCIONES EN LOTE (MÁXIMA ELEGANCIA UX) ── */}
      {selectedBoardCodes.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-full border border-slate-800 bg-slate-950/90 px-5 py-3 text-white shadow-2xl backdrop-blur-md animate-fade-up">
          <span className="text-xs font-bold text-slate-300">
            <strong className="text-white">{selectedBoardCodes.length}</strong> seleccionados
          </span>

          <div className="h-4 w-px bg-slate-800" />

          <button
            type="button"
            onClick={async () => {
              if (!effectivePublicCode) return;
              try {
                const selectedBoardsData = boards.filter((b) => selectedBoardCodes.includes(b.code));
                const companyName = selectedCompany?.name || "Voltguard";
                await generateQrPdf(selectedBoardsData, companyName, effectivePublicCode);
              } catch (error) {
                alert("Error al exportar códigos QR.");
              }
            }}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
          >
            <QrCode size={14} />
            Extraer QR
          </button>

          {auth?.role === "SUPERADMIN" && (
            <>
              <button
                type="button"
                onClick={async () => {
                  if (!effectivePublicCode) return;
                  try {
                    const selectedBoardsData = boards.filter((b) => selectedBoardCodes.includes(b.code));
                    const fullBoardsData = await Promise.all(
                      selectedBoardsData.map((b) => publicGetCompanyBoardByCode(effectivePublicCode, b.code))
                    );
                    const companyName = selectedCompany?.name || "Voltguard";
                    generateNfpaPDF(fullBoardsData, companyName);
                  } catch (error) {
                    alert("Error al generar etiquetas NFPA.");
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
              >
                <Download size={14} />
                Extraer NFPA70E
              </button>

              <button
                type="button"
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 rounded-xl bg-red-600/90 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 transition-all cursor-pointer"
              >
                <Trash2 size={14} />
                Eliminar
              </button>
            </>
          )}
        </div>
      )}

      {/* ── MODALES ADICIONALES ── */}
      <ImportBoardsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        companies={companies}
        onSuccess={refreshBoards}
      />
      <ImportInsulationsModal
        isOpen={showImportInsulationsModal}
        onClose={() => setShowImportInsulationsModal(false)}
        companies={companies}
        onSuccess={refreshBoards}
      />
      <ImportUnifilarBoardModal
        isOpen={showImportUnifilarModal}
        onClose={() => setShowImportUnifilarModal(false)}
        companies={companies}
        onSuccess={refreshBoards}
      />
      <ImportNfpa70eBoardModal
        isOpen={showNfpa70eModal}
        onClose={() => setShowNfpa70eModal(false)}
        companies={companies}
        onSuccess={refreshBoards}
      />

      <QRModal
        isOpen={Boolean(selectedBoardForQR)}
        onClose={() => setSelectedBoardForQR(null)}
        qrUrl={selectedBoardForQR ? getIndividualQrUrl(selectedBoardForQR.code) : ""}
        title={selectedBoardForQR?.name || "Tablero"}
      />
    </section>
  );
};

export default BoardDashboardPage;