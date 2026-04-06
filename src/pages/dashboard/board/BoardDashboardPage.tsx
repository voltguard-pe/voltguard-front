import { ChevronDown, Eye, QrCode, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { useNavigate, useParams } from "react-router-dom";
import { publicGetCompanyBoards } from "../../../services/board.service";
import { publicGetCompanies } from "../../../services/company.service";
import type { PublicCompanyBoardsResponseDTO } from "../../../shared/types/BoardProps";
import type { CompanyOptionDTO } from "../../../shared/types/CompanyProps";

const BoardDashboardPage = () => {
  const navigate = useNavigate();
  const { publicCode } = useParams();

  const [companies, setCompanies] = useState<CompanyOptionDTO[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyOptionDTO | null>(null);
  const [boards, setBoards] = useState<PublicCompanyBoardsResponseDTO["boards"]>([]);

  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [openQrModal, setOpenQrModal] = useState(false);

  const companyUrl = useMemo(() => {
    if (!publicCode) return "";
    return `${window.location.origin}/dashboard/boards/${publicCode}`;
  }, [publicCode]);

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const data = await publicGetCompanies();
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

  const handleSelectCompany = (company: CompanyOptionDTO) => {
    setSelectedCompany(company);
    navigate(`/dashboard/boards/${company.publicCode}`);
  };

  useEffect(() => {
    fetchCompanies();
  }, [publicCode]);

  useEffect(() => {
    if (publicCode) {
      fetchBoards(publicCode);
    } else {
      setBoards([]);
      setSelectedCompany(null);
    }
  }, [publicCode]);

  return (
    <>
      <section className="flex flex-col gap-y-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Tableros
          </h1>
          <p className="text-sm text-gray-500">
            Selecciona una empresa para ver sus tableros
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <select
                className="w-full border rounded-lg px-4 py-3 pr-10 text-sm appearance-none bg-white"
                value={selectedCompany?.publicCode || ""}
                onChange={(e) => {
                  const company = companies.find(
                    (item) => item.publicCode === e.target.value
                  );
                  if (company) handleSelectCompany(company);
                }}
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
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>

            {selectedCompany && publicCode && (
              <button
                type="button"
                onClick={() => setOpenQrModal(true)}
                className="flex items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition w-full md:w-auto"
              >
                <QrCode size={18} />
                Mostrar QR
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          {!publicCode ? (
            <p className="text-sm text-gray-500">
              Selecciona una empresa para ver sus tableros
            </p>
          ) : loadingBoards ? (
            <p className="text-sm text-gray-500">Cargando tableros...</p>
          ) : boards.length === 0 ? (
            <p className="text-sm text-gray-500">
              Esta empresa no tiene tableros
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {boards.map((board) => (
                <div
                  key={board.code}
                  className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <p className="font-medium text-gray-800">{board.name}</p>

                  <button
                    onClick={() =>
                      navigate(`/dashboard/boards/${publicCode}/${board.code}`)
                    }
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700 transition w-full md:w-auto"
                  >
                    <Eye size={16} />
                    Ver detalles
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {openQrModal && selectedCompany && companyUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  QR de empresa
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedCompany.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpenQrModal(false)}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="rounded-xl border bg-white p-4">
                <QRCode value={companyUrl} size={220} />
              </div>

              <div className="w-full rounded-lg bg-gray-50 p-3 text-xs text-gray-600 break-all border">
                {companyUrl}
              </div>

              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(companyUrl)}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
              >
                Copiar enlace
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BoardDashboardPage;