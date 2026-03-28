import { QrCode } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { publicGetCompanies } from "../../services/company.service";
import { publicGetCompanyBoards } from "../../services/board.service";
import PublicQrModal from "../../components/dashboard/modal/QRModal";
import type { PublicCompanyDTO } from "../../shared/types/CompanyProps";
import type {
  PublicCompanyBoardsItemDTO,
  PublicCompanyBoardsResponseDTO,
} from "../../shared/types/BoardProps";

const PublicBoardsPage = () => {
  const [companies, setCompanies] = useState<PublicCompanyDTO[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<PublicCompanyDTO | null>(null);
  const [boards, setBoards] = useState<PublicCompanyBoardsItemDTO[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const { publicCode } = useParams<{ publicCode?: string }>();
  const navigate = useNavigate();

  const companyPublicUrl = useMemo(() => {
    if (!selectedCompany?.publicCode) return "";
    return `${window.location.origin}/public/boards/${selectedCompany.publicCode}`;
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      setError(null);

      const data = await publicGetCompanies();
      setCompanies(data);
    } catch (err) {
      setError("No se pudieron cargar las empresas.");
    } finally {
      setLoadingCompanies(false);
    }
  };

  const fetchBoardsByCompany = async (companyPublicCode: string) => {
    try {
      setLoadingBoards(true);
      setError(null);

      const data: PublicCompanyBoardsResponseDTO =
        await publicGetCompanyBoards(companyPublicCode);

      setBoards(data.boards);
    } catch (err) {
      setBoards([]);
      setError("No se pudieron cargar los tableros de la empresa.");
    } finally {
      setLoadingBoards(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (!publicCode) {
      setSelectedCompany(null);
      setBoards([]);
      return;
    }

    const company = companies.find((c) => c.publicCode === publicCode);
    setSelectedCompany(company || null);
  }, [publicCode, companies]);

  useEffect(() => {
    if (!publicCode) {
      setBoards([]);
      return;
    }

    fetchBoardsByCompany(publicCode);
  }, [publicCode]);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Empresas registradas
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Selecciona una empresa en la barra lateral para ver sus tableros.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid min-h-[650px] grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-2xl bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Empresas
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Lista pública de empresas
              </p>
            </div>

            <div className="flex max-h-[560px] flex-col overflow-y-auto p-3">
              {loadingCompanies ? (
                <div className="p-4 text-sm text-slate-500">
                  Cargando empresas...
                </div>
              ) : companies.length === 0 ? (
                <div className="p-4 text-sm text-slate-500">
                  No hay empresas registradas.
                </div>
              ) : (
                companies.map((company) => {
                  const isActive = selectedCompany?._id === company._id;

                  return (
                    <button
                      key={company._id}
                      type="button"
                      onClick={() =>
                        navigate(`/public/boards/${company.publicCode}`)
                      }
                      className={`mb-2 rounded-xl border p-4 text-left transition ${
                        isActive
                          ? "border-indigo-500 bg-indigo-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {company.name}
                        </p>
                        <p className="mt-1 break-all text-xs text-slate-500">
                          Código público: {company.publicCode}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className="rounded-2xl bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedCompany?.name || "Explorar tableros"}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {selectedCompany?.publicCode ||
                      "Selecciona una empresa para ver sus tableros"}
                  </p>
                </div>

                {publicCode && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowQrModal(true)}
                      className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <QrCode size={16} />
                      Ver QR
                    </button>

                    <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
                      {loadingBoards
                        ? "Cargando..."
                        : `${boards.length} tablero${
                            boards.length !== 1 ? "s" : ""
                          }`}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              {!publicCode ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <p className="text-base font-medium text-slate-700">
                    Selecciona una empresa para ver sus tableros
                  </p>
                </div>
              ) : loadingBoards ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <p className="text-base font-medium text-slate-700">
                    Cargando tableros...
                  </p>
                </div>
              ) : boards.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <p className="text-base font-medium text-slate-700">
                    Esta empresa aún no tiene tableros registrados
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Cuando tenga tableros asignados se mostrarán aquí.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-1 xl:grid-cols-2">
                  {boards.map((board) => (
                    <article
                      key={board.code}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {board.name}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Código: {board.code}
                          </p>
                        </div>

                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                          Público
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-slate-600">
                        <p>
                          <span className="font-medium text-slate-800">
                            Ubicación:
                          </span>{" "}
                          {board.location || "Sin ubicación"}
                        </p>
                        <p>
                          <span className="font-medium text-slate-800">
                            Descripción:
                          </span>{" "}
                          {board.description || "Sin descripción"}
                        </p>
                        <p>
                          <span className="font-medium text-slate-800">
                            Fecha:
                          </span>{" "}
                          {new Date(board.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => navigate(`/public/board/${board.code}`)}
                          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                        >
                          Ver tablero
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <PublicQrModal
        isOpen={showQrModal}
        title={selectedCompany?.name || "Empresa"}
        qrValue={companyPublicUrl}
        onClose={() => setShowQrModal(false)}
      />
    </div>
  );
};

export default PublicBoardsPage;