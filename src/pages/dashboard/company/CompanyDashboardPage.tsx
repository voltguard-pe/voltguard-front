import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteUser, getAdmins } from "../../../services/users.service";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { UserProps } from "../../../shared/types/UserProps";
import DeleteUserModal from "../../../components/dashboard/modals/DeleteUserModal";

const CompanyDashboardPage = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);

  const navigate = useNavigate();

  const [users, setUsers] = useState<UserProps[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await getAdmins();
      console.log("respuesta admins:", response);
      setUsers(response);
    } catch (error) {
      console.error("Error al obtener administradores", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
    return <p className="text-sm text-gray-500">Cargando administradores...</p>;
  }

  return (
    <section className="flex flex-col gap-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Administradores de empresas
          </h1>
          <p className="text-sm text-gray-500">
            Lista de todos los administradores de empresas registrados en el sistema
          </p>
        </div>

        <button
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
          onClick={() => navigate("/dashboard/admins/create")}
        >
          <Plus size={18} />
          Nuevo administrador
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-4 text-left font-medium">Nombre</th>
              <th className="px-6 py-4 text-left font-medium">Empresa</th>
              <th className="px-6 py-4 text-left font-medium">Estado</th>
              <th className="px-6 py-4 text-right font-medium">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">
                  {user.firstname} {user.lastname}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {user.company ? (typeof user.company === 'string' ? user.company : user.company.name) : "Sin empresa"}
                </td>

                <td className="px-6 py-4">
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

                <td className="px-6 py-4">
                  <div className="flex justify-end gap-3 text-gray-500">
                    <button
                      className="hover:text-indigo-600"
                      onClick={() => navigate(`/dashboard/admins/${user._id}`)}
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      className="hover:text-yellow-600"
                      onClick={() => navigate(`/dashboard/admins/${user._id}/edit`)}
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

      {showDeleteModal && (
        <DeleteUserModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      )}
    </section>
  );
};

export default CompanyDashboardPage;