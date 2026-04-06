import { Eye, ShieldUser, User2, UserRoundCog } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteUserModal from "../../../components/dashboard/modals/DeleteUserModal";
import { deleteUser, getAllUsers } from "../../../services/users.service";
import type { UserProps } from "../../../shared/types/UserProps";

const AdminDashboardPage = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);

  const navigate = useNavigate();

  const [users, setUsers] = useState<UserProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        console.log("respuesta usuarios:", response);
        setUsers(response);
      } catch (error) {
        console.error("Error al obtener todos los usuarios", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async () => {
    if (!selectedUser) return;

    setShowDeleteModal(false);

    await deleteUser(selectedUser._id);

    setUsers((prev) => prev.filter((user) => user._id !== selectedUser._id));

    setSelectedUser(null);
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando usuarios...</p>;
  }

  return (
    <section className="flex flex-col gap-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Usuarios
          </h1>
          <p className="text-sm text-gray-500">
            Lista de todos los usuarios registrados en el sistema
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-4 md:px-6 py-3 md:py-4 font-medium text-gray-800 whitespace-nowrap">
                    {user.firstname} {user.lastname}
                  </td>

                  <td className="px-4 md:px-6 py-3 md:py-4 text-gray-600 whitespace-nowrap">
                    {user.email}
                  </td>

                  <td className="px-4 md:px-6 py-3 md:py-4 text-gray-600">
                    <span
                      className={`px-2 md:px-3 py-1 rounded-full inline-flex items-center gap-1 md:gap-2 whitespace-nowrap ${
                        user.role === "SUPERADMIN"
                          ? "bg-purple-500 text-white"
                          : user.role === "ADMIN"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-400 text-white"
                      }`}
                    >
                      {user.role === "SUPERADMIN" ? (
                        <ShieldUser size={16} />
                      ) : user.role === "ADMIN" ? (
                        <UserRoundCog size={16} />
                      ) : (
                        <User2 size={16} />
                      )}

                      <span className="md:hidden text-xs">
                        {user.role === "SUPERADMIN"
                          ? "Super"
                          : user.role === "ADMIN"
                          ? "Admin"
                          : "Usuario"}
                      </span>

                      <span className="hidden md:inline">
                        {user.role === "SUPERADMIN"
                          ? "Super Administrador"
                          : user.role === "ADMIN"
                          ? "Administrador"
                          : "Usuario"}
                      </span>
                    </span>
                  </td>

                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isActive
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

export default AdminDashboardPage;