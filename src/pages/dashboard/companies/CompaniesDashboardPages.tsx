import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteUserModal from "../../../components/dashboard/modals/DeleteUserModal";
import {
  deleteCompany,
  getCompanies,
} from "../../../services/company.service";
import type { CompanyResponseDTO } from "../../../shared/types/CompanyProps";

const CompaniesDashboardPages = () => {
  const [companies, setCompanies] = useState<CompanyResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyResponseDTO | null>(null);

  const navigate = useNavigate();

  const fetchCompanies = async () => {
    try {
      const response = await getCompanies();
      setCompanies(response);
    } catch (error) {
      console.error("Error al obtener empresas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleDelete = async () => {
    if (!selectedCompany) return;

    setShowDeleteModal(false);

    try {
      await deleteCompany(selectedCompany.publicCode);
      setCompanies((prev) =>
        prev.filter((company) => company.publicCode !== selectedCompany.publicCode)
      );
      setSelectedCompany(null);
    } catch (error) {
      console.error("Error al eliminar empresa", error);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando empresas...</p>;
  }

  return (
    <section className="flex flex-col gap-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Empresas
          </h1>
          <p className="text-sm text-gray-500">
            Lista de todas las empresas registradas en el sistema
          </p>
        </div>

        <button
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition w-full md:w-auto"
          onClick={() => navigate("/dashboard/companies/create")}
        >
          <Plus size={18} />
          Nueva empresa
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left font-medium">
                  Nombre
                </th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left font-medium">
                  RUC
                </th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-right font-medium">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {companies.map((company) => (
                <tr key={company.publicCode} className="hover:bg-gray-50">
                  <td className="px-4 md:px-6 py-3 md:py-4 font-medium text-gray-800 whitespace-nowrap">
                    {company.name}
                  </td>

                  <td className="px-4 md:px-6 py-3 md:py-4 text-gray-600 whitespace-nowrap">
                    {company.ruc || "Sin RUC"}
                  </td>

                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div className="flex justify-end gap-3 text-gray-500">
                      <button
                        className="hover:text-indigo-600"
                        onClick={() =>
                          navigate(`/dashboard/companies/${company.publicCode}`)
                        }
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        className="hover:text-yellow-600"
                        onClick={() =>
                          navigate(`/dashboard/companies/${company.publicCode}/edit`)
                        }
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        className="hover:text-red-600"
                        onClick={() => {
                          setSelectedCompany(company);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteUserModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      )}
    </section>
  );
};

export default CompaniesDashboardPages;