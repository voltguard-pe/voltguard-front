import { ChevronDown, Eye, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { publicGetCompanyBoards } from "../../../services/board.service";
import { getCompanies } from "../../../services/company.service";
import type {
  PublicCompanyBoardsItemDTO,
} from "../../../shared/types/BoardProps";
import type { CompanyResponseDTO } from "../../../shared/types/CompanyProps";

const BoardDashboardPage = () => {
  const navigate = useNavigate();
  const { publicCode } = useParams();

  const [companies, setCompanies] = useState<CompanyResponseDTO[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyResponseDTO | null>(null);
  const [boards, setBoards] = useState<PublicCompanyBoardsItemDTO[]>([]);

  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingBoards, setLoadingBoards] = useState(false);

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const data = await getCompanies();
      setCompanies(data);

      if (publicCode) {
        const companyFound =
          data.find((company) => company.publicCode === publicCode) || null;
        setSelectedCompany(companyFound);
      } else {
        setSelectedCompany(null);
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

  const handleSelectCompany = (selectedPublicCode: string) => {
    if (!selectedPublicCode) {
      navigate("/dashboard/boards");
      return;
    }

    navigate(`/dashboard/boards/${selectedPublicCode}`);
  };

  useEffect(() => {
    fetchCompanies();
  }, [publicCode]);

  useEffect(() => {
    if (publicCode) {
      fetchBoards(publicCode);
    } else {
      setBoards([]);
    }
  }, [publicCode]);

  return (
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
        <div className="relative">
          <select
            className="w-full border rounded-lg px-4 py-3 pr-10 text-sm appearance-none bg-white"
            value={selectedCompany?.publicCode || ""}
            onChange={(e) => handleSelectCompany(e.target.value)}
            disabled={loadingCompanies}
          >
            <option value="">
              {loadingCompanies ? "Cargando empresas..." : "Seleccionar empresa"}
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
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {!publicCode ? (
          <div className="p-6">
            <p className="text-sm text-gray-500">
              Selecciona una empresa para ver sus tableros
            </p>
          </div>
        ) : loadingBoards ? (
          <div className="p-6">
            <p className="text-sm text-gray-500">Cargando tableros...</p>
          </div>
        ) : boards.length === 0 ? (
          <div className="p-6">
            <p className="text-sm text-gray-500">
              Esta empresa no tiene tableros registrados
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left font-medium">
                    Nombre
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left font-medium">
                    Ubicación
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-right font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {boards.map((board) => (
                  <tr key={board.code} className="hover:bg-gray-50">
                    <td className="px-4 md:px-6 py-3 md:py-4 font-medium text-gray-800 whitespace-nowrap">
                      {board.name}
                    </td>

                    <td className="px-4 md:px-6 py-3 md:py-4 text-gray-600 whitespace-nowrap">
                      {board.location || "Sin ubicación"}
                    </td>

                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="flex justify-end gap-3 text-gray-500">
                        <button
                          className="flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm hover:bg-indigo-700"
                          onClick={() =>
                            navigate(`/dashboard/boards/${publicCode}/${board.code}/edit`)
                          }
                        >
                          <Pencil size={16} />
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default BoardDashboardPage;