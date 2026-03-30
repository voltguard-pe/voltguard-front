import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import type { CompanyResponseDTO } from "../../../shared/types/CompanyProps";
import { mockCompanies } from "../../../shared/mocks/data";
import DeleteCompanyModal from "../../../components/dashboard/modals/DeleteCompanyModal";

const CompanyDashboardPage = () => {
  const navigate = useNavigate();

  const [companies, setCompanies] =
    useState<CompanyResponseDTO[]>(mockCompanies);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setCompanies((prev) =>
      prev.filter((c) => c._id !== selectedId)
    );
    setShowDeleteModal(false);
  };

  return (
    <section className="flex flex-col gap-y-6 p-4 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Empresas
          </h1>
          <p className="text-sm text-gray-500">
            Gestiona las empresas del sistema
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard/companies/create")}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white"
        >
          Crear empresa
        </button>
      </div>

      {/* TABLA */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-6 py-4 text-left">Nombre</th>
                <th className="px-6 py-4 text-left">Código público</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {companies.map((c) => (
                <tr key={c._id}>
                  <td className="px-6 py-4 font-medium">
                    {c.name}
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    {c.publicCode}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() =>
                          navigate(`/dashboard/companies/${c._id}/edit`)
                        }
                        className="text-yellow-600"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(c._id)}
                        className="text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {companies.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-6">
                    No hay empresas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showDeleteModal && (
        <DeleteCompanyModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </section>
  );
};

export default CompanyDashboardPage;