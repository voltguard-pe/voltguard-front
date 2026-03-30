import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllUsers } from "../../../services/users.service";
import type { PageProps } from "../../../shared/types/PageProps";
import type { UserProps } from "../../../shared/types/UserProps";
import { mockAdmins } from "../../../shared/mocks/data";
// import type { User } from "../../../shared/mocks/users.mock";

// const users = [
//   {
//     id: 1,
//     name: "Juan Pérez",
//     email: "juan@example.com",
//     role: "Administrador",
//     status: "Activo",
//   },
//   {
//     id: 2,
//     name: "María López",
//     email: "maria@example.com",
//     role: "Usuario",
//     status: "Activo",
//   },
//   {
//     id: 3,
//     name: "Carlos Gómez",
//     email: "carlos@example.com",
//     role: "Editor",
//     status: "Bloqueado",
//   },
// ];

const UserDashboardPage = () => {
  const [, setUsers] = useState<PageProps<UserProps>>();
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
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



  if (loading) {
    return <p className="text-sm text-gray-500">Cargando usuarios...</p>;
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">
        Administradores
      </h1>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-sm md:text-base">
          <thead>
            <tr className="text-left bg-gray-100">
              <th className="p-3">Nombre</th>
              <th>Empresa</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {mockAdmins.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-3">{a.name}</td>
                <td>{a.empresa}</td>
                <td className="space-x-2">
                  <button className="text-blue-600">
                    Editar
                  </button>
                  <button className="text-red-600">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserDashboardPage;
