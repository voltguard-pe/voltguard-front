import {
  Building2,
  ChevronDown,
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
import QRModal from "../../../components/dashboard/modals/QRModal";

const BoardDashboardPage = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { publicCode } = useParams();

  const [companies, setCompanies] = useState<CompanyResponseDTO[]>([]);
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyResponseDTO | null>(null);

  const [boards, setBoards] = useState<PublicCompanyBoardsItemDTO[]>([]);

  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingBoards, setLoadingBoards] = useState(false);

  const [showQR, setShowQR] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const [search, setSearch] = useState("");

  const effectivePublicCode =
    auth?.role === "ADMIN"
      ? typeof auth.companyPublicCode === "string"
        ? auth.companyPublicCode
        : auth.companyPublicCode?.publicCode
      : publicCode;

  const qrUrl = `${window.location.origin}/dashboard/boards/${effectivePublicCode}`;

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true);

        const data = await getCompanies();

        setCompanies(data);

        if (publicCode) {
          const companyFound =
            data.find((company) => company.publicCode === publicCode) ||
            null;

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
      const value = search.toLowerCase();

      return (
        board.name?.toLowerCase().includes(value) ||
        board.boardCode?.toLowerCase().includes(value) ||
        board.location?.toLowerCase().includes(value)
      );
    });
  }, [boards, search]);

  const handleSelectCompany = (selectedPublicCode: string) => {
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

  const showEmptyCompanyState =
    auth?.role === "SUPERADMIN" && !effectivePublicCode;

  const showNoBoardsState =
    !loadingBoards && effectivePublicCode && filteredBoards.length === 0;

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Gestionar tableros
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {auth?.role === "ADMIN"
              ? "Visualiza los tableros eléctricos asociados a tu empresa."
              : "Selecciona una empresa para administrar sus tableros eléctricos."}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {auth?.role === "SUPERADMIN" && (
            <>
              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Import size={18} />
                Importar tableros
              </button>

              <button
                onClick={() => navigate("/dashboard/boards/create")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087fb3]"
              >
                <Plus size={18} />
                Nuevo tablero
              </button>
            </>
          )}

          {auth?.role === "ADMIN" && effectivePublicCode && (
            <button
              onClick={() => setShowQR(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087fb3]"
            >
              <QrCode size={18} />
              Ver QR empresa
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total tableros</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-950">
                {boards.length}
              </h3>
            </div>

            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
              <Zap size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Con ubicación</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-950">
                {boards.filter((board) => board.location).length}
              </h3>
            </div>

            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#8ccf2f]/15 text-[#3aaa35]">
              <MapPin size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Resultados visibles</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-950">
                {filteredBoards.length}
              </h3>
            </div>

            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Search size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Empresa actual</p>
              <h3 className="mt-2 truncate text-xl font-bold text-slate-950">
                {selectedCompany?.name ||
                  (auth?.role === "ADMIN" ? "Mi empresa" : "No seleccionada")}
              </h3>
            </div>

            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Building2 size={24} />
            </div>
          </div>
        </div>
      </div>

      {auth?.role === "SUPERADMIN" && (
        <div className="flex justify-between items-end rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="w-full">
            <label className="text-sm font-semibold text-slate-700">
              Empresa
            </label>

            <div className="relative mt-2">
              <select
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-[#0797d5] md:max-w-md"
                value={selectedCompany?.publicCode || ""}
                onChange={(event) => handleSelectCompany(event.target.value)}
                disabled={loadingCompanies}
              >
                <option value="">
                  {loadingCompanies
                    ? "Cargando empresas..."
                    : "Seleccionar empresa"}
                </option>

                {companies.map((company) => (
                  <option key={company.publicCode} value={company.publicCode}>
                    {company.name}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={18}
                className="pointer-events-none absolute left-[calc(100%-40px)] top-1/2 -translate-y-1/2 text-slate-400 md:left-[392px]"
              />
            </div>
          </div>

          <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:max-w-md">
            <Search size={18} className="text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, código o ubicación..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {showEmptyCompanyState ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-[#0797d5]/10 text-[#0797d5]">
              <Building2 size={30} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-950">
              Selecciona una empresa
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              Para ver, crear o editar tableros primero debes seleccionar una
              empresa.
            </p>
          </div>
        ) : loadingBoards ? (
          <div className="space-y-4 p-6">
            <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        ) : showNoBoardsState ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-[#8ccf2f]/15 text-[#3aaa35]">
              <Zap size={30} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-950">
              No hay tableros registrados
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              Esta empresa todavía no tiene tableros o no hay resultados para la
              búsqueda actual.
            </p>

            {auth?.role === "SUPERADMIN" && (
              <button
                onClick={() => navigate("/dashboard/boards/create")}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087fb3]"
              >
                <Plus size={18} />
                Crear tablero
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Tablero</th>
                  <th className="px-5 py-4 font-semibold">Código</th>
                  <th className="px-5 py-4 font-semibold">Ubicación</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredBoards.map((board) => (
                  <tr key={board.code} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] text-white">
                          <Zap size={18} />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-950">
                            {board.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            Tablero eléctrico
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {board.boardCode}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-slate-400" />
                        {board.location || "Sin ubicación"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleGeneratePDF(board.code)}
                          className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          title="Generar PDF"
                        >
                          <FileDown size={18} />
                        </button>

                        <button
                          onClick={() =>
                            navigate(
                              `/dashboard/boards/${effectivePublicCode}/${board.code}`
                            )
                          }
                          className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-[#0797d5]/10 hover:text-[#0797d5]"
                          title="Ver tablero"
                        >
                          <Eye size={18} />
                        </button>

                        {auth?.role === "SUPERADMIN" && (
                          <>
                            <button
                              onClick={() =>
                                navigate(
                                  `/dashboard/boards/${effectivePublicCode}/${board.code}/edit`
                                )
                              }
                              className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-[#8ccf2f]/15 hover:text-[#3aaa35]"
                              title="Editar tablero"
                            >
                              <Pencil size={18} />
                            </button>

                            <button
                              onClick={() => handleDelete(board.code)}
                              className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-100 hover:text-red-700"
                              title="Eliminar tablero"
                            >
                              <Trash2 size={18} />
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

      <QRModal
        isOpen={showQR}
        qrUrl={qrUrl}
        companyName={selectedCompany?.name || "Mi empresa"}
        onClose={() => setShowQR(false)}
      />

      <ImportBoardsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        companies={companies}
        onSuccess={async () => {
          if (effectivePublicCode) {
            const data = await publicGetCompanyBoards(effectivePublicCode);
            setBoards(data.boards);
          }
        }}
      />
    </section>
  );
};

export default BoardDashboardPage;