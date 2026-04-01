import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DeleteCompanyModal from "../../../components/dashboard/modals/DeleteCompanyModal";
import { deleteCompany, getAllCompanies } from "../../../services/company.service";
import Pagination from "../../../shared/components/Pagination";
import type { CompanyProps, CompanyResponseDTO } from "../../../shared/types/CompanyProps";
import type { PageProps } from "../../../shared/types/PageProps";

const CompanyDashboardPage = () => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<CompanyResponseDTO | null>(null);

    const navigate = useNavigate();

    const [company, setCompany] = useState<PageProps<CompanyResponseDTO>>();
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page") || 1) - 1;

    const pageSize = 5;

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await getAllCompanies({ page, size: pageSize });
                setCompany(response);
            } catch (error) {
                console.error('Error al obtener todas las empresas con paginación', error);
            } finally {
                setLoading(false);
            }
        }

        fetchCompany();
    }, [page]);

    const handleDelete = async () => {
        if (!selectedCompany) return;

        setShowDeleteModal(false);

        // await deleteCompany(selectedCompany.id);

        // setCompany((prev) =>
        //     prev.filter((user) => user.id !== selectedCompany.id)
        // );

        await deleteCompany(selectedCompany._id);

        setCompany((prev) => {
            if (!prev) return prev;

            return {
                ...prev,
                content: prev.content.filter((company) => company._id !== selectedCompany._id)
            }
        });

        setSelectedCompany(null);
    };

    if (loading) {
        return <p className="text-sm text-gray-500">Cargando usuarios...</p>;
    }

    return (
        <section className="flex flex-col gap-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Empresas
                    </h1>
                    <p className="text-sm text-gray-500">
                        Lista de todas las empresas registradas en el sistema
                    </p>
                </div>

                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition" onClick={() => navigate("/dashboard/company/create")}>
                    <Plus size={18} />
                    Nueva empresa
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="px-6 py-4 text-left font-medium">Nombre</th>
                            <th className="px-6 py-4 text-left font-medium">RUC</th>
                            <th className="px-6 py-4 text-right font-medium">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {company?.content.map((comp) => (
                            <tr key={comp._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-800">
                                    {comp.name}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {comp.ruc}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-3 text-gray-500">
                                        <button className="hover:text-indigo-600" onClick={() => navigate(`/dashboard/company/${comp._id}`)}>
                                            <Eye size={18} />
                                        </button>
                                        <button className="hover:text-yellow-600" onClick={() => navigate(`/dashboard/company/${comp._id}/edit`)}>
                                            <Pencil size={18} />
                                        </button>
                                        <button className="hover:text-red-600" onClick={() => {
                                            setSelectedCompany(comp);
                                            setShowDeleteModal(true);
                                        }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {company && (
                <Pagination
                    page={page}
                    totalPages={company.totalPages}
                    onPageChange={(newPage) => setSearchParams({ page: String(newPage + 1) })}
                />
            )}

            {showDeleteModal && (
                <DeleteCompanyModal
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDelete}
                />
            )}
        </section>
    );
}

export default CompanyDashboardPage;