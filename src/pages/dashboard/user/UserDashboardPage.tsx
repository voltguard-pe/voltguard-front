import { Eye, Pencil, Plus, ShieldUser, Trash2, UserRoundCog } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DeleteUserModal from "../../../components/dashboard/modals/DeleteUserModal";
import { deleteUser, getAllUsers } from "../../../services/users.service";
import Pagination from "../../../shared/components/Pagination";
import type { PageProps } from "../../../shared/types/PageProps";
import type { UserProps } from "../../../shared/types/UserProps";

const UserDashboardPage = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);

  const navigate = useNavigate();

  const [users, setUsers] = useState<PageProps<UserProps>>();
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1) - 1;

  const pageSize = 5;

  useEffect(() => {
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

    fetchUsers();
  }, [page]);

  const handleDelete = async () => {
    if (!selectedUser) return;

    setShowDeleteModal(false);

    await deleteUser(selectedUser._id);

    setUsers((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        content: prev.content.filter((user) => user._id !== selectedUser._id)
      }
    });

    setSelectedUser(null);
  };

  if (loading || !users) {
    return <p className="text-sm text-gray-500">Cargando usuarios...</p>;
  }

  return (
    <section className="flex flex-col gap-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Usuarios
          </h1>
          <p className="text-sm text-gray-500">
            Lista de todos los usuarios registrados en el sistema
          </p>
        </div>

        <button
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition w-full md:w-auto"
          onClick={() => navigate("/dashboard/users/create")}
        >
          <Plus size={18} />
          Nuevo usuario
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        {/* 👇 Scroll horizontal en mobile */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">

            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left font-medium">Nombre</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left font-medium">Email</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left font-medium">Rol</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left font-medium">Estado</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-right font-medium">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {users?.content.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">

                  <td className="px-4 md:px-6 py-3 md:py-4 font-medium text-gray-800 whitespace-nowrap">
                    {user.firstname} {user.lastname}
                  </td>

                  <td className="px-4 md:px-6 py-3 md:py-4 text-gray-600 whitespace-nowrap">
                    {user.email}
                  </td>

                  <td className="px-4 md:px-6 py-3 md:py-4 text-gray-600">
                    <span
                      className={`px-2 md:px-3 py-1 rounded-full inline-flex items-center gap-1 md:gap-2 whitespace-nowrap ${user.role === "SUPERADMIN"
                          ? "bg-purple-500 text-white"
                          : "bg-blue-100 text-blue-800"
                        }`}
                    >
                      {user.role === "SUPERADMIN" ? (
                        <ShieldUser size={16} />
                      ) : (
                        <UserRoundCog size={16} />
                      )}

                      {/* 👇 Mobile: texto corto */}
                      <span className="md:hidden text-xs">
                        {user.role === "SUPERADMIN" ? "Super" : "Admin"}
                      </span>

                      {/* 👇 Desktop: texto completo */}
                      <span className="hidden md:inline">
                        {user.role === "SUPERADMIN"
                          ? "Super Administrador"
                          : "Administrador"}
                      </span>
                    </span>
                  </td>

                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {user.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div className="flex justify-end gap-3 text-gray-500">
                      <button
                        className="hover:text-indigo-600"
                        onClick={() => navigate(`/dashboard/users/${user._id}`)}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="hover:text-yellow-600"
                        onClick={() => navigate(`/dashboard/users/${user._id}/edit`)}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        className="hover:text-red-600"
                        onClick={() => {
                          setSelectedUser(user);
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

      {users && (
        <Pagination
          page={page}
          totalPages={users.totalPages}
          onPageChange={(newPage) =>
            setSearchParams({ page: String(newPage + 1) })
          }
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
};

export default UserDashboardPage;
