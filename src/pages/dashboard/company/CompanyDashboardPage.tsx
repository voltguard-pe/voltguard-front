import { Eye, Pencil, Plus, Trash2, UserPlus } from "lucide-react";
import { deleteUser, getAllUsers } from "../../../services/users.service";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { PageProps } from "../../../shared/types/PageProps";
import type { UserProps } from "../../../shared/types/UserProps";

const CompanyDashboardPage = () => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const navigate = useNavigate();

    const [users, setUsers] = useState<PageProps<UserProps>>();
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page") || 1) - 1;

    const pageSize = 5;

    const fetchUsers = async () => {
        try {
            const response = await getAllUsers({ page, size: pageSize });
            setUsers(response);
        } catch (error) {
            console.error('Error al obtener todos los usuarios con paginación', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, [page]);

    // const handleDelete = async () => {
    //   await deleteUser(selectedUser.id);
    //   setUsers((prev) =>
    //     prev.filter((user) => user.id !== selectedUser.id)
    //   );

    //   // 👇 ESTO FALTABA
    //   setShowDeleteModal(false);
    //   setSelectedUser(null);
    // };


    // Mejor rendimiento y evita errores silenciosos a comparacion de la funcion anterior handleDelete
    const handleDelete = async () => {
        if (!selectedUser) return;

        setShowDeleteModal(false);

        await deleteUser(selectedUser.id);

        setUsers((prev) =>
            prev.filter((user) => user.id !== selectedUser.id)
        );

        setSelectedUser(null);
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

                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition" onClick={() => navigate("/dashboard/users/create")}>
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
                        {users?.content.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-800">
                                    {user.firstname} {user.lastname}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {user.email}
                                </td>
                                {/* <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">
                    {user.role}
                  </span>
                </td> */}
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${user.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {user.isActive ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-3 text-gray-500">
                                        <button className="hover:text-indigo-600" onClick={() => navigate(`/dashboard/users/${user.id}`)}>
                                            <Eye size={18} />
                                        </button>
                                        <button className="hover:text-yellow-600" onClick={() => navigate(`/dashboard/users/${user.id}/edit`)}>
                                            <Pencil size={18} />
                                        </button>
                                        <button className="hover:text-red-600" onClick={() => {
                                            setSelectedUser(user);
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

            {users && (
                <Pagination
                    page={page}
                    totalPages={users.totalPages}
                    onPageChange={(newPage) => setSearchParams({ page: String(newPage + 1) })}
                />
            )}

            {showDeleteModal && (
                <DeleteUserModal
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDelete}
                />
            )}
        </section>
    );
}

export default CompanyDashboardPage;