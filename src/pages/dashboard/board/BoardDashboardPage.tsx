import {
  Building2,
  Download,
  Eye,
  FileDown,
  Import,
  MapPin,
  Pencil,
  Plus,
  QrCode,
  Search,
  Trash2,
  Zap,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ImportBoardsModal from "../../../components/dashboard/modals/ImportBoardsModal";
import ImportInsulationsModal from "../../../components/dashboard/modals/ImportInsulationsModal";
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
import ImportUnifilarBoardModal from "../../../components/dashboard/modals/ImportUnifilarBoardModal";
import Select from "../../../shared/components/Select";
import { generateNfpaPDF } from "../../../shared/utils/generateNfpaPDF";
// IMPORTAMOS LA NUEVA UTILIDAD DE QR MASIVO
import { generateQrPdf } from "../../../shared/utils/generateQrPdf";

const BoardDashboardPage = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { publicCode } = useParams();

  const [companies, setCompanies] = useState<CompanyResponseDTO[]>([]);
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyResponseDTO | null>(null);

  const [boards, setBoards] = useState<PublicCompanyBoardsItemDTO[]>([]);
  const [search, setSearch] = useState("");

  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingBoards, setLoadingBoards] = useState(false);

  // NUEVO ESTADO: Maneja el objeto completo del tablero asignado para ver en el Modal QR individual
  const [selectedBoardForQR, setSelectedBoardForQR] = useState<PublicCompanyBoardsItemDTO | null>(null);

  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportInsulationsModal, setShowImportInsulationsModal] =
    useState(false);
  const [showImportUnifilarModal, setShowImportUnifilarModal] = useState(false);

  const [selectedBoardCodes, setSelectedBoardCodes] = useState<string[]>([]);

  const effectivePublicCode =
    auth?.role === "ADMIN"
      ? typeof auth.companyPublicCode === "string"
        ? auth.companyPublicCode
        : auth.companyPublicCode?.publicCode
      : publicCode;

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const data = await getCompanies();
        setCompanies(data);

        if (publicCode) {
          const companyFound =
            data.find((company) => company.publicCode === publicCode) || null;
          setSelectedCompany(companyFound);
        }
      } catch (error) {
        console.error("Error cargando empresas", error);
      } finally {
        setLoadingCompanies(false);
      }
    };

    if (auth?.role === "SUPERADMIN") {
      fetchCompanies();
    } else {
      setLoadingCompanies(false);
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
    return boards.filter((board) => {
      const searchValue = search.toLowerCase();
      return (
        board.name?.toLowerCase().includes(searchValue) ||
        board.boardCode?.toLowerCase().includes(searchValue) ||
        board.location?.toLowerCase().includes(searchValue)
      );
    });
  }, [boards, search]);

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

  const handleSelectCompany = (selectedPublicCode: string) => {
    setSelectedBoardCodes([]);
    if (!selectedPublicCode) {
      setSelectedCompany(null);
      navigate("/dashboard/boards");
      return;
    }

    const companyFound =
      companies.find((company) => company.publicCode === selectedPublicCode) ||
      null;

    setSelectedCompany(companyFound);
    navigate(`/dashboard/boards/${selectedPublicCode}`);
  };

  const handleDelete = async (code: string) => {
    if (!effectivePublicCode) return;

    const confirmDelete = confirm("¿Eliminar este tablero?");
    if (!confirmDelete) return;

    try {
      await deleteBoard(effectivePublicCode, code);
      setBoards((prev) => prev.filter((board) => board.code !== code));
    } catch (error) {
      console.error("Error al eliminar tablero", error);
      alert("Error al eliminar tablero");
    }
  };

  const handleBulkDelete = async () => {
    if (!effectivePublicCode || selectedBoardCodes.length === 0) return;

    const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar los ${selectedBoardCodes.length} tableros seleccionados?`);
    if (!confirmDelete) return;

    // Guardamos una copia de respaldo del estado actual por si la API falla
    const previousBoards = [...boards];
    const codesToRemove = [...selectedBoardCodes];

    try {
      // 1. Eliminación visual instantánea (Optimistic Update)
      // Removemos los tableros del estado de inmediato para que el usuario vea el cambio sin parpadeos
      setBoards((prev) => prev.filter((board) => !codesToRemove.includes(board.code)));
      setSelectedBoardCodes([]);

      // 2. Ejecutar las peticiones de borrado en segundo plano (sin bloquear la interfaz)
      await Promise.all(
        codesToRemove.map((code) => deleteBoard(effectivePublicCode, code))
      );

    } catch (error) {
      console.error("Error al eliminar tableros en lote", error);
      alert("Hubo un error al intentar eliminar algunos tableros en el servidor.");

      // Si la API falla, revertimos el cambio y regresamos los tableros a la tabla
      setBoards(previousBoards);
      setSelectedBoardCodes(codesToRemove);
    }
  };

  const handleGeneratePDF = async (boardCode: string) => {
    if (!effectivePublicCode) return;
    try {
      const fullBoard = await publicGetCompanyBoardByCode(
        effectivePublicCode,
        boardCode
      );
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

  const showEmptyCompanyState =
    auth?.role === "SUPERADMIN" && !effectivePublicCode;

  const showNoBoardsState =
    !loadingBoards && Boolean(effectivePublicCode) && filteredBoards.length === 0;

  // Renderiza la URL individual para el código QR de un tablero específico
  // const getIndividualQrUrl = (boardCode: string) => {
  //   return `${window.location.origin}/dashboard/boards/${effectivePublicCode}/${boardCode}`;
  // };

  const getIndividualQrUrl = (boardCode: string) => {
  return `${window.location.origin}/dashboard/scan/${boardCode}`;
};

  return (
    <section className="space-y-6">
      {/* ── ENCABEZADO GENERAL ── */}
      <div
        style={{ animation: "fadeUp 0.4s ease both" }}
        className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center"
      >
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Gestionar tableros
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {auth?.role === "ADMIN"
              ? "Visualiza los tableros eléctricos asociados a tu empresa."
              : "Selecciona una empresa para administrar sus tableros eléctricos."}
          </p>
        </div>

        {auth?.role === "SUPERADMIN" && (
          <div className="flex flex-col gap-2.5 md:flex-row md:items-center">
            <button
              type="button"
              onClick={() => setShowImportInsulationsModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
            >
              <Import size={15} />
              Importar mediciones de aislamiento
            </button>

            <button
              type="button"
              onClick={() => setShowImportUnifilarModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
            >
              <Import size={15} />
              Crear tablero desde unifilar
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
            >
              <Import size={15} />
              Importar tableros
            </button>

            <button
              onClick={() => navigate("/dashboard/boards/create")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-4 py-2.5 text-xs font-bold text-white transition-all duration-300 hover:bg-[#087fb3] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0797d5]/20 cursor-pointer"
            >
              <Plus size={15} />
              Nuevo tablero
            </button>
          </div>
        )}
      </div>

      {/* ── METRICAS INDICADORAS ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Total tableros", value: boards.length, icon: Zap, bg: "bg-[#0797d5]/10 text-[#0797d5]", delay: "40ms" },
          // { title: "Con ubicación", value: boards.filter(b => b.location).length, icon: MapPin, bg: "bg-[#8ccf2f]/15 text-[#3aaa35]", delay: "80ms" },
          { title: "Con NFPA 70E", value: boards.filter(b => b.nfpa).length, icon: Zap, bg: "bg-[#8ccf2f]/15 text-[#3aaa35]", delay: "80ms" },
          { title: "Resultados visibles", value: filteredBoards.length, icon: Search, bg: "bg-slate-100 text-slate-700", delay: "120ms" },
          {
            title: "Empresa actual",
            value: selectedCompany?.name || (auth?.role === "ADMIN" ? "Mi empresa" : "No seleccionada"),
            icon: Building2,
            bg: "bg-slate-100 text-slate-700",
            delay: "160ms",
            isTruncate: true
          }
        ].map((card, i) => {
          const CardIcon = card.icon;
          return (
            <div
              key={i}
              style={{ animation: "fadeUp 0.4s ease both", animationDelay: card.delay }}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500">{card.title}</p>
                  <h3 className={`mt-1.5 font-black text-slate-950 tracking-tight ${card.isTruncate ? "text-base truncate" : "text-2xl"}`}>
                    {card.value}
                  </h3>
                </div>
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${card.bg}`}>
                  <CardIcon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── FILTROS SUPERADMIN ── */}
      {auth?.role === "SUPERADMIN" && (
        <div
          style={{ animation: "fadeUp 0.4s ease 200ms both" }}
          className="relative z-20 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="w-full lg:max-w-md">
            <Select
              label="Empresa"
              value={selectedCompany?.publicCode || ""}
              onChange={(value) => handleSelectCompany(value)}
              disabled={loadingCompanies}
              placeholder={loadingCompanies ? "Cargando empresas..." : "Seleccionar empresa"}
              options={companies.map((company) => ({
                label: company.name,
                value: company.publicCode,
              }))}
            />
          </div>

          <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 md:max-w-md">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, código o ubicación..."
              className="w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      )}

      {/* ── ACCIONES EN LOTE PARA SELECCIONADOS ── */}
      {!showEmptyCompanyState && (
        <div
          style={{ animation: "fadeUp 0.4s ease 220ms both" }}
          className="flex flex-wrap items-center justify-between gap-4 w-full"
        >
          {/* GRUPO IZQUIERDO: Botones de Extracción y Futuros Botones */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* NUEVO BOTÓN MULTI-QR MÁSIVO */}
            <button
              type="button"
              disabled={selectedBoardCodes.length === 0}
              onClick={async () => {
                if (!effectivePublicCode) return;
                try {
                  const selectedBoardsData = boards.filter(b => selectedBoardCodes.includes(b.code));
                  const companyName = selectedCompany?.name || (auth?.role === "ADMIN" ? "Mi Empresa" : "Voltguard");

                  await generateQrPdf(selectedBoardsData, companyName, effectivePublicCode);
                } catch (error) {
                  console.error("Error al extraer códigos QR en PDF:", error);
                  alert("Hubo un error al generar el PDF de códigos QR.");
                }
              }}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer disabled:cursor-auto ${
                selectedBoardCodes.length > 0
                  ? "bg-[#0797d5] border-[#0797d5] text-white hover:bg-[#0684ba]"
                  : "bg-white border-slate-200 text-slate-400 opacity-60 cursor-not-allowed"
              }`}
            >
              <QrCode size={15} />
              Extraer Códigos QR
              {selectedBoardCodes.length > 0 && (
                <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/20 px-1 text-[10px] font-black text-white">
                  {selectedBoardCodes.length}
                </span>
              )}
            </button>

            {auth?.role === "SUPERADMIN" && (
              <button
                type="button"
                disabled={selectedBoardCodes.length === 0}
                onClick={async () => {
                  if (!effectivePublicCode) return;
                  try {
                    const selectedBoardsData = boards.filter(b => selectedBoardCodes.includes(b.code));
                    const fullBoardsData = await Promise.all(
                      selectedBoardsData.map((board) =>
                        publicGetCompanyBoardByCode(effectivePublicCode, board.code)
                      )
                    );
                    generateNfpaPDF(fullBoardsData);
                  } catch (error) {
                    console.error("Error al recopilar datos NFPA de tableros:", error);
                    alert("Hubo un error al descargar las etiquetas NFPA 70E.");
                  }
                }}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer disabled:cursor-auto ${
                  selectedBoardCodes.length > 0
                    ? "bg-slate-900 border-slate-900 text-white hover:bg-slate-800"
                    : "bg-white border-slate-200 text-slate-400 opacity-60 cursor-not-allowed"
                }`}
              >
                <Download size={15} />
                Extraer NFPA70E
                {selectedBoardCodes.length > 0 && (
                  <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#0797d5] px-1 text-[10px] font-black text-white">
                    {selectedBoardCodes.length > 99 ? "+99" : selectedBoardCodes.length}
                  </span>
                )}
              </button>
            )}

            {/* 💡 AQUÍ PUEDES AGREGAR EL NUEVO BOTÓN EN EL FUTURO, QUEDARÁ AL LADITO A LA IZQUIERDA */}
          </div>

          {/* GRUPO DERECHO: Botón único de eliminación */}
          {auth?.role === "SUPERADMIN" && (
            <button
              type="button"
              disabled={selectedBoardCodes.length === 0}
              onClick={handleBulkDelete}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer disabled:cursor-auto ${
                selectedBoardCodes.length > 0
                  ? "bg-red-600 border-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/20"
                  : "bg-white border-slate-200 text-slate-400 opacity-60 cursor-not-allowed"
              }`}
            >
              <Trash2 size={15} />
              Eliminar Seleccionados
              {selectedBoardCodes.length > 0 && (
                <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/20 px-1 text-[10px] font-black text-white">
                  {selectedBoardCodes.length}
                </span>
              )}
            </button>
          )}
        </div>
      )}

      {/* ── CONTENEDOR PRINCIPAL / TABLA ── */}
      <div
        style={{ animation: "fadeUp 0.5s ease 240ms both" }}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
      >
        {showEmptyCompanyState ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center animate-fade-up">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
              <Building2 size={26} />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-950">Selecciona una empresa</h3>
          </div>
        ) : loadingBoards ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-2xl bg-slate-50" />
            ))}
          </div>
        ) : showNoBoardsState ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center animate-fade-up">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#8ccf2f]/15 text-[#3aaa35]">
              <Zap size={26} />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-950">No hay tableros registrados</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm border-collapse">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="w-12 px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-slate-300 text-[#0797d5] focus:ring-[#0797d5] cursor-pointer"
                      checked={filteredBoards.length > 0 && filteredBoards.every((b) => selectedBoardCodes.includes(b.code))}
                      onChange={handleSelectAllRows}
                    />
                  </th>
                  <th className="px-6 py-4">Tablero</th>
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Ubicación</th>
                  <th className="px-6 py-4">NFPA 70E</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredBoards.map((board, index) => (
                  <tr
                    key={board.code}
                    style={{ animation: "fadeUp 0.35s ease both", animationDelay: `${index * 30}ms` }}
                    className={`transition-colors duration-150 ${selectedBoardCodes.includes(board.code) ? "bg-[#0797d5]/5 hover:bg-[#0797d5]/10" : "hover:bg-slate-50/60"}`}
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
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0797d5] to-[#8ccf2f] text-white shadow-sm">
                          <Zap size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-950">{board.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Tablero eléctrico</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 tracking-tight">
                        {board.boardCode}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <MapPin size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{board.location || "Sin ubicación"}</span>
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      {board.nfpa ? (
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          Certificado
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                          No Certificado
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-1">
                        {/* NUEVO BOTÓN EN CADA FILA DE LA TABLA: Ver QR */}
                        <button
                          type="button"
                          onClick={() => setSelectedBoardForQR(board)}
                          className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition-colors duration-200 hover:bg-[#0797d5]/10 hover:text-[#0797d5] cursor-pointer"
                          title="Ver código QR del tablero"
                        >
                          <QrCode size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleGeneratePDF(board.code)}
                          className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                          title="Generar PDF"
                        >
                          <FileDown size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(`/dashboard/boards/${effectivePublicCode}/${board.code}`)}
                          className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition-colors duration-200 hover:bg-[#0797d5]/10 hover:text-[#0797d5] cursor-pointer"
                          title="Ver tablero"
                        >
                          <Eye size={16} />
                        </button>

                        {auth?.role === "SUPERADMIN" && (
                          <>
                            <button
                              type="button"
                              onClick={() => navigate(`/dashboard/boards/${effectivePublicCode}/${board.code}/edit`)}
                              className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition-colors duration-200 hover:bg-[#8ccf2f]/15 hover:text-[#3aaa35] cursor-pointer"
                              title="Editar tablero"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(board.code)}
                              className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                              title="Eliminar tablero"
                            >
                              <Trash2 size={16} />
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

      {/* ── MODALES ADICIONALES ── */}
      <ImportBoardsModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} companies={companies} onSuccess={refreshBoards} />
      <ImportInsulationsModal isOpen={showImportInsulationsModal} onClose={() => setShowImportInsulationsModal(false)} companies={companies} onSuccess={refreshBoards} />
      <ImportUnifilarBoardModal isOpen={showImportUnifilarModal} onClose={() => setShowImportUnifilarModal(false)} companies={companies} onSuccess={refreshBoards} />

      {/* MODAL QR INDIVIDUAL */}
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